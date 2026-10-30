import { describe, expect, it } from 'vitest'
import { generateInterviewGuide } from '@/lib/agent-tools/interview-guide'
import { formatInterviewGuide } from '@/lib/agent-tools/interview-guide-format'

describe('interview guide', () => {
  it('prioriza evidência pública relevante e separa requisitos sem comprovação', () => {
    const guide = generateInterviewGuide({
      prioritySkills: ['must:React', 'must:Kubernetes', 'seniority:mid'],
      language: 'pt',
      role: 'Desenvolvedor Full Stack',
      company: 'Empresa Exemplo',
    })

    expect(guide.introduction).toContain('Sou engenheiro de software full stack')
    expect(guide.questions.some((item) => item.question.includes('React'))).toBe(true)
    expect(guide.gaps.some((item) => item.includes('Kubernetes'))).toBe(true)
    expect(guide.story.evidence.some((item) => item.includes('React'))).toBe(true)
    expect(formatInterviewGuide(guide)).toContain('## História principal')
    expect(JSON.stringify(guide)).not.toContain('R$ 90')
  })

  it('não confunde Java com JavaScript nem inventa tempo de uso por tecnologia', () => {
    const guide = generateInterviewGuide({
      prioritySkills: ['must:Java', 'must:Python'],
      language: 'en',
      role: 'Backend Engineer',
    })

    expect(guide.gaps.some((item) => item.includes('Java'))).toBe(true)
    expect(guide.questions.some((item) => item.question.includes('Python'))).toBe(true)
    expect(guide.introduction).toContain('5+ years of professional experience')
    expect(guide.introduction).not.toContain('4+ years of Python')
    expect(guide.profileVersion).toMatch(/^[a-f0-9]{10}$/)
  })
})
