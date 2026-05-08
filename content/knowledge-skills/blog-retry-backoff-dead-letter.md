---
name: blog-retry-backoff-dead-letter
description: Use quando o usuário pergunta sobre retry, backoff (linear, exponencial, jitter), dead letter queue, falha transiente vs permanente, ou como deduzir limite de tentativas e deadline.
triggers:
  - retry
  - backoff
  - dead letter
  - DLQ
  - resiliência
  - falha transiente
  - tentativa
  - reprocessamento
  - jitter
linkedContent: /blog/retry-backoff-dead-letter
linkedType: blog
relatedSkills:
  - blog-idempotencia-webhook-state-machine
  - blog-timeout-promise-race
  - blog-event-driven-domain-events
followups:
  - "Backoff linear ou exponencial? Quando cada um?"
  - "Como decide N de tentativas?"
  - "DLQ no banco principal ou em fila dedicada?"
---

## Quando esta skill se aplica

- Pergunta sobre retry, backoff, dead letter queue, falha transiente.
- Discussão de resiliência em integrações.
- Decisão sobre quantas vezes retentar e quando desistir.

## Pontos a destacar

- Linear para webhook (você é servidor), exponencial+jitter para cliente em fila com outros.
- Deadline absoluto combinado com N de tentativas — o que vier primeiro vence.
- DLQ manual no banco resolve sem dependência adicional para volume baixo/médio.

## Anti-padrões

- Não retentar erro permanente (validação 400) — só atrasa a falha legítima.
- DLQ silenciosa sem alerta é antipadrão.
- Retry em operação síncrona ao usuário mata UX.
