---
name: blog-log-payload-truncation
description: Use quando o usuário pergunta sobre log truncation, log safety, payload grande em log, redaction de PII, ou como controlar custo de ingestão em Loki/Datadog/Sentry.
triggers:
  - log truncation
  - log safety
  - Loki
  - Datadog
  - payload size
  - observability
  - structured log
  - redact
  - PII em log
linkedContent: /blog/log-payload-truncation
linkedType: blog
relatedSkills:
  - blog-request-id-trace-correlation
  - case-diagnostico-observabilidade-producao
  - blog-observabilidade-antes-de-opiniao
followups:
  - "Quais limites usa em produção (string, array, depth)?"
  - "Como tratar campos sensíveis (PII, token) na truncação?"
  - "Truncar antes ou depois de serializar?"
---

## Quando esta skill se aplica

- Pergunta sobre log payload size, ingestão de log, custo de observabilidade.
- Discussão sobre redação (redact) de PII em logs.
- Investigação de log rejeitado ou ingestão lenta.

## Pontos a destacar

- Truncação por tipo (string/array/object/buffer) é mais robusta que truncar string final.
- Truncar antes de serializar mantém JSON válido.
- Campos sensíveis se redact, não se trunca.

## Anti-padrões

- Truncar string serializada — corta no meio do JSON.
- Não marcar truncação — investigador não sabe que dado é parcial.
- Logar buffer/blob inteiro — explode log sem ganho.
