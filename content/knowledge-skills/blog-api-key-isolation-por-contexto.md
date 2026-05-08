---
name: blog-api-key-isolation-por-contexto
description: Use quando o usuário pergunta sobre segregação de API keys por contexto, least privilege, secret management, multi-tenant key routing, ou cost attribution via key segregada.
triggers:
  - API key
  - secret management
  - least privilege
  - isolation
  - multi-tenant
  - segurança
  - cost attribution
  - chave segregada
linkedContent: /blog/api-key-isolation-por-contexto
linkedType: blog
relatedSkills:
  - blog-webhook-signature-verification
  - case-cost-ledger-llm-multi-modelo
  - blog-anti-corruption-layer-llm
followups:
  - "Onde guarda o mapa contexto → env var?"
  - "Como age quando uma key específica vaza?"
  - "Vale para qualquer provider ou só LLM?"
---

## Quando esta skill se aplica

- Pergunta sobre segregação de API keys, least privilege, secret management.
- Discussão sobre cost attribution e auditoria de uso de provider.
- Decisão sobre granularidade de keys (por feature, por produto, por ambiente).

## Pontos a destacar

- Vazamento de uma key isola dano à feature dela apenas.
- Cost attribution vira propriedade gratuita (provider expõe gasto por key).
- Sweet spot: uma key por contexto operacional distinto.

## Anti-padrões

- Key única para tudo (default da pressa).
- Mapa de keys com nome de cliente — vaza identidade no env var.
- Fallback para key genérica em produção — viola o princípio.
