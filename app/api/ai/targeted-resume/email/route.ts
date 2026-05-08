/**
 * Envia o CV adaptado por email com o PDF como anexo.
 *
 * Pré-requisito: pdfUrl gerado pelo endpoint /api/ai/targeted-resume (mesma sessão).
 * Anti-SSRF: pdfUrl deve ser do domínio public.blob.vercel-storage.com.
 * Rate limit por sessão: 1/min, 5/h. Sem retenção de email após envio.
 */
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { AUDIT_EVENTS } from '@/lib/audit-events'
import { buildRequestContext } from '@/lib/request-context'
import { createHash } from 'node:crypto'

const RATE_HOUR_MS = 3_600_000
const RATE_MIN_MS = 60_000
const MAX_PER_HOUR = 5

const minuteBuckets = new Map<string, number>()
const hourBuckets = new Map<string, { count: number; resetAt: number }>()

const checkRate = (key: string): { allowed: boolean; reason?: string } => {
  const now = Date.now()
  const lastMin = minuteBuckets.get(key)
  if (lastMin && now - lastMin < RATE_MIN_MS) {
    return { allowed: false, reason: 'wait-1min' }
  }
  const hour = hourBuckets.get(key)
  if (!hour || now > hour.resetAt) {
    hourBuckets.set(key, { count: 1, resetAt: now + RATE_HOUR_MS })
  } else if (hour.count >= MAX_PER_HOUR) {
    return { allowed: false, reason: 'wait-1h' }
  } else {
    hour.count += 1
  }
  minuteBuckets.set(key, now)
  return { allowed: true }
}

const SELF_DOMAIN = 'josivan-amorim.vercel.app'
const SELF_ALLOWED_PATH = '/cv.pdf'
const BLOB_HOST_SUFFIX = 'blob.vercel-storage.com'

const isAllowedPdfUrl = (u: string): boolean => {
  try {
    const url = new URL(u)
    if (url.protocol !== 'https:') return false
    if (url.hostname === SELF_DOMAIN) {
      return url.pathname === SELF_ALLOWED_PATH
    }
    return url.hostname === BLOB_HOST_SUFFIX || url.hostname.endsWith('.' + BLOB_HOST_SUFFIX)
  } catch {
    return false
  }
}

const requestSchema = z.object({
  pdfUrl: z
    .string()
    .url()
    .refine(isAllowedPdfUrl, { message: 'pdfUrl inválido (apenas Vercel Blob ou /cv.pdf do site)' }),
  recipientEmail: z.string().email().max(254),
  jobTitle: z.string().min(2).max(160).optional(),
  sessionId: z.string().min(8).max(100),
  consent: z.literal(true),
})

const renderEmailHtml = () => {
  return `<!doctype html>
<html lang="pt-BR">
<body style="margin:0;padding:24px;font-family:Helvetica,Arial,sans-serif;background:#fafafa;color:#111">
  <div style="max-width:560px;margin:0 auto;background:#fff;padding:24px;border-radius:8px;border:1px solid #eee">
    <h1 style="font-size:18px;margin:0 0 12px">Currículo de Josivan Amorim</h1>
    <p style="font-size:14px;line-height:1.5;margin:0 0 12px">Olá! Em anexo está o currículo de Josivan Amorim, conforme solicitado.</p>
    <p style="font-size:14px;line-height:1.5;margin:0 0 12px">Para responder ou agendar uma conversa, basta dar reply neste email — vai direto para Josivan.</p>
    <hr style="border:none;border-top:1px solid #eee;margin:18px 0">
    <p style="font-size:12px;color:#666;line-height:1.5;margin:0">Este é um envio único, solicitado em <strong>josivan-amorim.vercel.app</strong>. Seu email não fica salvo em nenhuma lista. Caso não tenha solicitado, ignore.</p>
  </div>
</body>
</html>`
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c))

export async function POST(request: Request) {
  const ctx = await buildRequestContext().catch(() => null)
  const requestId = ctx?.request_id ?? null

  try {
    const body = await request.json().catch(() => ({}))
    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validação falhou', issues: parsed.error.issues }, { status: 400 })
    }
    const { pdfUrl, recipientEmail, jobTitle, sessionId, consent } = parsed.data
    const emailHash = createHash('sha256').update(recipientEmail).digest('hex').slice(0, 16)

    logger.info(AUDIT_EVENTS.TARGETED_RESUME_EMAIL_REQUESTED, {
      request_id: requestId,
      ip_hash: ctx?.ip_hash,
      session_key: sessionId,
      email_hash: emailHash,
      consent,
    })

    const rate = checkRate(sessionId)
    if (!rate.allowed) {
      logger.warn(AUDIT_EVENTS.TARGETED_RESUME_EMAIL_RATE_LIMIT_HIT, {
        request_id: requestId,
        ip_hash: ctx?.ip_hash,
        reason: rate.reason,
      })
      const message =
        rate.reason === 'wait-1min'
          ? 'Aguarde 1 minuto antes de novo envio.'
          : 'Limite de envios atingido. Tente novamente em 1 hora.'
      return NextResponse.json({ error: message }, { status: 429 })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      logger.error(AUDIT_EVENTS.TARGETED_RESUME_EMAIL_FAILED, {
        request_id: requestId,
        reason: 'missing_resend_api_key',
      })
      return NextResponse.json({ error: 'Serviço de email indisponível' }, { status: 503 })
    }

    const pdfFetch = await fetch(pdfUrl)
    if (!pdfFetch.ok) {
      logger.error(AUDIT_EVENTS.TARGETED_RESUME_EMAIL_FAILED, {
        request_id: requestId,
        reason: 'pdf_fetch_failed',
        status: pdfFetch.status,
      })
      return NextResponse.json({ error: 'PDF inacessível' }, { status: 502 })
    }
    const pdfBuffer = Buffer.from(await pdfFetch.arrayBuffer())

    const fromAddress = process.env.RESEND_FROM ?? 'cv@josivan-amorim.dev'
    const subject = 'Currículo de Josivan Amorim'

    const resend = new Resend(apiKey)
    const sent = await resend.emails.send({
      from: `Josivan Amorim <${fromAddress}>`,
      to: recipientEmail,
      replyTo: 'amorimjosivan7@gmail.com',
      subject,
      html: renderEmailHtml(),
      attachments: [{ filename: 'cv-josivan-amorim.pdf', content: pdfBuffer }],
    })

    if (sent.error) {
      logger.error(AUDIT_EVENTS.TARGETED_RESUME_EMAIL_FAILED, {
        request_id: requestId,
        reason: 'resend_error',
        error_message: sent.error.message?.slice(0, 200) ?? 'unknown',
      })
      return NextResponse.json({ error: 'Falha ao enviar email' }, { status: 502 })
    }

    logger.info(AUDIT_EVENTS.TARGETED_RESUME_EMAIL_SENT, {
      request_id: requestId,
      ip_hash: ctx?.ip_hash,
      email_hash: emailHash,
      pdf_size_bytes: pdfBuffer.length,
      resend_id: sent.data?.id ?? null,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error(AUDIT_EVENTS.API_ERROR_UNHANDLED, {
      request_id: requestId,
      route: '/api/ai/targeted-resume/email',
      error_class: error instanceof Error ? error.constructor.name : 'unknown',
    })
    return NextResponse.json({ error: 'Erro inesperado' }, { status: 500 })
  }
}
