---
name: blog-value-object-identificador-composto
description: Use quando o usuário pergunta sobre value object, identidade composta, hash de campos múltiplos, normalização para deduplicação, SHA-1 vs SHA-256, ou DDD aplicado a identidade.
triggers:
  - value object
  - identidade
  - hash composto
  - immutable
  - deduplicação
  - DDD
  - SHA-1
  - SHA-256
  - normalização
linkedContent: /blog/value-object-identificador-composto
linkedType: blog
relatedSkills:
  - blog-idempotencia-webhook-state-machine
  - blog-event-driven-domain-events
followups:
  - "SHA-1 ou SHA-256? Importa em quê?"
  - "Como evita colisão acidental entre tipos de evento diferentes?"
  - "Quando vira classe vs continua função pura retornando string?"
---

## Quando esta skill se aplica

- Pergunta sobre value object, identidade composta, hash para deduplicação.
- Discussão de DDD aplicado a chave/identidade.
- Decisão entre concat vs hash, ou entre SHA-1 e SHA-256.

## Pontos a destacar

- Função pura em um lugar só — insert e read usam a mesma.
- Normalização (trim, lowercase, ISO 8601) antes de hash.
- SHA-1 ok para identidade; SHA-256 com margem para o futuro; MD5 nunca.

## Anti-padrões

- Construir chave em múltiplos lugares — bug invisível.
- Hash sem normalização — dedupe falha em mudança cosmética.
- Hash de payload completo — campos irrelevantes geram identidade falsa.
