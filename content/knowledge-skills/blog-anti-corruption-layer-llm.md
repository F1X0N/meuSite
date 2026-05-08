---
name: blog-anti-corruption-layer-llm
description: Use quando o usuário pergunta sobre validação de saída de LLM, ACL, anti-corruption layer, schema validation com zod, JSON repair vs reject, ou como isolar domínio de provider externo de IA.
triggers:
  - ACL
  - anti-corruption
  - validação
  - schema
  - zod
  - JSON
  - LLM safety
  - JSON repair
  - fronteira de domínio
  - validação de saída
linkedContent: /blog/anti-corruption-layer-llm
linkedType: blog
relatedSkills:
  - case-orquestracao-ia-operacao
  - blog-ia-controle-humano
  - case-cost-ledger-llm-multi-modelo
  - case-hexagonal-domain-saas
followups:
  - "Como decide se rejeita ou tenta reparar a saída do LLM?"
  - "Onde guarda o schema de cada tool/output?"
  - "ACL é só pra LLM ou para todo provider externo?"
---

## Quando esta skill se aplica

- Pergunta sobre validar output de LLM, JSON repair, schema validation.
- Discussão de arquitetura de integração com IA.
- Decisão entre confiar no provider vs adicionar fronteira própria.

## Pontos a destacar

- ACL é padrão DDD aplicado palavra por palavra a LLM.
- Repair é técnico (sintaxe quebrada), reject é semântico (regra violada).
- Versionar schema — mudança não é retroativa.

## Anti-padrões

- Não dizer "o LLM vai melhorar" como justificativa para pular ACL.
- Não confundir validação no controller com ACL arquitetural.
- Não sugerir "tentar de novo" como fallback sem plano explícito.
