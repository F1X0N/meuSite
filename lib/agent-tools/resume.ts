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

export type Bullet = { text: string; tags: string[] }

export type Experience = {
  company: string
  role: string
  period: string
  location?: string
  bullets: Bullet[]
}

export type PublicProject = {
  title: string
  role?: string
  url: string
  repo?: string
  bullets: Bullet[]
}

export type ResumeBase = typeof resumeBase

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

export const matchScore = (bullet: Bullet, prioritySkills: string[]): number => {
  if (prioritySkills.length === 0) return 0
  return bullet.tags.filter((tag) => {
    const t = tag.toLowerCase()
    return prioritySkills.some((s) => {
      const sl = s.toLowerCase()
      return sl.includes(t) || t.includes(sl)
    })
  }).length
}

export const sortBulletsByPriority = (bullets: Bullet[], prioritySkills: string[]): Bullet[] => {
  if (prioritySkills.length === 0) return bullets
  return [...bullets].sort((a, b) => matchScore(b, prioritySkills) - matchScore(a, prioritySkills))
}

export const SKILL_GROUP_LABELS: Record<string, string> = {
  ai_llm: 'IA & LLMs',
  backend: 'Backend & APIs',
  data: 'Dados & Persistência',
  observability: 'Observabilidade',
  devops: 'DevOps & Infra',
  frontend: 'Frontend',
  methodologies: 'Metodologias',
  soft_skills: 'Competências comportamentais',
}

const renderHeader = (h: ResumeBase['header']): string => {
  const lines = [`# ${h.name}`, '', h.title, '']
  const contactLine = [h.email, h.phone, h.linkedin].filter(Boolean).join(' · ')
  lines.push(contactLine)
  lines.push(`GitHub: ${h.github} · Portfólio: ${h.portfolio}`)
  if (h.location) lines.push(`Localização: ${h.location}`)
  return lines.join('\n')
}

const renderSkillsBlock = (skills: ResumeBase['skills'], prioritySkills: string[]): string => {
  const groups: Array<[string, string[]]> = Object.entries(skills)
  const groupScore = ([, items]: [string, string[]]) =>
    items.filter((i) => prioritySkills.some((s) => s.toLowerCase().includes(i.toLowerCase()) || i.toLowerCase().includes(s.toLowerCase()))).length
  const sorted = prioritySkills.length > 0 ? groups.sort((a, b) => groupScore(b) - groupScore(a)) : groups
  return sorted
    .map(([key, items]) => `**${SKILL_GROUP_LABELS[key] ?? key}:** ${items.join(', ')}.`)
    .join('  \n')
}

const renderExperience = (exp: Experience, prioritySkills: string[]): string => {
  const sortedBullets = sortBulletsByPriority(exp.bullets, prioritySkills)
  const meta = exp.location ? `*${exp.period} · ${exp.location}*` : `*${exp.period}*`
  return `### ${exp.role} — ${exp.company}\n${meta}\n\n${sortedBullets.map((b) => `- ${b.text}`).join('\n')}`
}

const renderPublicProject = (p: PublicProject, prioritySkills: string[]): string => {
  const sorted = sortBulletsByPriority(p.bullets, prioritySkills)
  const head = `### ${p.title}${p.role ? ` (${p.role})` : ''}\n${p.url}`
  return `${head}\n\n${sorted.map((b) => `- ${b.text}`).join('\n')}`
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
  if (base.publicProjects && base.publicProjects.length > 0) {
    lines.push('')
    lines.push('## Projetos públicos')
    for (const p of base.publicProjects) {
      lines.push('')
      lines.push(renderPublicProject(p as PublicProject, prioritySkills))
    }
  }
  if (base.notableMetrics && base.notableMetrics.length > 0) {
    lines.push('')
    lines.push('## Métricas e resultados documentados')
    for (const m of base.notableMetrics) lines.push(`- ${m}`)
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
 * uma das seções estáticas (educação, certificações, idiomas, métricas).
 */
export const validateMarkdownIsSubset = (markdown: string): { ok: boolean; invalidBullets: string[] } => {
  const base = resumeBase as ResumeBase
  const allowedBullets = new Set<string>([
    ...base.experience.flatMap((e) => e.bullets.map((b) => b.text.trim())),
    ...(base.publicProjects ?? []).flatMap((p) => p.bullets.map((b) => b.text.trim())),
    ...(base.notableMetrics ?? []).map((m) => m.trim()),
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
