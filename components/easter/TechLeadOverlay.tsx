'use client'

import { useCallback, useEffect, useState } from 'react'
import { useKonami } from '@/hooks/useKonami'

const SHA = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? ''
const REF = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ?? 'local'
const DEPLOYED_AT = process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_CREATED_AT ?? ''

const formatTtfb = (): string => {
  if (typeof performance === 'undefined') return '—'
  const nav = performance.getEntriesByType('navigation')[0] as
    | PerformanceNavigationTiming
    | undefined
  if (!nav) return '—'
  const ttfb = nav.responseStart - nav.requestStart
  return ttfb >= 0 ? `${Math.round(ttfb)}ms` : '—'
}

const formatDeployedAt = (iso: string): string => {
  if (!iso) return 'dev local'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'dev local'
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const TechLeadOverlay = () => {
  const [open, setOpen] = useState(false)
  const [ttfb, setTtfb] = useState<string>('—')

  const handleOpen = useCallback(() => {
    setTtfb(formatTtfb())
    setOpen(true)
  }, [])

  useKonami(handleOpen)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  const shortSha = SHA ? SHA.slice(0, 7) : 'local'
  const deployLabel = formatDeployedAt(DEPLOYED_AT)

  return (
    <div
      role="dialog"
      aria-label="Tech lead mode"
      className="fixed bottom-4 right-4 z-50 max-w-xs rounded-xl border border-border bg-card/95 backdrop-blur p-4 shadow-lg font-mono text-xs leading-relaxed"
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-primary font-semibold">tech lead mode</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Fechar"
        >
          esc
        </button>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
        <dt className="text-muted-foreground">commit</dt>
        <dd className="text-foreground">{shortSha}</dd>
        <dt className="text-muted-foreground">branch</dt>
        <dd className="text-foreground truncate">{REF}</dd>
        <dt className="text-muted-foreground">deploy</dt>
        <dd className="text-foreground">{deployLabel}</dd>
        <dt className="text-muted-foreground">ttfb</dt>
        <dd className="text-foreground">{ttfb}</dd>
      </dl>
      <p className="mt-3 pt-3 border-t border-border/60 text-muted-foreground">
        gostou do site? <span className="text-primary">cmd+k :hire</span>
      </p>
    </div>
  )
}
