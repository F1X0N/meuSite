import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { getKnowledgeBase } from '@/lib/profile'
import { logger } from '@/lib/logger'
import { AUDIT_EVENTS } from '@/lib/audit-events'
import { buildRequestContext } from '@/lib/request-context'

const MAX_INPUT_TOKENS = 8000
const MODEL_NAME = 'gpt-4o'
const RATE_LIMIT_WINDOW_MS = 3600000
const MAX_REQUESTS_PER_SESSION = 10
const MAX_REQUESTS_PER_IP_HOUR = 30

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const ipLimitMap = new Map<string, { count: number; resetAt: number }>()

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

const checkIpRateLimit = (ipHash: string | null): boolean => {
  if (!ipHash) return true
  const now = Date.now()
  const bucket = ipLimitMap.get(ipHash)
  if (!bucket || now > bucket.resetAt) {
    ipLimitMap.set(ipHash, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (bucket.count >= MAX_REQUESTS_PER_IP_HOUR) return false
  bucket.count += 1
  return true
}

// ============ GUARDRAILS V5 ============
const GUARDRAILS = `
DIRETRIZES DE QUALIDADE (siga rigorosamente):

1. Use o conteúdo abaixo (perfil, cases, blog, FAQ) como ÚNICA fonte de fatos. Nunca invente clientes, métricas, números específicos ou experiências em tecnologias não mencionadas.

2. PERMITIDO sintetizar e derivar a partir do contexto:
   - Somar períodos profissionais para calcular anos de experiência.
   - Conectar capacidades implícitas no perfil (ex: trabalho com observabilidade + Grafana/Loki/Sentry implica experiência em diagnóstico de incidente).
   - Identificar fit qualitativo entre experiência documentada e a pergunta.
   - Citar limites de honestidade quando aplicável (FAQ "Limites e Honestidade").

3. Para perguntas TOTALMENTE fora do contexto (salário, vida pessoal, tecnologia nunca mencionada), responda: "Essa informação não está documentada no meu portfólio." e direcione para contato (amorimjosivan7@gmail.com).

4. Sempre cite fontes/evidências disponíveis (links para cases ou nota do blog), usando o nome exato do conteúdo (ex: "Orquestração de IA aplicada à operação técnica").

5. Mantenha tom profissional, em primeira pessoa, com profundidade técnica. Sem chavões corporativos.

6. Responda no MESMO IDIOMA da pergunta/vaga.
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
    logger.error(AUDIT_EVENTS.CHAT_PARSE_FAILURE, { snippet_length: content.length })
    return {
      type: 'answer',
      content: 'Desculpe, houve um erro ao processar a resposta. Tente novamente.',
      sources: []
    }
  }
}

const sanitizeUserInput = (text: string): string => {
  // Remove control chars (\x00-\x1F) exceto \n (\x0A), \r (\x0D), \t (\x09)
  // e DEL (\x7F). Tab/newline são preservados para formatação de JD/perguntas longas.
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
}

export async function POST(request: Request) {
  const ctx = await buildRequestContext().catch(() => null)
  const requestId = ctx?.request_id ?? null

  try {
    const { message: rawMessage, mode = 'ask', sessionId, history = [] } = await request.json()
    const message = typeof rawMessage === 'string' ? sanitizeUserInput(rawMessage) : ''

    logger.info(AUDIT_EVENTS.CHAT_REQUEST_RECEIVED, {
      request_id: requestId,
      session_id: sessionId ?? null,
      ip_hash: ctx?.ip_hash,
      mode,
      message_length: message?.length ?? 0,
    })

    // Validação de entrada
    if (!message || message.length < 3) {
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

    // Rate limit por IP (defesa adicional contra abuso multi-sessão)
    if (!checkIpRateLimit(ctx?.ip_hash ?? null)) {
      logger.warn(AUDIT_EVENTS.CHAT_RATE_LIMIT_HIT, {
        request_id: requestId,
        session_id: sessionId,
        ip_hash: ctx?.ip_hash,
        scope: 'ip',
      })
      return NextResponse.json({
        type: 'rate_limit',
        remaining: 0,
        message: 'Muitas requisições do mesmo IP. Tente novamente mais tarde.',
      })
    }

    // Rate limiting por sessão
    const rateLimit = checkRateLimit(sessionId)
    if (!rateLimit.allowed) {
      logger.warn(AUDIT_EVENTS.CHAT_RATE_LIMIT_HIT, {
        request_id: requestId,
        session_id: sessionId,
        ip_hash: ctx?.ip_hash,
        scope: 'session',
      })
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
      logger.info(AUDIT_EVENTS.CHAT_MOCK_MODE, { request_id: requestId, mode })

      // Delay to simulate API
      await new Promise(resolve => setTimeout(resolve, 2000))

      if (mode === 'job_fit') {
        return NextResponse.json({
          type: "job_fit",
          match_score_0_100: 0,
          summary_md: "Modo de demonstração ativo (sem chave de API). Para obter análise real de fit técnico, configure OPENAI_API_KEY no servidor. Quando ativo, a análise compara a vaga ao Knowledge Base público e retorna match honesto com evidências.",
          requirements: [],
          gaps: ["Modo demo ativo — análise real exige OPENAI_API_KEY configurada."],
          open_questions: [],
          sources: [{ label: "Knowledge Base público", href: "/case-studies" }],
          remaining: rateLimit.remaining
        })
      }

      return NextResponse.json({
        type: "answer",
        content: "Modo de demonstração ativo (sem chave de API). Em modo real, este assistente responde com base no Knowledge Base público de Josivan Amorim — quando não há evidência documentada, retorna \"não documentado\". Configure OPENAI_API_KEY no servidor para ativar respostas reais.",
        sources: [{ label: "Ver Case Studies", href: "/case-studies" }, { label: "Notas de Engenharia", href: "/blog" }],
        remaining: rateLimit.remaining
      })
    }

    // Contexto do perfil
    const profileContext = getKnowledgeBase()

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
    logger.info(AUDIT_EVENTS.CHAT_OPENAI_DISPATCHED, {
      request_id: requestId,
      model: MODEL_NAME,
      input_tokens_est: currentTokens,
    })
    const startedAt = Date.now()
    const response = await generateResponse(client, apiMessages, mode)
    logger.info(AUDIT_EVENTS.CHAT_OPENAI_RESPONDED, {
      request_id: requestId,
      latency_ms: Date.now() - startedAt,
      response_type: response.type ?? 'unknown',
    })

    const headers = new Headers()
    if (requestId) headers.set('x-request-id', requestId)
    return NextResponse.json({ ...response, remaining: rateLimit.remaining }, { headers })

  } catch (error) {
    logger.error(AUDIT_EVENTS.API_ERROR_UNHANDLED, {
      request_id: requestId,
      route: '/api/ai/chat',
      error_class: error instanceof Error ? error.constructor.name : 'unknown',
      error_message: error instanceof Error ? error.message.slice(0, 200) : 'unknown',
    })
    return NextResponse.json({ error: 'Erro ao processar mensagem' }, { status: 500 })
  }
}

