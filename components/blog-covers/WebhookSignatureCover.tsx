import { CoverFrame, CoverEdge, CoverDot } from '@/lib/cover-design'

/**
 * Webhook Signature: payload + HMAC validados → 200 OK ou 401 REJECTED.
 */
export const WebhookSignatureCover = ({ className = '' }: { className?: string }) => {
  return (
    <CoverFrame title="Webhook Signature" subtitle="Validando autenticidade com HMAC e Secrets" className={className}>
      <g transform="translate(100, 300)">
        <rect x={0} y={-60} width={150} height={120} rx={8} className="fill-card stroke-border" strokeWidth={2} />
        <text x={75} y={5} textAnchor="middle" className="fill-muted-foreground font-sans font-bold">PAYLOAD</text>
        <CoverEdge d="M 150 0 L 450 0" variant="muted" width={2} />
        <g transform="translate(500, 0)">
          <CoverDot cx={0} cy={0} r={60} variant="primary" dashed />
          <text x={0} y={10} textAnchor="middle" className="fill-primary font-sans font-bold" fontSize="30">#</text>
        </g>
        <CoverEdge d="M 560 0 L 850 -80" variant="primary" width={2} />
        <text x={860} y={-75} className="fill-primary font-sans font-bold">200 OK</text>
        <CoverEdge d="M 560 0 L 850 80" variant="destructive" width={2} />
        <text x={860} y={85} className="fill-destructive font-sans font-bold">401 REJECTED</text>
      </g>
    </CoverFrame>
  )
}
