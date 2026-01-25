import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { getKnowledgeBase } from '@/lib/profile'

const MAX_INPUT_TOKENS = 8000
const MODEL_NAME = 'gpt-4o'
const RATE_LIMIT_WINDOW_MS = 3600000
const MAX_REQUESTS_PER_SESSION = 10

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

const createClient = () => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null
  return new OpenAI({ apiKey })
}

const countTokens = (messages: { role: string; content: string }[]) => {
  const totalChars = messages.reduce((acc, m) => acc + (m.content?.length || 0), 0)
  return Math.ceil(totalChars / 3.5) + (messages.length * 4)
}

const checkRateLimit = (sessionId: string): { allowed: boolean; remaining: number } => {
  const now = Date.now()
  const userLimit = rateLimitMap.get(sessionId)

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitMap.set(sessionId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true, remaining: MAX_REQUESTS_PER_SESSION - 1 }
  }

  if (userLimit.count >= MAX_REQUESTS_PER_SESSION) {
    return { allowed: false, remaining: 0 }
  }

  userLimit.count++
  return { allowed: true, remaining: MAX_REQUESTS_PER_SESSION - userLimit.count }
}

// ============ GUARDRAILS V4.1 ============
const GUARDRAILS = `
⚠️ GUARDRAILS OBRIGATÓRIOS (NUNCA VIOLE):
1. Responda APENAS com base no conteúdo fornecido abaixo (cases, blog, trajetória).
2. PROIBIDO inventar fatos, clientes, métricas, experiências ou números não documentados.
3. Se não houver evidência no perfil, diga "não informado" ou "unknown" — NUNCA INVENTE.
4. Sempre inclua fontes/evidências quando disponíveis (links para cases/blog).
5. Mantenha tom profissional, confiante e objetivo.
6. Responda no MESMO IDIOMA da pergunta/vaga do usuário.
`

// ============ PROMPTS POR MODO ============
const buildAskPrompt = (profileContext: string) => `
Você é um assistente inteligente que responde perguntas sobre o perfil profissional de Josivan Amorim.
${GUARDRAILS}

=== PERFIL E EVIDÊNCIAS (Sua única fonte de verdade) ===
${profileContext}

FORMATO DE RESPOSTA (JSON):
{
  "type": "answer",
  "content": "Resposta clara e objetiva em primeira pessoa (como Josivan)",
  "sources": [{ "label": "Nome do Case/Post", "href": "/case-studies/slug-do-case" }],
  "followups": ["Sugestão de pergunta 1", "Sugestão de pergunta 2"]
}

Se não houver informação no perfil para responder:
{
  "type": "answer",
  "content": "Essa informação não está documentada no meu portfolio. Entre em contato para conversarmos: amorimjosivan7@gmail.com",
  "sources": []
}

Responda APENAS com JSON válido.
`

const buildJobFitPrompt = (profileContext: string) => `
Você é um analisador de compatibilidade profissional. Seu objetivo é comparar uma vaga com o perfil de Josivan Amorim.
${GUARDRAILS}

=== PERFIL E EVIDÊNCIAS (Sua única fonte de verdade) ===
${profileContext}

TAREFA: Analise a job description e retorne um diagnóstico de compatibilidade.

FORMATO DE RESPOSTA (JSON obrigatório):
{
  "type": "job_fit",
  "match_score_0_100": number (0-100, baseado em evidências reais),
  "summary_md": "Resumo de 2-3 linhas sobre a compatibilidade geral",
  "requirements": [
    {
      "requirement": "Requisito extraído da vaga",
      "status": "match" | "partial" | "unknown",
      "evidence_links": ["/case-studies/slug"],
      "notes": "Breve justificativa"
    }
  ],
  "gaps": ["Gap honesto 1", "Gap honesto 2"],
  "open_questions": ["Pergunta para o recrutador esclarecer"],
  "sources": [{ "label": "Case relevante", "href": "/case-studies/slug" }]
}

REGRAS:
- "match": há evidência clara no perfil
- "partial": há experiência relacionada mas não exata
- "unknown": não há informação — NUNCA marque como "match" sem evidência
- Gaps devem ser honestos e profissionais
- match_score deve refletir a realidade das evidências (não infle artificialmente)

Responda APENAS com JSON válido.
`

const generateResponse = async (
  client: OpenAI,
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  mode: 'ask' | 'job_fit'
) => {
  const response = await client.chat.completions.create({
    model: MODEL_NAME,
    messages: messages,
    temperature: mode === 'job_fit' ? 0.2 : 0.4,
    max_tokens: mode === 'job_fit' ? 2000 : 800,
    response_format: { type: 'json_object' }
  })

  const content = response.choices[0].message.content || ''

  try {
    const parsed = JSON.parse(content)
    return parsed
  } catch {
    console.error('[AI] Failed to parse JSON response:', content.substring(0, 200))
    return {
      type: 'answer',
      content: 'Desculpe, houve um erro ao processar a resposta. Tente novamente.',
      sources: []
    }
  }
}

