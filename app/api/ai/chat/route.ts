
import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { getKnowledgeBase } from '@/lib/profile'

const MAX_INPUT_TOKENS = 8000 // Aumentado para acomodar knowledge base expandida
const MODEL_NAME = 'gpt-4o'
const RATE_LIMIT_WINDOW_MS = 3600000 
const MAX_REQUESTS_PER_SESSION = 10 

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

const createClient = () => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null
  return new OpenAI({ apiKey })
}

const countTokens = (messages: any[]) => {
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

const detectIntent = (message: string): 'job_description' | 'question' => {
  const lowercaseMessage = message.toLowerCase()
  
  const jdIndicators = [
    'requisitos', 'responsabilidades', 'qualificações', 'benefícios', 'salário', 'vaga', 'contratação', 'descrição',
    'requirements', 'responsibilities', 'qualifications', 'benefits', 'salary', 'position', 'hiring', 'description', 'job', 'role',
  ]

  const hasMultipleIndicators = jdIndicators.filter(indicator => lowercaseMessage.includes(indicator)).length >= 2

  if ((message.length > 100 && hasMultipleIndicators) || message.length > 500) {
    console.log('[AI Intent] Detected: JOB_DESCRIPTION')
    return 'job_description'
  }

  console.log('[AI Intent] Detected: QUESTION')
  return 'question'
}

const buildSystemPrompt = (profileContext: string, intent: string) => {
  if (intent === 'job_description') {
    return `Você é o "Clone Digital" de Josivan Amorim analisando uma vaga.
Seu objetivo é vender Josivan como a escolha óbvia, destacando fit cultural e técnico.

⚠️ METAREGRA DE IDIOMA: Responda no MESMO IDIOMA da descrição da vaga fornecida pelo usuário.

=== PERFIL DO CANDIDATO ===
${profileContext}

TAREFA: Análise de FIT estruturada em JSON (Seja vendedor, mas honesto tecnicamente):
{
  "type": "job_fit",
  "fitScore": number (0-100),
  "summary": "Resumo de 2 linhas focando no valor que Josivan entrega para ESSA vaga específica (No idioma da vaga).",
  "skillsMatch": [{ "skill": "Nome", "evidence": "Contexto curto de uso" }],
  "skillsGap": ["Skills que faltam"],
  "highlights": ["3 pontos fortíssimos de venda"],
  "nextSteps": "Call to action amigável para marcar uma conversa"
}

Responda APENAS com JSON válido.`
  }

  return `Você é o "Clone Digital" profissional de Josivan Amorim.
Seu objetivo único: CONVENCER o recrutador/CTO que Josivan é um engenheiro de alto nível.

⚠️ METAREGRA DE IDIOMA (CRÍTICO):
Detecte o idioma da última mensagem do usuário e responda EXATAMENTE no mesmo idioma.

=== PERFIL COMPLETO (Sua Memória) ===
${profileContext}

DIRETRIZES DE RESPOSTA:
1. **Seja Objetivo:** Vá direto ao ponto.
2. **Venda Valor, não Features:** Não diga "usei Python", diga "usei Python para reduzir custos em 60%".
3. **Tom de Voz:** Profissional, confiante, pragmático.
4. **Primeira Pessoa:** Fale como Josivan ("Eu fiz", "Minha visão").

REGRA DE MISSING INFO / FALLBACK:
Se a pergunta for sobre algo que NÃO consta no seu perfil:
NÃO INVENTE. Gere:
{
  "type": "fallback_contact",
  "content": "Mensagem convidando para email",
  "contactInfo": { "email": "amorimjosivan7@gmail.com", "linkedin": "https://linkedin.com/in/josivan-amorim-44401120a" }
}`
}

const generateResponse = async (client: OpenAI, messages: any[], intent: string) => {
  const response = await client.chat.completions.create({
    model: MODEL_NAME,
    messages: messages,
    temperature: intent === 'job_description' ? 0.2 : 0.4,
    max_tokens: intent === 'job_description' ? 1500 : 400,
    ...(intent === 'job_description' ? { response_format: { type: "json_object" } } : {}) 
  })

  const content = response.choices[0].message.content || ''

  try {
    if (content.trim().startsWith('{')) {
      const parsed = JSON.parse(content)
      if (parsed.type === 'fallback_contact' || intent === 'job_description') {
        return parsed
      }
    }
  } catch (e) {}

  return { type: 'answer', content }
}

export async function POST(request: Request) {
  try {
    const { message, sessionId, history = [] } = await request.json()

    console.log('[Request] Message length:', message?.length, 'chars')
    
    if (!message || message.trim().length < 3) {
      console.log('[REJECT] Message too short')
      return NextResponse.json( { error: 'Mensagem muito curta' }, { status: 400 } )
    }
    
    // VALIDAÇÃO 1: Tamanho da mensagem de entrada isoladamente (evitar textos gigantes do usuário)
    const MAX_USER_MESSAGE_CHARS = 5000
    if (message.length > MAX_USER_MESSAGE_CHARS) { 
      console.log('[REJECT] User message too long:', message.length, 'chars')
       return NextResponse.json( { 
         error: `O texto enviado é muito grande para análise (${message.length} caracteres). Por favor, resuma ou envie em partes menores (máximo ${MAX_USER_MESSAGE_CHARS} caracteres).` 
       }, { status: 400 } )
    }

    if (!sessionId) {
      console.log('[REJECT] Missing session ID')
      return NextResponse.json( { error: 'Session ID obrigatório' }, { status: 400 } )
    }

    const rateLimit = checkRateLimit(sessionId)
    if (!rateLimit.allowed) {
      return NextResponse.json({
        type: 'rate_limit_rich',
        remaining: 0,
        message: 'Limite de mensagens atingido.',
        contactInfo: { email: 'amorimjosivan7@gmail.com', linkedin: 'https://linkedin.com/in/josivan-amorim-44401120a' }
      })
    }

    const client = createClient()
    if (!client) {
      return NextResponse.json( { error: 'Serviço de IA não configurado' }, { status: 503 } )
    }

    const profileContext = getKnowledgeBase()
    console.log('[Context] Knowledge base length:', profileContext?.length || 0, 'chars')
    
    const intent = detectIntent(message)
    const systemPrompt = buildSystemPrompt(profileContext || '', intent)

    let apiMessages = [
      { role: 'system', content: systemPrompt },
      ...history.map((h: any) => ({ role: h.role === 'user' ? 'user' : 'assistant', content: typeof h.content === 'string' ? h.content : JSON.stringify(h.content) })),
      { role: 'user', content: message }
    ]

    // VALIDAÇÃO 2: Contexto total (knowledge base + history + user message)
    let currentTokens = countTokens(apiMessages)
    console.log('[Tokens] Estimated:', currentTokens, '/ MAX:', MAX_INPUT_TOKENS)
    
    while (currentTokens > MAX_INPUT_TOKENS && apiMessages.length > 2) {
      apiMessages.splice(1, 1) // Remove histórico mais antigo
      currentTokens = countTokens(apiMessages)
      console.log('[Tokens] After trim:', currentTokens)
    }

    if (currentTokens > MAX_INPUT_TOKENS) {
      console.log('[REJECT] Context too large after trimming')
       return NextResponse.json({ 
         error: 'Contexto da conversa muito extenso. Por favor, limpe o histórico para continuar.' 
       }, { status: 400 })
    }

    const response = await generateResponse(client, apiMessages, intent)

    return NextResponse.json({ ...response, remaining: rateLimit.remaining })

  } catch (error) {
    console.error('CRITICAL ERROR in AI Chat:', error)
    return NextResponse.json( { error: 'Erro ao processar mensagem' }, { status: 500 } )
  }
}
