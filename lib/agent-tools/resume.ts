/**
 * Agent tools — geração de CV adaptado por vaga.
 *
 * Princípio crítico: o agente NUNCA inventa texto novo no CV. Apenas
 * reordena bullets do content/resume-base.json para destacar primeiro
 * os mais alinhados às skills prioritárias da JD. Isso garante que
 * cada bullet do output existe no CV-base aprovado pelo dono.
 */
import type { OpenAI } from 'openai'
import resumeBase from '@/content/resume-base.json'

type Bullet = { text: string; tags: string[] }

type Experience = {
  company: string
  role: string
  period: string
  bullets: Bullet[]
}

type ResumeBase = typeof resumeBase

const PRIORITY_PROMPT = (jd: string) => `Analise a descrição de vaga abaixo e extraia entre 3 e 8 skills/tecnologias prioritárias que o candidato deve destacar no CV. Use termos curtos (ex: "TypeScript", "PostgreSQL", "agentes de IA").

JD:
"""
${jd}
"""

Responda APENAS em JSON válido no formato:
{ "prioritySkills": ["skill1", "skill2", ...] }`

export const extractPrioritySkills = async (
  client: OpenAI,
  jobDescription: string,
): Promise<string[]> => {
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Você é um analisador de JDs que extrai skills chave em JSON estrito.' },
      { role: 'user', content: PRIORITY_PROMPT(jobDescription) },
    ],
    temperature: 0.1,
    max_tokens: 300,
    response_format: { type: 'json_object' },
  })
  const content = response.choices[0]?.message?.content ?? '{}'
  try {
    const parsed = JSON.parse(content) as { prioritySkills?: string[] }
    return Array.isArray(parsed.prioritySkills) ? parsed.prioritySkills.slice(0, 8) : []
  } catch {
    return []
  }
}

const matchScore = (bullet: Bullet, prioritySkills: string[]): number => {
  return bullet.tags.filter((tag) => {
    const t = tag.toLowerCase()
    return prioritySkills.some((s) => {
      const sl = s.toLowerCase()
      return sl.includes(t) || t.includes(sl)
    })
  }).length
}

const sortBulletsByPriority = (bullets: Bullet[], prioritySkills: string[]): Bullet[] => {
  return [...bullets].sort((a, b) => matchScore(b, prioritySkills) - matchScore(a, prioritySkills))
}

const renderHeader = (h: ResumeBase['header']): string => {
  return `# ${h.name}\n\n${h.title}\n\n${h.email} · ${h.phone} · ${h.linkedin}\nGitHub: ${h.github} · Portfólio: ${h.portfolio}`
}

const renderSkillsBlock = (skills: ResumeBase['skills'], prioritySkills: string[]): string => {
  // Reordenar grupos: primeiro os que tem skill matching com priority
  const groups: Array<[string, string[]]> = Object.entries(skills)
  const groupScore = ([, items]: [string, string[]]) =>
    items.filter((i) => prioritySkills.some((s) => s.toLowerCase().includes(i.toLowerCase()) || i.toLowerCase().includes(s.toLowerCase()))).length
  const sorted = groups.sort((a, b) => groupScore(b) - groupScore(a))
  const labels: Record<string, string> = {
    ai_llm: 'IA & LLMs',
    backend: 'Backend & APIs',
    data: 'Dados & Produção',
    observability: 'Observabilidade',
    devops: 'DevOps',
    frontend: 'Frontend',
  }
  return sorted.map(([key, items]) => `**${labels[key] ?? key}:** ${items.join(', ')}.`).join('  \n')
}

const renderExperience = (exp: Experience, prioritySkills: string[]): string => {
  const sortedBullets = sortBulletsByPriority(exp.bullets, prioritySkills)
  return `### ${exp.role} — ${exp.company}\n*${exp.period}*\n\n${sortedBullets.map((b) => `- ${b.text}`).join('\n')}`
}

export const generateTargetedResumeMarkdown = (prioritySkills: string[]): string => {
  const base = resumeBase as ResumeBase
  const lines: string[] = []
  lines.push(renderHeader(base.header))
  lines.push('')
  lines.push('## Resumo profissional')
  lines.push(base.summary)
  lines.push('')
  lines.push('## Competências técnicas')
  lines.push(renderSkillsBlock(base.skills, prioritySkills))
  lines.push('')
  lines.push('## Experiência profissional')
  for (const exp of base.experience) {
    lines.push('')
    lines.push(renderExperience(exp, prioritySkills))
  }
  if (base.publicProject) {
    lines.push('')
    lines.push('## Projeto público relevante')
    lines.push(`### ${base.publicProject.title} — ${base.publicProject.url}`)
    const sortedProjBullets = sortBulletsByPriority(base.publicProject.bullets, prioritySkills)
    for (const b of sortedProjBullets) lines.push(`- ${b.text}`)
  }
  lines.push('')
  lines.push('## Educação')
  for (const e of base.education) lines.push(`- ${e.institution} — ${e.degree} (${e.period})`)
  lines.push('')
  lines.push('## Certificações')
  for (const c of base.certifications) lines.push(`- ${c}`)
  lines.push('')
  lines.push('## Idiomas')
  for (const l of base.languages) lines.push(`- ${l}`)
  return lines.join('\n')
}

/**
 * Validação: o markdown gerado deve ser subset do resume-base.
 * Cada bullet do output deve aparecer literalmente no resume-base ou em
 * uma das seções estáticas (educação, certificações, idiomas).
 */
export const validateMarkdownIsSubset = (markdown: string): { ok: boolean; invalidBullets: string[] } => {
  const base = resumeBase as ResumeBase
  const allowedBullets = new Set<string>([
    ...base.experience.flatMap((e) => e.bullets.map((b) => b.text.trim())),
    ...(base.publicProject?.bullets ?? []).map((b) => b.text.trim()),
    ...base.education.map((e) => `${e.institution} — ${e.degree} (${e.period})`),
    ...base.certifications.map((c) => c.trim()),
    ...base.languages.map((l) => l.trim()),
  ])
  const lines = markdown.split('\n')
  const invalidBullets: string[] = []
  for (const line of lines) {
    const m = line.match(/^- (.+)$/)
    if (!m) continue
    const text = m[1].trim()
    if (!allowedBullets.has(text)) invalidBullets.push(text)
  }
  return { ok: invalidBullets.length === 0, invalidBullets }
}
