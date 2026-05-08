---
name: blog-connection-context-serverless
description: Use quando o usuário pergunta sobre pool de conexão, leak de conexão em serverless, transações ACID, wrapper de request, ou como garantir cleanup de recursos com finally.
triggers:
  - connection pool
  - serverless
  - ACID
  - transaction
  - leak de conexão
  - FaaS
  - banco
  - wrapper
  - finally
linkedContent: /blog/connection-context-serverless
linkedType: blog
relatedSkills:
  - case-diagnostico-observabilidade-producao
  - blog-event-driven-domain-events
  - blog-request-id-trace-correlation
followups:
  - "Como detectou leak de conexão antes de virar incidente?"
  - "Wrapper genérico ou por endpoint?"
  - "Como roda integration test sem leakar?"
---

## Quando esta skill se aplica

- Pergunta sobre pool de conexão, leak, ACID, wrapper de request.
- Discussão sobre transações em serverless / FaaS.
- Investigação de incidente de pool esgotado.

## Pontos a destacar

- `finally` é garantia da linguagem; cleanup explícito não roda em throw.
- Wrapper centralizado vira propriedade do framework, não disciplina manual.
- Read-only routes pulam BEGIN/COMMIT — overhead pequeno mas inútil.

## Anti-padrões

- Não pegar conexão fora do wrapper.
- Não usar transação aninhada — comportamento varia entre bancos.
- Não fazer `getConnection` no meio do handler — sempre no início, sempre no `finally`.
