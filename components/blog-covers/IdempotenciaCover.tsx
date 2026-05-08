import { CoverFrame, CoverDot, CoverEdge } from '@/lib/cover-design'

/**
 * Idempotência via state machine.
 *
 * Metáfora visual:
 *   1. 3 setas paralelas vindo da esquerda = mesmo webhook chegando várias vezes.
 *   2. Convergem num único nó central com anel tracejado (a "guarda" da chave composta = dedupe).
 *   3. Pequeno loop tracejado no nó simboliza retry com backoff.
 *   4. Saída ÚNICA em primary com tick (✓) = estado processed (efeito aplicado uma só vez).
 *   5. Desvio destructive curvo com X = dead letter quando todas as tentativas falharam.
 */
export const IdempotenciaCover = ({ className = '' }: { className?: string }) => (
  <CoverFrame
    title="Idempotência · State Machine"
    subtitle="múltiplas chegadas → um único efeito"
    ariaLabel="Três entradas iguais convergem num único nó (dedupe), seguem para processado, com desvio para dead-letter"
    className={className}
  >
    {/* === 3 chegadas idênticas (setas paralelas convergindo) === */}
    <CoverEdge d="M 90 220 L 360 290" variant="muted" width={2} />
    <CoverEdge d="M 70 290 L 360 290" variant="muted" width={2} />
    <CoverEdge d="M 90 360 L 360 290" variant="muted" width={2} />

    {/* pontos de origem (cada um = uma chegada do mesmo webhook) */}
    <CoverDot cx={70} cy={220} r={6} variant="muted" filled />
    <CoverDot cx={50} cy={290} r={6} variant="muted" filled />
    <CoverDot cx={70} cy={360} r={6} variant="muted" filled />

    {/* === Nó central: dedupe + state machine === */}
    {/* anel externo tracejado: representa o "guardião" da chave composta */}
    <circle cx={400} cy={290} r={50} className="fill-card stroke-primary" strokeWidth="2.5" strokeDasharray="3,3" />
    {/* núcleo: o registro único persistido */}
    <CoverDot cx={400} cy={290} r={22} filled />

    {/* === Loop de retry no próprio nó === */}
    <CoverEdge
      d="M 400 240 C 360 200, 320 215, 340 270"
      dashed
      variant="muted"
      width={1.6}
    />
    <CoverDot cx={340} cy={270} r={3.5} variant="muted" filled />

    {/* === Saída única: dedupe → processed === */}
    <CoverEdge d="M 460 290 L 730 290" />
    {/* nó "processed" — primary, cheio, mais largo (estado de sucesso) */}
    <CoverDot cx={780} cy={290} r={28} filled />
    {/* "tick" minimal dentro do nó processed (✓) */}
    <path
      d="M 768 290 L 776 300 L 794 280"
      fill="none"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="stroke-primary-foreground"
    />

    {/* === Desvio destructive: dead-letter === */}
    <CoverEdge
      d="M 410 340 C 500 440, 700 470, 880 470"
      variant="destructive"
      width={2}
    />
    {/* X dentro do nó dead-letter */}
    <circle cx={920} cy={470} r={22} className="fill-card stroke-destructive" strokeWidth="2.5" />
    <path
      d="M 910 460 L 930 480 M 930 460 L 910 480"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="stroke-destructive"
    />
  </CoverFrame>
)
