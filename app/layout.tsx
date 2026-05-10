import './globals.css'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Bricolage_Grotesque } from 'next/font/google'

// Display font para H1 de impacto (hero da home + headers de post/case).
// Não substitui Geist no body — usado apenas em headings selecionados via
// classe Tailwind `font-display`.
const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-bricolage',
  display: 'swap',
})
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PageTransition } from '@/components/layout/PageTransition'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { TechLeadOverlay } from '@/components/easter/TechLeadOverlay'
import { EasterEggProvider } from '@/components/easter/EasterEggProvider'
import { MatrixOverlay } from '@/components/easter/MatrixOverlay'
import { ConsoleArt } from '@/components/easter/ConsoleArt'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata = {
  title: {
    default: 'Portfolio Técnico | IA em Produção',
    template: '%s | Portfolio Técnico',
  },
  description:
    'Engenheiro de Software especializado em IA aplicada, sistemas robustos e controle de custos.',
  keywords: ['IA', 'Machine Learning', 'OCR', 'LLM', 'Resiliência', 'FinOps'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${GeistSans.variable} ${GeistMono.variable} ${bricolageGrotesque.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,300..700,0..1,-25..200&display=swap"
        />
        {/* No-flash: aplica .dark no <html> antes do body renderizar.
            Sem isso, SSR vai sem .dark, browser cacheia computed colors do
            light mode, e ao client adicionar .dark via useEffect alguns
            elementos ficam stuck com cores antigas (bug de hydration + CSS
            vars). Padrão idêntico ao next-themes. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark'){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}else{document.documentElement.style.colorScheme='light';}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <EasterEggProvider>
          <Header />
          <main className="flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          <CommandPalette />
          <TechLeadOverlay />
          <MatrixOverlay />
          <ConsoleArt />
        </EasterEggProvider>
        {/* Vercel Analytics + Speed Insights só em produção (em local com
            npm start, esses scripts dão 404 e poluem console errors no
            Lighthouse CI). Em previews também desabilita. */}
        {process.env.VERCEL_ENV === 'production' && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  )
}

