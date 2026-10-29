import { createHash } from 'node:crypto'
import resumeBase from '@/content/resume-base.json'
import { buildTargetedResumeModel, decodeTargetingSignals, matchScore } from './resume'
import type { ResumeLanguage } from './resume-localization'

const spokenPrefixes = {
  en: {
    'Full-stack software engineer': 'I am a full-stack software engineer',
    'Takes features': 'I take features',
    'Builds AI workflows': 'I build AI workflows',
    'Previously built': 'I previously built',
    'Combines engineering': 'I combine engineering',
    'Built ': 'I built ',
    'Developed ': 'I developed ',
    'Connected ': 'I connected ',
    'Investigated ': 'I investigated ',
    'Contributed ': 'I contributed ',
    'Owned ': 'I owned ',
    'Collaborated ': 'I collaborated ',
    'Delivered ': 'I delivered ',
  },
  pt: {
    'Engenheiro de software full stack': 'Sou engenheiro de software full stack',
    'Conduz funcionalidades': 'Conduzo funcionalidades',
    'Desenvolve fluxos': 'Desenvolvo fluxos',
    'Desenvolveu aplicações': 'Desenvolvi aplicações',
    'Combina engenharia': 'Combino engenharia',
    'Desenvolveu ': 'Desenvolvi ',
    'Conectou ': 'Conectei ',
    'Investigou ': 'Investiguei ',
    'Contribuiu ': 'Contribuí ',
    'Conduziu ': 'Conduzi ',
    'Colaborou ': 'Colaborei ',
    'Entregou ': 'Entreguei ',
  },
}

