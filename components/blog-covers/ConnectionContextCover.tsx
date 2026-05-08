import { CoverFrame, CoverEdge } from '@/lib/cover-design'

/**
 * Connection Context: wrapper garantidor que assegura release de recursos.
 */
export const ConnectionContextCover = ({ className = '' }: { className?: string }) => {
  return (
    <CoverFrame title="Connection Context" subtitle="Prevenindo leaks de pool em ambientes Serverless" className={className}>
      <g transform="translate(300, 150)">
        <rect x={0} y={0} width={600} height={320} rx={12} className="fill-card stroke-primary" strokeWidth={2} strokeDasharray="10 5" />
        <text x={20} y={-15} className="fill-primary font-sans font-bold" fontSize="14">withTransactionContext(() ={'>'} {'{ ... }'})</text>
        <CoverEdge d="M -150 60 L 0 60" variant="muted" width={2} />
        <text x={-145} y={50} className="fill-muted-foreground font-sans" fontSize="10">GET CONNECTION</text>
        <g transform="translate(100, 100)">
          <rect x={0} y={0} width={400} height={120} rx={4} className="fill-muted/30 stroke-border" strokeWidth={1.5} />
          <text x={200} y={65} textAnchor="middle" className="fill-muted-foreground font-sans font-bold" fontSize="16">EXECUTE DB LOGIC</text>
        </g>
        <CoverEdge d="M 600 260 L 750 260" variant="primary" width={2} />
        <text x={610} y={250} className="fill-primary font-sans" fontSize="10">FINALLY: RELEASE()</text>
        <path d="M 500 220 L 500 260 L 100 260" className="stroke-primary fill-none" strokeWidth={1.5} strokeDasharray="4 4" />
      </g>
    </CoverFrame>
  )
}
