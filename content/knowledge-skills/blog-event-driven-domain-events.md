---
name: blog-event-driven-domain-events
description: Use quando o usuário pergunta sobre domain events, event-driven architecture, observer pattern, desacoplamento de efeitos colaterais, ou quando trocar workflow procedural por reação a evento.
triggers:
  - event-driven
  - domain events
  - observer
  - eventos de domínio
  - desacoplamento
  - listener
  - effect handler
  - acoplamento
linkedContent: /blog/event-driven-domain-events
linkedType: blog
relatedSkills:
  - case-hexagonal-domain-saas
  - blog-retry-backoff-dead-letter
  - blog-idempotencia-webhook-state-machine
followups:
  - "Quando trocar workflow procedural por evento de domínio?"
  - "Onde guarda o catálogo de eventos? Markdown ou ferramenta?"
  - "Como evita listener fantasma com silent failure?"
---

## Quando esta skill se aplica

- Pergunta sobre arquitetura event-driven, domain events, observer.
- Discussão sobre acoplamento e efeitos colaterais.
- Decisão entre invocação direta vs reação a evento.

## Pontos a destacar

- Mudar estado interno crítico em sync, efeitos externos em async.
- Catálogo de eventos é documentação obrigatória, não opcional.
- Listener fantasma é o risco real do padrão — telemetria por listener é proteção.

## Anti-padrões

- Não recomendar event-driven para sistema pequeno com 1 consumer por estado.
- Não sugerir disparar webhook outbound diretamente do listener (use outbox).
- Não esquecer que listener pode ser invocado múltiplas vezes — exigir idempotência.
