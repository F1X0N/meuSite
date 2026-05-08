import { describe, it, expect } from 'vitest'
import {
  generateTargetedResumeMarkdown,
  validateMarkdownIsSubset,
} from '@/lib/agent-tools/resume'

describe('agent-tools/resume', () => {
  it('generateTargetedResumeMarkdown produz markdown não-vazio', () => {
    const md = generateTargetedResumeMarkdown(['nodejs', 'typescript'])
    expect(md.length).toBeGreaterThan(500)
    expect(md).toMatch(/^# /m)
    expect(md).toMatch(/## Resumo profissional/)
    expect(md).toMatch(/## Experiência profissional/)
  })

  it('generateTargetedResumeMarkdown reordena bullets baseado em prioritySkills', () => {
    const mdAi = generateTargetedResumeMarkdown(['llm', 'openai', 'rag'])
    const mdScrum = generateTargetedResumeMarkdown(['lean', 'scrum', 'kanban'])
    // Garantir que os outputs são diferentes (reordenamento de bullets)
    expect(mdAi).not.toBe(mdScrum)
  })

  it('validateMarkdownIsSubset retorna ok=true para markdown gerado', () => {
    const md = generateTargetedResumeMarkdown(['nodejs', 'typescript'])
    const result = validateMarkdownIsSubset(md)
    expect(result.ok).toBe(true)
    expect(result.invalidBullets).toHaveLength(0)
  })

  it('validateMarkdownIsSubset detecta bullet inventado', () => {
    const md = generateTargetedResumeMarkdown([])
    const tampered = md.replace(/## Resumo profissional/, '## Resumo profissional\n\n- Bullet inventado que nao existe no resume base\n')
    const result = validateMarkdownIsSubset(tampered)
    expect(result.ok).toBe(false)
    expect(result.invalidBullets.some((b) => b.includes('Bullet inventado'))).toBe(true)
  })
})
