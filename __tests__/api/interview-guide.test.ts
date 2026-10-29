import { beforeEach, describe, expect, it, vi } from 'vitest'

const createCompletion = vi.fn().mockResolvedValue({
  choices: [{ message: { content: JSON.stringify({
    mustHaveSkills: ['React', 'Kubernetes'],
    niceToHaveSkills: [],
    seniorityLevel: 'mid',
    industry: null,
    emphasis: 'balanced',
    softSignals: [],
  }) } }],
})

vi.mock('openai', () => ({
  OpenAI: vi.fn().mockImplementation(() => ({ chat: { completions: { create: createCompletion } } })),
}))

vi.mock('@/lib/request-context', () => ({
  buildRequestContext: vi.fn().mockResolvedValue({ request_id: 'test-request', ip_hash: 'test-ip' }),
}))

const requestFor = (body: unknown) => new Request('http://localhost/api/ai/interview-guide', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

beforeEach(() => {
  createCompletion.mockClear()
  vi.stubEnv('OPENAI_API_KEY', 'test-key')
})

describe('POST /api/ai/interview-guide', () => {
  it('bloqueia a geração em produção enquanto não há autenticação', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const { POST } = await import('@/app/api/ai/interview-guide/route')
    const response = await POST(requestFor({
      role: 'Full Stack',
      jobDescription: 'Buscamos uma pessoa para desenvolver interfaces, APIs e revisar entregas de software em produção.',
    }))

    expect(response.status).toBe(404)
    expect(createCompletion).not.toHaveBeenCalled()
    vi.unstubAllEnvs()
  })

  it('rejeita descrições curtas antes de chamar a IA', async () => {
    const { POST } = await import('@/app/api/ai/interview-guide/route')
    const response = await POST(requestFor({ role: 'Full Stack', jobDescription: 'curta' }))

    expect(response.status).toBe(400)
    expect(createCompletion).not.toHaveBeenCalled()
  })

  it('gera roteiro a partir dos sinais da vaga sem devolver a descrição bruta', async () => {
    const { POST } = await import('@/app/api/ai/interview-guide/route')
    const jobDescription = 'Procuramos alguém para construir interfaces React, APIs e colaborar com a equipe de produto. Kubernetes é desejável.'
    const response = await POST(requestFor({ role: 'Full-Stack Engineer', company: 'Example', jobDescription, language: 'en' }))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(body.guide.questions.some((item: { question: string }) => item.question.includes('React'))).toBe(true)
    expect(body.guide.gaps.some((item: string) => item.includes('Kubernetes'))).toBe(true)
    expect(JSON.stringify(body)).not.toContain(jobDescription)
    expect(createCompletion).toHaveBeenCalledOnce()
  })
})
