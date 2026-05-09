import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { copy } from '@/config/copy'

type Highlight = {
  title: string
  description: string
  tags: string[]
}

const renderTag = (tag: string) => (
  <Badge key={tag} variant="secondary">
    {tag}
  </Badge>
)

const renderTags = (tags: string[]) => (
  <div className="flex flex-wrap gap-2">
    {tags.map(renderTag)}
  </div>
)

const formatIndex = (i: number) => String(i + 1).padStart(2, '0')

const renderFeaturedCard = (highlight: Highlight, index: number) => (
  <Card
    key={highlight.title}
    className="lg:col-span-2 lg:row-span-2 relative overflow-hidden bg-gradient-to-br from-primary/10 via-card to-card"
  >
    <CardHeader className="h-full justify-between gap-6 p-8 md:p-10">
      <div className="flex items-baseline gap-3 text-primary">
        <span className="font-mono text-sm tracking-wider">{formatIndex(index)}</span>
        <span className="h-px flex-1 bg-primary/40" aria-hidden="true" />
      </div>
      <div className="space-y-4">
        <CardTitle className="text-2xl md:text-3xl tracking-tight text-balance">
          {highlight.title}
        </CardTitle>
        <CardDescription className="text-base leading-relaxed">
          {highlight.description}
        </CardDescription>
      </div>
      <div className="mt-2">
        {renderTags(highlight.tags)}
      </div>
    </CardHeader>
  </Card>
)

const renderCompactCard = (highlight: Highlight, index: number) => (
  <Card key={highlight.title} className="lg:col-span-1">
    <CardHeader className="space-y-3">
      <div className="flex items-baseline gap-2 text-primary">
        <span className="font-mono text-xs tracking-wider">{formatIndex(index)}</span>
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>
      <CardTitle as="h3" className="tracking-tight">{highlight.title}</CardTitle>
      <CardDescription>{highlight.description}</CardDescription>
      <div className="pt-1">
        {renderTags(highlight.tags)}
      </div>
    </CardHeader>
  </Card>
)

const renderHighlightCards = (highlights: Highlight[]) => {
  const [featured, ...compact] = highlights
  return (
    <>
      {renderFeaturedCard(featured, 0)}
      {compact.map((highlight, idx) => renderCompactCard(highlight, idx + 1))}
    </>
  )
}

export const Highlights = () => (
  <section className="py-16 md:py-20 border-t">
    <div className="container">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Provas Objetivas</h2>
        <p className="mt-3 text-muted-foreground">
          Três princípios que se repetem em todo o trabalho técnico que entrego.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:auto-rows-fr">
        {renderHighlightCards(copy.highlights)}
      </div>
    </div>
  </section>
)
