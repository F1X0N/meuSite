import { CoverFrame, CoverEdge, CoverDot } from '@/lib/cover-design'

/**
 * RUM: amostras brutas do cliente → percentis (P95/P99) no servidor.
 *
 * Coordenadas das amostras ficam fixas (definidas em build-time) para
 * garantir SSR/CSR consistency — Math.random() em render quebraria hidratação.
 */
const SAMPLE_POINTS: Array<{ x: number; y: number }> = [
  { x: 30, y: -50 }, { x: 80, y: 20 }, { x: 130, y: -10 }, { x: 50, y: 60 },
  { x: 110, y: -60 }, { x: 170, y: 40 }, { x: 60, y: -30 }, { x: 150, y: 10 },
  { x: 100, y: 50 }, { x: 25, y: -10 }, { x: 175, y: -40 }, { x: 145, y: 65 },
]

export const RumIntegrationCover = ({ className = '' }: { className?: string }) => {
  return (
    <CoverFrame title="Real User Monitoring" subtitle="Ingestão de métricas e agregação de percentis (P95/P99)" className={className}>
      <g transform="translate(150, 300)">
        <text x={0} y={-120} className="fill-muted-foreground font-sans font-bold" fontSize="12">CLIENT SAMPLES</text>
        {SAMPLE_POINTS.map((p, i) => (
          <CoverDot key={i} cx={p.x} cy={p.y} r={4} variant="muted" filled />
        ))}
        <CoverEdge d="M 220 0 L 500 0" variant="muted" width={2} />
        <g transform="translate(600, -80)">
          <path d="M 0 160 L 50 160 L 150 20 L 250 160 L 350 160" className="fill-none stroke-border" strokeWidth={2} />
          <line x1={180} y1={0} x2={180} y2={160} className="stroke-primary" strokeWidth={3} />
          <text x={190} y={20} className="fill-primary font-sans font-bold" fontSize="14">P95</text>
          <text x={300} y={180} textAnchor="middle" className="fill-muted-foreground font-sans" fontSize="10">LATENCY DISTRIBUTION</text>
        </g>
      </g>
    </CoverFrame>
  )
}
