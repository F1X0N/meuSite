'use client'

import Link from 'next/link'
import { useState } from 'react'
import { site } from '@/config/site'
import { ThemeToggle } from './ThemeToggle'
import { GIcon } from '@/components/icons/GIcon'
import { Button } from '@/components/ui/Button'

const buildNavItemClasses = () =>
  'text-sm font-medium transition-colors hover:text-primary'

const getIconForSection = (id) => {
  const icons = {
    'ask-ai': 'bolt',
    'job-fit': 'target',
    'highlights': 'star',
    'about': 'person',
    'contact': 'mail',
  }
  return icons[id] || null
}

const renderSection = (section) => {
  const icon = getIconForSection(section.id)
  
  return (
    <a key={section.id} href={`/#${section.id}`} className={buildNavItemClasses()}>
      <span className="flex items-center gap-1.5">
        {icon && <GIcon name={icon} size={16} />}
        {section.label.replace('⚡', '').replace('🎯', '')}
      </span>
    </a>
  )
}

const renderPage = (page) => (
  <Link key={page.href} href={page.href} className={buildNavItemClasses()}>
    {page.label}
  </Link>
)

const renderSections = (sections) => sections.map(renderSection)
const renderPages = (pages) => pages.map(renderPage)

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-bold flex items-center gap-2">
          <GIcon name="code" size={24} weight={500} />
          {site.name}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {renderPages(site.nav.pages)}
          {renderSections(site.nav.sections)}
          <ThemeToggle />
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <GIcon name={mobileMenuOpen ? 'close' : 'menu'} size={24} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="container py-4 flex flex-col gap-3">
            {renderPages(site.nav.pages)}
            <div className="border-t pt-3 mt-1 flex flex-col gap-3">
              {renderSections(site.nav.sections)}
            </div>
            <div className="border-t pt-3 mt-1">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
