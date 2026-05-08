import { CoverFrame, CoverHex, CoverEdge } from '@/lib/cover-design'

/**
 * Hexagonal Architecture / Ports & Adapters.
 *
 * Programador sem contexto deve entender ao olhar:
 *   - Hexágono preenchido = domínio (regra de negócio limpa, simétrica).
 *   - Pequenos retângulos brancos sobre as 6 arestas = ports (literalmente "portas"
 *     no domínio: entradas/encaixes para o mundo externo).
 *   - 6 formas DIFERENTES no exterior = adapters (heterogeneidade do mundo: HTTP,
 *     DB, queue, CLI, webhook, provider externo).
 *   - Linhas finas adapter → port mostram a regra: "dependência aponta pra dentro,
 *     mas só toca o port — domínio nunca conhece o adapter".
 */
export const HexagonalCover = ({ className = '' }: { className?: string }) => {
  const cx = 600
  const cy = 290
  const domainSize = 130 // raio do hexágono do domínio
  const adapterDistance = 240 // distância dos adapters externos

  // 6 ângulos das arestas do hexágono (rotação de 30° pra ports caírem no MEIO das arestas)
  const angles = [30, 90, 150, 210, 270, 330]

  return (
    <CoverFrame
      title="Ports & Adapters"
      subtitle="domínio no centro · ports são as portas · adapters são o mundo externo"
      ariaLabel="Hexágono central representa o domínio; pequenos retângulos sobre as arestas são os ports; seis formas diferentes no exterior são os adapters"
      className={className}
    >
      {/* === Domínio: hexágono preenchido em primary === */}
      <CoverHex cx={cx} cy={cy} size={domainSize} variant="primary" filled />

      {/* === Ports: pequenos retângulos sobre as 6 arestas do hexágono === */}
      {/* Para cada aresta, calcular ponto médio e ângulo de rotação do port. */}
      {angles.map((angleDeg, i) => {
        const rad = (angleDeg * Math.PI) / 180
        // ponto médio da aresta (no perímetro do hexágono regular, na altura cos(30°))
        const portCx = cx + domainSize * Math.cos(rad) * Math.cos(Math.PI / 6)
        const portCy = cy + domainSize * Math.sin(rad) * Math.cos(Math.PI / 6)

        // posição do adapter externo (mais longe na mesma direção)
        const adapterCx = cx + adapterDistance * Math.cos(rad)
        const adapterCy = cy + adapterDistance * Math.sin(rad)

        // linha do adapter ao port
        const dx = (cx - adapterCx) / adapterDistance
        const dy = (cy - adapterCy) / adapterDistance
        const lineStartX = adapterCx + dx * 30
        const lineStartY = adapterCy + dy * 30
        const lineEndX = portCx - dx * 12
        const lineEndY = portCy - dy * 12

        return (
          <g key={i}>
            {/* Port: retângulo curto, perpendicular à aresta */}
            <rect
              x={portCx - 14}
              y={portCy - 6}
              width={28}
              height={12}
              rx={2}
              transform={`rotate(${angleDeg + 90} ${portCx} ${portCy})`}
              className="fill-card stroke-primary"
              strokeWidth="2"
            />
            {/* Linha adapter → port (dependência aponta pra dentro) */}
            <CoverEdge d={`M ${lineStartX} ${lineStartY} L ${lineEndX} ${lineEndY}`} width={1.6} />
            {/* Adapter: forma específica por tipo */}
            <AdapterShape kind={i} cx={adapterCx} cy={adapterCy} />
          </g>
        )
      })}
    </CoverFrame>
  )
}

/**
 * 6 formas distintas para os adapters externos.
 * Cada forma carrega semântica visual: heterogeneidade do mundo externo.
 */
const AdapterShape = ({ kind, cx, cy }: { kind: number; cx: number; cy: number }) => {
  const cls = 'fill-card stroke-primary'
  const sw = 2.2

  switch (kind % 6) {
    case 0: {
      // círculo pequeno (HTTP / API REST)
      return <circle cx={cx} cy={cy} r={20} className={cls} strokeWidth={sw} />
    }
    case 1: {
      // cilindro estilizado (DB) — 2 elipses + retângulo
      return (
        <g>
          <ellipse cx={cx} cy={cy - 14} rx={18} ry={5} className={cls} strokeWidth={sw} />
          <rect x={cx - 18} y={cy - 14} width={36} height={28} className={cls} strokeWidth={sw} />
          <ellipse cx={cx} cy={cy + 14} rx={18} ry={5} className={cls} strokeWidth={sw} />
          {/* máscara branca pra "cortar" a parte de cima do retângulo */}
          <rect x={cx - 18} y={cy - 14} width={36} height={2} className="fill-card" />
        </g>
      )
    }
    case 2: {
      // pilha horizontal de 3 linhas (queue / fila)
      return (
        <g>
          <rect x={cx - 22} y={cy - 16} width={44} height={8} rx={2} className={cls} strokeWidth={sw} />
          <rect x={cx - 22} y={cy - 4} width={44} height={8} rx={2} className={cls} strokeWidth={sw} />
          <rect x={cx - 22} y={cy + 8} width={44} height={8} rx={2} className={cls} strokeWidth={sw} />
        </g>
      )
    }
    case 3: {
      // chevron / terminal (CLI)
      return (
        <g>
          <rect x={cx - 22} y={cy - 16} width={44} height={32} rx={3} className={cls} strokeWidth={sw} />
          <path
            d={`M ${cx - 12} ${cy - 6} L ${cx - 4} ${cy} L ${cx - 12} ${cy + 6}`}
            fill="none" strokeWidth={sw - 0.4} strokeLinecap="round"
            className="stroke-primary"
          />
          <line x1={cx - 2} y1={cy + 6} x2={cx + 12} y2={cy + 6} strokeWidth={sw - 0.4} strokeLinecap="round" className="stroke-primary" />
        </g>
      )
    }
    case 4: {
      // raio / webhook (símbolo de evento)
      return (
        <g>
          <circle cx={cx} cy={cy} r={20} className={cls} strokeWidth={sw} />
          <path
            d={`M ${cx + 2} ${cy - 10} L ${cx - 6} ${cy + 1} L ${cx + 1} ${cy + 1} L ${cx - 2} ${cy + 10} L ${cx + 7} ${cy - 1} L ${cx} ${cy - 1} Z`}
            className="fill-primary"
          />
        </g>
      )
    }
    case 5:
    default: {
      // engrenagem simplificada (worker / serviço externo)
      const teeth = 8
      const r1 = 18
      const r2 = 22
      const path = Array.from({ length: teeth * 2 }, (_, k) => {
        const a = (k * Math.PI) / teeth
        const r = k % 2 === 0 ? r2 : r1
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
      }).join(' ')
      return (
        <g>
          <polygon points={path} className={cls} strokeWidth={sw} />
          <circle cx={cx} cy={cy} r={6} className="fill-card stroke-primary" strokeWidth="1.5" />
        </g>
      )
    }
  }
}
