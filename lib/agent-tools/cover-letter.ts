import { buildTargetedResumeModel, decodeTargetingSignals, isVerifiedRequirement, matchScore } from './resume'
import type { ResumeLanguage } from './resume-localization'

type CoverLetterInput = {
  prioritySkills: string[]
  language: ResumeLanguage
  role: string
  company?: string
  motivation?: string
}

const cleanInput = (value: string | undefined, limit: number): string =>
  (value ?? '').replace(/\s+/g, ' ').trim().slice(0, limit)

const firstPersonVerbs: Record<ResumeLanguage, Record<string, string>> = {
  en: { Built: 'I built', Developed: 'I developed', Connected: 'I connected', Investigated: 'I investigated', Contributed: 'I contributed' },
  pt: { Desenvolveu: 'Desenvolvi', Conectou: 'Conectei', Investigou: 'Investiguei', Contribuiu: 'Contribuí' },
}

const toFirstPerson = (sentence: string, language: ResumeLanguage): string => {
  const verb = Object.keys(firstPersonVerbs[language]).find((candidate) => sentence.startsWith(`${candidate} `))
  if (!verb) return sentence
  return `${firstPersonVerbs[language][verb]}${sentence.slice(verb.length)}`
}

export const generateCoverLetter = ({ prioritySkills, language, role, company, motivation }: CoverLetterInput): string => {
  const model = buildTargetedResumeModel(prioritySkills, language)
  const verifiedSkills = decodeTargetingSignals(prioritySkills).mustHaveSkills
    .filter((skill) => model.skills.some((group) => group.items.some((item) => isVerifiedRequirement(item, skill))))
    .slice(0, 3)
  const requirementSignals = verifiedSkills.map((skill) => `must:${skill}`)
  const rankedExperience = model.experience.flatMap((experience) => experience.bullets)
    .map((bullet, index) => ({ bullet, index, score: matchScore(bullet, requirementSignals) }))
    .sort((left, right) => right.score - left.score || left.index - right.index)
  const verifiedExperience = rankedExperience.slice(0, 2).map(({ bullet }) => toFirstPerson(bullet.text, language))
  const targetRole = cleanInput(role, 120)
  const targetCompany = cleanInput(company, 120)
  const personalMotivation = cleanInput(motivation, 350)

  if (language === 'pt') {
    const opening = targetCompany
      ? `Olá, equipe da ${targetCompany},\n\nGostaria de me candidatar à vaga de ${targetRole}. Trabalho como engenheiro de software full stack, do frontend às APIs e à entrega em produção.`
      : `Olá,\n\nGostaria de me candidatar à vaga de ${targetRole}. Trabalho como engenheiro de software full stack, do frontend às APIs e à entrega em produção.`
    const relevance = verifiedSkills.length > 0 ? `A vaga pede ${verifiedSkills.join(', ')}. Minha experiência com essas competências pode contribuir para os desafios da equipe.` : ''
    const evidence = verifiedExperience.join(' ')
    const motivationLine = personalMotivation ? personalMotivation : ''
    return [opening, [relevance, evidence].filter(Boolean).join(' '), motivationLine, 'Gostaria de conversar sobre os desafios da vaga e como posso contribuir.\n\nJosivan Amorim'].filter(Boolean).join('\n\n')
  }

  const opening = targetCompany
    ? `Hello ${targetCompany} team,\n\nI'd like to apply for the ${targetRole} role. I work as a full-stack software engineer, from frontend and APIs through production delivery.`
    : `Hello,\n\nI'd like to apply for the ${targetRole} role. I work as a full-stack software engineer, from frontend and APIs through production delivery.`
  const relevance = verifiedSkills.length > 0 ? `The role calls for ${verifiedSkills.join(', ')}. My experience with these skills can help me contribute to the team's challenges.` : ''
  const evidence = verifiedExperience.join(' ')
  const motivationLine = personalMotivation ? personalMotivation : ''
  return [opening, [relevance, evidence].filter(Boolean).join(' '), motivationLine, 'I would welcome a conversation about the role and how I could contribute.\n\nJosivan Amorim'].filter(Boolean).join('\n\n')
}
