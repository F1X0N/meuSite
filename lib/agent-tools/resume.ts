import { z } from 'zod'
import type { OpenAI } from 'openai'
import resumeBase from '@/content/resume-base.json'
import type {
  ResumeBase as ResumeBaseData,
  ResumeBullet,
  ResumeSkillGroup,
  ResumeSkillItem,
  ResumeSummaryClause,
} from '@/lib/resume-schema'

export type ResumeBase = ResumeBaseData
export type Bullet = ResumeBullet
export type Experience = ResumeBase['experience'][number]
export type PublicProject = ResumeBase['publicProjects'][number]

export type SeniorityLevel = 'junior' | 'mid' | 'senior' | 'staff' | 'unknown'
export type ResumeEmphasis = 'speed' | 'quality' | 'scale' | 'innovation' | 'balanced'

export type ResumeTargetingSignals = {
  mustHaveSkills: string[]
  niceToHaveSkills: string[]
  seniorityLevel: SeniorityLevel
  industry: string | null
  emphasis: ResumeEmphasis
  softSignals: string[]
}

export type ResumeSkillGroupView = {
  key: string
  label: string
  items: ResumeSkillItem[]
}

export type ResumeRenderModel = {
  header: ResumeBase['header']
  summaryClauses: ResumeSummaryClause[]
  skills: ResumeSkillGroupView[]
  experience: Experience[]
  publicProjects: PublicProject[]
  education: ResumeBase['education']
  certifications: ResumeBase['certifications']
  languages: ResumeBase['languages']
}

const seniorityLevels = ['junior', 'mid', 'senior', 'staff', 'unknown'] as const
const emphasisValues = ['speed', 'quality', 'scale', 'innovation', 'balanced'] as const
const stringArraySchema = z.array(z.string()).catch([])

const targetingSignalsSchema = z.object({
  mustHaveSkills: stringArraySchema,
  niceToHaveSkills: stringArraySchema,
  seniorityLevel: z.enum(seniorityLevels).catch('unknown'),
  industry: z.string().nullable().catch(null),
  emphasis: z.enum(emphasisValues).catch('balanced'),
  softSignals: stringArraySchema,
})

const emptyTargetingSignals: ResumeTargetingSignals = {
  mustHaveSkills: [],
  niceToHaveSkills: [],
  seniorityLevel: 'unknown',
  industry: null,
  emphasis: 'balanced',
  softSignals: [],
}

const signalPrefixes = ['must:', 'nice:', 'soft:', 'seniority:', 'industry:', 'emphasis:'] as const

const synonymGroups = [
  ['typescript', 'ts'],
  ['javascript', 'js'],
  ['nodejs', 'node.js', 'node js', 'node'],
  ['postgresql', 'postgres'],
  ['rag', 'retrieval augmented generation'],
  ['llm', 'llms', 'large language model', 'large language models'],
  ['ai', 'ia', 'artificial intelligence', 'inteligencia artificial'],
  ['agent supervision', 'agent-supervision', 'agentes supervisionados', 'agents'],
  ['mcp', 'model context protocol'],
  ['json repair', 'json-repair', 'structured output', 'schema validation'],
  ['ci cd', 'ci/cd', 'cicd'],
  ['kubernetes', 'k8s'],
  ['grafana', 'metrics'],
  ['loki', 'logs', 'structured logs'],
  ['sentry', 'errors', 'error tracking'],
  ['sql safety', 'sql-safety', 'read only diagnostics', 'read-only diagnostics'],
  ['nextjs', 'next.js'],
  ['tailwind', 'tailwind css'],
]

const emphasisTerms: Record<ResumeEmphasis, string[]> = {
  speed: ['automation', 'delivery', 'runbooks', 'efficiency', 'feature intake'],
  quality: ['validation', 'observability', 'sql safety', 'release validation', 'acceptance criteria'],
  scale: ['scale', 'monitoring', 'performance', 'ci cd', 'industrial'],
  innovation: ['ai', 'llm', 'openai', 'rag', 'agent supervision'],
  balanced: [],
}

const seniorityTerms: Record<SeniorityLevel, string[]> = {
  junior: [],
  mid: ['full-cycle', 'full-stack', 'delivery'],
  senior: ['ownership', 'technical leadership', 'operational discipline', 'cross-functional'],
  staff: ['architecture', 'governance', 'risk management', 'cross-functional'],
  unknown: [],
}

