# Portfolio Técnico 2026 🚀

Site pessoal moderno com **Clone Digital IA** construído com **Next.js 15**, **TypeScript**, **Tailwind CSS** e integração com **OpenAI API**.

## ✨ Características Principais

### 🤖 Clone Digital com IA
- **Chat Inteligente** com contexto completo do perfil profissional
- **Job Fit Analyzer** para análise automática de vagas
- **Knowledge Base Otimizada** (~70% redução de tokens via resumos estáticos)
- **Multi-Provider Resilience** pronto para fallback OpenAI/Anthropic
- **Validação em 2 Etapas** (mensagem isolada + contexto total)
- **Rate Limiting** inteligente por sessão
- **Modo Foco** com ESC global e scroll automático

### 🎨 Design & UX
- ✅ **Design System** completo com temas claro/escuro
- ✅ **Animações Fluidas** com Framer Motion
- ✅ **Responsivo** mobile-first
- ✅ **Acessibilidade** (ARIA, keyboard navigation)

### 📝 Conteúdo Dinâmico
- ✅ **Case Studies** em MDX com estrutura padronizada
- ✅ **Blog Técnico** com syntax highlighting
- ✅ **Knowledge Base** anonimizada (compliance-safe)

### ⚡ Performance & SEO
- ✅ **SSG** para todas as páginas estáticas
- ✅ **Image Optimization** via `next/image`
- ✅ **Bundle Splitting** automático
- ✅ **SEO Completo** (metadados, Open Graph, JSON-LD)

## 🗂️ Estrutura do Projeto

```
meuSite/
├── app/                          # App Router (Next.js 15)
│   ├── layout.tsx                # Layout raiz com tema
│   ├── page.tsx                  # Home com seções integradas
│   ├── case-studies/             # Listagem e detalhe de cases
│   ├── blog/                     # Blog técnico
│   ├── about/                    # Sobre
│   ├── contact/                  # Contato com formulário
│   └── api/                      # API Routes
│       └── ai/
│           └── chat/             # Endpoint do Clone Digital
├── components/
│   ├── ui/                       # Componentes base (Button, Card, Badge)
│   ├── layout/                   # Header, Footer, ThemeToggle
│   ├── content/                  # Hero, Highlights, FeaturedCases
│   ├── sections/                 # AIChat (Clone Digital)
│   └── motion/                   # Wrappers de animação
├── config/                       # Configuração centralizada
│   ├── site.ts                   # Identidade, navegação, links
│   ├── copy.ts                   # Textos (Hero, Highlights, About)
│   └── motion.ts                 # Variantes de animação
├── content/                      # Conteúdo MDX
│   ├── case-studies/             # Cases em MDX
│   ├── blog/                     # Artigos técnicos
│   └── knowledge-base.md         # Base de conhecimento da IA
└── lib/                          # Utilities e helpers
    ├── mdx.ts                    # Parser MDX
    └── profile.ts                # Carregador de knowledge base
```

## 🚀 Começando

### Pré-requisitos

- Node.js 18+ 
- OpenAI API Key (para o Clone Digital)

### Instalação

```bash
# Clonar repositório
git clone <repo-url>
cd meuSite

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env e adicione sua OPENAI_API_KEY
```

### Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Build de Produção

```bash
npm run build
npm start
```

## 🤖 Clone Digital IA

### Configuração

1. Adicione sua OpenAI API Key no `.env`:
```env
OPENAI_API_KEY=sk-...
```

2. Personalize a Knowledge Base em `content/knowledge-base.md`

3. O sistema automaticamente:
   - Detecta se a mensagem é uma Job Description (>100 chars + 2 keywords)
   - Valida tamanho da entrada (limite: 5000 chars)
   - Gerencia contexto total (knowledge base + histórico)
   - Retorna JSON estruturado para análise de fit

### Fluxo de Job Fit

```typescript
// Usuário cola descrição de vaga
POST /api/ai/chat
{
  "message": "Job Description...",
  "sessionId": "session_123",
  "history": []
}

// Resposta automática
{
  "type": "job_fit",
  "fitScore": 85,
  "summary": "Excelente fit técnico...",
  "skillsMatch": [...],
  "skillsGap": [...],
  "highlights": [...],
  "nextSteps": "..."
}
```

