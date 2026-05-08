---
name: blog-strategy-pattern-outcome-resolution
description: Use quando o usuário pergunta sobre Strategy pattern, classificar resultado em categorias, refatorar cascata de if/else, derivar outcome a partir de múltiplos campos, ou pattern matching em código.
triggers:
  - strategy
  - design pattern
  - if-else
  - cascata
  - outcome
  - refactor
  - pattern matching
  - classificação
  - matcher
linkedContent: /blog/strategy-pattern-outcome-resolution
linkedType: blog
relatedSkills:
  - case-hexagonal-domain-saas
  - blog-event-driven-domain-events
followups:
  - "Como ordena prioridade entre estratégias quando há sobreposição?"
  - "Como testa matcher quando ele tem múltiplas condições?"
  - "Quando Strategy vira overkill?"
---

## Quando esta skill se aplica

- Pergunta sobre refactor de cascata if/else, Strategy pattern aplicado.
- Discussão de classificação de resultado em categorias semânticas.
- Decisão entre cascata vs Strategy vs DSL externa.

## Pontos a destacar

- Ordem importa: específico antes do genérico, fallback no fim.
- Para externalização (regras que mudam com frequência), DSL pequeno em vez de closure.
- Vale para 5+ casos com chance de crescer; abaixo é overengineering.

## Anti-padrões

- Strategy para 3 casos — overengineering, cascata é mais clara.
- Matcher com side effect — quebra testabilidade.
- Sem fallback explícito — undefined propaga silenciosamente.
