# Audit & Observability

Este documento descreve a estrutura de logs estruturados, eventos auditáveis e como reproduzir trilhas de eventos a partir de um `request_id`.

## Variáveis de ambiente

| Var | Obrigatória? | Onde | Para que |
|---|---|---|---|
| `OPENAI_API_KEY` | sim | Vercel (prod+preview) | Chat, Job Fit, extract-job, targeted-resume |
| `RESEND_API_KEY` | sim | Vercel (prod+preview) | Contato + envio do CV adaptado por email |
| `BLOB_READ_WRITE_TOKEN` | sim para CV adaptado em PDF | Vercel (prod+preview) | Upload do PDF gerado para Vercel Blob (criar Blob store no dashboard, copiar token) |

### Pendências externas (configuração manual)

- **Vercel Blob store**: criar via dashboard (Storage → Create → Blob) e copiar `BLOB_READ_WRITE_TOKEN` para `production` + `preview` envs. Sem isso, o endpoint `/api/ai/targeted-resume` continua funcionando mas não retorna `pdfUrl` (apenas markdown).
- **Resend domain `josivan-amorim.dev`**: verificar no dashboard Resend e adicionar SPF/DKIM/DMARC no DNS. Sem isso, envio de email do CV adaptado falha em prod (UI continua funcionando para download direto do PDF).

## Princípios

1. **Evidência antes de opinião**: cada request HTTP recebe um `request_id` (UUID v4) propagado em todos os logs daquela request. Dado um `request_id`, é possível reconstruir toda a vida da request — entrada → processamento → saída → erro se houver.
2. **Sem PII em logs**: nunca registramos mensagens de chat completas, e-mails completos ou IPs crus. Apenas IDs hashados (SHA256 truncado), métricas (length, latency_ms), status codes e error classes.
3. **Eventos com nome estável**: cada evento tem nome no formato `domain.action.outcome` definido em `lib/audit-events.ts`. Mudança de nome é breaking para queries downstream.
4. **Logs em produção são JSON estruturado**: uma linha = um evento, parseável por Vercel runtime logs e Log Drains externos.

## Formato do log

Cada linha de log em produção é um JSON com:

```json
{
  "level": "info" | "warn" | "error" | "debug",
  "event": "chat.openai.dispatched",
  "timestamp": "2026-05-07T20:35:42.123Z",
  "request_id": "9f4c2d77-...",
  "session_id": "session_1730000000_xyz",
  "ip_hash": "a1b2c3d4e5f6g7h8",
  "user_agent": "Mozilla/5.0 ...",
  "model": "gpt-4o",
  "input_tokens_est": 3245,
  "latency_ms": 1240
}
```

Em desenvolvimento, o mesmo evento sai em formato legível com prefixo `[level] event` + objeto.

## Catálogo de eventos

Definido em `lib/audit-events.ts`. Resumo:

### Chat (`/api/ai/chat`)
| Evento | Quando | Campos chave |
|---|---|---|
| `chat.request.received` | POST entra | request_id, session_id, ip_hash, mode, message_length |
| `chat.openai.dispatched` | Chamada OpenAI iniciada | request_id, model, input_tokens_est |
| `chat.openai.responded` | Resposta OpenAI recebida | request_id, latency_ms, response_type |
| `chat.rate_limit.hit` | Rate limit dispara | request_id, session_id, ip_hash, scope (`session` ou `ip`) |
| `chat.parse_failure` | JSON do LLM não pôde ser parseado | request_id, snippet_length |
| `chat.mock_mode` | Modo mock (sem OPENAI_API_KEY) | request_id, mode |

### Job-fit (`/api/ai/job-fit`)
| Evento | Quando | Campos chave |
|---|---|---|
| `job_fit.analysis.requested` | POST entra | request_id, ip_hash, jd_length |
| `job_fit.analysis.completed` | Análise retornada | request_id, latency_ms, fit_score |

### Ask-my-work (`/api/ai/ask-my-work`)
| Evento | Quando | Campos chave |
|---|---|---|
| `ask_my_work.requested` | POST entra | request_id, ip_hash, question_length |
| `ask_my_work.completed` | Resposta gerada | request_id, latency_ms, sources_count |

### Contact (`/api/contact`)
| Evento | Quando | Campos chave |
|---|---|---|
| `contact.submission.received` | POST entra com payload válido | request_id, ip_hash, has_email |
| `contact.validation.failed` | Validação zod falha | request_id, ip_hash, fieldErrors_keys |
| `contact.email.dispatched` | Resend/SMTP envio bem-sucedido | request_id, provider, status |
| `contact.email.failed` | Falha em ambos providers | request_id, error_class |

### Frontend (`/api/log/client-error`)
| Evento | Quando | Campos chave |
|---|---|---|
| `client.error.captured` | `app/error.tsx` reportou erro client | request_id, ip_hash, path, digest, message, stack_truncated |

### Catch-all
| Evento | Quando | Campos chave |
|---|---|---|
| `api.error.unhandled` | Catch genérico em qualquer rota | request_id, route, error_class, error_message |

## Correlação ponta a ponta

Cada request HTTP gera um `request_id` único na primeira chamada de `buildRequestContext()` e a resposta da API inclui o header `x-request-id`. O cliente pode anexar esse ID em report manual de bug.

Para reproduzir uma trilha:
1. Pegue o `request_id` do header `x-request-id` da resposta (ou do log de erro do cliente).
2. Filtre logs por `request_id == "<id>"`.
3. Linha temporal: `chat.request.received` → `chat.openai.dispatched` → `chat.openai.responded` → resposta entregue. Erros aparecem como `chat.parse_failure` ou `api.error.unhandled` no meio.

## Retenção

**Hoje (Hobby plan):** logs do Vercel runtime ficam ~1 hora. Para auditoria persistente, configurar Log Drain.

### Configurar Vercel Log Drain → destino persistente

Recomendação: **Axiom** (free tier 500 MB/mês, retenção 30 dias, query estilo SQL, zero infra).

Passos manuais (uma vez):
1. Criar conta em [axiom.co](https://axiom.co).
2. Criar dataset (ex: `josivan-amorim-prod`).
3. Em "API tokens", gerar token de ingest.
4. Vercel Dashboard → Project josivan-amorim → Settings → Log Drains → Add → JSON.
5. Cole o endpoint do Axiom (`https://api.axiom.co/v1/datasets/josivan-amorim-prod/ingest`) + Authorization header com token.
6. Salvar.

Logs do Vercel passam a duplicar para Axiom em near-real-time. Queries:
```
['josivan-amorim-prod']
| where event == 'chat.rate_limit.hit'
| summarize count() by ip_hash
| order by count_ desc
```

Alternativas equivalentes: Logflare (free, integração nativa Vercel), Better Stack (free, queries simples), self-hosted Loki+Grafana.

## O que NÃO é logado

Por contrato (anti-PII):
- Conteúdo de mensagens do chat (apenas `message_length`).
- E-mail completo no payload do form de contato (apenas `has_email`).
- IP cru (apenas `ip_hash` SHA256 truncado em 16 chars).
- Stack trace completa em produção (apenas primeiros 600 chars de `stack_truncated`).
- API keys, tokens, secrets de qualquer fonte.

Mudanças nessa política precisam ser explicitamente documentadas aqui.
