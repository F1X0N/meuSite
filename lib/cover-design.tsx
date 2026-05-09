'use client'

/**
 * Design system para covers de blog/case-studies.
 *
 * Princípios:
 * - Paleta restrita: primary, muted-foreground, destructive (apenas falha terminal).
 * - Estilo abstrato/minimal: linhas + pontos + formas geométricas.
 * - Sem rotular elementos individuais. Comunica o conceito visualmente, não didaticamente.
 * - Cores via CSS vars (Tailwind classes) → herda tema light/dark do site.
 * - ViewBox fixo 1200×630 (Open Graph standard).
 * - Reveal animado ao entrar viewport (CoverFrame faz IntersectionObserver).
 *   Respeita prefers-reduced-motion.
 */

import * as React from 'react'

const VIEWBOX = '0 0 1200 630'
const SAFE_LEFT = 80
const SAFE_RIGHT = 1120
const TITLE_Y = 585
const SUBTITLE_Y = 608

const ARROW_PRIMARY_ID = 'cover-arrow-primary'
const ARROW_MUTED_ID = 'cover-arrow-muted'
const ARROW_DESTRUCTIVE_ID = 'cover-arrow-destructive'

const CoverDefs = () => (
  <defs>
    <marker id={ARROW_PRIMARY_ID} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0L10 5L0 10z" className="fill-primary" />
    </marker>
    <marker id={ARROW_MUTED_ID} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0 0L10 5L0 10z" className="fill-muted-foreground" />
    </marker>
    <marker id={ARROW_DESTRUCTIVE_ID} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0L10 5L0 10z" className="fill-destructive" />
    </marker>
  </defs>
)

type CoverFrameProps = {
  title: string
  subtitle?: string
  ariaLabel?: string
  children: React.ReactNode
  className?: string
}

const useCoverReveal = () => {
  const ref = React.useRef<SVGSVGElement | null>(null)
  const [revealed, setRevealed] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setRevealed(true)
      return
    }
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setRevealed(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return { ref, revealed }
}

/**
 * Wrapper canônico de cover. ViewBox fixo, título + subtitle no rodapé.
 * Garante consistência de composição entre todas as covers.
 * ariaLabel opcional — fallback usa title.
 */
export const CoverFrame = ({ title, subtitle, ariaLabel, children, className = '' }: CoverFrameProps) => {
  const { ref, revealed } = useCoverReveal()
  return (
    <svg
      ref={ref}
      viewBox={VIEWBOX}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel ?? title}
      data-revealed={revealed ? 'true' : 'false'}
      className={`cover-frame w-full h-auto font-sans ${revealed ? 'cover-revealed' : ''} ${className}`}
    >
      <CoverDefs />
      {children}
      <text
        x="600" y={TITLE_Y}
        textAnchor="middle" fontSize="16" fontWeight="700" letterSpacing="2"
        className="cover-title fill-primary"
      >
        {title.toUpperCase()}
      </text>
      {subtitle && (
        <text
          x="600" y={SUBTITLE_Y}
          textAnchor="middle" fontSize="12"
          className="cover-subtitle fill-muted-foreground"
        >
          {subtitle}
        </text>
      )}
    </svg>
  )
}

type Variant = 'primary' | 'muted' | 'destructive'

const STROKE_CLASS: Record<Variant, string> = {
  primary: 'stroke-primary',
  muted: 'stroke-muted-foreground',
  destructive: 'stroke-destructive',
}

const FILL_CLASS: Record<Variant, string> = {
  primary: 'fill-primary',
  muted: 'fill-muted-foreground/40',
  destructive: 'fill-destructive',
}

const ARROW_ID: Record<Variant, string> = {
  primary: ARROW_PRIMARY_ID,
  muted: ARROW_MUTED_ID,
  destructive: ARROW_DESTRUCTIVE_ID,
}

type CoverDotProps = {
  cx: number
  cy: number
  r?: number
  variant?: Variant
  filled?: boolean
  dashed?: boolean
}

/**
 * Ponto/nó canônico. Sem label (estilo minimal).
 * Variant define cor via CSS vars (herda tema).
 * dashed aplica strokeDasharray (apenas quando filled=false).
 */
export const CoverDot = ({ cx, cy, r = 12, variant = 'primary', filled = false, dashed = false }: CoverDotProps) => (
  <circle
    cx={cx} cy={cy} r={r}
    className={filled ? FILL_CLASS[variant] : `fill-card ${STROKE_CLASS[variant]}`}
    strokeWidth={filled ? 0 : 2.5}
    strokeDasharray={!filled && dashed ? '6,4' : undefined}
  />
)

type CoverEdgeProps = {
  d: string
  variant?: Variant
  dashed?: boolean
  arrow?: boolean | 'start' | 'end' | 'none'
  width?: number
}

/**
 * Linha/aresta canônica. Aceita path SVG arbitrário.
 * Stroke width padronizado. Marker condicional.
 * arrow: true | 'end' → markerEnd · 'start' → markerStart · false | 'none' → sem marker
 */
export const CoverEdge = ({ d, variant = 'primary', dashed = false, arrow = true, width }: CoverEdgeProps) => {
  const markerHref = `url(#${ARROW_ID[variant]})`
  const markerEnd = arrow === true || arrow === 'end' ? markerHref : undefined
  const markerStart = arrow === 'start' ? markerHref : undefined
  return (
    <path
      d={d}
      fill="none"
      strokeWidth={width ?? (variant === 'primary' ? 2.5 : 1.8)}
      strokeDasharray={dashed ? '6,4' : undefined}
      className={STROKE_CLASS[variant]}
      markerEnd={markerEnd}
      markerStart={markerStart}
    />
  )
}

type CoverHexProps = {
  cx: number
  cy: number
  size: number
  variant?: Variant
  filled?: boolean
  dashed?: boolean
}

/**
 * Hexágono regular centrado em (cx, cy) com raio `size`.
 * Para arquiteturas hexagonais ou camadas concêntricas.
 */
export const CoverHex = ({ cx, cy, size, variant = 'primary', filled = false, dashed = false }: CoverHexProps) => {
  const points = [0, 60, 120, 180, 240, 300]
    .map((angle) => {
      const rad = (angle * Math.PI) / 180
      const x = cx + size * Math.cos(rad)
      const y = cy + size * Math.sin(rad)
      return `${x},${y}`
    })
    .join(' ')
  return (
    <polygon
      points={points}
      className={filled ? FILL_CLASS[variant] : `fill-none ${STROKE_CLASS[variant]}`}
      strokeWidth={filled ? 0 : 2}
      strokeDasharray={dashed ? '6,4' : undefined}
    />
  )
}

/**
 * Bounds canônicos para ajudar layout — são opcionais, só pra orientação.
 */
export const COVER_BOUNDS = {
  width: 1200,
  height: 630,
  centerX: 600,
  centerY: 290, // antes do bloco de título no rodapé
  safeLeft: SAFE_LEFT,
  safeRight: SAFE_RIGHT,
}
