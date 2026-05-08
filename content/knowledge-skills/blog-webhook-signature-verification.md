---
name: blog-webhook-signature-verification
description: Use quando o usuário pergunta sobre validação de assinatura de webhook, HMAC, anti-spoofing, replay attack, rotação de secret, ou como proteger endpoint público de webhook.
triggers:
  - webhook
  - signature
  - HMAC
  - verificação
  - segurança
  - anti-spoofing
  - replay attack
  - timing attack
  - rotação de secret
linkedContent: /blog/webhook-signature-verification
linkedType: blog
relatedSkills:
  - blog-idempotencia-webhook-state-machine
  - blog-api-key-isolation-por-contexto
followups:
  - "Onde guarda o secret? Env var ou cofre dedicado?"
  - "Como rotaciona o secret sem downtime?"
  - "Falha de assinatura: log warn ou error?"
---

## Quando esta skill se aplica

- Pergunta sobre validar webhook, HMAC, anti-spoofing.
- Discussão de segurança em integrações com providers externos.
- Investigação de falhas de assinatura no log.

## Pontos a destacar

- Comparação constant-time (timingSafeEqual) — `==` é vulnerável a timing attack.
- Rotação dupla (aceitar dois secrets simultaneamente) evita downtime.
- Timestamp assinado + idempotência cobrem replay attack.

## Anti-padrões

- Secret em código ou arquivo versionado.
- Mesmo secret para dev e prod.
- Logar payload bruto em falha — pode ser tentativa de injection no log.
