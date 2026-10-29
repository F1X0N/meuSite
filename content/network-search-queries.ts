export const networkSearchGroups = [
  {
    id: 'international-recruiting',
    title: 'Recrutamento internacional',
    description: 'Encontre pessoas ligadas a contratações internacionais que mencionem Brasil ou América Latina.',
    queries: [
      {
        id: 'latam-recruiters',
        title: 'Recrutadores com foco em LATAM',
        expression: '"technical recruiter" AND (LATAM OR Brazil OR "Latin America")',
        filters: 'Pessoas · Localização: EUA ou países europeus de interesse · Conexões: 2º grau',
      },
      {
        id: 'global-talent',
        title: 'Talent acquisition de empresas alvo',
        expression: '("talent acquisition" OR recruiter) AND ("software engineer" OR "full stack")',
        filters: 'Pessoas · Empresa atual: empresa com vaga acessível a candidatos no Brasil',
      },
    ],
  },
  {
    id: 'target-teams',
    title: 'Equipes de empresas alvo',
    description: 'Comece por uma vaga compatível e procure quem trabalha na equipe ou lidera a contratação.',
    queries: [
      {
        id: 'engineering-leaders',
        title: 'Liderança técnica',
        expression: '("engineering manager" OR "tech lead") AND (React OR "Node.js" OR Python)',
        filters: 'Pessoas · Empresa atual: empresa da vaga · Conexões: 2º grau quando possível',
      },
      {
        id: 'engineering-peers',
        title: 'Engenheiros da equipe',
        expression: '("software engineer" OR "full stack engineer") AND (React OR "Node.js")',
        filters: 'Pessoas · Empresa atual: empresa da vaga · Procure atividade ou interesses em comum',
      },
    ],
  },
  {
    id: 'brazil-recruiting',
    title: 'Mercado brasileiro',
    description: 'Mantenha contatos úteis para oportunidades locais e empresas globais com contratação no Brasil.',
    queries: [
      {
        id: 'brazil-recruiters',
        title: 'Recrutadores técnicos no Brasil',
        expression: '("recrutador técnico" OR "tech recruiter") AND ("engenheiro de software" OR "full stack")',
        filters: 'Pessoas · Localização: Brasil · Empresa atual: organização de interesse',
      },
    ],
  },
]
