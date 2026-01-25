import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { copy } from '@/config/copy'

const renderTag = (tag) => (
  <Badge key={tag} variant="secondary">
    {tag}
  </Badge>
)

const renderTags = (tags) => (
  <div className="flex flex-wrap gap-2">
    {tags.map(renderTag)}
  </div>
)

const renderHighlightCard = (highlight, index) => (
  <Card key={index}>
    <CardHeader>
      <CardTitle>{highlight.title}</CardTitle>
      <CardDescription>{highlight.description}</CardDescription>
      <div className="mt-4">
        {renderTags(highlight.tags)}
      </div>
    </CardHeader>
  </Card>
)

const renderHighlightCards = (highlights) =>
  highlights.map(renderHighlightCard)

export const Highlights = () => (
  <section className="py-16 md:py-20 border-t">
    <div className="container">
      <h2 className="text-2xl font-bold md:text-3xl">Provas Objetivas</h2>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {renderHighlightCards(copy.highlights)}
      </div>
    </div>
  </section>
)
