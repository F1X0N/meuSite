import { NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { AUDIT_EVENTS } from '@/lib/audit-events'
import { buildRequestContext } from '@/lib/request-context'

const RATE_LIMIT_WINDOW_MS = 60_000
const MAX_REQUESTS_PER_IP = 30
const ipBuckets = new Map<string, { count: number; resetAt: number }>()

const checkIpRateLimit = (ipHash: string | null): boolean => {
  if (!ipHash) return true
  const now = Date.now()
  const bucket = ipBuckets.get(ipHash)
  if (!bucket || now > bucket.resetAt) {
    ipBuckets.set(ipHash, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (bucket.count >= MAX_REQUESTS_PER_IP) return false
  bucket.count += 1
  return true
}

const clientErrorSchema = z.object({
  message: z.string().min(1).max(500),
  digest: z.string().max(200).nullable().optional(),
  stack: z.string().max(2000).nullable().optional(),
  path: z.string().max(500).nullable().optional(),
})

export async function POST(request: Request) {
  const ctx = await buildRequestContext().catch(() => null)
  const requestId = ctx?.request_id ?? null

  if (!checkIpRateLimit(ctx?.ip_hash ?? null)) {
    return NextResponse.json({ error: 'Rate limit' }, { status: 429 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const parsed = clientErrorSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    logger.error(AUDIT_EVENTS.CLIENT_ERROR_CAPTURED, {
      request_id: requestId,
      ip_hash: ctx?.ip_hash,
      user_agent: ctx?.user_agent,
      path: parsed.data.path,
      digest: parsed.data.digest,
      message: parsed.data.message,
      stack_truncated: parsed.data.stack?.slice(0, 600),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error(AUDIT_EVENTS.API_ERROR_UNHANDLED, {
      request_id: requestId,
      route: '/api/log/client-error',
      error_class: error instanceof Error ? error.constructor.name : 'unknown',
    })
    return NextResponse.json({ error: 'Failed to capture' }, { status: 500 })
  }
}
