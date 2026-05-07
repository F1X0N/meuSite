import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('openai', () => ({
  OpenAI: vi.fn(() => ({
    chat: { completions: { create: vi.fn() } },
  })),
}))

const buildRequest = (body: Record<string, unknown>) =>
  new Request('http://localhost/api/ai/job-fit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

describe('POST /api/ai/job-fit', () => {
  beforeEach(() => {
    delete process.env.OPENAI_API_KEY
  })

  it('rejeita JD muito curta com 400', async () => {
    const { POST } = await import('@/app/api/ai/job-fit/route')
    const res = await POST(buildRequest({ jobDescription: 'curto' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/curta/i)
  })

  it('rejeita JD muito longa com 400', async () => {
    const { POST } = await import('@/app/api/ai/job-fit/route')
    const big = 'x'.repeat(10001)
    const res = await POST(buildRequest({ jobDescription: big }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/longa/i)
  })

  it('retorna 503 sem OPENAI_API_KEY configurada', async () => {
    const { POST } = await import('@/app/api/ai/job-fit/route')
    const validJD = 'Vaga de backend engineer com Node.js e PostgreSQL '.repeat(3)
    const res = await POST(buildRequest({ jobDescription: validJD }))
    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body.error).toMatch(/n[ãa]o configurado|n[ãa]o dispon[íi]vel/i)
  })
})
