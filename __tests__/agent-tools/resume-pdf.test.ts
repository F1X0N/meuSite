import { describe, it, expect } from 'vitest'
import { generateResumePDF } from '@/lib/agent-tools/resume-pdf'

describe('agent-tools/resume-pdf', () => {
  it('gera PDF válido (magic %PDF) com tamanho razoável (CV default)', async () => {
    const buf = await generateResumePDF([])
    expect(buf.length).toBeGreaterThan(2000)
    expect(buf.length).toBeLessThan(500_000)
    expect(buf.subarray(0, 4).toString('utf-8')).toBe('%PDF')
  }, 30_000)

  it('gera PDF distinto quando recebe prioritySkills (reordena bullets)', async () => {
    const a = await generateResumePDF([])
    const b = await generateResumePDF(['llm', 'openai', 'rag'])
    const { createHash } = await import('node:crypto')
    const hashA = createHash('sha256').update(a).digest('hex')
    const hashB = createHash('sha256').update(b).digest('hex')
    expect(hashA).not.toBe(hashB)
  }, 30_000)
})
