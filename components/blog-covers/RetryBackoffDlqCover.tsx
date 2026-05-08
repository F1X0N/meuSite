import { CoverFrame, CoverEdge } from '@/lib/cover-design'

/**
 * Retry com backoff + Dead Letter Queue.
 *
 * Programador sem contexto deve entender ao olhar:
 *   - 4 tentativas em sequência horizontal, cada uma um arco de MESMA altura
 *     (a tentativa em si é igual; o que muda é o INTERVALO entre elas).
 *   - Gaps entre tentativas crescem exponencialmente (wait, wait 2x, wait 4x).
 *     O backoff é a parte mensagem-chave — fica visível no SPACING.
 *   - 3 primeiras: X cinza no topo (falha retentável).
 *   - 4ª: vai para caixa DLQ destructive (falha terminal).
 */
export const RetryBackoffDlqCover = ({ className = '' }: { className?: string }) => {
  const baseline = 380 // y da linha do tempo
  const arcHeight = 110 // mesma altura para todas as tentativas
  const arcWidth = 65 // mesma largura

  // posições x das 4 tentativas — gaps crescem exponencialmente (60, 120, 240)
  const startX = 90
  const gaps = [0, 60, 120, 240]
  const attempts = gaps.reduce<{ x: number }[]>((acc, gap) => {
    const lastEnd = acc.length === 0 ? startX : acc[acc.length - 1].x + arcWidth + gap
    return [...acc, { x: lastEnd }]
  }, [])

  // labels semânticos por gap (intervalo de espera)
  const gapLabels = ['wait', 'wait 2x', 'wait 4x']

  // posição da caixa DLQ
  const lastAttempt = attempts[attempts.length - 1]
  const dlqX = lastAttempt.x + arcWidth + 90
  const dlqY = baseline

  return (
    <CoverFrame
      title="Retry · Backoff · Dead Letter"
      subtitle="cada espera é maior que a anterior · falha terminal vai pra DLQ"
      ariaLabel="Quatro tentativas iguais com intervalos crescentes entre elas; falhas retentáveis ficam em cinza, falha terminal em vermelho segue para DLQ"
      className={className}
    >
      {/* === Linha de baseline (tempo) === */}
      <line
        x1={startX - 30}
        y1={baseline}
        x2={dlqX + 60}
        y2={baseline}
        strokeWidth="1.5"
        strokeDasharray="3,4"
        className="stroke-border"
      />

      {/* Label "tempo →" no extremo direito da baseline */}
      <text
        x={dlqX + 60}
        y={baseline + 22}
        textAnchor="end"
        fontSize="10"
        fontStyle="italic"
        className="fill-muted-foreground"
      >tempo →</text>

      {/* === 4 arcos de tentativa (todos com mesma altura e largura) === */}
      {attempts.map((a, i) => {
        const isLast = i === attempts.length - 1
        const arcEnd = a.x + arcWidth
        const arcTop = baseline - arcHeight
        const strokeColor = isLast ? 'stroke-destructive' : 'stroke-muted-foreground'
        const fillColor = isLast ? 'stroke-destructive' : 'stroke-muted-foreground'

        return (
          <g key={i}>
            {/* arco da tentativa */}
            <path
              d={`M ${a.x} ${baseline} Q ${(a.x + arcEnd) / 2} ${arcTop - 25}, ${arcEnd} ${baseline}`}
              fill="none"
              strokeWidth="2.2"
              className={strokeColor}
            />
            {/* ponto de origem na linha do tempo */}
            <circle cx={a.x} cy={baseline} r={4} className={isLast ? 'fill-destructive' : 'fill-muted-foreground'} />
            {/* X no topo do arco indicando falha */}
            <g transform={`translate(${(a.x + arcEnd) / 2}, ${arcTop})`}>
              <circle r={12} className={`fill-card ${fillColor}`} strokeWidth="2.2" />
              <path
                d="M -5 -5 L 5 5 M 5 -5 L -5 5"
                strokeWidth="2.2"
                strokeLinecap="round"
                className={strokeColor}
              />
            </g>
            {/* número da tentativa abaixo do início */}
            <text
              x={a.x}
              y={baseline + 22}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              className={isLast ? 'fill-destructive' : 'fill-muted-foreground'}
            >
              {i + 1}ª
            </text>
          </g>
        )
      })}

      {/* === Labels dos gaps (mostram backoff exponencial) === */}
      {attempts.slice(0, -1).map((a, i) => {
        const next = attempts[i + 1]
        const gapStart = a.x + arcWidth
        const gapEnd = next.x
        const midX = (gapStart + gapEnd) / 2

        return (
          <g key={`gap-${i}`}>
            {/* setinha sutil mostrando o gap */}
            <path
              d={`M ${gapStart + 4} ${baseline + 36} L ${gapEnd - 4} ${baseline + 36}`}
              strokeWidth="1.2"
              className="stroke-muted-foreground/50"
            />
            <text
              x={midX}
              y={baseline + 50}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              className="fill-muted-foreground"
            >
              {gapLabels[i]}
            </text>
          </g>
        )
      })}

      {/* === Seta da última tentativa pra DLQ === */}
      <CoverEdge
        d={`M ${lastAttempt.x + arcWidth} ${baseline} L ${dlqX - 35} ${dlqY}`}
        variant="destructive"
        width={2.5}
      />

      {/* === Caixa DLQ === */}
      <g transform={`translate(${dlqX}, ${dlqY})`}>
        <rect x={-35} y={-26} width={70} height={52} rx={6} className="fill-card stroke-destructive" strokeWidth="2.5" />
        <text x={0} y={-2} textAnchor="middle" fontSize="11" fontWeight="700" className="fill-destructive">DLQ</text>
        <text x={0} y={14} textAnchor="middle" fontSize="9" className="fill-destructive/80">análise</text>
      </g>
    </CoverFrame>
  )
}
