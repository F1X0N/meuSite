import { CoverFrame, CoverEdge, CoverDot } from '@/lib/cover-design'

/**
 * Value Object ID: 3 campos → função hash → identidade determinística.
 */
export const ValueObjectIdCover = ({ className = '' }: { className?: string }) => {
  return (
    <CoverFrame title="Value Object ID" subtitle="Identidade determinística e imutável via hashes compostos" className={className}>
      <g transform="translate(150, 300)">
        {[-60, 0, 60].map((y) => (
          <rect key={y} x={0} y={y - 20} width={150} height={40} rx={4} className="fill-card stroke-border" strokeWidth={2} />
        ))}
        <path d="M 150 -40 L 350 0 M 150 0 L 350 0 M 150 40 L 350 0" className="stroke-muted-foreground fill-none" strokeWidth={1.5} />
        <g transform="translate(400, 0)">
          <CoverDot cx={0} cy={0} r={50} variant="primary" filled />
          <text x={0} y={10} textAnchor="middle" className="fill-primary-foreground font-sans font-bold" fontSize="20">f(x)</text>
        </g>
        <CoverEdge d="M 450 0 L 750 0" variant="primary" width={3} />
        <rect x={770} y={-30} width={280} height={60} rx={30} className="fill-card stroke-primary" strokeWidth={2} />
        <text x={910} y={5} textAnchor="middle" className="fill-foreground font-mono" fontSize="12">sha256:8f2b...3a1c</text>
      </g>
    </CoverFrame>
  )
}
