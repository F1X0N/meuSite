# Professional Profile MCP

MCP local para manter um contexto profissional seguro do Josivan.

Ele nao faz login no LinkedIn, nao armazena senha e nao automatiza cliques. A funcao dele e dar a agentes uma superficie estruturada para ler evidencias locais, gerar contexto profissional sanitizado, revisar seguranca publica e exportar textos para LinkedIn/site.

## Rodar

```powershell
npm --prefix C:\Users\vidal\Documents\meuSite\utilities\professional-profile-mcp run smoke
```

```powershell
node C:\Users\vidal\Documents\meuSite\utilities\professional-profile-mcp\src\server.js
```

## Exemplo de configuracao MCP

```toml
[mcp_servers.professional_profile]
command = "node"
args = ["C:\\Users\\vidal\\Documents\\meuSite\\utilities\\professional-profile-mcp\\src\\server.js"]
```

## Arquivos de trabalho

- `workspace/linkedin/profile-source.md`: texto bruto do perfil atual.
- `workspace/linkedin/profile-current.json`: versao atual estruturada.
- `workspace/linkedin/profile-proposed.json`: proposta editavel.
- `workspace/linkedin/reviews/`: reviews e checklists exportados.
- `workspace/linkedin/posts/`: rascunhos de posts.
- `workspace/linkedin/professional-sources.json`: fontes profissionais externas em modo somente leitura.
- `workspace/professional-context/`: contexto profissional sanitizado gerado a partir das fontes vivas.

## Fontes profissionais

Por padrao, o MCP usa `C:\Users\vidal\Documents\facilita-suporte` como fonte de evidencias tecnicas e operacionais, sem escrever nada nesse diretorio. A varredura ignora diretorios sensiveis como `local/`, `.git/`, `node_modules/`, `tmp/`, `temp/`, `output/` e arquivos com nomes de segredo ou credencial.

Ferramentas de evidencia:

- `scan_professional_evidence`
- `summarize_technical_skills`
- `summarize_operational_strengths`
- `extract_profile_signals`
- `generate_linkedin_positioning`
- `build_professional_context_index`
- `refresh_professional_context_index`
- `read_professional_context`
- `summarize_daily_work_patterns`
- `summarize_facilita_skills`
- `extract_professional_capabilities`
- `extract_case_studies`
- `generate_linkedin_from_context`
- `generate_site_profile_from_context`
- `review_public_safety`
