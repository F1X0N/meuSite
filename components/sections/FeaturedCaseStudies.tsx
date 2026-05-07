import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Reveal, StaggerContainer } from '@/components/motion/Motion'
import { copy } from '@/config/copy'
import { getAllCaseStudies } from '@/lib/mdx'

const renderCaseTag = (tag) => (
  <Badge key={tag} variant="outline">
    {tag}
  </Badge>
)

const renderCaseTags = (tags) => (
  <div className="flex flex-wrap gap-2">
    {tags.slice(0, 3).map(renderCaseTag)}
  </div>
)

const renderCaseCard = (caseStudy) => (
  <Reveal key={caseStudy.slug}>
    <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader>
        <CardTitle>{caseStudy.title}</CardTitle>
        <CardDescription>{caseStudy.description}</CardDescription>
        <div className="mt-4 space-y-3">
          {renderCaseTags(caseStudy.tags)}
          <Link href={`/case-studies/${caseStudy.slug}`}>
            <Button variant="ghost" size="sm">
              Ler caso →
            </Button>
          </Link>
        </div>
      </CardHeader>
    </Card>
  </Reveal>
)

const renderCaseCards = (cases) => cases.map(renderCaseCard)

export const FeaturedCaseStudies = () => {
  const featuredCases = getAllCaseStudies()
    .filter((c) => c.featured)
    .slice(0, 3)

  return (
    <div className="container">
      <Reveal>
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {copy.featuredCaseStudies.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {copy.featuredCaseStudies.subtitle}
          </p>
        </div>
      </Reveal>

      <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {renderCaseCards(featuredCases)}
      </StaggerContainer>

      <Reveal delay={0.3}>
        <div className="mt-8 text-center">
          <Link href="/case-studies">
            <Button variant="outline">{copy.featuredCaseStudies.cta}</Button>
          </Link>
        </div>
      </Reveal>
    </div>
  )
}

