const createRobotsConfig = () => ({
  rules: {
    userAgent: '*',
    allow: '/',
    disallow: ['/api/'],
  },
  sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sitemap.xml`,
})

export default function robots() {
  return createRobotsConfig()
}
