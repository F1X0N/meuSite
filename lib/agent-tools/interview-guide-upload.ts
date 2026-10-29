import { decodeTargetingSignals } from './resume'
import type { ResumeLanguage } from './resume-localization'
import type { InterviewGuide } from './interview-guide'

const wording = {
  en: {
    title: 'Interview guide', introduction: 'Introduction', quickReference: 'Quick reference', story: 'Relevant experience',
    questions: 'Questions to practice', ask: 'Questions to ask', contingencies: 'If asked', gaps: 'Points to clarify', closing: 'Closing',
    intro: 'Use the CV evidence below to introduce yourself in your own words. Add context only when you can confirm it.',
    context: 'Explain the situation, your responsibility and the constraints in your own words.',
    outcome: 'Describe the outcome only if you can verify it. Avoid adding numbers absent from your CV.',
    questionIntro: 'Tell me about yourself.', questionProject: 'Walk me through a relevant project.',
    questionTradeoff: 'How did you make a technical decision and validate the result?',
    questionMotivation: 'Why does this role interest you?',
    questionSkill: (skill: string) => `How have you used ${skill}?`,
    questionPriority: 'What would success look like in the first three months?',
    questionTeam: 'How does the team review technical decisions?',
    questionChallenge: 'Which problem would this person own first?',
    questionProcess: 'What are the next steps?',
    englishQuestion: 'How comfortable are you working in English?',
    englishAnswer: 'Describe your current level and give a real example of using English at work or in study.',
    salaryQuestion: 'What are your salary expectations?',
    salaryAnswer: 'Ask about the scope, contract model and budgeted range before sharing a number.',
    transitionQuestion: 'When could you start?',
    transitionAnswer: 'Give a realistic date based on your actual commitments.',
    support: ['Could you repeat the last part of the question?', 'Let me organize my thoughts for a moment.'],
    unsupported: (skill: string) => `${skill} is not evident in this CV. Prepare an honest answer about related experience or a learning plan.`,
    closingLine: 'Thank you for the conversation. I would be glad to discuss the next step.',
  },
  pt: {
    title: 'Roteiro de entrevista', introduction: 'Apresentação', quickReference: 'Referência rápida', story: 'Experiência relevante',
    questions: 'Perguntas para treinar', ask: 'Perguntas para fazer', contingencies: 'Se perguntarem', gaps: 'Pontos a esclarecer', closing: 'Encerramento',
    intro: 'Use as evidências do CV abaixo para se apresentar com suas palavras. Acrescente contexto apenas quando puder confirmá-lo.',
    context: 'Explique a situação, sua responsabilidade e as restrições com suas palavras.',
    outcome: 'Descreva o resultado apenas se puder comprová-lo. Evite acrescentar números ausentes do CV.',
    questionIntro: 'Conte um pouco sobre você.', questionProject: 'Conte sobre um projeto relevante.',
    questionTradeoff: 'Como você tomou uma decisão técnica e validou o resultado?',
    questionMotivation: 'Por que esta vaga interessa a você?',
    questionSkill: (skill: string) => `Como você usou ${skill}?`,
    questionPriority: 'Como seria o sucesso nos primeiros três meses?',
    questionTeam: 'Como a equipe revisa decisões técnicas?',
    questionChallenge: 'Qual problema esta pessoa assumiria primeiro?',
    questionProcess: 'Quais são as próximas etapas?',
    englishQuestion: 'Como está seu inglês para o trabalho?',
    englishAnswer: 'Descreva seu nível atual e dê um exemplo real de uso do inglês no trabalho ou nos estudos.',
    salaryQuestion: 'Qual é sua pretensão salarial?',
    salaryAnswer: 'Pergunte sobre escopo, modelo de contratação e faixa prevista antes de informar um valor.',
    transitionQuestion: 'Quando você poderia começar?',
    transitionAnswer: 'Dê uma data realista de acordo com seus compromissos atuais.',
    support: ['Pode repetir a última parte da pergunta?', 'Vou organizar a ideia por um instante.'],
    unsupported: (skill: string) => `${skill} não aparece neste CV. Prepare uma resposta honesta sobre experiência próxima ou plano de aprendizado.`,
    closingLine: 'Obrigado pela conversa. Gostaria de saber quais são os próximos passos.',
  },
}

const normalize = (value: string): string =>
  value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()

const hasWholeTerm = (text: string, term: string): boolean =>
  ` ${normalize(text)} `.includes(` ${normalize(term)} `)

const cleanLabel = (value: string | undefined): string =>
  (value ?? '').replace(/[\r\n<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120)

const evidenceLines = (text: string): string[] =>
  Array.from(new Set(text.split(/\r?\n|(?<=[.!?])\s+/)
    .map((line) => line.replace(/^\s*[•*\-–]\s*/, '').replace(/\s+/g, ' ').trim())
    .filter((line) => line.length >= 35 && line.length <= 350)
    .filter((line) => !/@|https?:|www\.|\+\d{2}\s?\d/.test(line))))

const selectEvidence = (text: string, skills: string[]): string[] =>
  evidenceLines(text)
    .map((line, index) => ({ line, index, score: skills.filter((skill) => hasWholeTerm(line, skill)).length }))
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, 3)
    .map((item) => item.line)

export const generateUploadedInterviewGuide = ({ resumeText, prioritySkills, language, role, company }: {
  resumeText: string
  prioritySkills: string[]
  language: ResumeLanguage
  role: string
  company?: string
}): InterviewGuide => {
  const labels = wording[language]
  const requirements = Array.from(new Set(decodeTargetingSignals(prioritySkills).mustHaveSkills.map(cleanLabel).filter(Boolean))).slice(0, 6)
  const matchedSkills = requirements.filter((skill) => hasWholeTerm(resumeText, skill))
  const evidence = selectEvidence(resumeText, matchedSkills)
  const intro = labels.intro

  return {
    language,
    role: cleanLabel(role),
    company: cleanLabel(company),
    profileVersion: 'uploaded',
    labels: {
      title: labels.title, introduction: labels.introduction, quickReference: labels.quickReference,
      story: labels.story, questions: labels.questions, ask: labels.ask,
      contingencies: labels.contingencies, gaps: labels.gaps, closing: labels.closing,
    },
    introduction: intro,
    quickReference: [intro, ...evidence],
    story: { role: '', contextPrompt: labels.context, evidence, outcomePrompt: labels.outcome },
    questions: [
      { question: labels.questionIntro, talkingPoints: [intro, ...evidence.slice(0, 2)] },
      { question: labels.questionProject, talkingPoints: evidence },
      { question: labels.questionTradeoff, talkingPoints: [labels.context, labels.outcome] },
      { question: labels.questionMotivation, talkingPoints: matchedSkills.length ? matchedSkills : [labels.intro] },
      ...matchedSkills.slice(0, 3).map((skill) => ({ question: labels.questionSkill(skill), talkingPoints: evidence.filter((line) => hasWholeTerm(line, skill)).slice(0, 2) })),
    ],
    questionsToAsk: [labels.questionPriority, labels.questionTeam, labels.questionChallenge, labels.questionProcess],
    contingencies: [
      { question: labels.englishQuestion, answer: labels.englishAnswer },
      { question: labels.salaryQuestion, answer: labels.salaryAnswer },
      { question: labels.transitionQuestion, answer: labels.transitionAnswer },
    ],
    supportPhrases: labels.support,
    gaps: requirements.filter((skill) => !hasWholeTerm(resumeText, skill)).map(labels.unsupported),
    closing: labels.closingLine,
  }
}
