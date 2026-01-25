import { getAllBlogPosts } from '@/lib/mdx'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { copy } from '@/config/copy'
import Link from 'next/link'

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
      <CardTitle>{post.title}</CardTitle>
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

const renderPosts = (posts) => {
  const sortedPosts = [...posts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
  
  return sortedPosts.map(renderPostCard)
}

export const FeaturedBlog = () => {
  const posts = getAllBlogPosts()

  return (
    <div className="container">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          {copy.featuredBlog.title}
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          {copy.featuredBlog.subtitle}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
        {renderPosts(posts)}
      </div>

      <div className="mt-8 text-center">
        <Link href="/blog">
          <Button variant="outline">{copy.featuredBlog.cta}</Button>
        </Link>
      </div>
    </div>
  )
}
