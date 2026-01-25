import { getAllBlogPosts, getAllCaseStudies } from '@/lib/mdx'
import { site } from '@/config/site'

const escapeXml = (text) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

const formatRFC822Date = (dateString) => {
  return new Date(dateString).toUTCString()
}

const createRssItem = (baseUrl, type) => (item) => {
  const url = `${baseUrl}/${type}/${item.slug}`
  const title = escapeXml(item.title)
  const description = escapeXml(item.description)
  const pubDate = formatRFC822Date(item.date)

  return `
    <item>
      <title>${title}</title>
      <link>${url}</link>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${url}</guid>
    </item>`
}

const createRssChannel = (baseUrl, items) => {
  const title = escapeXml(site.name)
  const description = escapeXml(site.bio)

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${title}</title>
    <link>${baseUrl}</link>
    <description>${description}</description>
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${items.join('')}
  </channel>
</rss>`
}

const combineAndSortContent = (posts, cases) => {
  return [...posts, ...cases].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}

const generateRssFeed = (baseUrl) => {
  const posts = getAllBlogPosts()
  const cases = getAllCaseStudies()
  const allContent = combineAndSortContent(posts, cases)

  const postItems = posts.map(createRssItem(baseUrl, 'blog'))
  const caseItems = cases.map(createRssItem(baseUrl, 'case-studies'))
  const allItems = [...postItems, ...caseItems]

  return createRssChannel(baseUrl, allItems)
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const rssFeed = generateRssFeed(baseUrl)

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