export async function POST(request: Request) {
  try {
    const { message, mode = 'ask', sessionId, history = [] } = await request.json()

    console.log('[Request] Mode:', mode, '| Message length:', message?.length, 'chars')

    // Validação de entrada
    if (!message || message.trim().length < 3) {
      return NextResponse.json({ error: 'Mensagem muito curta' }, { status: 400 })
    }

    const MAX_USER_MESSAGE_CHARS = 5000
    if (message.length > MAX_USER_MESSAGE_CHARS) {
      return NextResponse.json({
        error: `Texto muito grande (${message.length} chars). Máximo: ${MAX_USER_MESSAGE_CHARS}.`
      }, { status: 400 })
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID obrigatório' }, { status: 400 })
    }

    // Rate limiting
    const rateLimit = checkRateLimit(sessionId)
    if (!rateLimit.allowed) {
      return NextResponse.json({
        type: 'rate_limit',
        remaining: 0,
        message: 'Limite de mensagens atingido. Entre em contato diretamente.'
      })
    }

    // Cliente OpenAI
    const client = createClient()

    // MOCK MODE: Se não houver cliente, usar simulação para testes
    if (!client) {
      console.log('[AI Chat] Running in MOCK MODE (No API Key found)')

      // Delay to simulate API
      await new Promise(resolve => setTimeout(resolve, 2000))

      if (mode === 'job_fit') {
        return NextResponse.json({
          type: "job_fit",
          match_score_0_100: 92,
          summary_md: "Análise preliminar: Meu perfil tem forte alinhamento com esta vaga. A experiência com stacks modernas (Next.js/React) e entrega de valor em produção (Cases de IA e FinOps) cobre os principais requisitos listados.",
          requirements: [
            { requirement: "Experiência sólida com React & Ecossistema Moderno", status: "match", evidence_links: ["/case-studies/platform-v2"], notes: "Histórico comprovado em apps complexos e performáticos." },
            { requirement: "Foco em Qualidade e Testes", status: "match", evidence_links: [], notes: "Adoção rigorosa de testes automatizados e code review." },
            { requirement: "Fit Cultural / Autonomia", status: "match", evidence_links: [], notes: "Perfil autodidata com foco em resolver problemas de negócio." }
          ],
          gaps: ["Disponibilidade para início imediato (a confirmar)", "Experiência em nichos específicos da vaga (se houver)"],
          open_questions: ["Qual o principal desafio técnico do time para os próximos 6 meses?", "Como é a estrutura de deploy e CI/CD atual?"],
          sources: [{ label: "Trajetória Profissional", href: "/#about" }],
          remaining: rateLimit.remaining
        })
      }

      return NextResponse.json({
        type: "answer",
        content: "Olá! Sou o assistente virtual do Josivan. \n\nPosso confirmar que tenho experiência prática e resultados consistentes em **Engenharia de Software** e **IA Aplicada**, focando sempre em código limpo, performance e impacto no negócio.\n\nPara detalhes específicos sobre um projeto ou stack, sinta-se à vontade para perguntar ou explorar meus Case Studies!",
        sources: [{ label: "Ver Case Studies", href: "/case-studies" }, { label: "Sobre Mim", href: "/#about" }],
        remaining: rateLimit.remaining
      })
    }

    // Contexto do perfil
    const profileContext = getKnowledgeBase()
    console.log('[Context] Knowledge base:', profileContext?.length || 0, 'chars')

    // Escolhe prompt baseado no modo
    const systemPrompt = mode === 'job_fit'
      ? buildJobFitPrompt(profileContext || '')
      : buildAskPrompt(profileContext || '')

    // Monta mensagens para API
    const apiMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-4).map((h: { role: string; content: string }) => ({
        role: (h.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: typeof h.content === 'string' ? h.content : JSON.stringify(h.content)
      })),
      { role: 'user', content: message }
    ]

    // Validação de tokens
    let currentTokens = countTokens(apiMessages)
    console.log('[Tokens] Estimated:', currentTokens, '/ MAX:', MAX_INPUT_TOKENS)

    while (currentTokens > MAX_INPUT_TOKENS && apiMessages.length > 2) {
      apiMessages.splice(1, 1)
      currentTokens = countTokens(apiMessages)
    }

    if (currentTokens > MAX_INPUT_TOKENS) {
      return NextResponse.json({
        error: 'Contexto muito extenso. Por favor, inicie uma nova conversa.'
      }, { status: 400 })
    }

    // Gera resposta
    const response = await generateResponse(client, apiMessages, mode)

    return NextResponse.json({ ...response, remaining: rateLimit.remaining })

  } catch (error) {
    console.error('[AI Chat] Critical error:', error)
    return NextResponse.json({ error: 'Erro ao processar mensagem' }, { status: 500 })
  }
}

