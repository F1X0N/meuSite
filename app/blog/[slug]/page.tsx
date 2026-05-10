import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { Badge } from '@/components/ui/Badge'
import { BackLink } from '@/components/ui/BackLink'
import { PostAside } from '@/components/content/PostAside'
import { getAllBlogPosts, getBlogPostBySlug } from '@/lib/mdx'
import { getCoverComponent } from '@/components/blog-covers'
import { mdxOptions } from '@/lib/mdx-options'
import { mdxComponents } from '@/components/mdx/components'

export async function generateStaticParams() {
  const posts = getAllBlogPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)

  if (!post) {
    return {
      title: 'Post não encontrado',
    }
  }

  return {
    title: post.title,
    description: post.description,
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

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

const renderPostHeader = (post) => (
  <header className="border-b pb-8">
    <div className="text-sm text-muted-foreground mb-4">
      {formatDate(post.date)} · {post.readingTime}
    </div>
    <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
      {post.title}
    </h1>
    <p className="mt-4 text-lg text-muted-foreground">
      {post.description}
    </p>
    <div className="mt-6">
      {renderTags(post.tags)}
    </div>
  </header>
)

const renderPostContent = (content) => (
  <article className="prose prose-lg dark:prose-invert max-w-none">
    <MDXRemote source={content} options={mdxOptions} components={mdxComponents} />
  </article>
)

export default async function BlogPostPage({ params }) {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const Cover = getCoverComponent(post.coverComponent)

  return (
    <div className="py-16 md:py-20 lg:py-24">
      <div className="container">
        <div className="lg:flex lg:items-start lg:gap-8">
          <div className="mx-auto max-w-3xl flex-1 min-w-0">
            <div className="mb-6">
              <BackLink href="/blog" label="Voltar para o blog" />
            </div>
            {Cover && (
              <div
                className="mb-10 cover-interactive"
                style={{ viewTransitionName: `cover-blog-${slug}` } as React.CSSProperties}
              >
                <Cover className="w-full h-auto" />
              </div>
            )}
            {renderPostHeader(post)}
            <div className="mt-12">
              {renderPostContent(post.content)}
            </div>
          </div>
          <PostAside title={post.title} />
        </div>
      </div>
    </div>
  )
}
