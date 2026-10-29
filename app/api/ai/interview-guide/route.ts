import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { z } from 'zod'
import { extractPrioritySkills } from '@/lib/agent-tools/resume'
import { generateInterviewGuide } from '@/lib/agent-tools/interview-guide'
import { buildRequestContext } from '@/lib/request-context'
import { logger } from '@/lib/logger'
import { AUDIT_EVENTS } from '@/lib/audit-events'

const requestSchema = z.object({
  jobDescription: z.string().trim().min(50).max(10_000),
  language: z.enum(['pt', 'en']).default('en'),
  role: z.string().trim().min(2).max(120),
  company: z.string().trim().max(120).optional(),
})

const requestsByIp = new Map<string, { count: number; resetAt: number }>()

const withinLimit = (ipHash: string): boolean => {
  const now = Date.now()
  const current = requestsByIp.get(ipHash)
  if (!current || now > current.resetAt) {
    requestsByIp.set(ipHash, { count: 1, resetAt: now + 3_600_000 })
    return true
  }
  if (current.count >= 8) return false
  current.count += 1
  return true
}

const responseHeaders = { 'Cache-Control': 'no-store' }

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'Rota não disponível.' }, { status: 404, headers: responseHeaders })
  const context = await buildRequestContext().catch(() => null)
  const requestId = context?.request_id ?? null

  try {
    const body = await request.json().catch(() => ({}))
    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Confira os dados da vaga.', issues: parsed.error.issues }, { status: 400, headers: responseHeaders })

    logger.info(AUDIT_EVENTS.INTERVIEW_GUIDE_REQUESTED, {
      request_id: requestId,
      ip_hash: context?.ip_hash,
      job_description_length: parsed.data.jobDescription.length,
    })

    if (!withinLimit(context?.ip_hash ?? 'anon')) {
      logger.warn(AUDIT_EVENTS.INTERVIEW_GUIDE_RATE_LIMIT_HIT, { request_id: requestId, ip_hash: context?.ip_hash })
      return NextResponse.json({ error: 'Limite de gerações atingido. Tente novamente em 1 hora.' }, { status: 429, headers: responseHeaders })
    }

    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'Serviço de IA não configurado.' }, { status: 503, headers: responseHeaders })

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const prioritySkills = await extractPrioritySkills(client, parsed.data.jobDescription)
    const guide = generateInterviewGuide({
      prioritySkills,
      language: parsed.data.language,
      role: parsed.data.role,
      company: parsed.data.company,
    })

    logger.info(AUDIT_EVENTS.INTERVIEW_GUIDE_GENERATED, {
      request_id: requestId,
      ip_hash: context?.ip_hash,
      matched_requirements: guide.questions.length - 4,
      gaps_count: guide.gaps.length,
      profile_version: guide.profileVersion,
    })

    return NextResponse.json({ guide, generatedAt: new Date().toISOString() }, { headers: responseHeaders })
  } catch (error) {
    logger.error(AUDIT_EVENTS.API_ERROR_UNHANDLED, {
      request_id: requestId,
      route: '/api/ai/interview-guide',
      error_class: error instanceof Error ? error.constructor.name : 'unknown',
    })
    return NextResponse.json({ error: 'Não foi possível gerar o roteiro. Tente novamente.' }, { status: 500, headers: responseHeaders })
  }
}
