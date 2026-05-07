import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'
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

const buildJobFitPrompt = (jobDescription, profileContext) => {
  return `Você é um Recrutador Técnico Sênior especializado em validar fit técnico, com viés a favor da honestidade — nunca infle scores artificialmente.

=== PERFIL DO CANDIDATO (FONTE DE VERDADE) ===
${profileContext}

=== DESCRIÇÃO DA VAGA ===
${jobDescription}

REGRAS DE CLASSIFICAÇÃO:

- "match" (skill confirmada): há evidência clara e direta no perfil — uso documentado, projeto real ou case study referenciando.
- "partial" (experiência relacionada não-exata): o candidato tem experiência em tecnologia/contexto adjacente que sugere capacidade de entrega, mas sem prova exata da skill da vaga.
- "unknown" (não documentado): não há evidência no perfil. NUNCA marque como "match" sem evidência observável.

REGRAS DE FIT SCORE:

- 90-100: candidato cobre todos os requisitos técnicos chave + alinhamento cultural alto (vide princípios de engenharia do perfil).
- 70-89: cobre maior parte dos requisitos chave, alguns gaps gerenciáveis.
- 50-69: cobre parte dos requisitos, gaps significativos mas treináveis.
- < 50: gap crítico (stack inteira diferente, nível claramente abaixo do exigido).
- Refletir a realidade das evidências. Se o perfil não tem evidência forte, fitScore não deve passar de 70 mesmo que a vaga seja "atrativa".

REGRAS DE GAPS:
- Listar gaps reais e específicos, não genéricos. Bons exemplos: "Kubernetes em produção (tem Docker direto, sem orquestração de cluster)", "Inglês fluente conversacional (perfil cita inglês técnico apenas)".
- Não listar gaps de soft skills sem evidência (ex: "trabalho em equipe" não é gap inferível de uma JD).

REGRAS DE EVIDÊNCIA:
- skillsMatch deve citar o local exato no perfil (empresa, case study, capability listada).
- Sempre que possível, citar o nome do case study ou nota do blog (ex: "Diagnóstico, observabilidade e segurança em produção").

Formato de resposta (JSON estrito):
{
  "fitScore": number,
  "summary": "Resumo executivo de 2-3 frases, honesto sobre o match e gaps principais",
  "skillsMatch": [{ "skill": "React", "evidence": "uso documentado no Grupo Dass + portfólio Next.js público", "level": "match" | "partial" }],
  "skillsGap": ["Skill X (perfil tem Y mas vaga pede Z, treinável em N semanas)"],
  "highlights": ["Argumento 1 ancorado em evidência", "Argumento 2", "Argumento 3"],
  "recommendations": ["Recomendação prática para o candidato"]
}

Responda APENAS com o JSON válido, sem markdown.`
}

const analyzeJobFit = async (client, prompt) => {
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Você é um analisador de job fit. Responda APENAS com JSON válido.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
    max_tokens: 2000,
    response_format: { type: "json_object" }
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
