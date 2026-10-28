import { describe, it, expect, vi } from 'vitest'
import type { OpenAI } from 'openai'
import {
  calculateResumeFitScore,
  extractPrioritySkills,
  generateTargetedResumeMarkdown,
  matchScore,
  validateMarkdownIsSubset,
  buildTargetedResumeModel,
  type Bullet,
} from '@/lib/agent-tools/resume'
import { generateCoverLetter } from '@/lib/agent-tools/cover-letter'

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

  it('gera currículo em português com a mesma validação de evidências', () => {
    const markdown = generateTargetedResumeMarkdown(['must:React', 'must:Node.js'], 'pt')

    expect(markdown).toContain('## Resumo')
    expect(markdown).toContain('## Experiência')
    expect(markdown).toContain('Engenheiro de Software Full Stack')
    expect(markdown).toContain('Desenvolveu funcionalidades de produto')
    expect(markdown).not.toContain('Built full-stack product features')
    expect(validateMarkdownIsSubset(markdown, 'pt').ok).toBe(true)
  })

  it('mantém todos os textos narrativos traduzidos e verificáveis', () => {
    const english = buildTargetedResumeModel([], 'en')
    const portuguese = buildTargetedResumeModel([], 'pt')

    expect(portuguese.summaryClauses.every((clause, index) => clause.text !== english.summaryClauses[index].text)).toBe(true)
    expect(portuguese.experience.every((experience, experienceIndex) =>
      experience.bullets.every((bullet, bulletIndex) => bullet.text !== english.experience[experienceIndex].bullets[bulletIndex].text),
    )).toBe(true)
    expect(portuguese.publicProjects.every((project, projectIndex) =>
      project.bullets.every((bullet, bulletIndex) => bullet.text !== english.publicProjects[projectIndex].bullets[bulletIndex].text),
    )).toBe(true)
  })

  it('carta usa cargo, empresa e experiência verificada no idioma escolhido', () => {
    const portugueseLetter = generateCoverLetter({
      prioritySkills: ['must:React'],
      language: 'pt',
      role: 'Engenheiro Full Stack',
      company: 'Empresa Exemplo',
      motivation: 'Gosto de construir produtos de ponta a ponta.',
    })
    const englishLetter = generateCoverLetter({
      prioritySkills: ['must:React'],
      language: 'en',
      role: 'Full-Stack Engineer',
      company: 'Example Company',
    })

    expect(portugueseLetter).toContain('Empresa Exemplo')
    expect(portugueseLetter).toContain('Desenvolvi funcionalidades de produto')
    expect(portugueseLetter).toContain('Gosto de construir produtos de ponta a ponta.')
    expect(englishLetter).toContain('Example Company')
    expect(englishLetter).toContain('I built full-stack product features')
    expect(englishLetter).not.toContain('Gosto de construir')
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

    expect(markdown.indexOf('Builds AI workflows')).toBeLessThan(markdown.indexOf('Full-stack software engineer'))
    expect(markdown.indexOf('Developed applied AI workflows')).toBeLessThan(markdown.indexOf('Built full-stack product features'))
    expect(markdown).not.toContain('Contributed to Docker-based delivery')
    expect(markdown).not.toContain('Collaborated with engineering and operations teams')
  })

  it('reordena grupos e itens de skills, nao apenas bullets', () => {
    const markdown = generateTargetedResumeMarkdown(['must:PostgreSQL', 'must:Redis'])

    expect(markdown.indexOf('**Data & Storage:** PostgreSQL, Redis')).toBeGreaterThan(-1)
    expect(markdown.indexOf('**Data & Storage:**')).toBeLessThan(markdown.indexOf('**Applied AI:**'))
  })

  it('usa CV-base quando a vaga não tem competências verificadas no perfil', () => {
    const defaultMarkdown = generateTargetedResumeMarkdown([])
    const lowFitMarkdown = generateTargetedResumeMarkdown(['must:Kubernetes'])

    expect(calculateResumeFitScore(['must:Kubernetes'])).toBe(0)
    expect(lowFitMarkdown).toBe(defaultMarkdown)
  })

  it('personaliza uma vaga com correspondência parcial sem inventar requisitos', () => {
    const markdown = generateTargetedResumeMarkdown(['must:React', 'must:Kubernetes'])

    expect(markdown).not.toBe(generateTargetedResumeMarkdown([]))
    expect(markdown).not.toContain('Kubernetes')
    expect(validateMarkdownIsSubset(markdown).ok).toBe(true)
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
      'Full-stack software engineer with 4+ years of professional experience across web applications, using React, Node.js, Python, and PostgreSQL.',
      'Engenheiro inventado com dez anos de Kubernetes em escala global.',
    )
    const result = validateMarkdownIsSubset(tampered)

    expect(result.ok).toBe(false)
    expect(result.invalidBullets.some((line) => line.includes('Kubernetes'))).toBe(true)
  })
})
