'use client'

/**
 * Hero network graph — "IA em produção".
 *
 * Metáfora visual:
 *   Cliente → Gateway → LLM Primary
 *                    ↘ LLM Fallback (resiliência)
 *                    → Cache (custo)
 *                    → Trace/Logs (observabilidade)
 *
 * Pulses correm pelas edges em loop sutil, sugerindo requests fluindo.
 * Animação puramente CSS (keyframes em globals.css). Respeita prefers-reduced-motion.
 * Usa CSS vars do tema (primary, muted-foreground) — herda light/dark do site.
 */

const VIEWBOX = '0 0 600 520'

type NodeProps = {
  cx: number
  cy: number
  r?: number
  variant?: 'primary' | 'muted' | 'accent'
  label: string
  sublabel?: string
  delay?: number
}

const NODE_FILL: Record<NonNullable<NodeProps['variant']>, string> = {
  primary: 'fill-primary',
  muted: 'fill-card stroke-muted-foreground',
  accent: 'fill-card stroke-primary',
}

const HeroNode = ({ cx, cy, r = 28, variant = 'primary', label, sublabel, delay = 0 }: NodeProps) => {
  const isFilled = variant === 'primary'
  const labelY = cy + r + 16
  const sublabelY = labelY + 14
  return (
    <g className="hero-graph-node" style={{ animationDelay: `${delay}ms` }}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        className={NODE_FILL[variant]}
        strokeWidth={isFilled ? 0 : 2}
      />
      <text
        x={cx}
        y={labelY}
        textAnchor="middle"
        className="fill-foreground"
        fontSize="13"
        fontWeight="600"
      >
        {label}
      </text>
      {sublabel && (
        <text
          x={cx}
          y={sublabelY}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize="10"
        >
          {sublabel}
        </text>
      )}
    </g>
  )
}

type EdgeProps = {
  d: string
  delay?: number
  variant?: 'primary' | 'muted'
  width?: number
}

const HeroEdge = ({ d, delay = 0, variant = 'primary', width = 2 }: EdgeProps) => {
  const strokeClass = variant === 'primary' ? 'stroke-primary' : 'stroke-muted-foreground'
  return (
    <>
      <path
        d={d}
        fill="none"
        strokeWidth={width}
        strokeOpacity={variant === 'primary' ? 0.35 : 0.4}
        className={strokeClass}
      />
      <path
        d={d}
        fill="none"
        strokeWidth={width + 0.5}
        strokeLinecap="round"
        className={`${strokeClass} hero-graph-pulse`}
        style={{ animationDelay: `${delay}ms` }}
      />
    </>
  )
}

const HeroDefs = () => (
  <defs>
    <radialGradient id="hero-graph-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.18" />
      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
    </radialGradient>
  </defs>
)

export const HeroNetworkGraph = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox={VIEWBOX}
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Diagrama de IA em produção: cliente conectado a gateway, com fallback de modelo, cache e observabilidade"
    className={`hero-graph w-full h-auto ${className}`}
  >
    <HeroDefs />

    {/* glow de fundo no gateway central */}
    <circle cx="300" cy="260" r="180" fill="url(#hero-graph-glow)" />

    {/* === EDGES (renderizados antes dos nodes para ficarem por trás) === */}
    {/* Cliente → Gateway */}
    <HeroEdge d="M 100 170 L 280 250" delay={0} />
    {/* Gateway → LLM Primary */}
    <HeroEdge d="M 320 250 L 500 130" delay={400} />
    {/* Gateway → LLM Fallback (curva sutil) */}
    <HeroEdge d="M 320 270 Q 420 320 500 380" delay={2200} variant="muted" width={1.6} />
    {/* Gateway → Cache */}
    <HeroEdge d="M 280 240 Q 200 180 130 80" delay={1300} variant="muted" width={1.6} />
    {/* Gateway → Logs */}
    <HeroEdge d="M 300 290 L 300 440" delay={900} variant="muted" width={1.6} />
    {/* LLM Primary → Logs (telemetria) */}
    <HeroEdge d="M 500 150 Q 480 320 320 440" delay={1700} variant="muted" width={1.4} />

    {/* === NODES === */}
    <HeroNode cx={100} cy={170} r={26} variant="accent" label="Cliente" sublabel="HTTP" delay={0} />
    <HeroNode cx={300} cy={260} r={36} variant="primary" label="Gateway" sublabel="Idempotência · Trace ID" delay={300} />
    <HeroNode cx={500} cy={130} r={28} variant="primary" label="LLM Primary" sublabel="OpenAI" delay={600} />
    <HeroNode cx={500} cy={380} r={24} variant="muted" label="LLM Fallback" sublabel="Anthropic" delay={2200} />
    <HeroNode cx={130} cy={80} r={22} variant="muted" label="Cache" sublabel="dedupe + custo" delay={1300} />
    <HeroNode cx={300} cy={460} r={26} variant="accent" label="Trace · Logs" sublabel="Loki · Sentry" delay={900} />
  </svg>
)
