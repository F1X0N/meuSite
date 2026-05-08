import { describe, it, expect, beforeEach, vi } from 'vitest'

const sendMock = vi.fn()
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({ emails: { send: sendMock } })),
}))

vi.mock('@/lib/request-context', () => ({
  buildRequestContext: vi.fn().mockResolvedValue({ request_id: 'req-test', ip_hash: 'iph-test' }),
}))

const fetchPdf = vi.fn().mockResolvedValue({
  ok: true,
  arrayBuffer: async () => new ArrayBuffer(8),
})
vi.stubGlobal('fetch', fetchPdf)

beforeEach(() => {
  sendMock.mockReset()
  fetchPdf.mockClear()
  vi.stubEnv('RESEND_API_KEY', 'rk_test')
  vi.stubEnv('NODE_ENV', 'test')
})

describe('POST /api/ai/targeted-resume/email', () => {
  it('rejeita pdfUrl fora do allowlist (anti-SSRF)', async () => {
    const { POST } = await import('@/app/api/ai/targeted-resume/email/route')
    const req = new Request('http://localhost/api/ai/targeted-resume/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pdfUrl: 'https://evil.example.com/cv.pdf',
        recipientEmail: 'foo@bar.com',
        sessionId: 'sess-anti-ssrf',
        consent: true,
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('rejeita pdfUrl same-domain fora de /cv.pdf (anti fetch-and-mail)', async () => {
    const { POST } = await import('@/app/api/ai/targeted-resume/email/route')
    const req = new Request('http://localhost/api/ai/targeted-resume/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pdfUrl: 'https://josivan-amorim.vercel.app/api/ai/chat',
        recipientEmail: 'foo@bar.com',
        sessionId: 'sess-self-non-pdf',
        consent: true,
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('rejeita email inválido', async () => {
    const { POST } = await import('@/app/api/ai/targeted-resume/email/route')
    const req = new Request('http://localhost/api/ai/targeted-resume/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pdfUrl: 'https://abc.public.blob.vercel-storage.com/cv.pdf',
        recipientEmail: 'naoeumemail',
        sessionId: 'sess-bad-email',
        consent: true,
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('exige consent=true', async () => {
    const { POST } = await import('@/app/api/ai/targeted-resume/email/route')
    const req = new Request('http://localhost/api/ai/targeted-resume/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pdfUrl: 'https://abc.public.blob.vercel-storage.com/cv.pdf',
        recipientEmail: 'foo@bar.com',
        sessionId: 'sess-no-consent',
        consent: false,
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('envia email com sucesso e retorna ok', async () => {
    sendMock.mockResolvedValue({ data: { id: 'em_123' }, error: null })
    const { POST } = await import('@/app/api/ai/targeted-resume/email/route')
    const req = new Request('http://localhost/api/ai/targeted-resume/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pdfUrl: 'https://abc.public.blob.vercel-storage.com/cv-x.pdf',
        recipientEmail: 'recruiter@example.com',
        jobTitle: 'Senior Backend',
        sessionId: 'sess-happy-path',
        consent: true,
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(sendMock).toHaveBeenCalledOnce()
    const call = sendMock.mock.calls[0][0]
    expect(call.to).toBe('recruiter@example.com')
    expect(call.attachments?.[0]?.filename).toBe('cv-josivan-amorim.pdf')
  })
})
