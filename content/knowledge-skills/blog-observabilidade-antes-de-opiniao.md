---
name: blog-observabilidade-antes-de-opiniao
description: Use quando o usuário pergunta sobre disciplina de diagnóstico, evidência observável vs achismo, troubleshooting baseado em logs/métricas, validação pós-mudança ou disciplina de SQL safety.
triggers:
  - "evidência"
  - "achismo"
  - "diagnóstico"
  - "diagnose"
  - "troubleshooting"
  - "SQL safety"
  - "read-only"
  - "validação pós-mudança"
  - "logs estruturados"
  - "antes de opinião"
  - "engenharia disciplinada"
linkedContent: /blog/observabilidade-antes-de-opiniao
linkedType: blog
relatedSkills:
  - case-diagnostico-observabilidade-producao
  - blog-metricas-que-pagam-a-conta
followups:
  - "Por que read-only por padrão em diagnóstico?"
  - "Como define janela de observação pós-deploy?"
  - "O que significa 'evidência antes de opinião' no dia a dia?"
---

## Quando esta skill se aplica
- Pergunta sobre método de diagnóstico, troubleshooting.
- Discussão sobre evidência vs intuição na engenharia.
- Pergunta sobre SQL safety, read-only diagnostics.
- "Como você sabe que a mudança realmente resolveu?"

## Pontos a destacar
- Pirâmide de evidência: logs estruturados → métricas → erros → consulta read-only.
- Read-only diagnostics como contrato — mudança é planejada, não diagnóstico apressado.
- Validação pós-mudança contínua: o erro sumir da tela do usuário não é evidência.
- Diagnóstico reproduzível > intuição salva por sorte.

## Anti-padrões (a NÃO dizer)
- Não vender como "metodologia rigorosa de PhD" — é disciplina mínima de produção.
- Não inventar exemplos de incidentes específicos.
