import { getAllBlogPosts } from '@/lib/mdx'
import BlogClient from './client'

export const metadata = {
  title: 'Blog',
  description:
    'Artigos técnicos sobre IA, engenharia de software e boas práticas de desenvolvimento.',
}

export default function BlogPage() {
  const posts = getAllBlogPosts()
  return <BlogClient initialPosts={posts} />
}
