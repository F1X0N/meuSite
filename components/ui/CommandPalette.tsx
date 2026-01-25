'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'

const createNavItems = () => [
  { label: 'Home', href: '/', group: 'Páginas' },
  { label: 'Case Studies', href: '/case-studies', group: 'Páginas' },
  { label: 'Blog', href: '/blog', group: 'Páginas' },
  { label: 'Sobre', href: '/about', group: 'Páginas' },
  { label: 'Contato', href: '/contact', group: 'Páginas' },
  { label: 'Ask AI — Pergunte qualquer coisa', href: '/ai/ask-my-work', group: 'IA' },
  { label: 'Job Fit — Analise vagas', href: '/ai/job-fit', group: 'IA' },
]

const buildDialogClasses = (open) => {
  if (!open) return 'hidden'
  
  return 'fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4'
}

const renderItem = (router, setOpen) => (item) => (
  <Command.Item
    key={item.href}
    value={item.label}
    onSelect={() => {
      router.push(item.href)
      setOpen(false)
    }}
    className="flex items-center gap-3 px-4 py-3 text-sm cursor-pointer hover:bg-accent rounded-lg transition-colors"
  >
    <span>{item.label}</span>
  </Command.Item>
)

const groupItemsByGroup = (items) => {
  return items.reduce((groups, item) => {
    if (!groups[item.group]) {
      groups[item.group] = []
    }
    groups[item.group].push(item)
    return groups
  }, {})
}

const renderGroup = (router, setOpen) => ([groupName, items]) => (
  <Command.Group key={groupName} heading={groupName} className="px-2 py-2">
    {items.map(renderItem(router, setOpen))}
  </Command.Group>
)

const renderGroups = (router, setOpen, items) => {
  const groups = groupItemsByGroup(items)
  return Object.entries(groups).map(renderGroup(router, setOpen))
}

export const CommandPalette = () => {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const navItems = createNavItems()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((current) => !current)
      }

      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <div className={buildDialogClasses(open)}>
        <Command className="w-full max-w-2xl rounded-lg border bg-background shadow-2xl relative z-50">
          <div className="flex items-center border-b px-4">
            <span className="text-muted-foreground text-sm mr-2">⌘K</span>
            <Command.Input
              placeholder="Buscar páginas..."
              className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
              Nenhum resultado encontrado.
            </Command.Empty>

            {renderGroups(router, setOpen, navItems)}
          </Command.List>

          <div className="border-t px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
            <span>Use ↑↓ para navegar</span>
            <span>Enter para selecionar</span>
            <span>Esc para fechar</span>
          </div>
        </Command>
      </div>
    </>
  )
}
