import { CoverFrame, CoverEdge, CoverDot } from '@/lib/cover-design'

/**
 * Domain Events: estado central muda → ondas radiais acionam N listeners.
 * Posições dos listeners calculadas via trig — sem `transform rotate`,
 * para manter caixas e texto horizontais em todas as 6 posições.
 */
export const DomainEventsCover = ({ className = '' }: { className?: string }) => {
  const cx = 600
  const cy = 290
  const radius = 180

  // 6 posições angulares (espaçamento 60°), começando à direita
  const angles = [0, 60, 120, 180, 240, 300]

  const listeners = angles.map((angleDeg) => {
    const rad = (angleDeg * Math.PI) / 180
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
      // ponto onde a seta sai do círculo central (na direção do listener)
      startX: cx + 60 * Math.cos(rad),
      startY: cy + 60 * Math.sin(rad),
      // ponto onde a seta chega na borda da caixa do listener (para a seta não invadir)
      endX: cx + (radius - 45) * Math.cos(rad),
      endY: cy + (radius - 45) * Math.sin(rad),
    }
  })

  return (
    <CoverFrame title="Domain Events" subtitle="Desacoplando efeitos colaterais via eventos de domínio" className={className}>
      {/* Anel tracejado externo (evento emitido) — desenhado primeiro, fill="none" pra não cobrir o núcleo */}
      <circle cx={cx} cy={cy} r={55} fill="none" className="stroke-primary" strokeWidth={2.5} strokeDasharray="6,4" />

      {/* === Núcleo: estado que mudou === */}
      <CoverDot cx={cx} cy={cy} r={40} variant="primary" filled />
      <text x={cx} y={cy + 6} textAnchor="middle" className="fill-primary-foreground font-sans font-bold" fontSize="14">
        STATE
      </text>

      {/* === 6 listeners radiais === */}
      {listeners.map((l, i) => (
        <g key={i}>
          {/* seta do estado para o listener */}
          <CoverEdge d={`M ${l.startX} ${l.startY} L ${l.endX} ${l.endY}`} variant="primary" width={2} />
          {/* caixa do listener (horizontal, sem rotação) */}
          <rect x={l.x - 50} y={l.y - 18} width={100} height={36} rx={4} className="fill-card stroke-border" strokeWidth={1.5} />
          <text x={l.x} y={l.y + 4} textAnchor="middle" className="fill-muted-foreground font-sans font-bold" fontSize="11">
            LISTENER
          </text>
        </g>
      ))}
    </CoverFrame>
  )
}
