import { CoverFrame } from '@/lib/cover-design'

/**
 * Cover decorativo do side project "4 Dígitos · Mastermind".
 *
 * Mantém a paleta cyan/muted/destructive do portfólio (decisão de tom unificado).
 * Composição visual:
 *   - 4 linhas horizontais representando tentativas progressivas.
 *   - Slots quadrados (rounded rect) com glyphs minimal (•, ✓, ✗).
 *   - Última linha em primary cheio = vitória (4 acertos).
 *
 * Elementos são children diretos do CoverFrame (sem <g>) para que o reveal CSS
 * em globals.css (.cover-frame > path/circle/polygon { opacity: 0 → 1 }) atinja
 * todos eles. Rect não recebe fade pelo CSS atual mas tem stroke/fill via classe.
 */

const SLOT_SIZE = 90
const SLOT_GAP = 18
const ROW_GAP = 28
const ROWS_TOP_Y = 90

type Outcome = 'hit' | 'miss' | 'unknown'
type Row = [Outcome, Outcome, Outcome, Outcome]

const ROWS: Row[] = [
  ['miss', 'unknown', 'miss', 'hit'],
  ['hit', 'miss', 'unknown', 'hit'],
  ['hit', 'hit', 'miss', 'hit'],
  ['hit', 'hit', 'hit', 'hit'],
]

const totalSlotsWidth = SLOT_SIZE * 4 + SLOT_GAP * 3
const SLOTS_X_START = (1200 - totalSlotsWidth) / 2

const slotX = (col: number) => SLOTS_X_START + col * (SLOT_SIZE + SLOT_GAP)
const slotY = (rowIndex: number) => ROWS_TOP_Y + rowIndex * (SLOT_SIZE + ROW_GAP)

type SlotElements = {
  rect: React.ReactElement
  glyph: React.ReactElement | null
}

const buildSlotElements = (
  row: number,
  col: number,
  outcome: Outcome,
  winning: boolean,
): SlotElements => {
  const x = slotX(col)
  const y = slotY(row)
  const cx = x + SLOT_SIZE / 2
  const cy = y + SLOT_SIZE / 2
  const key = `r${row}c${col}`

  const fillClass = winning ? 'fill-primary' : 'fill-card'
  const strokeClass = winning
    ? 'stroke-primary'
    : outcome === 'unknown'
      ? 'stroke-muted-foreground'
      : 'stroke-primary'
  const dasharray = !winning && outcome === 'unknown' ? '6,5' : undefined

  const rect = (
    <rect
      key={`${key}-rect`}
      x={x}
      y={y}
      width={SLOT_SIZE}
      height={SLOT_SIZE}
      rx={12}
      className={`${fillClass} ${strokeClass}`}
      strokeWidth={2.5}
      strokeDasharray={dasharray}
    />
  )

  if (outcome === 'hit') {
    const glyphClass = winning ? 'stroke-primary-foreground' : 'stroke-primary'
    return {
      rect,
      glyph: (
        <path
          key={`${key}-glyph`}
          d={`M ${cx - 16} ${cy} L ${cx - 4} ${cy + 14} L ${cx + 18} ${cy - 16}`}
          fill="none"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={glyphClass}
        />
      ),
    }
  }

  if (outcome === 'miss') {
    return {
      rect,
      glyph: (
        <path
          key={`${key}-glyph`}
          d={`M ${cx - 14} ${cy - 14} L ${cx + 14} ${cy + 14} M ${cx + 14} ${cy - 14} L ${cx - 14} ${cy + 14}`}
          fill="none"
          strokeWidth={3.5}
          strokeLinecap="round"
          className="stroke-destructive"
        />
      ),
    }
  }

  return {
    rect,
    glyph: (
      <circle
        key={`${key}-glyph`}
        cx={cx}
        cy={cy}
        r={6}
        className="fill-muted-foreground/60"
      />
    ),
  }
}

const buildAllElements = () => {
  const rects: React.ReactElement[] = []
  const glyphs: React.ReactElement[] = []

  ROWS.forEach((row, rowIndex) => {
    const winning = rowIndex === ROWS.length - 1
    row.forEach((outcome, col) => {
      const { rect, glyph } = buildSlotElements(rowIndex, col, outcome, winning)
      rects.push(rect)
      if (glyph) glyphs.push(glyph)
    })
  })

  return [...rects, ...glyphs]
}

export const FourDigitsCover = ({ className = '' }: { className?: string }) => (
  <CoverFrame
    title="4 Dígitos · Mastermind"
    subtitle="posições exatas contam"
    ariaLabel="Quatro linhas de tentativas com slots de acerto, erro e desconhecido; última linha mostra os quatro slots como acerto"
    className={className}
  >
    {buildAllElements()}
  </CoverFrame>
)
