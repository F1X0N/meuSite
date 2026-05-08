import { CoverFrame, CoverEdge } from '@/lib/cover-design'

/**
 * Log Payload Truncation: payload massivo passa por tesoura → output compacto.
 * Tesoura desenhada como 2 alças (círculos) + 2 lâminas (linhas grossas).
 */
export const LogPayloadTruncationCover = ({ className = '' }: { className?: string }) => {
  // Tesoura centrada em (cx, cy)
  const ScissorsIcon = ({ cx, cy }: { cx: number; cy: number }) => (
    <g>
      {/* Lâminas (2 linhas cruzadas) */}
      <line x1={cx - 18} y1={cy + 14} x2={cx + 32} y2={cy - 26} className="stroke-destructive" strokeWidth={4} strokeLinecap="round" />
      <line x1={cx - 18} y1={cy - 14} x2={cx + 32} y2={cy + 26} className="stroke-destructive" strokeWidth={4} strokeLinecap="round" />
      {/* Alças (2 círculos) */}
      <circle cx={cx - 22} cy={cy + 14} r={9} fill="none" className="stroke-destructive" strokeWidth={3} />
      <circle cx={cx - 22} cy={cy - 14} r={9} fill="none" className="stroke-destructive" strokeWidth={3} />
    </g>
  )

  return (
    <CoverFrame title="Log Payload Truncation" subtitle="Protegendo buffers e storage contra objetos gigantes" className={className}>
      {/* === RAW JSON: pilha de retângulos à esquerda === */}
      <g transform="translate(150, 200)">
        {[0, 14, 28, 42].map((offset) => (
          <rect
            key={offset}
            x={offset}
            y={offset}
            width={220}
            height={170}
            rx={4}
            className="fill-card stroke-muted-foreground"
            strokeWidth={1.5}
          />
        ))}
        <text x={120} y={90} textAnchor="middle" className="fill-muted-foreground font-sans font-bold" fontSize="14">
          RAW JSON (5MB)
        </text>
      </g>

      {/* === Seta da pilha → tesoura === */}
      <CoverEdge d="M 410 290 L 540 290" variant="muted" width={2} />

      {/* === Tesoura === */}
      <ScissorsIcon cx={620} cy={290} />
      <text x={620} y={370} textAnchor="middle" className="fill-destructive font-sans font-bold" fontSize="13">
        TRUNCATE
      </text>

      {/* === Seta tesoura → output compacto === */}
      <CoverEdge d="M 695 290 L 820 290" variant="primary" width={2.2} />

      {/* === Output compacto === */}
      <rect x={840} y={260} width={220} height={60} rx={6} className="fill-card stroke-primary" strokeWidth={2} />
      <text x={950} y={297} textAnchor="middle" className="fill-foreground font-mono" fontSize="13">
        {'{ "data": "[...]" }'}
      </text>
    </CoverFrame>
  )
}
