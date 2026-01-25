import { copy } from '@/config/copy'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

const renderPrinciple = (principle, index) => (
  <li key={index} className="flex gap-3">
    <span className="text-primary">→</span>
    <span>{principle}</span>
  </li>
)

const renderPrinciples = (principles) => (
  <ul className="space-y-2 text-base md:text-lg">
    {principles.map(renderPrinciple)}
  </ul>
)

const renderCTA = (cta) => (
  <Link key={cta.href} href={cta.href}>
    <Button variant="outline">{cta.label}</Button>
  </Link>
)

const renderCTAs = (ctas) => (
  <div className="flex flex-wrap gap-4">
    {ctas.map(renderCTA)}
  </div>
)

export const About = () => (
  <div className="container max-w-4xl">
    <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-center">
      Sobre
    </h2>

    <div className="mt-8 space-y-6 text-base md:text-lg leading-relaxed">
      <p>{copy.about.intro}</p>

      <div>
        <h3 className="text-xl font-semibold mb-4">Como eu trabalho:</h3>
        {renderPrinciples(copy.about.principles)}
      </div>
    </div>

    <div className="mt-8">
      {renderCTAs(copy.about.ctas)}
    </div>
  </div>
)