const createPriorityPrompt = (jobDescription: string) => `Analise a descrição de vaga abaixo e extraia sinais de priorização para adaptar um currículo ATS sem inventar fatos.

Regras:
- Separe requisitos rígidos de diferenciais.
- Inclua apenas skills, senioridade e sinais explicitamente presentes ou fortemente implicados na vaga.
- Use nomes canônicos e curtos, preservando tecnologia quando aparecer clara na JD.
- Não avalie o candidato. Extraia apenas a demanda da vaga.

JD:
"""
${jobDescription}
"""

Responda APENAS em JSON válido:
{
  "mustHaveSkills": ["TypeScript", "PostgreSQL"],
  "niceToHaveSkills": ["RAG"],
  "seniorityLevel": "junior" | "mid" | "senior" | "staff" | "unknown",
  "industry": "legaltech" | "fintech" | "health" | "saas" | null,
  "emphasis": "speed" | "quality" | "scale" | "innovation" | "balanced",
  "softSignals": ["ownership", "collaboration"]
}`

const normalizeText = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9+#.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const uniqueStrings = (items: string[]): string[] =>
  Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)))

const sanitizeSignals = (signals: ResumeTargetingSignals): ResumeTargetingSignals => ({
  mustHaveSkills: uniqueStrings(signals.mustHaveSkills).slice(0, 10),
  niceToHaveSkills: uniqueStrings(signals.niceToHaveSkills).slice(0, 10),
  seniorityLevel: signals.seniorityLevel,
  industry: signals.industry?.trim() ? signals.industry.trim().slice(0, 60) : null,
  emphasis: signals.emphasis,
  softSignals: uniqueStrings(signals.softSignals).slice(0, 8),
})

const parseTargetingSignals = (value: unknown): ResumeTargetingSignals => {
  const parsed = targetingSignalsSchema.safeParse(value)
  if (parsed.success) return sanitizeSignals(parsed.data)

  const legacy = z.object({ prioritySkills: z.array(z.string()) }).safeParse(value)
  if (legacy.success) return sanitizeSignals({ ...emptyTargetingSignals, mustHaveSkills: legacy.data.prioritySkills })

  return emptyTargetingSignals
}

const parseJsonSignals = (content: string): ResumeTargetingSignals => {
  try {
    return parseTargetingSignals(JSON.parse(content))
  } catch {
    return emptyTargetingSignals
  }
}

const signalToken = (prefix: string, value: string): string => `${prefix}${value}`

export const encodeTargetingSignals = (signals: ResumeTargetingSignals): string[] => {
  const sanitized = sanitizeSignals(signals)
  return [
    ...sanitized.mustHaveSkills.map((skill) => signalToken('must:', skill)),
    ...sanitized.niceToHaveSkills.map((skill) => signalToken('nice:', skill)),
    ...sanitized.softSignals.map((signal) => signalToken('soft:', signal)),
    signalToken('seniority:', sanitized.seniorityLevel),
    signalToken('emphasis:', sanitized.emphasis),
    sanitized.industry ? signalToken('industry:', sanitized.industry) : '',
  ].filter(Boolean)
}

const valuesByPrefix = (items: string[], prefix: string): string[] =>
  items
    .filter((item) => item.startsWith(prefix))
    .map((item) => item.slice(prefix.length).trim())
    .filter(Boolean)

const decodeEnumValue = <T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T => {
  if (value && allowed.includes(value as T)) return value as T
  return fallback
}

export const decodeTargetingSignals = (prioritySkills: string[]): ResumeTargetingSignals => {
  const structured = prioritySkills.some((skill) => signalPrefixes.some((prefix) => skill.startsWith(prefix)))
  if (!structured) return sanitizeSignals({ ...emptyTargetingSignals, mustHaveSkills: prioritySkills })

  return sanitizeSignals({
    mustHaveSkills: valuesByPrefix(prioritySkills, 'must:'),
    niceToHaveSkills: valuesByPrefix(prioritySkills, 'nice:'),
    softSignals: valuesByPrefix(prioritySkills, 'soft:'),
    seniorityLevel: decodeEnumValue(valuesByPrefix(prioritySkills, 'seniority:')[0], seniorityLevels, 'unknown'),
    industry: valuesByPrefix(prioritySkills, 'industry:')[0] ?? null,
    emphasis: decodeEnumValue(valuesByPrefix(prioritySkills, 'emphasis:')[0], emphasisValues, 'balanced'),
  })
}

