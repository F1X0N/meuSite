export const jobSearchGroups = [
  {
    id: 'brazil',
    title: 'Brasil',
    description: 'Termos usados em anúncios brasileiros para vagas remotas ou híbridas.',
    queries: [
      {
        id: 'br-full-stack',
        title: 'Full stack',
        expression: '("desenvolvedor full stack" OR "engenheiro de software full stack") AND (React OR Node.js)',
      },
      {
        id: 'br-backend',
        title: 'Backend',
        expression: '("desenvolvedor backend" OR "engenheiro de software backend") AND (Node.js OR Python)',
      },
      {
        id: 'br-mid-level',
        title: 'Pleno',
        expression: '("desenvolvedor pleno" OR "engenheiro de software pleno") AND (React OR Node.js OR Python)',
      },
      {
        id: 'br-frontend',
        title: 'Frontend',
        expression: '("desenvolvedor frontend" OR "engenheiro frontend") AND React',
      },
    ],
  },
  {
    id: 'international',
    title: 'Internacional',
    description: 'Buscas em inglês para engenharia de produto, cloud e IA aplicada.',
    queries: [
      {
        id: 'global-full-stack',
        title: 'Full stack',
        expression: '("full stack engineer" OR "full stack developer") AND (React OR Node.js)',
      },
      {
        id: 'global-backend',
        title: 'Backend',
        expression: '("backend engineer" OR "software engineer") AND (Python OR Node.js) AND PostgreSQL',
      },
      {
        id: 'global-cloud',
        title: 'Produto e cloud',
        expression: '("software engineer" OR "full stack engineer") AND (AWS OR cloud) AND (React OR Node.js OR Python)',
      },
      {
        id: 'global-ai',
        title: 'IA aplicada',
        expression: '("software engineer" OR "full stack engineer") AND ("AI applications" OR LLM OR RAG)',
      },
    ],
  },
]
