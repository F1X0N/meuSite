'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SearchBar } from '@/components/ui/SearchBar'

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

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const renderPostCard = (post) => (
  <Card key={post.slug}>
    <CardHeader>
      <div className="text-sm text-muted-foreground">
        {formatDate(post.date)} · {post.readingTime}
      </div>
      <CardTitle as="h2">{post.title}</CardTitle>
      <CardDescription>{post.description}</CardDescription>
      <div className="mt-4 space-y-3">
        {renderTags(post.tags)}
        <Link href={`/blog/${post.slug}`}>
          <Button variant="ghost" size="sm">
            Ler artigo →
          </Button>
        </Link>
      </div>
    </CardHeader>
  </Card>
)

const sortPosts = (posts) => {
  return [...posts].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}

const renderPostCards = (posts) => {
  const sortedPosts = sortPosts(posts)
  return sortedPosts.map(renderPostCard)
}

const renderResultsCount = (count, total) => {
  if (count === total) return null

  return (
    <p className="text-sm text-muted-foreground">
      {count} {count === 1 ? 'resultado encontrado' : 'resultados encontrados'} de {total}
    </p>
  )
}

export default function BlogClient({ initialPosts }) {
  const [filteredPosts, setFilteredPosts] = useState(initialPosts)

  return (
    <div className="py-16 md:py-20 lg:py-24">
      <div className="container">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Blog
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl">
          Artigos técnicos sobre IA, engenharia de software, padrões de
          arquitetura e lições aprendidas em produção.
        </p>

        <div className="mt-8">
          <SearchBar items={initialPosts} onFilteredResults={setFilteredPosts} />
        </div>

        <div className="mt-6">
          {renderResultsCount(filteredPosts.length, initialPosts.length)}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {renderPostCards(filteredPosts)}
        </div>
      </div>
    </div>
  )
}
