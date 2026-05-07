import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock OpenAI antes de importar a route
vi.mock('openai', () => {
  const create = vi.fn()
  return {
    OpenAI: vi.fn(() => ({
      chat: { completions: { create } },
    })),
    __mockCreate: create,
  }
})

const buildRequest = (body: Record<string, unknown>) =>
  new Request('http://localhost/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

describe('POST /api/ai/chat', () => {
  beforeEach(() => {
    delete process.env.OPENAI_API_KEY
  })

  it('rejeita mensagem muito curta com 400', async () => {
    const { POST } = await import('@/app/api/ai/chat/route')
    const res = await POST(buildRequest({ message: 'oi', sessionId: 'sess1' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/curta/i)
  })

  it('rejeita mensagem muito longa com 400', async () => {
    const { POST } = await import('@/app/api/ai/chat/route')
    const big = 'a'.repeat(5001)
    const res = await POST(buildRequest({ message: big, sessionId: 'sess2' }))
    expect(res.status).toBe(400)
  })

  it('rejeita request sem sessionId com 400', async () => {
    const { POST } = await import('@/app/api/ai/chat/route')
    const res = await POST(buildRequest({ message: 'pergunta longa o suficiente' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/[Ss]ession/)
  })

  it('em mock mode (sem OPENAI_API_KEY) retorna estrutura de answer válida', async () => {
    const { POST } = await import('@/app/api/ai/chat/route')
    const res = await POST(
      buildRequest({ message: 'pergunta de teste com tamanho ok', sessionId: 'sess-mock' }),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.type).toBe('answer')
    expect(body.content).toMatch(/demonstra[çc][ãa]o|OPENAI_API_KEY/i)
    expect(Array.isArray(body.sources)).toBe(true)
  })

  it('sanitiza control chars do input antes de validar length', async () => {
    const { POST } = await import('@/app/api/ai/chat/route')
    // 2 chars úteis + control chars que devem ser removidos → < 3 chars úteis → 400
    const res = await POST(
      buildRequest({ message: 'oi\x00\x01\x02', sessionId: 'sess-sanitize' }),
    )
    expect(res.status).toBe(400)
  })
})
