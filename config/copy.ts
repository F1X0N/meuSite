const createCopyConfig = () => ({
  hero: {
    title: 'Construindo IA em produção com resiliência e eficiência',
    subtitle:
      'Transformo requisitos complexos em sistemas robustos que funcionam sob pressão, controlam custos e entregam valor mensurável',
    cta: {
      primary: 'Ver Case Studies',
      secondary: 'Vamos conversar',
    },
  },
  highlights: [
    {
      title: 'IA Multi-Provider',
      description: 'Sistemas resilientes com fallback, retry inteligente e recovery de JSON',
      tags: ['LLM', 'Resiliência', 'OpenAI'],
    },
    {
      title: 'Pipelines Robustos',
      description: 'OCR híbrido otimizado para custo e qualidade em documentos complexos',
      tags: ['OCR', 'Visão', 'Layout'],
    },
    {
      title: 'FinOps em IA',
      description: 'Monitoramento granular de custos por token, imagem e operação',
      tags: ['Custo', 'Telemetria', 'FinOps'],
    },
  ],
  featuredCaseStudies: {
    title: 'Engenharia em Prática',
    subtitle: 'Soluções reais para problemas complexos de IA e Arquitetura',
    cta: 'Ver catálogo completo',
  },
  featuredBlog: {
    title: 'Engenharia & Opinião',
    subtitle: 'Deep dives em arquitetura, carreira e o ecossistema de software',
    cta: 'Ler todos os artigos',
  },
  askAi: {
    title: 'Pergunte ao meu "Clone Digital"',
    subtitle: 'Experimente na prática: uma IA treinada com meu portfólio técnico pronta para responder recrutadores e CTOs.',
    placeholder: 'Ex: "Como você lida com alucinações de LLMs?" ou "Explique sua arquitetura de OCR híbrido".',
    buttonLabel: 'Entrevistar IA',
    disclaimer: 'Respostas geradas com base no meu Portfólio Técnico e artigos publicados.',
    emptyState: 'Inicie uma "entrevista técnica" simulada acima.',
  },
  jobFit: {
    title: 'Análise de Fit (Match Técnico)',
    subtitle: 'Cole sua Job Description e deixe meu algoritmo analisar a aderência do meu perfil à sua vaga.',
    placeholder: 'Cole a descrição da vaga (stack, requisitos, desafios)...',
    buttonLabel: 'Calcular Aderência',
    disclaimer: 'Nenhum dado é salvo. Análise feita em tempo real via GPT-4o.',
    emptyState: 'Cole a JD para ver nosso match técnico.',
  },
  about: {
    intro:
      'Engenheiro de Software com visão de produto. Especialista em transformar tecnologias emergentes (como IA Generativa) em sistemas de produção robustos, escaláveis e financeiramente viáveis.',
    principles: [
      'Production-First AI: Prompts são código, custo é métrica de qualidade.',
      'Sistemas Resilientes: Falhas externas (APIs) não derrubam minha aplicação.',
      'Arquitetura Pragmática: Monólitos modulares bem feitos > Microserviços prematuros.',
      'FinOps Nativo: Otimização de recursos desde a primeira linha de código.',
    ],
    ctas: [
      { label: 'Ver Experiência Completa', href: '/#experience' },
      { label: 'Baixar CV (PDF)', href: '/cv.pdf' },
    ],
  },
  experience: {
    title: 'Trajetória Profissional',
    subtitle: 'Impacto real em empresas e projetos',
    items: [
      {
        role: 'Desenvolvedor Fullstack & IA',
        company: 'Facilita Jurídico',
        period: 'Jul 2024 — Presente',
        description:
          'Atuação direta na arquitetura e desenvolvimento de soluções de IA Generativa. Responsável por pipelines RAG, finetuning de modelos e automação de fluxos jurídicos complexos.',
        achievements: [
          'Redução de 60% em custos de OCR com pipeline híbrido e fallback inteligente.',
          'Implementação de arquitetura RAG-ready com reconstrução de layout de documentos.',
          'Desenvolvimento de agentes para automação de rotinas usando OpenAI API e Python.',
        ],
        technologies: ['Python', 'OpenAI API', 'RAG', 'AWS', 'Docker', 'PostgreSQL', 'React', 'Node.js'],
      },
      {
        role: 'Desenvolvedor Fullstack',
        company: 'Grupo Dass',
        period: 'Fev 2022 — Mai 2024',
        description:
          'Automação de processos corporativos e digitalização para mais de 28 mil colaboradores. Foco em eficiência operacional e modernização de legado.',
        achievements: [
          'Aumento de 30% na eficiência de processos internos via digitalização.',
          'Redução de 50% no tempo de processamento de documentos corporativos.',
          'Sustentação de sistemas críticos em escala utilizando Angular e Node.js.',
        ],
        technologies: ['Angular', 'Node.js', 'PHP', 'PostgreSQL', 'Docker', 'CI/CD'],
      },
      {
        role: 'Desenvolvedor Frontend',
        company: 'Projetos Freelance',
        period: 'Jul 2021 — Jul 2024',
        description:
          'Desenvolvimento de interfaces modernas e responsivas para diversos clientes, focando em performance e UX.',
        achievements: [
          'Desenvolvimento de portais imobiliários e corporativos (iMovels, MichelTech).',
          'Implementação de interfaces responsivas com foco em SEO e performance.',
        ],
        technologies: ['React', 'JavaScript', 'Bootstrap', 'HTML5/CSS3'],
      },
    ],
  },
  contact: {
    title: 'Vamos conversar?',
    description: 'Estou disponível para discutir projetos, oportunidades ou trocar ideias sobre IA em produção.',
    social: {
      linkedin: 'https://www.linkedin.com/in/josivan-amorim-44401120a/',
      github: 'https://github.com/F1X0N',
      email: 'amorimjosivan7@gmail.com',
    },
    form: {
      name: { label: 'Nome', placeholder: 'Seu nome' },
      email: { label: 'E-mail', placeholder: 'seu@email.com' },
      message: { label: 'Mensagem', placeholder: 'Sua mensagem...' },
      submit: 'Enviar',
    },
    successMessage: 'Mensagem enviada com sucesso! Retornarei em breve.',
    errorMessage: 'Erro ao enviar mensagem. Tente novamente ou entre em contato por e-mail.',
  },
})

export const copy = createCopyConfig()
