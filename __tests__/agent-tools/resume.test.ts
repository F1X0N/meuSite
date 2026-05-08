import { describe, it, expect, vi } from 'vitest'
import type { OpenAI } from 'openai'
import {
  calculateResumeFitScore,
  extractPrioritySkills,
  generateTargetedResumeMarkdown,
  matchScore,
  validateMarkdownIsSubset,
  type Bullet,
} from '@/lib/agent-tools/resume'

const createMockOpenAiClient = (content: string): OpenAI => ({
  chat: {
    completions: {
      create: vi.fn().mockResolvedValue({
        choices: [{ message: { content } }],
      }),
    },
  },
}) as unknown as OpenAI

describe('agent-tools/resume', () => {
  it('generateTargetedResumeMarkdown produz markdown ATS nao-vazio', () => {
    const markdown = generateTargetedResumeMarkdown(['nodejs', 'typescript'])

    expect(markdown.length).toBeGreaterThan(500)
    expect(markdown).toMatch(/^# /m)
    expect(markdown).toMatch(/## Summary/)
    expect(markdown).toMatch(/## Skills/)
    expect(markdown).toMatch(/## Experience/)
    expect(markdown).not.toMatch(/Métricas e Resultados|Princípios/)
  })

  it('extractPrioritySkills extrai sinais estruturados e codifica sem quebrar o endpoint atual', async () => {
    const client = createMockOpenAiClient(JSON.stringify({
      mustHaveSkills: ['TypeScript', 'PostgreSQL'],
      niceToHaveSkills: ['RAG'],
      seniorityLevel: 'senior',
      industry: 'legaltech',
      emphasis: 'quality',
      softSignals: ['ownership'],
    }))

    const result = await extractPrioritySkills(client, 'Senior backend TypeScript PostgreSQL RAG role in LegalTech.')

    expect(result).toContain('must:TypeScript')
    expect(result).toContain('must:PostgreSQL')
    expect(result).toContain('nice:RAG')
    expect(result).toContain('seniority:senior')
    expect(result).toContain('industry:legaltech')
    expect(result).toContain('emphasis:quality')
    expect(result).toContain('soft:ownership')
  })

  it('matchScore aplica pesos para must-have, nice-to-have e soft signals', () => {
    const bullet: Bullet = {
      text: 'Integra OpenAI e React com ownership técnico em fluxos de produto documentados.',
      tags: ['openai', 'react', 'ownership'],
      sourceRefs: ['content/knowledge-base.md'],
    }

    const score = matchScore(bullet, ['must:OpenAI', 'nice:React', 'soft:ownership'])

    expect(score).toBe(4.5)
  })

  it('personalizacao reordena summary, skills e filtra bullets irrelevantes', () => {
    const markdown = generateTargetedResumeMarkdown(['llm', 'openai', 'rag'])

    expect(markdown.indexOf('Atua com IA aplicada')).toBeLessThan(markdown.indexOf('Engenheiro de Software full stack'))
    expect(markdown.indexOf('Integra OpenAI')).toBeLessThan(markdown.indexOf('Desenvolve features full stack'))
    expect(markdown).not.toContain('Estrutura runbooks, planos de validação')
    expect(markdown).not.toContain('Colaborou com engenharia, operação e PCP')
  })

  it('reordena grupos e itens de skills, nao apenas bullets', () => {
    const markdown = generateTargetedResumeMarkdown(['must:PostgreSQL', 'must:Redis'])

    expect(markdown.indexOf('**Dados e Persistência:** PostgreSQL, Redis')).toBeGreaterThan(-1)
    expect(markdown.indexOf('**Dados e Persistência:**')).toBeLessThan(markdown.indexOf('**AI e LLMs:**'))
  })

  it('usa CV-base quando o score deterministico fica abaixo de 60', () => {
    const defaultMarkdown = generateTargetedResumeMarkdown([])
    const lowFitMarkdown = generateTargetedResumeMarkdown(['must:Kubernetes'])

    expect(calculateResumeFitScore(['must:Kubernetes'])).toBe(0)
    expect(lowFitMarkdown).toBe(defaultMarkdown)
  })

  it('validateMarkdownIsSubset retorna ok=true para markdown gerado', () => {
    const markdown = generateTargetedResumeMarkdown(['nodejs', 'typescript'])
    const result = validateMarkdownIsSubset(markdown)

    expect(result.ok).toBe(true)
    expect(result.invalidBullets).toHaveLength(0)
  })

  it('validateMarkdownIsSubset detecta summary ou bullet inventado', () => {
    const markdown = generateTargetedResumeMarkdown([])
    const tampered = markdown.replace(
      'Engenheiro de Software full stack com mais de 4 anos de experiência em Python, Node.js, TypeScript e PostgreSQL.',
      'Engenheiro inventado com dez anos de Kubernetes em escala global.',
    )
    const result = validateMarkdownIsSubset(tampered)

    expect(result.ok).toBe(false)
    expect(result.invalidBullets.some((line) => line.includes('Kubernetes'))).toBe(true)
  })
})
