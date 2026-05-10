# Portfolio Técnico 2026 🚀

Site pessoal moderno construído com **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS** e integração com **OpenAI**. Inclui clone digital de IA, view transitions, covers SVG animados, easter eggs técnicos e overlay de tech-lead via Konami code.

URL ativa em produção: [josivan-amorim-cvd3xueje-f1x0ns-projects.vercel.app](https://josivan-amorim-cvd3xueje-f1x0ns-projects.vercel.app/)

## ✨ Características Principais

### 🤖 Clone Digital com IA
- **Chat Inteligente** com contexto completo do perfil profissional
- **Job Fit Analyzer** para análise automática de vagas (modo `:job_fit`)
- **Knowledge Base Otimizada** (~70% redução de tokens via resumos estáticos)
- **Multi-Provider Resilience** pronto para fallback OpenAI/Anthropic
- **Validação em 2 Etapas** (mensagem isolada + contexto total)
- **Rate Limiting** por sessão
- **Modo Foco** com Esc global e scroll automático

### 🎨 Design & UX
- **View Transitions API nativa** com shared element entre listagem e post (covers "voam" para o topo do post aberto). Fallback gracioso em browsers sem suporte e em `prefers-reduced-motion`.
- **15 Covers SVG inline** com reveal por IntersectionObserver e hover state com drop-shadow nas páginas individuais.
- **Hero animado** com network graph (Cliente → Gateway → LLM Primary/Fallback → Cache → Trace) e pulses correndo pelas edges em loop sutil.
- **Variable Fonts** Geist Sans + Geist Mono via `next/font`.
- **Bento layout** na seção Highlights (1 card grande + 2 compactos).
- **Dark/Light** com no-flash script e CSS vars.
- **Acessibilidade** ARIA completo, navegação por teclado, foco visível, `prefers-reduced-motion` respeitado em todas as animações.

### 🥚 Easter eggs e atalhos
- **`⌘+K` / `Ctrl+K`** abre Command Palette com busca de páginas, seções e ações.
- **`⌘+K`, depois `:`** revela grupo *Secret* com 4 comandos:
  - `:hire` — abre o contato com mensagem pré-preenchida estilo recrutador.
  - `:source` — abre o repositório no GitHub.
  - `:matrix` — overlay matrix por 8s (canvas 2D, Esc fecha, render estático em reduced-motion).
  - `:reset` — desativa qualquer easter egg em curso.
- **Konami code** (`↑↑↓↓←→←→BA`) ativa o **Tech Lead Mode**: overlay no canto inferior direito com commit hash, branch, deploy time e TTFB do request atual.
- **Console do browser** imprime convite com link do repo e dica do `⌘+K`.
- **Página 404** com stack-trace estilizado e três sugestões de rota próximas calculadas via Levenshtein normalizado.

### 📝 Conteúdo Dinâmico
- **Case Studies** em MDX com estrutura padronizada
- **Blog Técnico** com syntax highlighting via rehype-pretty-code + Shiki dual-theme
- **Knowledge Base** anonimizada (compliance-safe)
- **CV** gerado dinamicamente via `@react-pdf/renderer` no prebuild

### ⚡ Performance & SEO
- **SSG/ISR** para páginas de conteúdo
- **Bundle Splitting** automático
- **next/font** Geist (sem layout shift)
- **Sitemap + RSS + robots.txt** automáticos
- **Open Graph** e metadados por página
- **Lighthouse CI** integrado

## 🗂️ Estrutura do Projeto

```
meuSite/
├── app/                          # App Router (Next.js 15)
│   ├── layout.tsx                # Root layout, EasterEggProvider, fontes Geist
│   ├── page.tsx                  # Home (Hero, AITools, Highlights, Cases, Blog, About, Contact)
│   ├── not-found.tsx             # 404 server (busca slugs e passa para client)
│   ├── not-found-client.tsx      # 404 client com usePathname e sugestões
│   ├── case-studies/             # Listagem e detalhe de cases
│   ├── blog/                     # Blog técnico
│   ├── about/                    # Sobre
│   ├── contact/                  # Contato com formulário
│   ├── play/4-digitos/           # Side project: Mastermind multiplayer (link externo)
│   └── api/
│       └── ai/
│           ├── chat/             # Endpoint do Clone Digital
│           ├── ask-my-work/      # IA com contexto do portfólio
│           ├── job-fit/          # Análise de aderência a vaga
│           └── targeted-resume/  # CV adaptado por vaga
├── components/
│   ├── ui/                       # Button, Card, Badge, CommandPalette
│   ├── layout/                   # Header, Footer, ThemeToggle, TransitionLink
│   ├── content/                  # Hero, HeroNetworkGraph, Highlights, FinalCTA
│   ├── sections/                 # AITools, FeaturedCases, FeaturedBlog, Experience, SideProjects, About, Contact
│   ├── motion/                   # Reveal, FadeIn, StaggerContainer
│   ├── blog-covers/              # 15 SVG covers inline (registry com next/dynamic)
│   ├── play/                     # Covers e helpers de side projects
│   └── easter/                   # ConsoleArt, EasterEggProvider, MatrixOverlay, TechLeadOverlay
├── config/                       # site.ts, copy.ts, motion.ts
├── content/                      # MDX de blog/case-studies + knowledge-base.md
├── hooks/                        # useReducedMotion, useKonami
├── lib/                          # mdx, profile, validation, route-suggestions, cover-design
└── __tests__/                    # Vitest + Testing Library (95 testes)
```

## 🚀 Começando

### Pré-requisitos

- Node.js 22+
- OpenAI API Key (opcional, para o Clone Digital — sem ela, o chat entra em mock mode)

### Instalação

```bash
git clone https://github.com/F1X0N/meuSite.git
cd meuSite
npm install
cp .env.example .env   # editar e adicionar OPENAI_API_KEY (opcional)
```

### Desenvolvimento

```bash
npm run dev   # Next.js com Turbopack em http://localhost:3000
```

### Testes

```bash
npm test            # vitest run (uma execução, 95 testes)
npm run test:watch  # watch mode
npm run test:ui     # vitest UI
npm run lint        # eslint (next config)
npx tsc --noEmit    # type check
```

### Build

```bash
npm run build       # gera .next/, regenera public/cv.pdf via script
npm start           # serve a build
```

## 🔄 Fluxo de entrega

Trabalho não-trivial segue branch + PR + merge:

```bash
git checkout -b feat/<scope>
# implementar, commitar
git push -u origin feat/<scope>
gh pr create --title "..." --body "..."
gh pr merge --squash --delete-branch
```

Histórico de PRs grandes em `https://github.com/F1X0N/meuSite/pulls?q=is%3Apr+is%3Aclosed`.

## 🤖 Clone Digital IA

### Configuração

1. Adicione sua OpenAI API Key no `.env`:
   ```env
   OPENAI_API_KEY=sk-...
   ```
2. Personalize a Knowledge Base em `content/knowledge-base.md`.
3. O sistema:
   - Detecta se a mensagem é uma Job Description (>100 chars + 2 keywords)
   - Valida tamanho da entrada (limite: 5000 chars)
   - Faz trimming de histórico para caber em 8000 tokens
   - Retorna JSON estruturado para análise de fit

### Limites

- **Mensagem isolada:** 5000 caracteres (~1400 tokens)
- **Contexto total:** 8000 tokens (knowledge base + histórico + mensagem)
- **Trimming automático:** remove histórico antigo se necessário
- **Rate limit:** 10 mensagens/hora por sessão

## 📝 Adicionando Conteúdo

### Criar um Case Study

1. Crie `content/case-studies/seu-case.mdx` com frontmatter:
   ```markdown
   ---
   title: "Título do Case"
   description: "Descrição curta"
   date: "2026-01-24"
   tags: ["IA", "OCR", "FinOps"]
   featured: true
   coverComponent: "CostLedgerLlmCover"
   ---
   ```
2. (Opcional) Adicione um cover SVG novo em `components/blog-covers/` e registre em `components/blog-covers/index.ts`.

### Criar um Post de Blog

Mesma estrutura em `content/blog/`. Os 15 covers existentes seguem o design system em `lib/cover-design.tsx` (CoverFrame, CoverDot, CoverEdge, CoverHex).

## 🎨 Sistema de Design

### Cores (CSS Variables)

Em `app/globals.css`:
- `--primary` — cyan, único accent
- `--background` / `--foreground`
- `--card`, `--muted`, `--border`, `--destructive`
- `--ring` para focus visível

**🚫 Regra Purple Ban:** sem violet/purple.

### Componentes Base

- **Button** — `primary | secondary | outline | ghost | link`
- **Card** — wrapper de conteúdo com bordas e sombra
- **Badge** — tags
- **CommandPalette** — `cmdk` com modo foco e grupo Secret
- **TransitionLink** — wrapper de `next/link` que aciona `document.startViewTransition`

### Animações

- `Reveal`, `FadeIn`, `StaggerContainer` em `components/motion/`
- View Transitions configuradas em `app/globals.css` (crossfade default + shared element nos covers)
- `prefers-reduced-motion` desliga toda animação adicional

## 🏗️ Arquitetura

### Princípios

- Funções pequenas, single-purpose, early returns
- Sem nested ifs
- Data-driven strategies sobre switch/if-chains
- Nomes descritivos em inglês no código
- Comentários só onde o "porque" não é óbvio

### Performance

- SSG para páginas estáticas, ISR onde apropriado
- next/dynamic para os 15 covers (cada cover em chunk próprio)
- next/font Geist (zero layout shift)
- Knowledge Base estática (~70% economia vs envio inline)

### Segurança

- CSP em `next.config.ts` (script-src/style-src/img-src/...)
- Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options, Referrer-Policy
- Rate limiting por sessão na API de chat
- Anonimização do conteúdo público

### SEO

- Metadados por página
- Open Graph
- Sitemap automático
- RSS (`/rss.xml`)
- robots.txt

## 📦 Deploy

### Vercel (canonical)

1. Push para `main`
2. Vercel build automático
3. Variáveis de ambiente:
   - `OPENAI_API_KEY` — Clone Digital
   - `RESEND_API_KEY` — envio de email do formulário de contato
   - `BLOB_READ_WRITE_TOKEN` — Vercel Blob (CV adaptado)
   - `NEXT_PUBLIC_SITE_URL` — origem pública do site (ex: `https://meu-dominio.com`); usada por `sitemap.ts`, `robots.ts` e `rss.xml/route.ts`. Sem ela, esses endpoints caem em `http://localhost:3000`, vazando localhost para crawlers.

Domínio canônico atual: `josivan-amorim-cvd3xueje-f1x0ns-projects.vercel.app`.

### Outras Plataformas

```bash
npm run build
npm start
```

Requer Node.js 22+.

## 📊 Logs e Debug

Logs estruturados via `lib/logger.ts`:

```
[chat.request.received] { request_id, session_id, mode, message_length }
[chat.context_too_large_after_trim] { ... }
[chat.mock_mode] { request_id, mode }
```

## 🤝 Contribuindo

Portfolio pessoal, mas sugestões via issues são bem-vindas.

## 📄 Licença

Uso pessoal. Código disponível para referência educacional.

---

**Stack:** Next.js 15 · React 19 · TypeScript · Tailwind CSS · MDX · Framer Motion · cmdk · Geist · OpenAI · Vitest · Lighthouse CI

**Destaques:** View Transitions · Covers SVG vivos · Hero IA-graph animado · Easter eggs (Konami, console, palette secret, 404 caprichada) · Clone Digital IA · Job Fit Analyzer
