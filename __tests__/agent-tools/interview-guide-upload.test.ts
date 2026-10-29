import { describe, expect, it } from 'vitest'
import { generateUploadedInterviewGuide } from '@/lib/agent-tools/interview-guide-upload'
import { isOwnerResumeText } from '@/lib/agent-tools/resume-upload'

describe('uploaded interview guide', () => {
  it('usa apenas o CV enviado para evidências de outro candidato', () => {
    const guide = generateUploadedInterviewGuide({
      resumeText: 'Maria Silva\nDesenvolveu interfaces React e APIs em Node.js para produtos digitais.\nLiderou revisões de código e validou entregas em produção com a equipe.',
      prioritySkills: ['must:React', 'must:Kubernetes'],
      language: 'pt',
      role: 'Desenvolvedora Full Stack',
    })

    expect(guide.profileVersion).toBe('uploaded')
    expect(guide.story.evidence.some((item) => item.includes('React'))).toBe(true)
    expect(guide.gaps.some((item) => item.includes('Kubernetes'))).toBe(true)
    expect(JSON.stringify(guide)).not.toContain('Josivan')
    expect(JSON.stringify(guide)).not.toContain('4+ years')
  })

  it('não reconhece como CV de Josivan apenas pelo nome', () => {
    expect(isOwnerResumeText('Josivan Amorim trabalha com React.')).toBe(false)
    expect(isOwnerResumeText('Josivan Amorim amorimjosivan7@gmail.com linkedin.com/in/josivan-amorim outra pessoa com outra experiência')).toBe(false)
  })
})
