---
name: case-rum-integracao-provider-externo
description: Use quando o usuário pergunta sobre Real User Monitoring (RUM), telemetria de qualidade em integrações com providers externos, sampling, jitter, packet loss, ou como ter evidência própria de qualidade.
triggers:
  - RUM
  - real user monitoring
  - telemetria
  - qualidade
  - provider
  - sampling
  - jitter
  - packet loss
  - latência cliente
linkedContent: /case-studies/rum-integracao-provider-externo
linkedType: case-study
relatedSkills:
  - case-diagnostico-observabilidade-producao
  - blog-log-payload-truncation
  - blog-observabilidade-antes-de-opiniao
followups:
  - "Como decide o que amostrar e o que ignorar?"
  - "Como evita inflar payload no batch enviado?"
  - "Como age quando provider está degradando?"
---

## Quando esta skill se aplica

- Pergunta sobre Real User Monitoring, telemetria cliente, qualidade de integração externa.
- Investigação de degradação reportada pelo cliente sem evidência no dashboard do provider.
- Decisão de instrumentar cliente para coletar métricas de qualidade.

## Pontos a destacar

- Cliente é o único ponto onde se vê qualidade real entregue ao usuário.
- Sampling fixo (~40 amostras/sessão) cobre a maioria dos casos.
- Percentis (P95, P99), não média, para alertas.

## Anti-padrões

- Coletar sem agregar — dado existe mas insight é zero.
- Métrica única (média) — engana em distribuições assimétricas.
- Confiar 100% no SDK do provider — provider não tem incentivo para reportar problema próprio.
