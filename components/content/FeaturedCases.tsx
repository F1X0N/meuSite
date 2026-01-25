import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

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
  <Card key={caseStudy.slug}>
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
)

const renderCaseCards = (cases) => cases.map(renderCaseCard)

export const FeaturedCases = () => {
  const featuredCases = [
    {
      slug: 'ocr-hibrido',
      title: 'OCR Híbrido: Custo vs Qualidade',
      description:
        'Pipeline multi-fase com fallback inteligente entre OCR tradicional e modelos de visão',
      tags: ['OCR', 'Visão', 'FinOps'],
      featured: true,
    },
    {
      slug: 'llm-resiliente',
      title: 'Sistema Multi-LLM Resiliente',
      description:
        'Arquitetura com retry exponencial, fallback entre providers e recovery de JSON',
      tags: ['LLM', 'Resiliência', 'OpenAI'],
      featured: true,
    },
    {
      slug: 'observabilidade',
      title: 'Telemetria Granular em IA',
      description:
        'Rastreamento de tokens, latência e custos por operação com OpenTelemetry',
      tags: ['Telemetria', 'Custo', 'Observabilidade'],
      featured: true,
    },
  ]

  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold md:text-3xl">Case Studies</h2>
          <Link href="/case-studies">
            <Button variant="link">Ver todos →</Button>
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {renderCaseCards(featuredCases)}
        </div>
      </div>
    </section>
  )
}