### Limites de Tokens

- **Mensagem isolada**: 5000 caracteres (~1400 tokens)
- **Contexto total**: 8000 tokens (knowledge base + histórico + mensagem)
- **Trimming automático**: Remove histórico antigo se necessário

## 📝 Adicionando Conteúdo

### Criar um Case Study

1. Crie `content/case-studies/seu-case.mdx`:

```markdown
---
title: "Título do Case"
description: "Descrição curta"
date: "2026-01-24"
tags: ["IA", "OCR", "FinOps"]
featured: true
---

## Contexto
...

## Problema
...

## Decisão e Trade-offs
...

## Implementação
```code
...
```

## Validação
...

## Impacto
...

## Stack Evidenciada
...
```

2. O case aparecerá automaticamente na listagem

### Criar um Post de Blog

Siga a mesma estrutura em `content/blog/`.

## 🎨 Sistema de Design

### Cores (CSS Variables)

Defina tokens em `app/globals.css`:
- `--primary` - Cor principal (cyan por padrão)
- `--background` / `--foreground` - Fundos e textos
- `--card` - Cor de cards
- `--muted` - Elementos secundários
- `--border` - Bordas

**🚫 Regra Purple Ban:** Evite violet/purple (conforme design guidelines).

### Componentes Base

- **Button**: `primary`, `secondary`, `outline`, `ghost`, `link`
- **Card**: Para destacar conteúdo
- **Badge**: Para tags
- **Reveal**: Animação de entrada

### Animações

Variantes centralizadas em `config/motion.ts`:
- `revealUp` - Elementos surgem com fade + slide
- `stagger` - Animação sequencial em listas
- `hoverLift` - Elevação em hover

## 🏗️ Arquitetura

### Princípios Funcionais

Todo código segue paradigma funcional puro:
- ✅ Funções pequenas e single-purpose
- ✅ Early returns (sem else/elif)
- ✅ Sem nested ifs
- ✅ Data-driven strategies
- ✅ Nomes descritivos em inglês
- ✅ Zero comentários desnecessários (código auto-explicativo)

### Performance

- **SSG** para todas as páginas estáticas
- **Image Optimization** via `next/image`
- **Bundle Splitting** automático
- **Font Optimization** com `next/font`
- **Knowledge Base Estática** (~70% economia de tokens)

### SEO

- Metadados por página
- Open Graph tags
- Structured data (JSON-LD)
- Sitemap automático
- robots.txt

## 🔒 Segurança & Compliance

- ✅ **Anonimização**: Nomes de empresas substituídos por descrições genéricas
- ✅ **Rate Limiting**: 10 mensagens/hora por sessão
- ✅ **Validação de Input**: Sanitização de mensagens
- ✅ **Environment Variables**: Secrets protegidas

## 📦 Deploy

### Vercel (Recomendado)

1. Push para GitHub
2. Conecte no Vercel
3. Adicione `OPENAI_API_KEY` nas Environment Variables
4. Deploy automático em cada commit

### Outras Plataformas

```bash
npm run build
```

Deploy a pasta `.next` em qualquer plataforma que suporte Node.js.

**Requisitos de Runtime:**
- Node.js 18+
- Variável de ambiente: `OPENAI_API_KEY`

## 🧪 Desenvolvimento

### Type Check

```bash
npm run type-check
```

### Lint

```bash
npm run lint
```

## 📊 Logs e Debug

O sistema fornece logs detalhados:

```
[Request] Message length: 1234 chars
[Context] Knowledge base length: 8967 chars
[AI Intent] Detected: JOB_DESCRIPTION
[Tokens] Estimated: 2345 / MAX: 8000
POST /api/ai/chat 200 in 5432ms
```

Em caso de erro:
```
[REJECT] User message too long: 6789 chars
[REJECT] Context too large after trimming
```

## 🤝 Contribuindo

Este é um portfolio pessoal, mas sugestões são bem-vindas via issues.

## 📄 Licença

Uso pessoal. Código disponível para referência educacional.

---

**Stack Principal**: Next.js 15 · React 19 · TypeScript · Tailwind CSS · MDX · Framer Motion · OpenAI API

**Features Destacadas**: Clone Digital IA · Job Fit Analyzer · Knowledge Base Otimizada · Multi-Provider Ready
