import { CoverFrame } from '@/lib/cover-design'

/**
 * Cover do side project "Próxima Sessão".
 *
 * Redesenha o símbolo "Match" do app (dois círculos que se cruzam, com o play
 * no cruzamento) na paleta do portfólio:
 *   - Círculo da esquerda: a pessoa, com pontos soltos representando o gosto.
 *   - Círculo da direita: o catálogo, com uma grade de títulos.
 *   - Lente do cruzamento em primary cheio com o play recortado = a obra certa.
 *
 * Elementos são children diretos do CoverFrame (sem <g>) para receber o reveal
 * CSS de globals.css.
 */

const CY = 275
const R = 181.5
const LEFT_CX = 501
const RIGHT_CX = 699
const MID_X = (LEFT_CX + RIGHT_CX) / 2
const HALF_CHORD = Math.sqrt(R * R - ((RIGHT_CX - LEFT_CX) / 2) ** 2)

const LENS_PATH = [
  `M ${MID_X} ${CY - HALF_CHORD}`,
  `A ${R} ${R} 0 0 1 ${MID_X} ${CY + HALF_CHORD}`,
  `A ${R} ${R} 0 0 1 ${MID_X} ${CY - HALF_CHORD}`,
  'Z',
].join(' ')

const PLAY_POINTS = '572,228 648,275 572,322'

const TASTE_DOTS: Array<[number, number, number]> = [
  [405, 205, 9],
  [372, 285, 6],
  [430, 350, 11],
  [455, 262, 5],
]

const CATALOG_COLS = [738, 774, 810]
const CATALOG_ROWS = [195, 245, 295, 345]

const catalogTiles = () =>
  CATALOG_ROWS.flatMap((y, row) =>
    CATALOG_COLS.map((x, col) => (
      <rect
        key={`tile-${row}-${col}`}
        x={x}
        y={y}
        width={26}
        height={36}
        rx={4}
        className="fill-card stroke-muted-foreground"
        strokeWidth={1.5}
      />
    )),
  )

export const ProximaSessaoCover = ({ className = '' }: { className?: string }) => (
  <CoverFrame
    title="Próxima Sessão · Match"
    subtitle="seu gosto encontra o catálogo"
    ariaLabel="Dois círculos que se cruzam, um com pontos de gosto e outro com uma grade de títulos; no cruzamento, um botão de play"
    className={className}
  >
    <circle cx={LEFT_CX} cy={CY} r={R} fill="none" className="stroke-primary" strokeWidth={3} />
    <circle cx={RIGHT_CX} cy={CY} r={R} fill="none" className="stroke-primary" strokeWidth={3} />
    {TASTE_DOTS.map(([cx, cy, r]) => (
      <circle key={`taste-${cx}-${cy}`} cx={cx} cy={cy} r={r} className="fill-primary/70" />
    ))}
    {catalogTiles()}
    <path d={LENS_PATH} className="fill-primary" />
    <polygon points={PLAY_POINTS} strokeLinejoin="round" strokeWidth={10} className="fill-card stroke-card" />
  </CoverFrame>
)
