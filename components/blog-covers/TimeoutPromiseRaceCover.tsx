import { CoverFrame, CoverEdge } from '@/lib/cover-design'

/**
 * Timeout / Promise.race: corrida entre operação e timer; deadline corta o perdedor.
 */
export const TimeoutPromiseRaceCover = ({ className = '' }: { className?: string }) => {
  return (
    <CoverFrame title="Timeout Promise Race" subtitle="Cancelamento determinístico com AbortController" className={className}>
      <g transform="translate(200, 250)">
        <text x={0} y={-30} className="fill-muted-foreground font-sans font-bold" fontSize="12">Promise.race([ ... ])</text>
        <text x={0} y={35} className="fill-muted-foreground font-sans" fontSize="12">Operation</text>
        <CoverEdge d="M 0 50 L 900 50" variant="primary" width={3} />
        <text x={0} y={115} className="fill-muted-foreground font-sans" fontSize="12">Timeout (500ms)</text>
        <CoverEdge d="M 0 130 L 450 130" variant="muted" width={3} />
        <line x1={450} y1={0} x2={450} y2={200} className="stroke-destructive" strokeWidth={3} strokeDasharray="8 4" />
        <text x={460} y={20} className="fill-destructive font-sans font-bold" fontSize="14">DEADLINE</text>
        <g transform="translate(450, 50)">
          <circle r={15} className="fill-destructive" />
          <text x={0} y={6} textAnchor="middle" className="fill-primary-foreground font-bold" fontSize="16">✕</text>
        </g>
      </g>
    </CoverFrame>
  )
}
