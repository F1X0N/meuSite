const createSiteConfig = () => ({
  name: 'Josivan Amorim',
  headline: 'Engenheiro de Software | IA aplicada em produção',
  bio: 'Especialista em soluções de IA robustas e escaláveis, com foco em resiliência, performance e controle de custos.',
  email: 'josivan.amorim@gmail.com',
  social: {
    github: 'https://github.com/josivanamorim',
    linkedin: 'https://linkedin.com/in/josivanamorim',
    whatsapp: 'https://wa.me/5511999999999', // Substituir pelo número real
  },
  nav: {
    // Seções da Home (scroll por âncora)
    sections: [
      { label: 'AI Tools', id: 'ai-tools' },
      { label: 'Trajetória', id: 'experience' },
      { label: 'Highlights', id: 'highlights' },
      { label: 'Sobre', id: 'about' },
      { label: 'Contato', id: 'contact' },
    ],
    // Páginas dedicadas (rota completa)
    pages: [
      { label: 'Case Studies', href: '/case-studies' },
      { label: 'Blog', href: '/blog' },
    ],
    // Ações utilitárias
    utils: [
      { label: 'Baixar CV', href: '/cv.pdf' },
    ],
  },
})

export const site = createSiteConfig()
