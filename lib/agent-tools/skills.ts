/**
 * Agent tools — Skills por conteúdo (padrão Claude Code-style).
 *
 * Cada skill em content/knowledge-skills/<name>.md tem frontmatter validado e
 * lista de triggers + followups. As tools abaixo permitem que o agente do
 * site selecione skills relevantes, carregue corpo completo, sugira conteúdo
 * para o usuário e ofereça followups naturais.
 *
 * Skills index é gerado em build (lib/skills-data.json) — runtime não lê FS
 * para evitar custo por request.
 */
import skillsData from '@/lib/skills-data.json'
import type { SkillIndexEntry } from '@/lib/skill-schema'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const SKILLS: SkillIndexEntry[] = skillsData as SkillIndexEntry[]

const KNOWLEDGE_SKILLS_DIR = path.join(process.cwd(), 'content', 'knowledge-skills')

export type SkillSuggestion = {
  name: string
  score: number
  description: string
  linkedContent: string
  linkedType: 'case-study' | 'blog'
}

export type ContentCard = {
  slug: string
  title: string
  type: 'case-study' | 'blog'
  href: string
}

/**
 * Match lexical: triggers contam 3x, palavras chave da description 1x.
 * Retorna top N skills com score > 0, ordenadas decrescente.
 */
export const selectRelevantSkills = (question: string, max = 3): SkillSuggestion[] => {
  const q = question.toLowerCase()
  const scored = SKILLS.map((skill) => {
    const triggerHits = skill.triggers.filter((t) => q.includes(t.toLowerCase())).length
    const descTokens = skill.description
      .toLowerCase()
      .split(/[\s,.;:]+/)
      .filter((w) => w.length > 4)
    const descHits = descTokens.filter((w) => q.includes(w)).length
    return {
      name: skill.name,
      score: triggerHits * 3 + descHits,
      description: skill.description,
      linkedContent: skill.linkedContent,
      linkedType: skill.linkedType,
    }
  })
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
}

/**
 * Carrega body completo de uma skill (texto após o frontmatter).
 * Para uso server-side em chat/route.ts antes da chamada LLM.
 */
export const loadSkill = async (skillName: string): Promise<string | null> => {
  const skill = SKILLS.find((s) => s.name === skillName)
  if (!skill) return null
  try {
    const filePath = path.join(KNOWLEDGE_SKILLS_DIR, `${skillName}.md`)
    const raw = await readFile(filePath, 'utf-8')
    // Remove frontmatter (entre --- e ---)
    const body = raw.replace(/^---[\s\S]*?---\n+/, '')
    return body.trim()
  } catch {
    return null
  }
}

/**
 * Cards clicáveis para frontend renderizar como sugestão de conteúdo.
 * Resumo compatível com Card UI primitive já usado no site.
 */
export const suggestRelevantContent = (topic: string, max = 3): ContentCard[] => {
  return selectRelevantSkills(topic, max).map((s) => {
    const slug = s.linkedContent.split('/').pop() ?? ''
    const title = s.description.length > 80 ? s.description.slice(0, 80) + '...' : s.description
    return {
      slug,
      title,
      type: s.linkedType,
      href: s.linkedContent,
    }
  })
}

/**
 * Extrai followups dos skills consultados nesta turn.
 * Deduplica e limita a max.
 */
export const offerFollowupQuestions = (skillsUsed: string[], max = 3): string[] => {
  const all = SKILLS.filter((s) => skillsUsed.includes(s.name)).flatMap((s) => s.followups)
  return Array.from(new Set(all)).slice(0, max)
}

/**
 * Deep dive: carrega o MDX completo do case linkado para responder com
 * profundidade quando usuário pede "fala mais sobre" / "explica como".
 */
export const deepDiveCase = async (
  skillName: string,
): Promise<{ title: string; content: string } | null> => {
  const skill = SKILLS.find((s) => s.name === skillName)
  if (!skill || skill.linkedType !== 'case-study') return null
  const slug = skill.linkedContent.split('/').pop() ?? ''
  const { getCaseStudyBySlug } = await import('@/lib/mdx')
  const caseStudy = getCaseStudyBySlug(slug)
  return caseStudy ? { title: caseStudy.title, content: caseStudy.content } : null
}
