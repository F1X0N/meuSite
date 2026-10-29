import { beforeEach, describe, expect, it, vi } from 'vitest'
import { isOwnerResumeText } from '@/lib/agent-tools/resume-upload'

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

const { resumeText } = vi.hoisted(() => ({
  resumeText: 'Full-stack engineer with experience building React interfaces, Node.js APIs and reliable releases.\nBuilt React interfaces for production applications and collaborated with product teams on delivery.',
}))

vi.mock('@/lib/agent-tools/resume-upload', () => ({
  extractResumeText: vi.fn().mockResolvedValue(resumeText),
  isOwnerResumeText: vi.fn().mockReturnValue(false),
}))

const requestFor = (body: { role: string; jobDescription: string; company?: string; language?: string }) => {
  const formData = new FormData()
  formData.set('role', body.role)
  formData.set('jobDescription', body.jobDescription)
  if (body.company) formData.set('company', body.company)
  if (body.language) formData.set('language', body.language)
  formData.set('resume', new File(['resume content'], 'resume.txt', { type: 'text/plain' }))
  const request = new Request('http://localhost/api/ai/interview-guide', { method: 'POST' })
  vi.spyOn(request, 'formData').mockResolvedValue(formData)
  return request
}

beforeEach(() => {
  createCompletion.mockClear()
  vi.stubEnv('OPENAI_API_KEY', 'test-key')
})

describe('POST /api/ai/interview-guide', () => {
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

    expect(response.status, JSON.stringify(body)).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(body.guide.questions.some((item: { question: string }) => item.question.includes('React'))).toBe(true)
    expect(body.guide.gaps.some((item: string) => item.includes('Kubernetes'))).toBe(true)
    expect(body.guide.profileVersion).toBe('uploaded')
    expect(JSON.stringify(body.guide)).not.toContain('Josivan')
    expect(JSON.stringify(body)).not.toContain(jobDescription)
    expect(JSON.stringify(createCompletion.mock.calls)).not.toContain(resumeText)
    expect(createCompletion).toHaveBeenCalledOnce()
  })

  it('usa a base pública de Josivan somente quando o CV corresponde', async () => {
    vi.mocked(isOwnerResumeText).mockReturnValueOnce(true)
    const { POST } = await import('@/app/api/ai/interview-guide/route')
    const response = await POST(requestFor({
      role: 'Full-Stack Engineer',
      jobDescription: 'Buscamos uma pessoa para construir interfaces React, APIs e colaborar com a equipe de produto em entregas de software.',
      language: 'en',
    }))
    const body = await response.json()

    expect(response.status, JSON.stringify(body)).toBe(200)
    expect(body.guide.profileVersion).toMatch(/^[a-f0-9]{10}$/)
    expect(body.guide.introduction).toContain('full-stack software engineer')
  })
})
