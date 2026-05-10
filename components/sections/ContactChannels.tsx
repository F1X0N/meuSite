'use client'

import { useCallback, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { GIcon } from '@/components/icons/GIcon'
import { site } from '@/config/site'

type Channel = {
  key: string
  icon: string
  label: string
  display: string
  href: string
  external: boolean
}

const formatHandle = (url: string): string =>
  url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, '')

const formatWhatsapp = (url: string): string => {
  const match = url.match(/wa\.me\/(\d+)/)
  if (!match) return url
  const digits = match[1]
  if (digits.length === 13) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 9)}-${digits.slice(9)}`
  }
  return `+${digits}`
}

const buildChannels = (): Channel[] => [
  {
    key: 'email',
    icon: 'mail',
    label: 'Email',
    display: site.email,
    href: `mailto:${site.email}`,
    external: false,
  },
  {
    key: 'linkedin',
    icon: 'link',
    label: 'LinkedIn',
    display: formatHandle(site.social.linkedin),
    href: site.social.linkedin,
    external: true,
  },
  {
    key: 'github',
    icon: 'code',
    label: 'GitHub',
    display: formatHandle(site.social.github),
    href: site.social.github,
    external: true,
  },
  {
    key: 'whatsapp',
    icon: 'chat',
    label: 'WhatsApp',
    display: formatWhatsapp(site.social.whatsapp),
    href: site.social.whatsapp,
    external: true,
  },
]

type Props = { className?: string }

export const ContactChannels = ({ className = '' }: Props) => {
  const channels = buildChannels()
  const [copied, setCopied] = useState(false)

  const onCopyEmail = useCallback(async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    try {
      await navigator.clipboard.writeText(site.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle as="h3">Canais diretos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {channels.map((channel) => (
          <a
            key={channel.key}
            href={channel.href}
            target={channel.external ? '_blank' : undefined}
            rel={channel.external ? 'noopener noreferrer' : undefined}
            className="group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 hover:border-border hover:bg-muted/40 transition-colors"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <GIcon name={channel.icon} size={20} />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-medium text-foreground">
                {channel.label}
              </span>
              <span className="block truncate text-xs text-muted-foreground font-mono">
                {channel.display}
              </span>
            </span>
            {channel.key === 'email' && (
              <button
                type="button"
                onClick={onCopyEmail}
                className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-primary hover:border-primary/60 transition-colors"
                aria-label="Copiar email"
              >
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            )}
          </a>
        ))}
      </CardContent>
    </Card>
  )
}