const wording = {
  en: {
    title: 'Interview guide',
    introduction: 'Introduction',
    quickReference: 'Quick reference',
    story: 'Main story',
    questions: 'Questions to practice',
    ask: 'Questions to ask',
    contingencies: 'If asked',
    gaps: 'Points to clarify',
    closing: 'Closing',
    context: 'Give the problem and constraints in your own words.',
    outcome: 'Describe a verified outcome. Do not add metrics that are absent from the public evidence.',
    tradeoffPrompt: 'Choose a concrete example, explain the constraints and trade-offs, then describe how you validated the release.',
    relevance: 'Connect these verified points to the role, then ask which problem matters most to the team.',
    noMatch: 'Use the closest verified example and be explicit about what you would still need to learn.',
    unsupported: (skill: string) => `The public profile does not verify ${skill}. Prepare an honest answer about adjacent experience and learning plan.`,
    skillQuestion: (skill: string) => `How have you used ${skill} in a real project?`,
    questionIntroduction: 'Tell me about yourself.',
    questionProject: 'Walk me through a project relevant to this role.',
    questionTradeoff: 'How do you make technical trade-offs and validate a release?',
    questionMotivation: 'Why are you interested in this role?',
    questionPriority: 'What would success look like in the first three months?',
    questionTeam: 'How does the team make technical decisions and review changes?',
    questionChallenge: 'Which technical challenge would this person own first?',
    questionProcess: 'What are the next steps in the interview process?',
    englishQuestion: 'How comfortable are you working in English?',
    englishAnswer: (level: string | null) => level
      ? `My English is ${level}. I can discuss technical work in English and continue to improve my fluency in live conversations.`
      : 'I can discuss technical work in English and continue to improve my fluency in live conversations.',
    salaryQuestion: 'What are your salary expectations?',
    salaryAnswer: 'I would like to understand the scope, employment model and budgeted range before sharing a number.',
    transitionQuestion: 'When could you start?',
    transitionAnswer: 'I would align a responsible transition with my current work and discuss a start date that works for both sides.',
    support: ['Could you repeat the last part of the question?', 'Let me organize my thoughts for a moment.', 'I do not have a verified number to share, but I can explain the outcome.'],
    finalLine: 'Thank you for the conversation. The role sounds interesting, and I would be glad to discuss the next step.',
  },
  pt: {
    title: 'Roteiro de entrevista',
    introduction: 'Apresentação',
    quickReference: 'Referência rápida',
    story: 'História principal',
    questions: 'Perguntas para treinar',
    ask: 'Perguntas para fazer',
    contingencies: 'Se perguntarem',
    gaps: 'Pontos a esclarecer',
    closing: 'Encerramento',
    context: 'Explique o problema e as restrições com suas palavras.',
    outcome: 'Descreva um resultado verificado. Não acrescente métricas que não estejam na evidência pública.',
    tradeoffPrompt: 'Escolha um exemplo concreto, explique as restrições e decisões, e conte como validou a entrega.',
    relevance: 'Conecte estes pontos verificados à vaga e pergunte qual problema é prioridade para a equipe.',
    noMatch: 'Use o exemplo verificado mais próximo e seja claro sobre o que ainda precisaria aprender.',
    unsupported: (skill: string) => `O perfil público não comprova ${skill}. Prepare uma resposta honesta sobre experiência próxima e como aprenderia o restante.`,
    skillQuestion: (skill: string) => `Como você usou ${skill} em um projeto real?`,
    questionIntroduction: 'Conte um pouco sobre você.',
    questionProject: 'Conte sobre um projeto relevante para esta vaga.',
    questionTradeoff: 'Como você decide entre alternativas técnicas e valida uma entrega?',
    questionMotivation: 'Por que esta vaga interessa a você?',
    questionPriority: 'Como seria o sucesso nos primeiros três meses?',
    questionTeam: 'Como a equipe toma decisões técnicas e revisa mudanças?',
    questionChallenge: 'Qual desafio técnico esta pessoa assumiria primeiro?',
    questionProcess: 'Quais são as próximas etapas do processo seletivo?',
    englishQuestion: 'Como está seu inglês para o trabalho?',
    englishAnswer: (level: string | null) => level
      ? `Meu inglês é ${level}. Consigo conversar sobre trabalho técnico em inglês e continuo desenvolvendo fluidez em conversas ao vivo.`
      : 'Consigo conversar sobre trabalho técnico em inglês e continuo desenvolvendo fluidez em conversas ao vivo.',
    salaryQuestion: 'Qual é sua pretensão salarial?',
    salaryAnswer: 'Gostaria de entender o escopo, o modelo de contratação e a faixa prevista antes de informar um valor.',
    transitionQuestion: 'Quando você poderia começar?',
    transitionAnswer: 'Eu alinharia uma transição responsável com meu trabalho atual e conversaria sobre uma data adequada para os dois lados.',
    support: ['Pode repetir a última parte da pergunta?', 'Vou organizar a ideia por um instante.', 'Não tenho um número verificado para citar, mas posso explicar o resultado.'],
    finalLine: 'Obrigado pela conversa. A vaga parece interessante e gostaria de saber quais são os próximos passos.',
  },
}

const speak = (text: string, language: ResumeLanguage): string => {
  const prefix = Object.keys(spokenPrefixes[language]).find((candidate) => text.startsWith(candidate))
  if (!prefix) return text
  return `${spokenPrefixes[language][prefix as keyof typeof spokenPrefixes[typeof language]]}${text.slice(prefix.length)}`
}

