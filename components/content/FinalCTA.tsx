import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { copy } from '@/config/copy'
import { site } from '@/config/site'

const renderContactButton = ([platform, url]) => {
  const labels = {
    linkedin: 'LinkedIn',
    github: 'GitHub',
  }

  return (
    <Link key={platform} href={url} target="_blank" rel="noopener noreferrer">
      <Button variant="outline" size="lg">
        {labels[platform] || platform}
      </Button>
    </Link>
  )
}

const renderContactButtons = () =>
  Object.entries(site.social)
    .filter(([platform]) => ['linkedin', 'github'].includes(platform))
    .map(renderContactButton)

export const FinalCTA = () => (
  <section className="py-16 md:py-20 border-t">
    <div className="container">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-bold md:text-3xl">
          {copy.contact.title}
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          {copy.contact.description}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href={`mailto:${site.email}`}>
            <Button variant="primary" size="lg">
              Enviar Email
            </Button>
          </Link>
          {renderContactButtons()}
        </div>
      </div>
    </div>
  </section>
)
