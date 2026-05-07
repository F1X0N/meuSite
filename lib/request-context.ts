import { headers } from 'next/headers'
import { createHash, randomUUID } from 'node:crypto'

export type RequestContext = {
  request_id: string
  session_id: string | null
  ip_hash: string | null
  user_agent: string | null
  received_at: string
}

/**
 * Hasheia o IP (SHA256 + truncado) para nunca logar IP cru.
 * IP cru é PII em algumas jurisdições — sempre passamos pelo hash.
 */
export const hashIp = (ip: string | null | undefined): string | null => {
  if (!ip) return null
  const trimmed = ip.split(',')[0]?.trim()
  if (!trimmed) return null
  return createHash('sha256').update(trimmed).digest('hex').slice(0, 16)
}

/**
 * Constrói contexto de request a partir dos headers HTTP.
 * `request_id` é gerado novo a cada chamada (UUID v4).
 * `session_id` opcional via header `x-session-id` (frontend pode passar).
 */
export const buildRequestContext = async (
  options?: { sessionId?: string | null }
): Promise<RequestContext> => {
  const h = await headers()
  return {
    request_id: randomUUID(),
    session_id: options?.sessionId ?? h.get('x-session-id') ?? null,
    ip_hash: hashIp(h.get('x-forwarded-for') ?? h.get('x-real-ip')),
    user_agent: h.get('user-agent')?.slice(0, 200) ?? null,
    received_at: new Date().toISOString(),
  }
}

/**
 * Versão sincrônica para casos onde já temos o IP/UA na mão (ex: tests, ou
 * quando construímos contexto a partir de um body parseado).
 */
export const buildRequestContextSync = (input: {
  sessionId?: string | null
  ip?: string | null
  userAgent?: string | null
}): RequestContext => ({
  request_id: randomUUID(),
  session_id: input.sessionId ?? null,
  ip_hash: hashIp(input.ip ?? null),
  user_agent: input.userAgent?.slice(0, 200) ?? null,
  received_at: new Date().toISOString(),
})
