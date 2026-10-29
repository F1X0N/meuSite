'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BackLink } from '@/components/ui/BackLink'
import { jobSearchGroups } from '@/content/job-search-queries'

const getLinkedInUrl = (expression) =>
  `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(expression)}`

export const JobSearchQueries = () => {
  const [copyStatus, setCopyStatus] = useState({ id: '', message: '' })

  const copyQuery = async (query) => {
    try {
      await navigator.clipboard.writeText(query.expression)
      setCopyStatus({ id: query.id, message: 'Query copiada.' })
    } catch {
      setCopyStatus({ id: query.id, message: 'Não foi possível copiar. Selecione o texto da query.' })
    }
  }

  return (
    <div className="py-16 md:py-20 lg:py-24">
      <div className="container max-w-5xl">
        <BackLink href="/tools" label="Voltar para ferramentas" />

        <header className="mt-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Ferramentas</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">Buscar vagas</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Queries para encontrar oportunidades em engenharia de software. Copie uma busca ou abra-a no LinkedIn e ajuste os filtros conforme a vaga que procura.
          </p>
        </header>

        <Link href="/blog/buscar-vagas-engenharia-linkedin" className="mt-6 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline">
          Entenda como montar e ajustar essas buscas →
        </Link>

        <div className="mt-10 rounded-2xl border bg-muted/30 p-6">
          <h2 className="font-semibold">Como usar</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Em Vagas, selecione júnior e pleno, escolha remoto ou híbrido e filtre por publicações da última semana. Para acompanhar novidades diariamente, use as últimas 24 horas. Em buscas internacionais, confirme no anúncio se a empresa contrata pessoas no Brasil.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            As buscas usam termos amplos de propósito. Se aparecerem poucos resultados, remova o último grupo de tecnologias da query ou pesquise só pelo cargo.
          </p>
        </div>

        <div className="mt-14 space-y-14">
          {jobSearchGroups.map((group) => (
            <section key={group.id} aria-labelledby={`${group.id}-title`}>
              <h2 id={`${group.id}-title`} className="font-display text-2xl font-bold">{group.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{group.description}</p>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {group.queries.map((query) => (
                  <article key={query.id} className="flex flex-col rounded-2xl border bg-card p-5 shadow-sm">
                    <h3 className="text-lg font-semibold">{query.title}</h3>
                    <p className="mt-4 flex-1 select-all break-words rounded-lg bg-muted px-4 py-3 font-mono text-sm leading-relaxed" aria-label={`Query para ${query.title}`}>
                      {query.expression}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => copyQuery(query)}
                        className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        aria-label={`Copiar busca de ${query.title} para ${group.title}`}
                      >
                        Copiar query
                      </button>
                      <a
                        href={getLinkedInUrl(query.expression)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-10 items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
                        aria-label={`Abrir busca de ${query.title} para ${group.title} no LinkedIn em nova aba`}
                      >
                        Abrir no LinkedIn ↗
                      </a>
                    </div>
                    <p role="status" aria-live="polite" className="mt-2 min-h-5 text-xs text-muted-foreground">
                      {copyStatus.id === query.id ? copyStatus.message : ''}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
