import { describe, it, expect } from 'vitest'
import { hashIp, buildRequestContextSync } from '@/lib/request-context'

describe('lib/request-context.hashIp', () => {
  it('retorna null para input null/empty', () => {
    expect(hashIp(null)).toBeNull()
    expect(hashIp(undefined)).toBeNull()
    expect(hashIp('')).toBeNull()
    expect(hashIp(',  , ')).toBeNull()
  })

  it('retorna SHA256 truncado para 16 chars', () => {
    const hash = hashIp('192.168.1.1')
    expect(hash).toMatch(/^[a-f0-9]{16}$/)
  })

  it('é determinístico para mesmo input', () => {
    expect(hashIp('10.0.0.1')).toBe(hashIp('10.0.0.1'))
  })

  it('extrai apenas o primeiro IP em listas (x-forwarded-for chain)', () => {
    const direct = hashIp('192.168.1.1')
    const chained = hashIp('192.168.1.1, 10.0.0.5, 172.16.0.1')
    expect(direct).toBe(chained)
  })

  it('NÃO retorna o IP cru', () => {
    const ip = '203.0.113.42'
    const hash = hashIp(ip)
    expect(hash).not.toContain(ip)
    expect(hash).not.toContain('203')
  })
})

describe('lib/request-context.buildRequestContextSync', () => {
  it('gera request_id UUID v4 único por chamada', () => {
    const a = buildRequestContextSync({})
    const b = buildRequestContextSync({})
    expect(a.request_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    expect(a.request_id).not.toBe(b.request_id)
  })

  it('aplica hashIp ao IP cru', () => {
    const ctx = buildRequestContextSync({ ip: '198.51.100.7' })
    expect(ctx.ip_hash).toMatch(/^[a-f0-9]{16}$/)
    expect(ctx.ip_hash).not.toBe('198.51.100.7')
  })

  it('trunca user_agent em 200 chars', () => {
    const longUA = 'M'.repeat(500)
    const ctx = buildRequestContextSync({ userAgent: longUA })
    expect(ctx.user_agent?.length).toBe(200)
  })

  it('received_at é timestamp ISO válido', () => {
    const ctx = buildRequestContextSync({})
    expect(() => new Date(ctx.received_at).toISOString()).not.toThrow()
  })
})
