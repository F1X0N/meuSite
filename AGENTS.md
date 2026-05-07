# AGENTS.md

Este repositorio e o site pessoal e workspace profissional do Josivan.

## Regra central

Use `C:\Users\vidal\Documents\facilita-suporte` apenas como fonte local read-only de evidencias profissionais. Nunca copie dados brutos da Facilita Juridico para conteudo publico.

## Perfil profissional

Antes de escrever ou alterar textos sobre Josivan, LinkedIn, bio, curriculo, pagina "sobre", projetos ou narrativa profissional:

1. Use o MCP `professional_profile` quando disponivel.
2. Atualize ou leia o contexto em `workspace/professional-context`.
3. Baseie conclusoes em evidencias sanitizadas.
4. Revise seguranca publica antes de entregar texto final.

Configuracao MCP esperada:

```toml
[mcp_servers.professional_profile]
command = "node"
args = ["C:\\Users\\vidal\\Documents\\meuSite\\utilities\\professional-profile-mcp\\src\\server.js"]
```

## Ferramentas principais

- `build_professional_context_index`: cria indice sanitizado a partir das fontes vivas.
- `refresh_professional_context_index`: atualiza o indice quando o workspace mudou.
- `read_professional_context`: le artefatos sanitizados.
- `summarize_daily_work_patterns`: resume padroes dos resumos diarios e trabalho ativo.
- `summarize_facilita_skills`: resume skills, workflows e logica operacional.
- `extract_professional_capabilities`: extrai hard skills, soft skills e capacidade operacional.
- `extract_case_studies`: gera estudos de caso publicos e sem dados sensiveis.
- `generate_linkedin_from_context`: gera texto para LinkedIn.
- `generate_site_profile_from_context`: gera texto para o site.
- `review_public_safety`: verifica termos e referencias inseguras.

## Fontes locais

Fontes permitidas para leitura:

- `C:\Users\vidal\Documents\facilita-suporte\workspace`
- `C:\Users\vidal\Documents\facilita-suporte\.claude\skills`
- `C:\Users\vidal\Documents\facilita-suporte\knowledge`
- `C:\Users\vidal\Documents\facilita-suporte\workflows`

## Proibicoes

Nunca publicar ou copiar para texto publico:

- nomes de clientes, partes, usuarios ou fornecedores;
- numeros de pedido, IDs, transactions, emails, telefones, CPF, CNPJ ou URLs internas;
- SQL bruto, logs, prints, payloads, tokens, segredos, `.env` ou credenciais;
- detalhes operacionais internos da Facilita Juridico;
- caminhos locais internos como prova publica;
- qualquer conteudo de `facilita-suporte/local`, `.git`, `node_modules`, `tmp`, `temp`, `backups` ou `output`.

## Forma correta de uso

Fale de competencias, padroes e responsabilidade:

- orquestracao de agentes de IA;
- engenharia de software;
- diagnostico tecnico;
- observabilidade;
- seguranca de producao;
- suporte tecnico e operacao;
- criterio de aceite e validacao;
- comunicacao analitica;
- ownership e revisao tecnica.

Nao fale de incidentes, clientes ou dados internos como fatos publicos especificos.

