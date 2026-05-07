---
name: case-orquestracao-ia-operacao
description: Use quando o usuário pergunta sobre orquestração de agentes de IA, supervisão humana de LLMs, MCP tooling, automação de trabalho repetitivo de operação técnica, ou skills focadas vs agente genérico.
triggers:
  - "orquestração"
  - "orquestrar"
  - "agente"
  - "agentes"
  - "MCP"
  - "skill"
  - "skills"
  - "supervisão"
  - "supervisor"
  - "automação"
  - "automatizar"
  - "LLM"
linkedContent: /case-studies/orquestracao-ia-operacao
linkedType: case-study
relatedSkills:
  - blog-ia-controle-humano
  - case-diagnostico-observabilidade-producao
followups:
  - "Como você decide o que vira skill e o que continua manual?"
  - "Quais são os critérios de aceite das skills?"
  - "Como auditar o que o agente fez?"
---

## Quando esta skill se aplica
- Pergunta direta sobre orquestração ou supervisão de agentes de IA.
- Pergunta indireta: "como você automatiza X?" onde X é trabalho repetitivo de operação.
- Comparação entre skills focadas vs agente genérico.
- Discussão sobre governance multi-provider (OpenAI/Anthropic/Azure).

## Pontos a destacar
- Skills focadas, não agente genérico — princípio editorial.
- Read-only por padrão como contrato de governança.
- Validação de saída via JSON repair + schema.
- 17 templates de workflow + 21 skills + 74 fluxos operacionais ativos no workspace.

## Anti-padrões (a NÃO dizer)
- Não vender como "agente que substitui engenheiro".
- Não citar números fictícios de produtividade.
- Não falar de implementação interna do empregador atual.
