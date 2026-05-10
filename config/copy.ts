const createCopyConfig = () => ({
  hero: {
    title: 'Engenharia de software com responsabilidade operacional',
    subtitle:
      'IA aplicada, observabilidade e operação técnica em produção. Transformo problemas recorrentes em sistemas mais previsíveis, auditáveis e seguros.',
    cta: {
      primary: 'Ver Case Studies',
      secondary: 'Vamos conversar',
    },
  },
  highlights: [
    {
      title: 'IA com controle humano',
      description: 'Supervisão de agentes, validação de saídas e governança multi-provider. Alavanca de produtividade sem perder critério técnico.',
      tags: ['LLM', 'Agentes', 'MCP'],
    },
    {
      title: 'Observabilidade antes de opinião',
      description: 'Diagnóstico orientado por evidências com Grafana, Loki e Sentry. Logs, métricas e replays antes de hipóteses.',
      tags: ['Grafana', 'Loki', 'Sentry'],
    },
    {
      title: 'Operação como parte do produto',
      description: 'Runbooks, critérios de aceite, validação pós-mudança e segurança operacional como responsabilidade de engenharia.',
      tags: ['Runbooks', 'Release validation', 'Risk'],
    },
  ],
  featuredCaseStudies: {
    title: 'Engenharia em Prática',
    subtitle: 'Como agentes, observabilidade e disciplina de validação transformam operação técnica.',
    cta: 'Ver catálogo completo',
  },
  featuredBlog: {
    title: 'Notas de Engenharia',
    subtitle: 'IA, observabilidade e métricas que pagam a conta — material analítico de posicionamento técnico.',
    cta: 'Ler todas as notas',
  },
  askAi: {
    title: 'Pergunte ao meu "Clone Digital"',
    subtitle: 'Uma IA treinada com meu portfólio técnico, pronta para responder recrutadores, líderes técnicos e CTOs com base em evidência publicada.',
    placeholder: 'Ex: "Como você desenha supervisão de agentes em produção?" ou "Como você diagnostica incidente com observabilidade?".',
    buttonLabel: 'Entrevistar IA',
    disclaimer: 'Respostas geradas a partir do meu Knowledge Base público. Quando não há evidência documentada, a IA diz "não documentado".',
    emptyState: 'Inicie uma entrevista técnica simulada acima.',
  },
  jobFit: {
    title: 'Análise de Fit (Match Técnico)',
    subtitle: 'Cole a descrição da vaga e a IA compara com meu perfil documentado, retornando match honesto, evidências e gaps.',
    placeholder: 'Cole a descrição da vaga (stack, requisitos, desafios)...',
    buttonLabel: 'Calcular Aderência',
    disclaimer: 'Nenhum dado é salvo. Análise feita em tempo real com base no Knowledge Base público.',
    emptyState: 'Cole a JD para ver o match técnico.',
  },
  about: {
    intro:
      'Sou engenheiro de software com foco em IA aplicada, observabilidade e operação técnica em produção. Atuo conectando produto, suporte técnico e engenharia para transformar problemas recorrentes em sistemas mais previsíveis, auditáveis e seguros. Diferencial: combino profundidade técnica com responsabilidade operacional — entender o sistema, reduzir risco, comunicar com clareza e usar IA como alavanca de produtividade sem perder controle humano.',
    principles: [
      'Evidência antes de opinião: logs, métricas e replays vêm antes de hipóteses.',
      'IA com controle humano: agentes e LLMs são alavancas, não substitutos de critério técnico.',
      'Operação é parte do produto: runbooks, observabilidade e validação pós-mudança são responsabilidade de engenharia.',
      'Métricas que pagam a conta: eficiência, custo, risco e impacto operacional sustentam decisões técnicas.',
    ],
    ctas: [
      { label: 'Ver Experiência Completa', href: '/#experience' },
      { label: 'Baixar CV (PDF)', href: '/cv.pdf' },
    ],
  },
  experience: {
    title: 'Trajetória Profissional',
    subtitle: 'Atuação real em produto, operação e infraestrutura técnica',
    items: [
      {
        role: 'Desenvolvedor Full Stack',
        company: 'SaaS LegalTech',
        period: 'Jul 2024 — Presente',
        description:
          'Engenharia full stack com foco em IA aplicada, observabilidade e operação técnica em produto LegalTech. Atuação na intersecção entre produto, suporte e operação para reduzir risco e ambiguidade no ciclo de entrega.',
        achievements: [
          'Desenvolvimento de funcionalidades full stack em backend, frontend, automações e integrações com IA.',
          'Integração de LLMs em fluxos de produto: OpenAI, RAG, prompts estruturados, validação de saídas e governança multi-provider.',
          'Supervisão de agentes de IA aplicados à operação técnica e ao suporte, com critérios de aceite e validação por evidência.',
          'Diagnóstico de incidentes com observabilidade (Grafana/Loki/Sentry), consultas read-only e validação pós-mudança.',
          'Estruturação de runbooks, planos de validação e critérios de aceite para reduzir ambiguidade operacional.',
        ],
        technologies: ['Python', 'Node.js', 'TypeScript', 'React', 'Next.js', 'PostgreSQL', 'OpenAI', 'Grafana', 'Loki', 'Sentry', 'Docker'],
      },
      {
        role: 'Desenvolvedor Full Stack',
        company: 'Grupo Dass',
        period: 'Fev 2022 — Jul 2024',
        description:
          'Desenvolvimento e sustentação de aplicações web internas e automações para uma operação com mais de 28 mil colaboradores no Brasil e Argentina.',
        achievements: [
          'Ciclo completo: coleta de requisitos, desenvolvimento (back/front), entrega e apresentação.',
          'Automação de processos e desburocratização em escala corporativa.',
          'Atuação em ambiente Lean com práticas Scrum e Kanban entre áreas.',
        ],
        technologies: ['JavaScript', 'Angular', 'Node.js', 'PHP', 'PostgreSQL', 'Lean', 'Scrum'],
      },
      {
        role: 'Cronometrista',
        company: 'Grupo Dass',
        period: 'Fev 2021 — Fev 2022',
        description:
          'Planejamento e melhoria contínua no PCP — layouts funcionais e previsões produtivas com metodologias ágeis no chão de fábrica.',
        achievements: [
          'Layouts funcionais com ZWCAD e planejamento produtivo no PCP.',
          'Melhoria contínua no setor produtivo com Scrum, Kanban e Lean.',
        ],
        technologies: ['ZWCAD', 'Lean', 'PCP', 'Scrum', 'Kanban'],
      },
    ],
  },
  contact: {
    title: 'Vamos conversar?',
    description: 'Disponível para discutir oportunidades, projetos e trocar ideias sobre IA aplicada, observabilidade e operação técnica em produção.',
    social: {
      linkedin: 'https://www.linkedin.com/in/josivan-amorim/',
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