export const extractPrioritySkills = async (
  client: OpenAI,
  jobDescription: string,
): Promise<string[]> => {
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Você extrai sinais estruturados de job descriptions e responde somente JSON válido.' },
      { role: 'user', content: createPriorityPrompt(jobDescription) },
    ],
    temperature: 0.1,
    max_tokens: 500,
    response_format: { type: 'json_object' },
  })
  const content = response.choices[0]?.message?.content ?? '{}'
  return encodeTargetingSignals(parseJsonSignals(content))
}

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const normalizedTextMatchesTerm = (candidate: string, term: string): boolean => {
  const normalizedCandidate = normalizeText(candidate)
  const normalizedTerm = normalizeText(term)
  if (!normalizedCandidate || !normalizedTerm) return false
  if (normalizedTerm.length <= 3) return new RegExp(`(^|\\s)${escapeRegExp(normalizedTerm)}($|\\s)`).test(normalizedCandidate)
  return normalizedCandidate.includes(normalizedTerm)
}

const equivalentTerms = (term: string): string[] => {
  const normalizedTerm = normalizeText(term)
  const matchingGroup = synonymGroups.find((group) => group.map(normalizeText).includes(normalizedTerm))
  if (!matchingGroup) return [normalizedTerm]
  return uniqueStrings([normalizedTerm, ...matchingGroup.map(normalizeText)])
}

const searchableText = (text: string, tags: string[]): string => [text, ...tags].join(' ')

const textMatchesTerm = (candidate: string, term: string): boolean =>
  equivalentTerms(term).some((equivalentTerm) => normalizedTextMatchesTerm(candidate, equivalentTerm))

const scoreSearchableText = (candidate: string, signals: ResumeTargetingSignals): number => {
  const weightedTermScore = (terms: string[], weight: number) =>
    terms.reduce((total, term) => total + (textMatchesTerm(candidate, term) ? weight : 0), 0)

  const industryScore = signals.industry && textMatchesTerm(candidate, signals.industry) ? 1 : 0
  const emphasisScore = weightedTermScore(emphasisTerms[signals.emphasis], 0.75)
  const seniorityScore = weightedTermScore(seniorityTerms[signals.seniorityLevel], 0.5)

  return (
    weightedTermScore(signals.mustHaveSkills, 3) +
    weightedTermScore(signals.niceToHaveSkills, 1) +
    weightedTermScore(signals.softSignals, 0.5) +
    industryScore +
    emphasisScore +
    seniorityScore
  )
}

const baseSearchableText = (base: ResumeBase): string =>
  [
    base.header.title,
    ...base.summaryClauses.flatMap((clause) => [clause.text, ...clause.tags]),
    ...Object.values(base.skills).flatMap((group) => group.items.flatMap((item) => [item.text, ...item.tags])),
    ...base.experience.flatMap((experience) => experience.bullets.flatMap((bullet) => [bullet.text, ...bullet.tags])),
    ...base.publicProjects.flatMap((project) => project.bullets.flatMap((bullet) => [bullet.text, ...bullet.tags])),
  ].join(' ')

const weightedSignalsTotal = (signals: ResumeTargetingSignals): number =>
  signals.mustHaveSkills.length * 3 + signals.niceToHaveSkills.length + signals.softSignals.length * 0.5

export const calculateResumeFitScore = (prioritySkills: string[], base: ResumeBase = resumeBase as ResumeBase): number => {
  const signals = decodeTargetingSignals(prioritySkills)
  const total = weightedSignalsTotal(signals)
  if (total === 0) return 100

  const candidate = baseSearchableText(base)
  const weightedTermScore = (terms: string[], weight: number) =>
    terms.reduce((sum, term) => sum + (textMatchesTerm(candidate, term) ? weight : 0), 0)

  const matched =
    weightedTermScore(signals.mustHaveSkills, 3) +
    weightedTermScore(signals.niceToHaveSkills, 1) +
    weightedTermScore(signals.softSignals, 0.5)

  return Math.round((matched / total) * 100)
}

