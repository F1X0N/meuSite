import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { getAllContent } from '@/lib/mdx'
import { getKnowledgeBase } from '@/lib/profile'
import { logger } from '@/lib/logger'
import { AUDIT_EVENTS } from '@/lib/audit-events'
import { buildRequestContext } from '@/lib/request-context'

const createClient = () => {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    return null
  }

  return new OpenAI({ apiKey })
}

const buildPrompt = (question, profileContext, relevantDocs) => {
  const docContext = relevantDocs
    .map((doc) => `[Referência: ${doc.title}]\n${doc.description}\nTags: ${doc.tags.join(', ')}`)
    .join('\n\n')

  return `Você é o "Clone Digital" profissional de Josivan Amorim.
Sua função é responder perguntas de recrutadores e CTOs sobre a experiência, habilidades e projetos de Josivan, em primeira pessoa, com profundidade técnica e honestidade.

=== PERFIL PROFISSIONAL & EXPERIÊNCIA (FONTE DE VERDADE) ===
${profileContext}

=== DETALHES DE CASES/POSTS RELACIONADOS ===
${docContext}

DIRETRIZES:

1. Use o contexto acima como ÚNICA fonte de fatos. NUNCA invente clientes, números específicos não documentados, ou experiências em tecnologias não mencionadas.

2. PERMITIDO sintetizar e derivar informações a partir do contexto:
   - Somar períodos profissionais para calcular anos totais de experiência.
   - Conectar capacidades implícitas no perfil (ex: se trabalho com observabilidade e tenho Grafana/Loki/Sentry listados, posso falar sobre diagnóstico de incidente).
   - Identificar fit qualitativo entre minha experiência e a pergunta.
   - Citar limites de honestidade quando aplicável (FAQ "Limites e Honestidade").

3. Quando a resposta exigir cálculo derivado (ex: anos totais), explicite o cálculo de forma sintética:
   "Considerando os períodos X (Y meses) + Z (W meses), tenho cerca de N anos de experiência."

4. Para perguntas TOTALMENTE fora do contexto (ex: salário pretendido, vida pessoal, tecnologia que nunca foi mencionada no perfil), seja honesto: "Essa informação não está documentada no meu portfólio. Para conversar diretamente: amorimjosivan7@gmail.com."

5. Tom de engenheiro sênior: objetivo, técnico, em primeira pessoa. Sem chavões corporativos.

6. Sempre que citar um case study ou nota do blog, use o nome exato do conteúdo (ex: "Orquestração de IA aplicada à operação técnica", "Métricas que pagam a conta").

7. Quando a pergunta tocar área onde tenho menos experiência (citada no FAQ "Limites e Honestidade"), seja honesto sobre a limitação em vez de exagerar.

EXEMPLOS DE BOAS RESPOSTAS:

Pergunta: "Quantos anos de experiência você tem?"
Resposta: "Calculando a partir dos períodos documentados no perfil — Grupo Dass como cronometrista (fev/2021 a fev/2022), freelance frontend (jul/2021 a jul/2024) e Grupo Dass como dev full stack (fev/2022 a jul/2024), mais SaaS LegalTech atual (jul/2024 até a data atual) — tenho cerca de 4 a 5 anos de experiência profissional contínua, com foco crescente em engenharia de software e IA aplicada nos últimos ~3 anos. (Use a data atual ao calcular o período da posição atual; não cite duração fixa do papel atual.)"

Pergunta: "Você tem experiência com microsserviços?"
Resposta: "Tenho preferência por monólito modular bem fatiado em domínio jovem, conforme descrito no meu princípio de engenharia. Microsserviços têm custo operacional real (deploy, observabilidade, contratos, debugging distribuído) que só compensa quando o limite de escala ou time exige. Meu uso direto de microsserviços em produção é limitado — uso quando faz sentido, não como default."

Pergunta: "Quanto você cobra por hora?"
Resposta: "Essa informação não está documentada no meu portfólio. Para discutir compensação ou oportunidades, entre em contato: amorimjosivan7@gmail.com ou linkedin.com/in/josivan-amorim-44401120a."

Pergunta do Recrutador: ${question}

Resposta:`
}

const generateAnswer = async (client, prompt) => {
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Você é um assistente profissional representando Josivan Amorim.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 700,
  })

  return response.choices[0].message.content
}

const simpleSearch = (query, documents) => {
  const queryLower = query.toLowerCase()
  
  return documents
    .map((doc) => {
      // Peso maior para título e tags
      const titleMatch = doc.title.toLowerCase().includes(queryLower) * 3
      const descMatch = doc.description.toLowerCase().includes(queryLower) * 1
      const tagsMatch = doc.tags.some((tag) => tag.toLowerCase().includes(queryLower)) * 2
      
      return { ...doc, score: titleMatch + descMatch + tagsMatch }
    })
    .filter((doc) => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}

export async function POST(request) {
  const ctx = await buildRequestContext().catch(() => null)
  const requestId = ctx?.request_id ?? null

  try {
    const { question } = await request.json()

    logger.info(AUDIT_EVENTS.ASK_MY_WORK_REQUESTED, {
      request_id: requestId,
      ip_hash: ctx?.ip_hash,
      question_length: typeof question === 'string' ? question.length : 0,
    })

    if (!question || question.trim().length < 3) {
      return NextResponse.json(
        { error: 'Pergunta muito curta' },
        { status: 400 }
      )
    }

    const client = createClient()
    
    if (!client) {
      return NextResponse.json(
        { error: 'Serviço de IA não configurado' },
        { status: 503 }
      )
    }

    // 1. Carregar Contexto Principal (Knowledge Base)
    const profileContext = getKnowledgeBase()

    // 2. Buscar Docs Relevantes (apenas para citar fontes/links)
    const { all: allContent } = getAllContent()
    const relevantDocs = simpleSearch(question, allContent)

    // 3. Se não tiver conhecimento base nem docs, falhar (edge case raro)
    if (!profileContext && relevantDocs.length === 0) {
      return NextResponse.json({
        answer: 'Desculpe, não consegui carregar meu perfil no momento.',
        sources: [],
      })
    }

    // 4. Gerar Resposta
    const prompt = buildPrompt(question, profileContext, relevantDocs)
    const startedAt = Date.now()
    const answer = await generateAnswer(client, prompt)
    logger.info(AUDIT_EVENTS.ASK_MY_WORK_COMPLETED, {
      request_id: requestId,
      latency_ms: Date.now() - startedAt,
      sources_count: relevantDocs.length,
    })

    const sources = relevantDocs.map((doc) => ({
      title: doc.title,
      slug: doc.slug,
      type: doc.readingTime ? 'blog' : 'case-study',
    }))

    const headers = new Headers()
    if (requestId) headers.set('x-request-id', requestId)
    return NextResponse.json({ answer, sources }, { headers })

  } catch (error) {
    logger.error(AUDIT_EVENTS.API_ERROR_UNHANDLED, {
      request_id: requestId,
      route: '/api/ai/ask-my-work',
      error_class: error instanceof Error ? error.constructor.name : 'unknown',
      error_message: error instanceof Error ? error.message.slice(0, 200) : 'unknown',
    })
    return NextResponse.json(
      { error: 'Erro ao processar pergunta' },
      { status: 500 }
    )
  }
}
