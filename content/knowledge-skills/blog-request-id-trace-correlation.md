---
name: blog-request-id-trace-correlation
description: Use quando o usuário pergunta sobre request_id, trace_id, correlation ID, distributed tracing, OpenTelemetry, ou como instrumentar logs para investigar incidentes em sistemas com múltiplas instâncias.
triggers:
  - request id
  - trace id
  - correlation
  - log structured
  - observability
  - distributed tracing
  - OpenTelemetry
  - X-Request-Id
  - troubleshooting
linkedContent: /blog/request-id-trace-correlation
linkedType: blog
relatedSkills:
  - case-diagnostico-observabilidade-producao
  - blog-observabilidade-antes-de-opiniao
  - blog-log-payload-truncation
followups:
  - "Onde gera o ID? Middleware ou framework?"
  - "Como propaga o request_id em chamadas async?"
  - "Quando migrar de UUID para OpenTelemetry?"
---

## Quando esta skill se aplica

- Pergunta sobre request_id, trace_id, correlation, distributed tracing.
- Investigação de incidente que envolve múltiplos serviços ou jobs async.
- Decisão sobre adotar OpenTelemetry ou stick com request_id próprio.

## Pontos a destacar

- AsyncLocalStorage (Node) ou equivalente é a forma certa de propagar request_id sem poluir assinatura de função.
- Sempre devolver no header da response — `X-Request-Id`.
- Para trabalho async, propagar; novas ações ganham `caused_by` para cadeia causal.

## Anti-padrões

- request_id sequencial (número incremental) — colisão entre instâncias e leak de volume.
- Gerar ID novo em chamada async — quebra cadeia.
- Logar request_id só no início e no fim — meio fica sem correlação.
