import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { getAllContent } from '@/lib/mdx'
import { getKnowledgeBase } from '@/lib/profile'

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
Sua função é responder perguntas de recrutadores e CTOs sobre a experiência, habilidades e projetos de Josivan.

USE O SEGUINTE CONTEXTO COMO SUA FONTE DE VERDADE:

=== PERFIL PROFISSIONAL & EXPERIÊNCIA (PRIORITÁRIO) ===
${profileContext}

=== DETALHES DE CASES/POSTS RELACIONADOS ===
${docContext}

DIRETRIZES:
1. Responda APENAS com base no contexto acima. Se não souber, diga que não tem essa informação no portfólio.
2. Seja objetivo, técnico e direto (tom de engenheiro sênior).
3. Valorize conquistas quantitativas (ex: "redução de 60% custo").
4. Sempre que citar um projeto, mencione o nome dele.
5. Fale em primeira pessoa ("Eu fiz...", "Minha experiência...").

Pergunta do Recrutador: ${question}

Resposta:`
}

const generateAnswer = async (client, prompt) => {
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Você é um assistente profissional representando Josivan Amorim.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 500,
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
  try {
    const { question } = await request.json()

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
    const answer = await generateAnswer(client, prompt)

    const sources = relevantDocs.map((doc) => ({
      title: doc.title,
      slug: doc.slug,
      type: doc.readingTime ? 'blog' : 'case-study',
    }))

    return NextResponse.json({ answer, sources })

  } catch (error) {
    console.error('Error in ask-my-work:', error)
    return NextResponse.json(
      { error: 'Erro ao processar pergunta' },
      { status: 500 }
    )
  }
}