const shouldTargetResume = (prioritySkills: string[], base: ResumeBase = resumeBase as ResumeBase): boolean =>
  prioritySkills.length > 0 && weightedSignalsTotal(decodeTargetingSignals(prioritySkills)) > 0 && calculateResumeFitScore(prioritySkills, base) >= 60

export const matchScore = (bullet: Bullet, prioritySkills: string[]): number => {
  if (!shouldTargetResume(prioritySkills)) return 0
  const signals = decodeTargetingSignals(prioritySkills)
  return scoreSearchableText(searchableText(bullet.text, bullet.tags), signals)
}

const scoreSkillItem = (item: ResumeSkillItem, prioritySkills: string[]): number => {
  if (!shouldTargetResume(prioritySkills)) return 0
  return scoreSearchableText(searchableText(item.text, item.tags), decodeTargetingSignals(prioritySkills))
}

const sortByScore = <T>(items: T[], score: (item: T) => number): T[] =>
  items
    .map((item, index) => ({ item, index, score: score(item) }))
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map(({ item }) => item)

export const sortBulletsByPriority = (bullets: Bullet[], prioritySkills: string[]): Bullet[] => {
  if (!shouldTargetResume(prioritySkills)) return bullets
  return sortByScore(bullets, (bullet) => matchScore(bullet, prioritySkills))
}

export const selectBulletsByPriority = (
  bullets: Bullet[],
  prioritySkills: string[],
  minimumBullets = 2,
): Bullet[] => {
  if (!shouldTargetResume(prioritySkills)) return bullets

  const scored = sortByScore(bullets, (bullet) => matchScore(bullet, prioritySkills))
  const matched = scored.filter((bullet) => matchScore(bullet, prioritySkills) > 0)
  if (matched.length >= minimumBullets) return matched
  return scored.slice(0, Math.min(minimumBullets, scored.length))
}

const selectSummaryClauses = (clauses: ResumeSummaryClause[], prioritySkills: string[]): ResumeSummaryClause[] => {
  const defaults = clauses.filter((clause) => clause.default)
  if (!shouldTargetResume(prioritySkills)) return defaults

  const signals = decodeTargetingSignals(prioritySkills)
  const scored = sortByScore(clauses, (clause) => scoreSearchableText(searchableText(clause.text, clause.tags), signals))
  const matched = scored.filter((clause) => scoreSearchableText(searchableText(clause.text, clause.tags), signals) > 0)
  const selected = uniqueStrings([...matched, ...defaults].map((clause) => clause.text))
    .map((text) => clauses.find((clause) => clause.text === text))
    .filter((clause): clause is ResumeSummaryClause => Boolean(clause))

  return selected.slice(0, 3)
}

const sortSkillGroup = ([key, group]: [string, ResumeSkillGroup], prioritySkills: string[]): ResumeSkillGroupView => {
  if (!shouldTargetResume(prioritySkills)) return { key, label: group.label, items: group.items }
  return { key, label: group.label, items: sortByScore(group.items, (item) => scoreSkillItem(item, prioritySkills)) }
}

const skillGroupScore = (group: ResumeSkillGroupView, prioritySkills: string[]): number =>
  group.items.reduce((total, item) => total + scoreSkillItem(item, prioritySkills), 0)

const selectSkillGroups = (skills: ResumeBase['skills'], prioritySkills: string[]): ResumeSkillGroupView[] => {
  const groups = Object.entries(skills).map((entry) => sortSkillGroup(entry, prioritySkills))
  if (!shouldTargetResume(prioritySkills)) return groups
  return sortByScore(groups, (group) => skillGroupScore(group, prioritySkills))
}

export const buildTargetedResumeModel = (prioritySkills: string[] = []): ResumeRenderModel => {
  const base = resumeBase as ResumeBase
  const activePrioritySkills = shouldTargetResume(prioritySkills, base) ? prioritySkills : []

  return {
    header: base.header,
    summaryClauses: selectSummaryClauses(base.summaryClauses, activePrioritySkills),
    skills: selectSkillGroups(base.skills, activePrioritySkills),
    experience: base.experience.map((experience) => ({
      ...experience,
      bullets: selectBulletsByPriority(experience.bullets, activePrioritySkills, Math.min(2, experience.bullets.length)),
    })),
    publicProjects: base.publicProjects.map((project) => ({
      ...project,
      bullets: selectBulletsByPriority(project.bullets, activePrioritySkills, 1),
    })),
    education: base.education,
    certifications: base.certifications,
    languages: base.languages,
  }
}

