import Link from 'next/link'
import { BackLink } from '@/components/ui/BackLink'

export const metadata = {
  title: 'Ferramentas',
  description: 'Ferramentas para buscar vagas e preparar entrevistas com base na experiência profissional publicada.',
}

const tools = [
  {
    href: '/tools/job-search',
    title: 'Buscar vagas',
    description: 'Queries prontas para explorar vagas de engenharia no Brasil e no exterior.',
    action: 'Abrir buscas',
  },
  {
    href: '/tools/interview-prep',
    title: 'Preparar entrevista',
    description: 'Cole a descrição de uma vaga e monte um roteiro de conversa em português ou inglês.',
    action: 'Criar roteiro',
  },
]

export default function ToolsPage() {
  return (
    <div className="py-16 md:py-20 lg:py-24">
      <div className="container max-w-5xl">
        <BackLink href="/" label="Voltar para a home" />
        <header className="mt-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Portfólio</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">Ferramentas</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">Recursos práticos para explorar oportunidades e organizar uma conversa de entrevista.</p>
        </header>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {tools.map((tool) => (
            <article key={tool.href} className="flex flex-col rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="font-display text-2xl font-bold">{tool.title}</h2>
              <p className="mt-3 flex-1 leading-relaxed text-muted-foreground">{tool.description}</p>
              <Link href={tool.href} className="mt-6 inline-flex min-h-10 items-center self-start font-medium text-primary underline-offset-4 hover:underline">
                {tool.action} →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
