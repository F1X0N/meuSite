import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { copy } from '@/config/copy'

const renderCTA = () => (
  <div className="flex flex-wrap gap-4">
    <Link href="/case-studies">
      <Button variant="primary" size="lg">
        {copy.hero.cta.primary}
      </Button>
    </Link>
    <Link href="/contact">
      <Button variant="outline" size="lg">
        {copy.hero.cta.secondary}
      </Button>
    </Link>
  </div>
)

const renderSignalCard = (signal, index) => (
  <div
    key={index}
    className="rounded-lg border bg-card p-4 text-sm shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="font-medium">{signal.title}</div>
    <div className="text-muted-foreground text-xs mt-1">{signal.subtitle}</div>
  </div>
)

const renderSignalCards = () => {
  const signals = [
    { title: 'OCR Híbrido', subtitle: 'Custo/Qualidade' },
    { title: 'Multi-LLM', subtitle: 'Resiliente' },
    { title: 'Paralelismo', subtitle: 'Cloud-native' },
    { title: 'Observabilidade', subtitle: 'FinOps' },
  ]

  return (
    <div className="grid gap-3">
      {signals.map(renderSignalCard)}
    </div>
  )
}

export const Hero = () => (
  <section className="py-16 md:py-20 lg:py-24">
    <div className="container">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-8">
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl md:leading-[1.05] text-balance">
            {copy.hero.title}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed md:mt-8 max-w-3xl">
            {copy.hero.subtitle}
          </p>
          <div className="mt-8 md:mt-10">
            {renderCTA()}
          </div>
        </div>

        <div className="lg:col-span-4">
          {renderSignalCards()}
        </div>
      </div>
    </div>
  </section>
)
