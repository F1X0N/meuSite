---
name: case-cost-ledger-llm-multi-modelo
description: Use quando o usuário pergunta sobre custo de IA em produção, cost attribution por feature, escolha de modelo por tarefa, contabilidade de tokens, ou como justificar gasto de LLM tecnicamente.
triggers:
  - custo IA
  - cost attribution
  - ledger
  - contabilidade IA
  - custo de LLM
  - modelo certo
  - otimização de custo
  - tokens
  - cached tokens
linkedContent: /case-studies/cost-ledger-llm-multi-modelo
linkedType: case-study
relatedSkills:
  - case-orquestracao-ia-operacao
  - blog-anti-corruption-layer-llm
  - blog-metricas-que-pagam-a-conta
followups:
  - "Como decide qual modelo usar para cada tarefa?"
  - "Como atribui custo de IA a uma feature/produto interno?"
  - "Cache de prompt vale a pena? Quando?"
---

## Quando esta skill se aplica

- Pergunta sobre custo de IA, cost attribution, contabilidade de tokens.
- Decisão técnica entre modelos (full vs mini, OpenAI vs alternativas).
- Justificativa para uso de IA em produto cobrado.

## Pontos a destacar

- Ledger é decisão de modelagem, não feature de framework.
- Tabela de preços versionada local — auditoria não muda retroativamente.
- Persistência em duas camadas: operacional (junto da entidade) e analítica.

## Anti-padrões

- Não citar valores de fatura específica do empregador.
- Não citar provider explícito como vínculo (ex: não dizer "no GCP a fatura").
- Não sugerir cobrar usuário pelo custo bruto da chamada — pricing tem margem e contexto.
