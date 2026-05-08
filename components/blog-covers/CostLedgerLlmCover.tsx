import { CoverFrame, CoverEdge } from '@/lib/cover-design'

/**
 * Cost Ledger LLM: múltiplos provedores → tabela contábil centralizada.
 * Posições absolutas (sem translate aninhado) pra evitar que linhas
 * cruzem o título no rodapé.
 */
export const CostLedgerLlmCover = ({ className = '' }: { className?: string }) => {
  // 3 LLMs verticalmente alinhados à esquerda
  const llms = [
    { label: 'GPT-4', y: 180 },
    { label: 'Claude', y: 290 },
    { label: 'Llama', y: 400 },
  ]

  // Tabela ledger à direita
  const tableX = 700
  const tableY = 180
  const tableW = 420
  const tableH = 230
  const tableEntryX = tableX

  return (
    <CoverFrame title="Cost Ledger LLM" subtitle="Rastreabilidade financeira e granular de tokens por request" className={className}>
      {/* === 3 LLMs à esquerda === */}
      {llms.map((llm) => (
        <g key={llm.label}>
          <rect x={120} y={llm.y - 25} width={120} height={50} rx={8} className="fill-muted/40 stroke-border" strokeWidth={1.5} />
          <text x={180} y={llm.y + 4} textAnchor="middle" className="fill-muted-foreground font-sans font-bold" fontSize="13">
            {llm.label}
          </text>
        </g>
      ))}

      {/* === Linhas curvas convergindo na entrada da tabela (centro vertical da tabela) === */}
      {llms.map((llm, i) => {
        const targetY = tableY + tableH / 2
        const ctrlX = (240 + tableEntryX) / 2
        return (
          <CoverEdge
            key={`edge-${i}`}
            d={`M 240 ${llm.y} C ${ctrlX} ${llm.y}, ${ctrlX} ${targetY}, ${tableEntryX} ${targetY}`}
            variant="muted"
            width={1.6}
          />
        )
      })}

      {/* === Tabela ledger === */}
      <rect
        x={tableX}
        y={tableY}
        width={tableW}
        height={tableH}
        rx={6}
        className="fill-card stroke-primary"
        strokeWidth={2}
      />
      {/* Header da tabela */}
      <rect x={tableX} y={tableY} width={tableW} height={44} rx={6} className="fill-primary/10" />
      <text x={tableX + tableW / 2} y={tableY + 28} textAnchor="middle" className="fill-primary font-sans font-bold" fontSize="16">
        $ TRANSACTION_LEDGER
      </text>
      {/* Linha divisória abaixo do header */}
      <line x1={tableX} y1={tableY + 44} x2={tableX + tableW} y2={tableY + 44} className="stroke-primary" strokeWidth={1.5} />
      {/* Linhas da tabela (cada uma simboliza uma transação registrada) */}
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={tableX + 20}
          y={tableY + 70 + i * 38}
          width={tableW - 40}
          height={20}
          rx={2}
          className="fill-primary/15"
        />
      ))}
    </CoverFrame>
  )
}
