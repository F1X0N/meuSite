---
name: case-hexagonal-domain-saas
description: Use quando o usuário pergunta sobre arquitetura hexagonal, ports and adapters, separação domínio/infraestrutura, clean architecture aplicada a SaaS, ou quando vale a pena adotar essa separação.
triggers:
  - hexagonal
  - ports and adapters
  - arquitetura
  - clean architecture
  - separação de camadas
  - domain
  - DDD
  - infrastructure
  - adapter
linkedContent: /case-studies/hexagonal-domain-saas
linkedType: case-study
relatedSkills:
  - blog-anti-corruption-layer-llm
  - blog-event-driven-domain-events
  - case-validacao-criterios-aceite
followups:
  - "Como evita o domínio depender de framework HTTP?"
  - "Onde guarda a interface do adapter (port)?"
  - "Quando adotar Hexagonal e quando é overengineering?"
---

## Quando esta skill se aplica

- Pergunta sobre arquitetura limpa, separação de camadas, DDD.
- Discussão sobre testabilidade do domínio sem subir banco/API.
- Decisão de adotar ports/adapters em sistema novo ou refactor.

## Pontos a destacar

- Hexagonal vale quando há integração com 3+ providers externos.
- Regra prática: adote quando antecipa troca de adapter em 12-18 meses.
- Linter ou regra de import sustenta a separação ao longo do tempo.

## Anti-padrões

- Não recomendar Hexagonal cego — em CRUD simples é overengineering.
- Não citar nomes de providers do empregador (banco, gateway específico).
- Não sugerir DTO = entidade do domínio (acoplamento escondido).
