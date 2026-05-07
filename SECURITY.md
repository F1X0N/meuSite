# Security Policy

Este documento descreve como reportar vulnerabilidades, a postura de segurança do projeto e os trade-offs aceitos.

## Como reportar uma vulnerabilidade

Envie e-mail para **amorimjosivan7@gmail.com** com:
- Descrição da vulnerabilidade.
- Passos para reproduzir.
- Impacto observado.
- Versão / commit afetado se possível.

Resposta dentro de 48 horas úteis. Patch dentro de:
- 7 dias para vulnerabilidades de severidade alta (RCE, exfiltração de dados).
- 30 dias para média.
- Best-effort para baixa.

Por favor, **não** abra issue público com detalhes exploráveis.

## Threat model

Este é um site público de portfolio com:
- Conteúdo público (cases, blog, perfil profissional sanitizado).
- Formulário de contato (e-mail enviado via Resend/SMTP).
- Endpoints de IA (chat com clone digital, análise de job-fit) — entradas controladas pelo usuário, saídas geradas por LLM com guardrails.

**Dados que o sistema toca:**
- Mensagens enviadas ao chat de IA (não persistidas além da sessão).
- E-mail/nome/mensagem do formulário de contato (transmitidos para o dono via e-mail; não persistidos em DB).
- IP do cliente: **nunca logado em texto plano**, apenas via SHA256 truncado (`ip_hash`) para correlação e rate limit.

**Não armazenamos:**
- Conteúdo de mensagens do chat após a resposta.
- E-mails completos em logs (apenas `email_hash` quando relevante).
- Passwords, tokens de usuário, dados financeiros — o site não tem login.

## Postura de segurança aplicada

- **Headers HTTP de segurança** (`next.config.ts`): CSP, HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy.
- **Sanitização de input** em todos os endpoints de IA: remoção de control chars (`\x00-\x1F`) e validação de length.
- **Validação rigorosa** com zod no formulário de contato (`lib/validation.ts`).
- **HTML escaping** no template de e-mail enviado ao dono (mitiga injection).
- **Rate limit duplo** no chat: por sessão (10/hora) + por IP hashado (30/hora).
- **Logs estruturados** sem PII (`lib/logger.ts` + `lib/audit-events.ts`); detalhes em `AUDIT.md`.
- **TypeScript strict** + `noEmit` no CI; sem `ignoreBuildErrors` mascarando erros reais.
- **Dependências auditadas** via `npm audit` no CI.

## CVEs aceitos

Atual (após `npm audit fix`): **0 critical, 0 high**, 3 moderate, 4 low — todos em devDependencies (cadeia do `@lhci/cli` / `inquirer` / `tmp`). Documentados aqui:

- `inquirer` 3.0.0–8.2.6 / 9.0.0–9.3.7 (low, dev-only): chain do Lighthouse CLI que não roda em produção.
- `tmp` <0.2.4 (low, dev-only): mesma chain.
- `external-editor` (low, dev-only): mesma chain.
- `yaml` 2.0.0–2.8.2 (moderate, dev-only): consumida por `lighthouserc`.

Esses pacotes só rodam dentro do GitHub Actions / dev local — nunca em runtime de produção. Atualizar exige bumping major do `@lhci/cli`, planejado para PR futuro.

## Limitações conhecidas

- **Rate limit em memória**: o `Map<>` reseta a cada cold start no Vercel serverless. Para mitigar abuso real, considerar migração para `@vercel/kv` em PR futuro. Atualmente: rate limit best-effort + monitoramento via logs (`chat.rate_limit.hit`).
- **CSP permissiva**: contém `unsafe-inline` e `unsafe-eval` para compatibilidade com Turbopack/dev e scripts inline do Next 15. Endurecimento com nonces planejado para PR posterior de hardening.
- **Sem WAF**: contamos com Vercel default + rate limit aplicado.

## Práticas para contribuidores

- **Nunca commit secrets**: `.env*.local` e `.env` estão no `.gitignore`. Use Vercel Environment Variables para produção.
- **Logs nunca contêm PII**: use `lib/logger.ts` que padroniza saída JSON sem mensagens de chat, e-mails completos ou IPs crus.
- **Tools que tocam estado externo** (envio de e-mail, geração de artefato, consulta a banco quando aplicável) devem passar por validação rigorosa e gerar evento auditável.
- **CI gate** roda `npm run lint`, `npm run type-check`, `npm test` e `npm run build` em todo PR. Não bypassar.
