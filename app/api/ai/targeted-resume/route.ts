import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { put } from '@vercel/blob'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { AUDIT_EVENTS } from '@/lib/audit-events'
import { buildRequestContext } from '@/lib/request-context'
import {
  extractPrioritySkills,
  generateTargetedResumeMarkdown,
  validateMarkdownIsSubset,
} from '@/lib/agent-tools/resume'
import { generateResumePDF } from '@/lib/agent-tools/resume-pdf'
import { generateCoverLetter } from '@/lib/agent-tools/cover-letter'
import { createHash } from 'node:crypto'

const RATE_LIMIT_WINDOW_MS = 3600_000
const MAX_PER_SESSION = 3
const MAX_PER_IP = 10

const sessionBuckets = new Map<string, { count: number; resetAt: number }>()
const ipBuckets = new Map<string, { count: number; resetAt: number }>()

const checkLimit = (
  bucket: Map<string, { count: number; resetAt: number }>,
  key: string,
  max: number,
): boolean => {
  const now = Date.now()
  const cur = bucket.get(key)
  if (!cur || now > cur.resetAt) {
    bucket.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (cur.count >= max) return false
  cur.count += 1
  return true
}

const requestSchema = z.object({
  jobDescription: z.string().min(50).max(10_000),
  language: z.enum(['pt', 'en']).default('en'),
  role: z.string().trim().min(2).max(120).optional(),
  company: z.string().trim().max(120).optional(),
  motivation: z.string().trim().max(350).optional(),
  sessionId: z.string().min(8).max(100).optional(),
})

const createClient = (): OpenAI | null => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null
  return new OpenAI({ apiKey })
}

export async function POST(request: Request) {
  const ctx = await buildRequestContext().catch(() => null)
  const requestId = ctx?.request_id ?? null

  try {
    const body = await request.json().catch(() => ({}))
    const parsed = requestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.some((issue) => issue.path[0] === 'jobDescription')
          ? 'A descrição da vaga precisa ter entre 50 e 10.000 caracteres. Analise a vaga novamente antes de gerar os documentos.'
          : 'Confira os dados informados: cargo, empresa e motivação devem respeitar os limites dos campos.' },
        { status: 400 },
      )
    }

    const { jobDescription, sessionId, language, role, company, motivation } = parsed.data
    const sessionKey = sessionId ?? ctx?.ip_hash ?? 'anon'

    logger.info(AUDIT_EVENTS.TARGETED_RESUME_REQUESTED, {
      request_id: requestId,
      ip_hash: ctx?.ip_hash,
      session_key: sessionKey,
      jd_length: jobDescription.length,
    })

    if (!checkLimit(ipBuckets, ctx?.ip_hash ?? 'anon', MAX_PER_IP) ||
        !checkLimit(sessionBuckets, sessionKey, MAX_PER_SESSION)) {
      logger.warn(AUDIT_EVENTS.TARGETED_RESUME_RATE_LIMIT_HIT, {
        request_id: requestId,
        ip_hash: ctx?.ip_hash,
      })
      return NextResponse.json(
        { error: 'Limite de gerações atingido. Tente novamente em 1 hora.' },
        { status: 429 },
      )
    }

    const client = createClient()
    if (!client) {
      return NextResponse.json(
        { error: 'Serviço de IA não configurado' },
        { status: 503 },
      )
    }

    const startedAt = Date.now()
    const prioritySkills = await extractPrioritySkills(client, jobDescription)
    const markdown = generateTargetedResumeMarkdown(prioritySkills, language)
    const coverLetter = role ? generateCoverLetter({ prioritySkills, language, role, company, motivation }) : null

    const validation = validateMarkdownIsSubset(markdown, language)
    if (!validation.ok) {
      logger.error(AUDIT_EVENTS.TARGETED_RESUME_VALIDATION_FAILED, {
        request_id: requestId,
        invalid_count: validation.invalidBullets.length,
      })
      return NextResponse.json(
        { error: 'Falha na validação do CV gerado. Tente novamente.' },
        { status: 500 },
      )
    }

    const md_hash = createHash('sha256').update(markdown).digest('hex').slice(0, 16)
    logger.info(AUDIT_EVENTS.TARGETED_RESUME_GENERATED, {
      request_id: requestId,
      ip_hash: ctx?.ip_hash,
      latency_ms: Date.now() - startedAt,
      priority_skills_count: prioritySkills.length,
      markdown_length: markdown.length,
      md_hash,
    })

    const pdfBuffer = await generateResumePDF(prioritySkills, language)
    let pdfUrl: string | null = null
    const pdfSizeBytes = pdfBuffer.length
    const pdfHash = createHash('sha256').update(pdfBuffer).digest('hex').slice(0, 16)

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const pdfStartedAt = Date.now()
        const filename = `cv-targeted-${language}-${md_hash}.pdf`
        const blob = await put(filename, pdfBuffer, {
          access: 'public',
          addRandomSuffix: true,
          contentType: 'application/pdf',
        })
        pdfUrl = blob.url

        logger.info(AUDIT_EVENTS.TARGETED_RESUME_PDF_UPLOADED, {
          request_id: requestId,
          ip_hash: ctx?.ip_hash,
          pdf_url: pdfUrl,
          pdf_size_bytes: pdfSizeBytes,
          pdf_hash: pdfHash,
          pdf_latency_ms: Date.now() - pdfStartedAt,
        })
      } catch (pdfError) {
        logger.error(AUDIT_EVENTS.TARGETED_RESUME_PDF_FAILED, {
          request_id: requestId,
          error_class: pdfError instanceof Error ? pdfError.constructor.name : 'unknown',
          error_message: pdfError instanceof Error ? pdfError.message.slice(0, 200) : 'unknown',
        })
      }
    }

    const headers = new Headers()
    if (requestId) headers.set('x-request-id', requestId)
    return NextResponse.json(
      { markdown, coverLetter, language, prioritySkills, hash: md_hash, pdfUrl, pdfBase64: pdfBuffer.toString('base64'), pdfSizeBytes, pdfHash },
      { headers },
    )
  } catch (error) {
    logger.error(AUDIT_EVENTS.API_ERROR_UNHANDLED, {
      request_id: requestId,
      route: '/api/ai/targeted-resume',
      error_class: error instanceof Error ? error.constructor.name : 'unknown',
    })
    return NextResponse.json({ error: 'Erro ao gerar CV' }, { status: 500 })
  }
}
