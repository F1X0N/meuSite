import { type ReactNode } from 'react'

type SparkDirection = 'lower-better' | 'higher-better'

type SparkProps = {
  before: number | string
  after: number | string
  unit?: string
  label?: ReactNode
  direction?: SparkDirection
}

// MDX (especialmente com experimental.mdxRs) pode passar props numéricas como
// strings. Coerce explicitamente para number.
const toNumber = (value: number | string | undefined): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

const formatNumber = (n: number, unit?: string): string => {
  if (Number.isInteger(n)) return unit ? `${n}${unit}` : String(n)
  return unit ? `${n.toFixed(1)}${unit}` : n.toFixed(1)
}

const computeDelta = (before: number, after: number, direction: SparkDirection) => {
  if (before === 0) return { pct: 0, isImprovement: true }
  const pct = ((after - before) / before) * 100
  const isImprovement = direction === 'lower-better' ? pct < 0 : pct > 0
  return { pct, isImprovement }
}

const formatDelta = (pct: number): string => {
  const abs = Math.abs(pct)
  if (abs < 1) return abs.toFixed(1)
  return Math.round(abs).toString()
}

/**
 * Spark — micro-visual de antes/depois para case studies.
 *
 * Mostra duas barras horizontais (antes em muted, depois em primary) com
 * a magnitude relativa proporcional, números formatados e o delta percentual
 * coloridos por sucesso/regressão.
 *
 * `direction` define a interpretação semântica: "lower-better" (latência,
 * custo, taxa de erro) ou "higher-better" (throughput, score). Default é
 * lower-better porque case studies de IA em produção tipicamente medem
 * redução.
 */
export const Spark = ({
  before: beforeRaw,
  after: afterRaw,
  unit,
  label,
  direction = 'lower-better',
}: SparkProps) => {
  const before = toNumber(beforeRaw)
  const after = toNumber(afterRaw)
  const max = Math.max(before, after, 1)
  const beforeWidth = (before / max) * 100
  const afterWidth = (after / max) * 100
  const { pct, isImprovement } = computeDelta(before, after, direction)
  const deltaColor = isImprovement ? 'text-primary' : 'text-destructive'
  const deltaSign = isImprovement ? '↓' : '↑'

  return (
    <div className="my-6 rounded-xl border border-border bg-card p-5 not-prose">
      {label && (
        <div className="text-sm font-medium text-foreground mb-3">{label}</div>
      )}
      <div className="grid grid-cols-[60px_1fr_auto] items-center gap-x-3 gap-y-2 font-mono text-xs">
        <div className="text-muted-foreground">antes</div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-muted-foreground/40"
            style={{ width: `${beforeWidth}%` }}
          />
        </div>
        <div className="tabular-nums text-foreground">{formatNumber(before, unit)}</div>

        <div className="text-muted-foreground">depois</div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary"
            style={{ width: `${afterWidth}%` }}
          />
        </div>
        <div className="tabular-nums text-foreground">{formatNumber(after, unit)}</div>
      </div>
      <div className={`mt-3 text-sm font-semibold ${deltaColor}`}>
        {deltaSign} {formatDelta(pct)}%{' '}
        <span className="font-normal text-muted-foreground">
          {isImprovement ? 'de melhora' : 'de regressão'}
        </span>
      </div>
    </div>
  )
}
