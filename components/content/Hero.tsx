import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { HeroNetworkGraph } from '@/components/content/HeroNetworkGraph'
import { copy } from '@/config/copy'

const renderCTA = () => (
  <div className="flex flex-wrap gap-3">
    <Link href="/case-studies">
      <Button variant="primary" size="lg">
        {copy.hero.cta.primary}
      </Button>
    </Link>
    <Link href="#ai-tools">
      <Button variant="outline" size="lg">
        Conversar com a IA do site
      </Button>
    </Link>
  </div>
)

const renderSignalRow = () => {
  const signals = [
    { label: 'IA com controle humano', glyph: '◆' },
    { label: 'Observabilidade', glyph: '◇' },
    { label: 'Engenharia operacional', glyph: '◈' },
  ]
  return (
    <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
      {signals.map((signal) => (
        <li key={signal.label} className="inline-flex items-center gap-2">
          <span className="text-primary" aria-hidden="true">{signal.glyph}</span>
          {signal.label}
        </li>
      ))}
    </ul>
  )
}

export const Hero = () => (
  <section className="relative overflow-hidden py-16 md:py-20 lg:py-24">
    <div className="container">
      <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
            IA aplicada · Observabilidade · Operação
          </div>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl lg:text-6xl text-balance">
            {copy.hero.title.split(' ').map((word, i, arr) => {
              const isLast = i === arr.length - 1
              const isHighlight = /respons|operacional/i.test(word)
              return (
                <span key={i} className={isHighlight ? 'text-primary' : ''}>
                  {word}{!isLast ? ' ' : ''}
                </span>
              )
            })}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed md:mt-8">
            {copy.hero.subtitle}
          </p>
          <div className="mt-8 md:mt-10">
            {renderCTA()}
          </div>
          {renderSignalRow()}
        </div>

        <div className="lg:col-span-5">
          <div className="relative mx-auto max-w-md lg:max-w-none">
            <HeroNetworkGraph />
          </div>
        </div>
      </div>
    </div>
  </section>
)
