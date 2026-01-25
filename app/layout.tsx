import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CommandPalette } from '@/components/ui/CommandPalette'
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
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,300..700,0..1,-25..200&display=swap"
        />
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CommandPalette />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

