import Link from 'next/link'
import { site } from '@/config/site'

const renderSocialLink = ([platform, url]) => (
  <Link
    key={platform}
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="text-muted-foreground hover:text-foreground transition-colors"
  >
    {platform}
  </Link>
)

const renderSocialLinks = (social) =>
  Object.entries(social).map(renderSocialLink)

const getCurrentYear = () => new Date().getFullYear()

export const Footer = () => (
  <footer className="border-t">
    <div className="container py-8 md:py-12">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-muted-foreground">
          © {getCurrentYear()} {site.name}
        </p>

        <div className="flex gap-4">
          {renderSocialLinks(site.social)}
        </div>
      </div>
    </div>
  </footer>
)
