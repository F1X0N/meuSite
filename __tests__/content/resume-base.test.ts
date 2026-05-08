import { describe, it, expect } from 'vitest'
import resumeBase from '@/content/resume-base.json'
import { resumeBaseSchema } from '@/lib/resume-schema'

const allowedSourceRefs = new Set([
  'content/knowledge-base.md',
  'workspace/professional-context/profile-context.md',
  'workspace/professional-context/linkedin-positioning.md',
  'content/case-studies/orquestracao-ia-operacao.mdx',
  'content/case-studies/diagnostico-observabilidade-producao.mdx',
  'content/case-studies/validacao-criterios-aceite.mdx',
  'content/blog/ia-controle-humano.mdx',
  'content/blog/observabilidade-antes-de-opiniao.mdx',
  'content/blog/metricas-que-pagam-a-conta.mdx',
  'config/copy.ts',
])

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const collectSourceRefs = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.flatMap(collectSourceRefs)
  if (!isRecord(value)) return []

  const directRefs = Array.isArray(value.sourceRefs) ? value.sourceRefs.map(String) : []
  return [...directRefs, ...Object.values(value).flatMap(collectSourceRefs)]
}

const countWords = (value: string): number => value.split(/\s+/).filter(Boolean).length

const allBullets = [
  ...resumeBase.experience.flatMap((experience) => experience.bullets),
  ...resumeBase.publicProjects.flatMap((project) => project.bullets),
]

describe('content/resume-base.json', () => {
  it('valida contra resumeBaseSchema', () => {
    const result = resumeBaseSchema.safeParse(resumeBase)
    if (!result.success) {
      console.error(JSON.stringify(result.error.issues, null, 2))
    }
    expect(result.success).toBe(true)
  })

  it('mantem summary default ATS com menos de 60 palavras', () => {
    const defaultSummary = resumeBase.summaryClauses
      .filter((clause) => clause.default)
      .map((clause) => clause.text)
      .join(' ')

    expect(resumeBase.summaryClauses.filter((clause) => clause.default)).toHaveLength(3)
    expect(countWords(defaultSummary)).toBeLessThanOrEqual(60)
    expect(defaultSummary.toLowerCase()).toContain('python')
    expect(defaultSummary.toLowerCase()).toContain('openai')
    expect(defaultSummary.toLowerCase()).toContain('grafana')
  })

  it('mantem skills enxutas e remove grupos de ruido ATS', () => {
    const groups = Object.entries(resumeBase.skills)
    const itemCounts = groups.map(([, group]) => group.items.length)

    expect(Object.keys(resumeBase.skills)).not.toContain('soft_skills')
    expect(Object.keys(resumeBase.skills)).not.toContain('methodologies')
    expect(itemCounts.filter((count) => count < 5 || count > 7)).toEqual([])
  })

  it('mantem bullets entre 12 e 22 palavras com tags e sourceRefs', () => {
    const invalidBullets = allBullets
      .map((bullet) => ({ text: bullet.text, words: countWords(bullet.text), tags: bullet.tags, sourceRefs: bullet.sourceRefs }))
      .filter((bullet) => bullet.words < 12 || bullet.words > 22 || bullet.tags.length === 0 || bullet.sourceRefs.length === 0)

    expect(invalidBullets).toEqual([])
  })

  it('remove secoes e metricas inadequadas para o CV publico', () => {
    const asRecord = resumeBase as Record<string, unknown>
    const serialized = JSON.stringify(resumeBase)

    expect(asRecord.notableMetrics).toBeUndefined()
    expect(asRecord.principles).toBeUndefined()
    expect(resumeBase.education.some((education) => 'coursework' in education)).toBe(false)
    expect(resumeBase.experience.some((experience) => experience.role.toLowerCase().includes('cronometrista'))).toBe(false)
    expect(resumeBase.publicProjects).toHaveLength(1)
    expect(serialized).not.toMatch(/184\+?|110\+?|1338|30%|50%/)
  })

  it('usa apenas sourceRefs aprovados e nao usa icones unicode no JSON', () => {
    const invalidSourceRefs = collectSourceRefs(resumeBase).filter((sourceRef) => !allowedSourceRefs.has(sourceRef))
    const serialized = JSON.stringify(resumeBase)

    expect(invalidSourceRefs).toEqual([])
    expect(serialized).not.toMatch(/[·—✓→]/)
  })
})
