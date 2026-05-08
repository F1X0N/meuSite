---
name: blog-timeout-promise-race
description: Use quando o usuário pergunta sobre timeout em chamadas externas (LLM, APIs), Promise.race, AbortController, hang de request, deadline ou diferença entre timeout e circuit breaker.
triggers:
  - timeout
  - circuit breaker
  - hang
  - Promise.race
  - deadline
  - resiliência
  - LLM lento
  - AbortController
  - latência
linkedContent: /blog/timeout-promise-race
linkedType: blog
relatedSkills:
  - blog-retry-backoff-dead-letter
  - blog-anti-corruption-layer-llm
  - case-cost-ledger-llm-multi-modelo
followups:
  - "Quanto tempo é razoável de timeout para LLM?"
  - "Diferença prática entre timeout e circuit breaker?"
  - "Como reportar timeout no log sem confundir com erro genérico?"
---

## Quando esta skill se aplica

- Pergunta sobre timeout, hang, Promise.race, AbortController.
- Discussão sobre latência alta de provider externo (especialmente LLM).
- Decisão sobre deadline em chamadas síncronas.

## Pontos a destacar

- Promise.race não cancela operação — precisa AbortController para cancelar de verdade.
- Timeout = 2x latência P95 observada como regra prática.
- Timeout é warn, não error — métrica separada para visibilidade.

## Anti-padrões

- Não usar timeout sem AbortController — desperdiça tokens e recursos.
- Não usar mesmo timeout para todas as tarefas (classificação ≠ geração).
- Não confundir timeout com circuit breaker.