const cleanLabel = (value: string | undefined): string =>
  (value ?? '').replace(/[\r\n<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120)

const uniqueSkills = (skills: string[]): string[] =>
  Array.from(new Set(skills.map((skill) => cleanLabel(skill).slice(0, 80)).filter(Boolean))).slice(0, 6)

const normalizeTerm = (value: string): string =>
  value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()

const hasWholeTerm = (text: string, term: string): boolean =>
  ` ${normalizeTerm(text)} `.includes(` ${normalizeTerm(term)} `)

const publicEvidenceTerms = [
  ...resumeBase.summaryClauses.flatMap((clause) => [clause.text, ...clause.tags]),
  ...Object.values(resumeBase.skills).flatMap((group) => group.items.flatMap((item) => [item.text, ...item.tags])),
  ...resumeBase.experience.flatMap((experience) => experience.bullets.flatMap((bullet) => [bullet.text, ...bullet.tags])),
]

const isVerifiedSkill = (skill: string): boolean =>
  publicEvidenceTerms.some((evidence) => hasWholeTerm(evidence, skill))

const selectEvidence = (prioritySkills: string[], language: ResumeLanguage) =>
  buildTargetedResumeModel(prioritySkills, language).experience
    .flatMap((experience) => experience.bullets.map((bullet) => ({ role: experience.role, bullet })))
    .sort((left, right) => matchScore(right.bullet, prioritySkills) - matchScore(left.bullet, prioritySkills))
    .slice(0, 3)
    .map(({ role, bullet }) => ({ role, text: speak(bullet.text, language) }))

export const generateInterviewGuide = ({ prioritySkills, language, role, company }: {
  prioritySkills: string[]
  language: ResumeLanguage
  role: string
  company?: string
}) => {
  const labels = wording[language]
  const requirements = uniqueSkills(decodeTargetingSignals(prioritySkills).mustHaveSkills)
  const matchedSkills = requirements.filter(isVerifiedSkill)
  const unsupportedSkills = requirements.filter((skill) => !isVerifiedSkill(skill))
  const verifiedPrioritySkills = matchedSkills.map((skill) => `must:${skill}`)
  const model = buildTargetedResumeModel(verifiedPrioritySkills, language)
  const evidence = selectEvidence(verifiedPrioritySkills, language)
  const introduction = model.summaryClauses.slice(0, 2).map((clause) => speak(clause.text, language)).join(' ')
  const safeRole = cleanLabel(role)
  const safeCompany = cleanLabel(company)
  const relatedEvidence = evidence.map((item) => item.text)
  const englishEvidence = model.languages.find((item) => /English|Inglês/i.test(item.text))?.text ?? ''
  const englishLevel = englishEvidence.match(/\b(?:A1|A2|B1|B2|C1|C2)\b/)?.[0] ?? null

  return {
    language,
    role: safeRole,
    company: safeCompany,
    profileVersion: createHash('sha256').update(JSON.stringify(resumeBase)).digest('hex').slice(0, 10),
    labels: {
      title: labels.title,
      introduction: labels.introduction,
      quickReference: labels.quickReference,
      story: labels.story,
      questions: labels.questions,
      ask: labels.ask,
      contingencies: labels.contingencies,
      gaps: labels.gaps,
      closing: labels.closing,
    },
    introduction,
    quickReference: [introduction, relatedEvidence[0], matchedSkills.length ? `${matchedSkills.join(', ')}. ${labels.relevance}` : labels.noMatch].filter(Boolean),
    story: {
      role: evidence[0]?.role ?? model.experience[0]?.role ?? '',
      contextPrompt: labels.context,
      evidence: relatedEvidence,
      outcomePrompt: labels.outcome,
    },
    questions: [
      { question: labels.questionIntroduction, talkingPoints: [introduction] },
      { question: labels.questionProject, talkingPoints: relatedEvidence },
      { question: labels.questionTradeoff, talkingPoints: [labels.tradeoffPrompt, labels.outcome] },
      { question: labels.questionMotivation, talkingPoints: [matchedSkills.length ? `${matchedSkills.join(', ')}. ${labels.relevance}` : labels.noMatch] },
      ...matchedSkills.slice(0, 3).map((skill) => ({
        question: labels.skillQuestion(skill),
        talkingPoints: [relatedEvidence.find((item) => hasWholeTerm(item, skill)) ?? labels.relevance],
      })),
    ],
    questionsToAsk: [labels.questionPriority, labels.questionTeam, labels.questionChallenge, labels.questionProcess],
    contingencies: [
      { question: labels.englishQuestion, answer: labels.englishAnswer(englishLevel) },
      { question: labels.salaryQuestion, answer: labels.salaryAnswer },
      { question: labels.transitionQuestion, answer: labels.transitionAnswer },
    ],
    supportPhrases: labels.support,
    gaps: unsupportedSkills.map(labels.unsupported),
    closing: labels.finalLine,
  }
}

export type InterviewGuide = ReturnType<typeof generateInterviewGuide>
