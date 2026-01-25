const createSiteConfig = () => ({
  name: 'Josivan Amorim',
  headline: 'Engenheiro de Software | IA aplicada em produção',
  bio: 'Especialista em soluções de IA robustas e escaláveis, com foco em resiliência, performance e controle de custos.',
  email: 'contato@exemplo.com',
  social: {
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com',
  },
  nav: {
    sections: [
      { label: 'Conversar com Clone IA 🤖', id: 'ai-chat' },
      { label: 'Trajetória', id: 'experience' },
      { label: 'Highlights', id: 'highlights' },
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
