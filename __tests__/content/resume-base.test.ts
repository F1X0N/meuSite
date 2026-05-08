import { describe, it, expect } from 'vitest'
import resumeBase from '@/content/resume-base.json'
import { resumeBaseSchema } from '@/lib/resume-schema'

describe('content/resume-base.json', () => {
  it('valida contra resumeBaseSchema (zod)', () => {
    const result = resumeBaseSchema.safeParse(resumeBase)
    if (!result.success) {
      console.error(JSON.stringify(result.error.issues, null, 2))
    }
    expect(result.success).toBe(true)
  })

  it('todas as bullets têm tags não-vazias (necessário para sortBulletsByPriority)', () => {
    const allBullets = [
      ...resumeBase.experience.flatMap((e) => e.bullets),
      ...resumeBase.publicProjects.flatMap((p) => p.bullets),
    ]
    expect(allBullets.length).toBeGreaterThan(0)
    for (const b of allBullets) {
      expect(b.tags.length).toBeGreaterThan(0)
    }
  })

  it('inclui Cronometrista no Grupo Dass (cargo anterior documentado)', () => {
    const cronometrista = resumeBase.experience.find((e) => e.role.toLowerCase().includes('cronometrista'))
    expect(cronometrista).toBeDefined()
    expect(cronometrista?.company).toBe('Grupo Dass')
  })

  it('summary tem keywords ATS-críticas', () => {
    const s = resumeBase.summary.toLowerCase()
    for (const kw of ['python', 'node.js', 'typescript', 'postgresql', 'openai', 'observabilidade']) {
      expect(s).toContain(kw)
    }
  })
})
