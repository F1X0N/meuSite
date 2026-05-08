---
name: case-diagnostico-observabilidade-producao
description: Use quando o usuário pergunta sobre diagnóstico de incidentes em produção, observabilidade com Grafana/Loki/Sentry, segurança operacional, read-only diagnostics, ou validação pós-mudança.
triggers:
  - "observabilidade"
  - "diagnóstico"
  - "incidente"
  - "incidentes"
  - "Grafana"
  - "Loki"
  - "Sentry"
  - "produção"
  - "incident"
  - "monitoring"
  - "logs"
  - "métricas"
linkedContent: /case-studies/diagnostico-observabilidade-producao
linkedType: case-study
relatedSkills:
  - blog-observabilidade-antes-de-opiniao
  - case-orquestracao-ia-operacao
followups:
  - "O que é read-only diagnostics na prática?"
  - "Como você valida que uma mudança realmente resolveu o incidente?"
  - "Que tipos de incidente você já diagnosticou?"
---

## Quando esta skill se aplica
- Pergunta direta sobre diagnóstico, observabilidade, monitoramento.
- "Como você lida com incidente em produção?"
- Discussão sobre Grafana/Loki/Sentry ou stack de observabilidade.
- Pergunta sobre disciplina de SQL safety / consultas read-only.

## Pontos a destacar
- Evidência antes de opinião: logs → métricas → erros → consulta read-only, nessa ordem.
- 110 diagnósticos de incidente documentados no workspace.
- Validação pós-mudança contínua (não termina no deploy).
- Configuração segura por padrão: secrets fora de log, fora de erro, fora de UI.

## Anti-padrões (a NÃO dizer)
- Não citar incidentes específicos do empregador atual.
- Não inventar números de SLA ou MTTR sem evidência.
- Não vender como "expert em SRE" — é engenheiro de software com responsabilidade operacional.
