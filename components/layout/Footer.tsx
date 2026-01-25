import Link from 'next/link'
import { site } from '@/config/site'
import { GIcon } from '@/components/icons/GIcon'

const socialIcons: Record<string, string> = {
  github: 'code',
  linkedin: 'link',
  whatsapp: 'chat',
}

const renderSocialLink = ([platform, url]: [string, string]) => {
  const icon = socialIcons[platform]
  if (!icon) return null

  return (
    <Link
      key={platform}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      aria-label={`Visitar ${platform}`}
    >
      <GIcon name={icon} size={20} />
    </Link>
  )
}

const getCurrentYear = () => new Date().getFullYear()

export const Footer = () => (
  <footer className="border-t">
    <div className="container py-8 md:py-12">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-muted-foreground">
          © {getCurrentYear()} {site.name}
        </p>

        <div className="flex items-center gap-1">
          {Object.entries(site.social).map(renderSocialLink)}
        </div>
      </div>
    </div>
  </footer>
)

