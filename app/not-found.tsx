import { getAllBlogPosts, getAllCaseStudies } from '@/lib/mdx'
import { NotFoundClient } from './not-found-client'

export const metadata = { title: 'Rota não encontrada' }

export default function NotFoundPage() {
  const posts = getAllBlogPosts().map((p) => ({ slug: p.slug, title: p.title }))
  const cases = getAllCaseStudies().map((c) => ({ slug: c.slug, title: c.title }))
  return <NotFoundClient posts={posts} cases={cases} />
}
