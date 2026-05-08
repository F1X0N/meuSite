import { CoverFrame, CoverEdge, CoverDot } from '@/lib/cover-design'

/**
 * Strategy Pattern: roteador escolhe estratégia ativa por predicado.
 */
export const StrategyPatternCover = ({ className = '' }: { className?: string }) => {
  return (
    <CoverFrame title="Strategy Pattern" subtitle="Substituindo condicionais complexas por objetos de estratégia" className={className}>
      <g transform="translate(150, 300)">
        <CoverEdge d="M 0 0 L 250 0" variant="muted" width={2} />
        <CoverDot cx={300} cy={0} r={40} variant="muted" dashed />
        <text x={300} y={6} textAnchor="middle" className="fill-muted-foreground font-sans font-bold" fontSize="14">MATCH?</text>
        <g transform="translate(350, 0)">
          <CoverEdge d="M 0 0 C 100 0, 100 -120, 200 -120" variant="muted" width={2} />
          <CoverEdge d="M 0 0 C 100 0, 100 0, 200 0" variant="primary" width={4} />
          <CoverEdge d="M 0 0 C 100 0, 100 120, 200 120" variant="muted" width={2} />
        </g>
        <rect x={560} y={-30} width={180} height={60} rx={4} className="fill-primary/20 stroke-primary" strokeWidth={2} />
        <text x={650} y={5} textAnchor="middle" className="fill-primary font-sans font-bold">ACTIVE_STRATEGY</text>
      </g>
    </CoverFrame>
  )
}
