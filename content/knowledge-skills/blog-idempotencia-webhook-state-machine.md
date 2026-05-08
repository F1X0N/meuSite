---
name: blog-idempotencia-webhook-state-machine
description: Use quando o usuário pergunta sobre idempotência, deduplicação de webhooks, state machine para eventos retransmitidos, ou como evitar dupla cobrança/notificação em integrações com providers externos.
triggers:
  - idempotência
  - idempotency
  - webhook
  - dedupe
  - deduplicação
  - state machine
  - retry
  - evento duplicado
  - retransmissão
  - dupla cobrança
linkedContent: /blog/idempotencia-webhook-state-machine
linkedType: blog
relatedSkills:
  - blog-webhook-signature-verification
  - blog-retry-backoff-dead-letter
  - blog-value-object-identificador-composto
followups:
  - "Como você define o que torna dois webhooks 'o mesmo evento'?"
  - "Onde guarda o estado: no banco principal ou tabela à parte?"
  - "Como evita race condition entre dois workers processando o mesmo webhook?"
---

## Quando esta skill se aplica

- Pergunta direta sobre idempotência, dedupe, state machine para webhooks.
- Pergunta indireta: "como evitar cobrança duplicada", "provider retransmite, o que faço", "como saber se já processei esse evento".
- Discussão de arquitetura de integração com provider externo.

## Pontos a destacar

- Identidade do evento é decisão de modelagem (chave composta), não flag.
- State machine explícito (received/processed/failed/dead_letter) > flag boolean processed.
- DLQ silenciosa é antipadrão — sempre alerta.

## Anti-padrões

- Não vender como "feature do framework". É decisão de modelagem.
- Não citar provider específico do empregador atual.
- Não sugerir solução one-size-fits-all — o trade-off (JSON inline vs tabela separada) depende do volume.
