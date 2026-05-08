import { CoverFrame, CoverEdge } from '@/lib/cover-design'

/**
 * Request ID Trace Correlation: linha de vida com ID atravessa serviços.
 */
export const RequestIdTraceCover = ({ className = '' }: { className?: string }) => {
  return (
    <CoverFrame title="Request ID Correlation" subtitle="Rastreando o fluxo completo de uma transação distribuída" className={className}>
      <g transform="translate(100, 300)">
        <line x1={0} y1={0} x2={1000} y2={0} className="stroke-border" strokeWidth={1} strokeDasharray="10 10" />
        <CoverEdge d="M 0 0 L 1000 0" variant="primary" width={4} />
        {[150, 450, 750].map((x, i) => (
          <g key={x} transform={`translate(${x}, -60)`}>
            <rect x={-80} y={0} width={160} height={120} rx={8} className="fill-card stroke-border" strokeWidth={2} />
            <text x={0} y={30} textAnchor="middle" className="fill-muted-foreground font-sans font-bold" fontSize="10">SERVICE {i + 1}</text>
            <rect x={-60} y={70} width={120} height={25} rx={4} className="fill-primary/20 stroke-primary" strokeWidth={1.5} />
            <text x={0} y={87} textAnchor="middle" className="fill-primary font-mono font-bold" fontSize="10">req_8f2b</text>
          </g>
        ))}
      </g>
    </CoverFrame>
  )
}
