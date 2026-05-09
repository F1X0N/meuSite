import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { Badge } from '@/components/ui/Badge'
import { BackLink } from '@/components/ui/BackLink'
import { getAllCaseStudies, getCaseStudyBySlug } from '@/lib/mdx'
import { getCoverComponent } from '@/components/blog-covers'
import { mdxOptions } from '@/lib/mdx-options'

export async function generateStaticParams() {
  const cases = getAllCaseStudies()
  return cases.map((caseStudy) => ({
    slug: caseStudy.slug,
  }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const caseStudy = getCaseStudyBySlug(slug)

  if (!caseStudy) {
    return {
      title: 'Case Study não encontrado',
    }
  }

  return {
    title: caseStudy.title,
    description: caseStudy.description,
  }
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

const renderCaseHeader = (caseStudy) => (
  <header className="border-b pb-8">
    <div className="text-sm text-muted-foreground mb-4">
      {caseStudy.date}
    </div>
    <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
      {caseStudy.title}
    </h1>
    <p className="mt-4 text-lg text-muted-foreground">
      {caseStudy.description}
    </p>
    <div className="mt-6">
      {renderTags(caseStudy.tags)}
    </div>
  </header>
)

const renderCaseContent = (content) => (
  <article className="prose prose-lg dark:prose-invert max-w-none">
    <MDXRemote source={content} options={mdxOptions} />
  </article>
)

export default async function CaseStudyPage({ params }) {
  const { slug } = await params
  const caseStudy = getCaseStudyBySlug(slug)

  if (!caseStudy) {
    notFound()
  }

  const Cover = getCoverComponent(caseStudy.coverComponent)

  return (
    <div className="py-16 md:py-20 lg:py-24">
      <div className="container max-w-3xl">
        <div className="mb-6">
          <BackLink href="/case-studies" label="Voltar para case studies" />
        </div>
        {Cover && (
          <div
            className="mb-10 cover-interactive"
            style={{ viewTransitionName: `cover-case-${slug}` } as React.CSSProperties}
          >
            <Cover className="w-full h-auto" />
          </div>
        )}
        {renderCaseHeader(caseStudy)}
        <div className="mt-12">
          {renderCaseContent(caseStudy.content)}
        </div>
      </div>
    </div>
  )
}
