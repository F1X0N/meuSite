import { getAllCaseStudies, getAllBlogPosts } from '@/lib/mdx'

const createSitemapEntry = (baseUrl, path, lastModified, priority) => ({
  url: `${baseUrl}${path}`,
  lastModified,
  changeFrequency: 'weekly',
  priority,
})

const createStaticPages = (baseUrl) => [
  createSitemapEntry(baseUrl, '', new Date(), 1.0),
  createSitemapEntry(baseUrl, '/about', new Date(), 0.8),
  createSitemapEntry(baseUrl, '/contact', new Date(), 0.8),
  createSitemapEntry(baseUrl, '/case-studies', new Date(), 0.9),
  createSitemapEntry(baseUrl, '/blog', new Date(), 0.9),
]

const createCasePages = (baseUrl, cases) => {
  return cases.map((caseStudy) =>
    createSitemapEntry(
      baseUrl,
      `/case-studies/${caseStudy.slug}`,
      new Date(caseStudy.date),
      caseStudy.featured ? 0.9 : 0.7
    )
  )
}

const createBlogPages = (baseUrl, posts) => {
  return posts.map((post) =>
    createSitemapEntry(
      baseUrl,
      `/blog/${post.slug}`,
      new Date(post.date),
      0.7
    )
  )
}

const generateSitemap = (baseUrl) => {
  const cases = getAllCaseStudies()
  const posts = getAllBlogPosts()

  const staticPages = createStaticPages(baseUrl)
  const casePages = createCasePages(baseUrl, cases)
  const blogPages = createBlogPages(baseUrl, posts)

  return [...staticPages, ...casePages, ...blogPages]
}

export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return generateSitemap(baseUrl)
}
