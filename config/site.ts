const createSiteConfig = () => ({
  name: 'Josivan Amorim',
  headline: 'Engenheiro de Software | IA aplicada | Observabilidade | Operação técnica',
  bio: 'Engenharia full stack com foco em IA aplicada, robustez operacional e observabilidade. Agentes com controle humano, diagnóstico orientado por evidências e validação por critério.',
  email: 'amorimjosivan7@gmail.com',
  social: {
    github: 'https://github.com/F1X0N',
    linkedin: 'https://www.linkedin.com/in/josivan-amorim/',
    whatsapp: 'https://wa.me/5575991826325',
  },
  nav: {
    sections: [
      { label: 'AI Tools', id: 'ai-tools' },
      { label: 'Trajetória', id: 'experience' },
      { label: 'Highlights', id: 'highlights' },
      { label: 'Side projects', id: 'side-projects' },
      { label: 'Sobre', id: 'about' },
      { label: 'Contato', id: 'contact' },
    ],
    pages: [
      { label: 'Case Studies', href: '/case-studies' },
      { label: 'Blog', href: '/blog' },
    ],
    utils: [
      { label: 'Baixar CV', href: '/cv.pdf' },
    ],
  },
})

export const site = createSiteConfig()
