import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { getKnowledgeBase } from '@/lib/profile'

const createClient = () => {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    return null
  }

  return new OpenAI({ apiKey })
}

const buildJobFitPrompt = (jobDescription, profileContext) => {
  return `Você é um Recrutador Técnico Sênior especializado em validar fit técnico.
Analise a compatibilidade entre a VAGA (abaixo) e o PERFIL DO CANDIDATO (Josivan Amorim).

=== PERFIL DO CANDIDATO (Fonte de Verdade) ===
${profileContext}

=== DESCRIÇÃO DA VAGA ===
${jobDescription}

ANÁLISE REQUERIDA (Seja rigoroso, mas justo):
1. **Fit Score** (0-100): Score baseado em requisitos técnicos e culturais.
2. **Skills Match**: Liste as skills da vaga que o candidato REALMENTE tem, citando onde ele usou (empresa/projeto).
3. **Skills Gap**: Liste honestamente o que falta ou onde a experiência é fraca.
4. **Destaques**: Top 3 argumentos para contratar este candidato para ESSA vaga.
5. **Recomendações**: Sugestão de como o candidato pode se vender melhor para essa posição.

Formato de resposta (JSON estrito):
{
  "fitScore": number,
  "summary": "Resumo executivo de 2 frases sobre o match",
  "skillsMatch": [{ "skill": "React", "evidence": "Usou no Grupo Dass para sistema com 28k usuários" }],
  "skillsGap": ["Kubernetes (tem experiência básica, vaga pede expert)"],
  "highlights": ["Destaque 1", "Destaque 2", "Destaque 3"],
  "recommendations": ["Recomendação 1", "Recomendação 2"]
}

Responda APENAS com o JSON válido, sem markdown.`
}

const analyzeJobFit = async (client, prompt) => {
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Você é um analisador de job fit. Responda APENAS com JSON válido.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2, // Baixa temperatura para análise consistente
    max_tokens: 1500,
    response_format: { type: "json_object" } // Garante JSON válido
  })

  return JSON.parse(response.choices[0].message.content)
}

export async function POST(request) {
  try {
    const { jobDescription } = await request.json()

    if (!jobDescription || jobDescription.trim().length < 50) {
      return NextResponse.json(
        { error: 'Descrição da vaga muito curta (mínimo 50 caracteres)' },
        { status: 400 }
      )
    }

    if (jobDescription.length > 10000) {
      return NextResponse.json(
        { error: 'Descrição da vaga muito longa (máximo 10000 caracteres)' },
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

    const profileContext = getKnowledgeBase()
    
    // Fallback se não encontrar o perfil (não deve acontecer em prod)
    if (!profileContext) {
      return NextResponse.json(
        { error: 'Perfil do candidato indisponível para análise.' },
        { status: 500 }
      )
    }

    const prompt = buildJobFitPrompt(jobDescription, profileContext)
    const analysis = await analyzeJobFit(client, prompt)

    return NextResponse.json(analysis)

  } catch (error) {
    console.error('Error in job-fit:', error)
    
    return NextResponse.json(
      { error: 'Erro ao analisar vaga' },
      { status: 500 }
    )
  }
}
