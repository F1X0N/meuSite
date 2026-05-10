'use client'

import { useCallback, useEffect, useState } from 'react'

type Heading = {
  id: string
  text: string
  level: 2 | 3
}

const collectHeadings = (): Heading[] => {
  if (typeof document === 'undefined') return []
  const article = document.querySelector('article.prose')
  if (!article) return []
  const nodes = article.querySelectorAll<HTMLElement>('h2[id], h3[id]')
  return Array.from(nodes).map((node) => ({
    id: node.id,
    text: node.textContent?.trim() ?? '',
    level: node.tagName === 'H2' ? 2 : 3,
  }))
}

const useScrollProgress = (): number => {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const compute = () => {
      const scroll = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      const pct = max > 0 ? (scroll / max) * 100 : 0
      setProgress(Math.max(0, Math.min(100, pct)))
    }
    compute()
    window.addEventListener('scroll', compute, { passive: true })
    window.addEventListener('resize', compute)
    return () => {
      window.removeEventListener('scroll', compute)
      window.removeEventListener('resize', compute)
    }
  }, [])
  return progress
}

const useActiveHeading = (headings: Heading[]): string | null => {
  const [activeId, setActiveId] = useState<string | null>(null)
  useEffect(() => {
    if (typeof window === 'undefined' || headings.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target.id)
        if (visible.length > 0) setActiveId(visible[0])
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
    )
    headings.forEach((h) => {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [headings])
  return activeId
}

type Props = { title: string }

export const PostAside = ({ title }: Props) => {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const progress = useScrollProgress()
  const activeId = useActiveHeading(headings)

  useEffect(() => {
    setHeadings(collectHeadings())
  }, [])

  const shareUrl = useCallback(() => {
    if (typeof window === 'undefined') return ''
    return window.location.href
  }, [])

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl())
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [shareUrl])

  const onTwitter = useCallback(() => {
    const text = encodeURIComponent(title)
    const url = encodeURIComponent(shareUrl())
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      '_blank',
      'noopener,noreferrer',
    )
  }, [shareUrl, title])

  const onLinkedIn = useCallback(() => {
    const url = encodeURIComponent(shareUrl())
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      '_blank',
      'noopener,noreferrer',
    )
  }, [shareUrl])

  if (headings.length === 0) return null

  return (
    <>
      <aside
        aria-label="Sumário do artigo"
        className="hidden lg:block sticky top-24 h-fit w-64 ml-8 self-start"
      >
        <PostAsideContent
          headings={headings}
          activeId={activeId}
          progress={progress}
          copied={copied}
          onCopy={onCopy}
          onTwitter={onTwitter}
          onLinkedIn={onLinkedIn}
        />
      </aside>

      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-40 rounded-full bg-primary text-primary-foreground p-3 shadow-lg"
        aria-label="Abrir sumário"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M3 5h14M3 10h14M3 15h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end" role="dialog" aria-label="Sumário">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full bg-card border-t border-border rounded-t-2xl max-h-[75vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Sumário</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>
            <PostAsideContent
              headings={headings}
              activeId={activeId}
              progress={progress}
              copied={copied}
              onCopy={onCopy}
              onTwitter={onTwitter}
              onLinkedIn={onLinkedIn}
              onItemClick={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  )
}

type ContentProps = {
  headings: Heading[]
  activeId: string | null
  progress: number
  copied: boolean
  onCopy: () => void
  onTwitter: () => void
  onLinkedIn: () => void
  onItemClick?: () => void
}

const PostAsideContent = ({ headings, activeId, progress, copied, onCopy, onTwitter, onLinkedIn, onItemClick }: ContentProps) => (
  <div className="space-y-5 text-sm">
    <div>
      <div className="flex items-center justify-between mb-2 text-xs uppercase tracking-wider text-muted-foreground">
        <span>Progresso</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-1 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>

    <nav aria-label="Sumário do post">
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Sumário</div>
      <ul className="space-y-1.5">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? 'pl-3' : ''}>
            <a
              href={`#${h.id}`}
              onClick={onItemClick}
              className={`block text-sm leading-snug transition-colors ${
                activeId === h.id
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>

    <div className="border-t border-border pt-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Compartilhar</div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onTwitter}
          className="flex-1 px-3 py-2 text-xs rounded-lg border border-border hover:border-primary/60 hover:text-primary transition-colors"
        >
          Twitter
        </button>
        <button
          type="button"
          onClick={onLinkedIn}
          className="flex-1 px-3 py-2 text-xs rounded-lg border border-border hover:border-primary/60 hover:text-primary transition-colors"
        >
          LinkedIn
        </button>
        <button
          type="button"
          onClick={onCopy}
          className="flex-1 px-3 py-2 text-xs rounded-lg border border-border hover:border-primary/60 hover:text-primary transition-colors"
        >
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  </div>
)
