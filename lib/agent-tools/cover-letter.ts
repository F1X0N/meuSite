import { buildTargetedResumeModel, decodeTargetingSignals } from './resume'
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
  const verifiedExperience = model.experience[0]?.bullets.slice(0, 2).map((bullet) => toFirstPerson(bullet.text, language)) ?? []
  const verifiedSkills = decodeTargetingSignals(prioritySkills).mustHaveSkills
    .filter((skill) => model.skills.some((group) => group.items.some((item) => item.tags.some((tag) => tag.toLowerCase() === skill.toLowerCase()) || item.text.toLowerCase() === skill.toLowerCase())))
    .slice(0, 3)
  const targetRole = cleanInput(role, 120)
  const targetCompany = cleanInput(company, 120)
  const personalMotivation = cleanInput(motivation, 350)

  if (language === 'pt') {
    const opening = targetCompany
      ? `Olá, equipe da ${targetCompany},\n\nGostaria de me candidatar à vaga de ${targetRole}. Trabalho como engenheiro de software full stack, do frontend às APIs e à entrega em produção.`
      : `Olá,\n\nGostaria de me candidatar à vaga de ${targetRole}. Trabalho como engenheiro de software full stack, do frontend às APIs e à entrega em produção.`
    const relevance = verifiedSkills.length > 0 ? `Vi que a vaga pede ${verifiedSkills.join(', ')}. Já trabalhei com essas tecnologias em produtos reais.` : ''
    const evidence = verifiedExperience.join(' ')
    const motivationLine = personalMotivation ? personalMotivation : ''
    return [opening, [relevance, evidence].filter(Boolean).join(' '), motivationLine, 'Gostaria de conversar sobre os desafios da vaga e como posso contribuir.\n\nJosivan Amorim'].filter(Boolean).join('\n\n')
  }

  const opening = targetCompany
    ? `Hello ${targetCompany} team,\n\nI'd like to apply for the ${targetRole} role. I work as a full-stack software engineer, from frontend and APIs through production delivery.`
    : `Hello,\n\nI'd like to apply for the ${targetRole} role. I work as a full-stack software engineer, from frontend and APIs through production delivery.`
  const relevance = verifiedSkills.length > 0 ? `I noticed the role calls for ${verifiedSkills.join(', ')}. I've used these technologies in shipped products.` : ''
  const evidence = verifiedExperience.join(' ')
  const motivationLine = personalMotivation ? personalMotivation : ''
  return [opening, [relevance, evidence].filter(Boolean).join(' '), motivationLine, 'I would welcome a conversation about the role and how I could contribute.\n\nJosivan Amorim'].filter(Boolean).join('\n\n')
}