const renderHeader = (header: ResumeBase['header']): string => {
  const contactLine = [header.email, header.phone, header.linkedin].filter(Boolean).join(' | ')
  const linksLine = [`GitHub: ${header.github}`, `Portfolio: ${header.portfolio}`].join(' | ')
  const locationLine = header.location ? [`Location: ${header.location}`] : []
  return [`# ${header.name}`, '', header.title, '', contactLine, linksLine, ...locationLine].join('\n')
}

const renderSkillsBlock = (skills: ResumeSkillGroupView[]): string =>
  skills
    .map((group) => `**${group.label}:** ${group.items.map((item) => item.text).join(', ')}.`)
    .join('  \n')

const renderExperience = (experience: Experience): string => {
  const meta = experience.location ? `*${experience.period} - ${experience.location}*` : `*${experience.period}*`
  return `### ${experience.role} - ${experience.company}\n${meta}\n\n${experience.bullets.map((bullet) => `- ${bullet.text}`).join('\n')}`
}

const renderPublicProject = (project: PublicProject): string => {
  const heading = `### ${project.title}${project.role ? ` (${project.role})` : ''}`
  return `${heading}\n${project.url}\n\n${project.bullets.map((bullet) => `- ${bullet.text}`).join('\n')}`
}

export const generateTargetedResumeMarkdown = (prioritySkills: string[] = []): string => {
  const model = buildTargetedResumeModel(prioritySkills)
  return [
    renderHeader(model.header),
    '',
    '## Summary',
    ...model.summaryClauses.map((clause) => clause.text),
    '',
    '## Skills',
    renderSkillsBlock(model.skills),
    '',
    '## Experience',
    ...model.experience.flatMap((experience) => ['', renderExperience(experience)]),
    '',
    '## Projects',
    ...model.publicProjects.flatMap((project) => ['', renderPublicProject(project)]),
    '',
    '## Education',
    ...model.education.map((education) => `- ${education.institution} - ${education.degree} (${education.period})`),
    '',
    '## Certifications',
    ...model.certifications.map((certification) => `- ${certification.text}`),
    '',
    '## Languages',
    ...model.languages.map((language) => `- ${language.text}`),
  ].join('\n')
}

const allowedSkillLine = (line: string, base: ResumeBase): boolean => {
  const match = line.match(/^\*\*(.+):\*\* (.+)\.$/)
  if (!match) return false

  const [, label, values] = match
  const group = Object.values(base.skills).find((skillGroup) => skillGroup.label === label)
  if (!group) return false

  const allowedItems = new Set(group.items.map((item) => item.text))
  return values.split(', ').every((value) => allowedItems.has(value))
}

const allowedMarkdownLines = (base: ResumeBase): Set<string> =>
  new Set([
    ...renderHeader(base.header).split('\n').map((line) => line.trim()).filter(Boolean),
    '## Summary',
    '## Skills',
    '## Experience',
    '## Projects',
    '## Education',
    '## Certifications',
    '## Languages',
    ...base.summaryClauses.map((clause) => clause.text),
    ...base.experience.flatMap((experience) => [
      `### ${experience.role} - ${experience.company}`,
      experience.location ? `*${experience.period} - ${experience.location}*` : `*${experience.period}*`,
      ...experience.bullets.map((bullet) => `- ${bullet.text}`),
    ]),
    ...base.publicProjects.flatMap((project) => [
      `### ${project.title}${project.role ? ` (${project.role})` : ''}`,
      project.url,
      ...project.bullets.map((bullet) => `- ${bullet.text}`),
    ]),
    ...base.education.map((education) => `- ${education.institution} - ${education.degree} (${education.period})`),
    ...base.certifications.map((certification) => `- ${certification.text}`),
    ...base.languages.map((language) => `- ${language.text}`),
  ])

export const validateMarkdownIsSubset = (markdown: string): { ok: boolean; invalidBullets: string[] } => {
  const base = resumeBase as ResumeBase
  const allowedLines = allowedMarkdownLines(base)
  const invalidBullets = markdown
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !allowedLines.has(line))
    .filter((line) => !allowedSkillLine(line, base))

  return { ok: invalidBullets.length === 0, invalidBullets }
}
