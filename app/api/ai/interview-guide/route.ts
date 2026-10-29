import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { z } from 'zod'
import { extractPrioritySkills } from '@/lib/agent-tools/resume'
import { generateInterviewGuide } from '@/lib/agent-tools/interview-guide'
import { generateUploadedInterviewGuide } from '@/lib/agent-tools/interview-guide-upload'
import { extractResumeText, isOwnerResumeText } from '@/lib/agent-tools/resume-upload'
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
  if (Number(request.headers.get('content-length')) > 2_200_000) return NextResponse.json({ error: 'O currículo deve ter até 2 MB.' }, { status: 413, headers: responseHeaders })
  const context = await buildRequestContext().catch(() => null)
  const requestId = context?.request_id ?? null

  try {
    const formData = await request.formData().catch(() => null)
    if (!formData) return NextResponse.json({ error: 'Envie os dados da vaga e o currículo.' }, { status: 400, headers: responseHeaders })
    const parsed = requestSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return NextResponse.json({ error: 'Confira os dados da vaga.', issues: parsed.error.issues }, { status: 400, headers: responseHeaders })
    const resume = formData.get('resume')
    if (!resume || typeof resume === 'string') return NextResponse.json({ error: 'Envie um currículo em PDF, DOCX ou TXT.' }, { status: 400, headers: responseHeaders })

    logger.info(AUDIT_EVENTS.INTERVIEW_GUIDE_REQUESTED, {
      request_id: requestId,
      ip_hash: context?.ip_hash,
      job_description_length: parsed.data.jobDescription.length,
      resume_bytes: resume.size,
    })

    if (!withinLimit(context?.ip_hash ?? 'anon')) {
      logger.warn(AUDIT_EVENTS.INTERVIEW_GUIDE_RATE_LIMIT_HIT, { request_id: requestId, ip_hash: context?.ip_hash })
      return NextResponse.json({ error: 'Limite de gerações atingido. Tente novamente em 1 hora.' }, { status: 429, headers: responseHeaders })
    }

    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'Serviço de IA não configurado.' }, { status: 503, headers: responseHeaders })

    const resumeText = await extractResumeText(resume).catch(() => null)
    if (!resumeText) return NextResponse.json({ error: 'Não foi possível ler o currículo. Envie PDF, DOCX ou TXT com texto selecionável e até 2 MB.' }, { status: 400, headers: responseHeaders })
    const ownerResume = isOwnerResumeText(resumeText)
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const prioritySkills = await extractPrioritySkills(client, parsed.data.jobDescription)
    const input = {
      prioritySkills,
      language: parsed.data.language,
      role: parsed.data.role,
      company: parsed.data.company,
    }
    const guide = ownerResume
      ? generateInterviewGuide(input)
      : generateUploadedInterviewGuide({ ...input, resumeText })

    logger.info(AUDIT_EVENTS.INTERVIEW_GUIDE_GENERATED, {
      request_id: requestId,
      ip_hash: context?.ip_hash,
      matched_requirements: guide.questions.length - 4,
      gaps_count: guide.gaps.length,
      profile_version: guide.profileVersion,
      source: ownerResume ? 'public_profile' : 'uploaded_resume',
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
