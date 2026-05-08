import { CoverFrame } from '@/lib/cover-design'

/**
 * API Key Isolation: 3 contextos isolados, cada um com sua própria key.
 *
 * Tailwind purge não detecta classes interpoladas (`fill-${var}/10`),
 * então mapeamos estaticamente.
 */
type Context = {
  label: string
  isPrimary: boolean
}

const CONTEXTS: Context[] = [
  { label: 'Ingestion', isPrimary: true },
  { label: 'Analytics', isPrimary: false },
  { label: 'Admin', isPrimary: false },
]

export const ApiKeyIsolationCover = ({ className = '' }: { className?: string }) => {
  return (
    <CoverFrame title="API Key Isolation" subtitle="Reduzindo raio de explosão por contexto de uso" className={className}>
      <g transform="translate(200, 150)">
        {CONTEXTS.map((ctx, i) => (
          <g key={ctx.label} transform={`translate(${i * 300}, 0)`}>
            <rect x={0} y={0} width={200} height={300} rx={8} className="fill-card stroke-border" strokeWidth={2} />
            <rect
              x={20}
              y={20}
              width={160}
              height={40}
              rx={4}
              className={ctx.isPrimary ? 'fill-primary/10 stroke-primary' : 'fill-muted-foreground/10 stroke-muted-foreground'}
              strokeWidth={1.5}
            />
            <text
              x={100}
              y={45}
              textAnchor="middle"
              className={`${ctx.isPrimary ? 'fill-primary' : 'fill-muted-foreground'} font-mono font-bold`}
              fontSize="10"
            >
              pk_live_{ctx.label.toLowerCase()}
            </text>
            <circle cx={100} cy={180} r={40} className="fill-muted/20 stroke-border" strokeWidth={1.5} strokeDasharray="4 4" />
            <text x={100} y={250} textAnchor="middle" className="fill-muted-foreground font-sans font-bold" fontSize="12">
              {ctx.label}
            </text>
          </g>
        ))}
      </g>
    </CoverFrame>
  )
}
