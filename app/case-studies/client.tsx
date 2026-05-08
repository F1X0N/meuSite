'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SearchBar } from '@/components/ui/SearchBar'
import {
  DateFilter,
  filterByDateRange,
  type DateFilterRange,
} from '@/components/ui/DateFilter'
import { getCoverComponent } from '@/components/blog-covers'

const renderTag = (tag) => (
  <Badge key={tag} variant="outline">
    {tag}
  </Badge>
)

const renderTags = (tags) => (
  <div className="flex flex-wrap gap-2">
    {tags.slice(0, 3).map(renderTag)}
  </div>
)

const renderCaseCard = (caseStudy) => {
  const Cover = getCoverComponent(caseStudy.coverComponent)
  return (
    <Card key={caseStudy.slug} className="overflow-hidden">
      <CardHeader>
        <div className="text-sm text-muted-foreground">
          {caseStudy.date}
        </div>
        <CardTitle as="h2">{caseStudy.title}</CardTitle>
        <CardDescription>{caseStudy.description}</CardDescription>
        <div className="mt-5 space-y-4">
          {renderTags(caseStudy.tags)}
          <Link href={`/case-studies/${caseStudy.slug}`} className="inline-block">
            <Button variant="ghost" size="sm">
              Ler caso →
            </Button>
          </Link>
        </div>
        {Cover && (
          <div className="mt-5 -mx-6 -mb-6 border-t border-border bg-muted/20">
            <Cover className="w-full h-auto" />
          </div>
        )}
      </CardHeader>
    </Card>
  )
}

const sortCases = (cases) => {
  return [...cases].sort((a, b) => {
    if (a.featured && !b.featured) return -1
    if (!a.featured && b.featured) return 1
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}

const renderCaseCards = (cases) => {
  const sortedCases = sortCases(cases)
  return sortedCases.map(renderCaseCard)
}

const renderResultsCount = (count, total) => {
  if (count === total) return null

  return (
    <p className="text-sm text-muted-foreground">
      {count} {count === 1 ? 'resultado encontrado' : 'resultados encontrados'} de {total}
    </p>
  )
}

export default function CaseStudiesClient({ initialCases }) {
  const [searchFiltered, setSearchFiltered] = useState(initialCases)
  const [dateRange, setDateRange] = useState<DateFilterRange>('all')

  const finalFiltered = useMemo(
    () => filterByDateRange(searchFiltered, dateRange),
    [searchFiltered, dateRange],
  )

  return (
    <div className="py-16 md:py-20 lg:py-24">
      <div className="container">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Case Studies
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl">
          Casos reais de implementação de IA em produção. Cada caso documenta
          contexto, decisões, trade-offs e impacto mensurável.
        </p>

        <div className="mt-8">
          <SearchBar items={initialCases} onFilteredResults={setSearchFiltered} />
        </div>

        <div className="mt-4">
          <DateFilter active={dateRange} onChange={setDateRange} />
        </div>

        <div className="mt-6">
          {renderResultsCount(finalFiltered.length, initialCases.length)}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {renderCaseCards(finalFiltered)}
        </div>
      </div>
    </div>
  )
}
