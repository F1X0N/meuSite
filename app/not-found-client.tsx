'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useMemo } from 'react'
import { suggestRoutes, type RouteSuggestion } from '@/lib/route-suggestions'

type IndexedItem = { slug: string; title: string }

type Props = {
  posts: IndexedItem[]
  cases: IndexedItem[]
}

const KIND_LABEL: Record<RouteSuggestion['kind'], string> = {
  blog: 'post',
  case: 'case study',
  page: 'página',
}

export const NotFoundClient = ({ posts, cases }: Props) => {
  const pathname = usePathname() ?? '/'
  const suggestions = useMemo(
    () => suggestRoutes(pathname, posts, cases),
    [pathname, posts, cases],
  )

  return (
    <div className="container max-w-2xl py-20 md:py-24">
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 font-mono text-sm leading-relaxed">
        <div className="text-destructive font-semibold">
          Error 404 · RouteNotFoundError
        </div>
        <div className="mt-3 text-foreground/90">
          <span className="text-muted-foreground">at</span>{' '}
          <span className="text-primary">router.resolve</span>
          <span className="text-muted-foreground">(</span>
          <span className="text-foreground">{pathname}</span>
          <span className="text-muted-foreground">)</span>
        </div>
        <div className="mt-1 text-muted-foreground">
          <span className="text-foreground/60">at</span>{' '}
          /app/not-found.tsx <span className="text-foreground/60">(line 42, col 24)</span>
        </div>
        <div className="mt-4 text-muted-foreground">
          <span className="text-foreground/70">{'// '}</span>
          a rota acima não existe neste portfólio. continua sendo um site sólido.
        </div>
      </div>

      <div className="mt-10 space-y-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Essa rota não foi encontrada.
        </h1>
        <p className="text-muted-foreground">
          O que você tentou abrir não está mapeado. Você pode voltar para a home
          ou conferir as rotas mais próximas do que você digitou:
        </p>

        <ul className="space-y-3">
          {suggestions.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="group flex items-baseline justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3 hover:border-primary/60 transition-colors"
              >
                <div>
                  <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {s.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                    {s.href}
                  </div>
                </div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  {KIND_LABEL[s.kind]}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            ← voltar para a home
          </Link>
        </div>
      </div>
    </div>
  )
}
