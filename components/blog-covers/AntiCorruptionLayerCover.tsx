import { CoverFrame, CoverHex, CoverEdge } from '@/lib/cover-design'

/**
 * Anti-Corruption Layer (ACL) entre LLM e domínio.
 *
 * Programador sem contexto deve entender ao olhar:
 *   - Esquerda: LLM produz 4 formas heterogêneas (sem pré-classificar como erro:
 *     "tudo que sai do LLM é não-confiável até a validação dizer o contrário").
 *   - Centro: barreira vertical sólida e dominante com símbolo "{}" (schema).
 *   - DEPOIS da barreira: a triagem fica visível —
 *       · 2 setas primary continuam pra direita (válidas → domínio)
 *       · 2 setas destructive desviam pra fora (rejeitadas, voltam ao chamador)
 *   - Direita: domínio = hexágono regular preenchido (forma limpa, intocada).
 */
export const AntiCorruptionLayerCover = ({ className = '' }: { className?: string }) => {
  const barrierX = 580
  const barrierTop = 130
  const barrierBottom = 460
  const domainX = 970
  const domainCy = 295

  return (
    <CoverFrame
      title="Anti-Corruption Layer"
      subtitle="saída do LLM passa por validação · só formas válidas alcançam o domínio"
      ariaLabel="Quatro saídas heterogêneas do LLM passam por barreira de validação; válidas continuam ao domínio, rejeitadas desviam"
      className={className}
    >
      {/* === LADO ESQUERDO: 4 saídas heterogêneas do LLM === */}
      {/* Forma 1: círculo */}
      <circle cx={150} cy={170} r={20} className="fill-card stroke-muted-foreground" strokeWidth="2" />
      {/* Forma 2: triângulo */}
      <polygon points="130,255 170,255 150,220" className="fill-card stroke-muted-foreground" strokeWidth="2" />
      {/* Forma 3: quadrado */}
      <rect x={130} y={325} width={40} height={40} className="fill-card stroke-muted-foreground" strokeWidth="2" />
      {/* Forma 4: losango */}
      <polygon points="150,400 175,425 150,450 125,425" className="fill-card stroke-muted-foreground" strokeWidth="2" />

      {/* === Setas das 4 formas indo até a barreira (todas iguais, sem pré-classificar) === */}
      <CoverEdge d="M 175 175 L 555 280" variant="muted" width={1.5} arrow={false} />
      <CoverEdge d="M 175 240 L 555 290" variant="muted" width={1.5} arrow={false} />
      <CoverEdge d="M 175 345 L 555 305" variant="muted" width={1.5} arrow={false} />
      <CoverEdge d="M 175 425 L 555 315" variant="muted" width={1.5} arrow={false} />

      {/* === BARREIRA: linha vertical sólida e dominante === */}
      <line
        x1={barrierX}
        y1={barrierTop}
        x2={barrierX}
        y2={barrierBottom}
        strokeWidth="5"
        strokeLinecap="round"
        className="stroke-primary"
      />

      {/* Símbolo do schema dentro da barreira (círculo branco com {}) */}
      <circle cx={barrierX} cy={295} r={36} className="fill-card stroke-primary" strokeWidth="3" />
      <text
        x={barrierX} y={307}
        textAnchor="middle"
        fontSize="28"
        fontWeight="700"
        fontFamily="ui-monospace, SFMono-Regular, Menorah, Consolas, monospace"
        className="fill-primary"
      >{'{ }'}</text>

      {/* === DEPOIS DA BARREIRA: a triagem === */}

      {/* VÁLIDAS (2 setas primary atravessando até o domínio) */}
      <CoverEdge d={`M 620 285 L ${domainX - 80} ${domainCy - 8}`} variant="primary" width={2.5} />
      <CoverEdge d={`M 620 305 L ${domainX - 80} ${domainCy + 8}`} variant="primary" width={2.5} />

      {/* REJEITADAS (2 setas destructive desviando pra cima e pra baixo, saindo da barreira) */}
      <CoverEdge
        d={`M 620 220 C 700 180, 700 150, 720 130`}
        variant="destructive"
        width={2.2}
      />
      <CoverEdge
        d={`M 620 380 C 700 420, 700 450, 720 470`}
        variant="destructive"
        width={2.2}
      />

      {/* Pequenos X nas pontas das setas rejeitadas pra reforçar "rejeição" */}
      <g transform="translate(720, 130)">
        <circle r={10} className="fill-card stroke-destructive" strokeWidth="2" />
        <path d="M -4 -4 L 4 4 M 4 -4 L -4 4" strokeWidth="2" strokeLinecap="round" className="stroke-destructive" />
      </g>
      <g transform="translate(720, 470)">
        <circle r={10} className="fill-card stroke-destructive" strokeWidth="2" />
        <path d="M -4 -4 L 4 4 M 4 -4 L -4 4" strokeWidth="2" strokeLinecap="round" className="stroke-destructive" />
      </g>

      {/* === DOMÍNIO (direita): hexágono regular === */}
      <CoverHex cx={domainX} cy={domainCy} size={85} variant="primary" filled />
    </CoverFrame>
  )
}
