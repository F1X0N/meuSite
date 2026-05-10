'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Command } from 'cmdk'
import { site } from '@/config/site'
import { GIcon } from '@/components/icons/GIcon'
import { useEasterEggs } from '@/components/easter/EasterEggProvider'

type NavItem = {
  label: string
  action: () => void
  icon?: string
  group: string
}

export const CommandPalette = () => {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const { triggerMatrix, reset: resetEasterEggs } = useEasterEggs()

  // Garantir que só renderiza no client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Limpa o input quando a palette fecha. Evita que o grupo "secret"
  // permaneça visível na próxima abertura por causa de um ":" antigo.
  useEffect(() => {
    if (!open) setInputValue('')
  }, [open])

  // Scroll para seção na Home
  const scrollToSection = useCallback((id: string) => {
    if (pathname !== '/') {
      // Se não está na home, navega primeiro
      router.push(`/#${id}`)
    } else {
      // Scroll suave para a seção
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
    setOpen(false)
  }, [pathname, router])

  // Navegar para página
  const navigateToPage = useCallback((href: string) => {
    router.push(href)
    setOpen(false)
  }, [router])

  // Ações utilitárias
  const copyEmail = useCallback(() => {
    navigator.clipboard.writeText(site.email)
    setOpen(false)
  }, [])

  const openExternal = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
    setOpen(false)
  }, [])

  const showSecret = inputValue.trim().startsWith(':')

  const closeAndClear = useCallback(() => {
    setOpen(false)
    setInputValue('')
  }, [])

  const secretItems: NavItem[] = useMemo(() => [
    {
      label: ':hire — abrir contato como recrutador',
      action: () => {
        // Rota direta para /#contact preservando a query.
        // /contact redireciona dropando search string (ver app/contact/page.tsx).
        router.push('/?intent=hire#contact')
        closeAndClear()
      },
      icon: 'work',
      group: 'Secret',
    },
    {
      label: ':source — repositório no GitHub',
      action: () => {
        openExternal('https://github.com/F1X0N/meuSite')
        closeAndClear()
      },
      icon: 'code',
      group: 'Secret',
    },
    {
      label: ':matrix — ativar overlay matrix por 8s',
      action: () => {
        triggerMatrix()
        closeAndClear()
      },
      icon: 'auto_awesome',
      group: 'Secret',
    },
    {
      label: ':reset — desativar easter eggs',
      action: () => {
        resetEasterEggs()
        closeAndClear()
      },
      icon: 'restart_alt',
      group: 'Secret',
    },
  ], [router, openExternal, triggerMatrix, resetEasterEggs, closeAndClear])

  // Construir lista de itens
  const navItems: NavItem[] = [
    // Seções da Home
    ...site.nav.sections.map(section => ({
      label: section.label,
      action: () => scrollToSection(section.id),
      icon: section.id === 'ai-tools' ? 'smart_toy'
        : section.id === 'experience' ? 'work_history'
          : section.id === 'highlights' ? 'star'
            : section.id === 'about' ? 'person'
              : section.id === 'contact' ? 'mail' : undefined,
      group: 'Seções',
    })),
    // Páginas dedicadas
    ...site.nav.pages.map(page => ({
      label: page.label,
      action: () => navigateToPage(page.href),
      icon: page.href === '/case-studies' ? 'cases' : 'article',
      group: 'Páginas',
    })),
    // Ações
    { label: 'Copiar email', action: copyEmail, icon: 'content_copy', group: 'Ações' },
    { label: 'Abrir LinkedIn', action: () => openExternal(site.social.linkedin), icon: 'link', group: 'Ações' },
    { label: 'Abrir GitHub', action: () => openExternal(site.social.github), icon: 'code', group: 'Ações' },
    { label: 'Abrir WhatsApp', action: () => openExternal(site.social.whatsapp), icon: 'chat', group: 'Ações' },
    { label: 'Baixar CV (PDF)', action: () => openExternal('/cv.pdf'), icon: 'download', group: 'Ações' },
  ]

  // Agrupar itens. Quando o input começa com ":", mostra apenas o grupo Secret.
  const visibleItems = showSecret ? secretItems : navItems
  const groupedItems = visibleItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {})

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Não renderiza nada se não estiver montado ou não estiver aberto
  if (!mounted || !open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
        <Command
          className="w-full max-w-2xl rounded-lg border bg-background shadow-2xl"
          label="Command Palette"
        >
          <div className="flex items-center border-b px-4">
            <GIcon name="search" size={20} className="text-muted-foreground mr-2" />
            <Command.Input
              value={inputValue}
              onValueChange={setInputValue}
              placeholder="Buscar páginas, seções ou ações..."
              className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
              Nenhum resultado encontrado.
            </Command.Empty>

            {Object.entries(groupedItems).map(([groupName, items]) => (
              <Command.Group key={groupName} heading={groupName} className="px-2 py-2">
                {items.map((item, idx) => (
                  <Command.Item
                    key={`${groupName}-${idx}`}
                    value={item.label}
                    onSelect={item.action}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer hover:bg-accent rounded-lg transition-colors"
                  >
                    {item.icon && <GIcon name={item.icon} size={18} className="text-muted-foreground" />}
                    <span>{item.label}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>

          <div className="border-t px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
            <span>↑↓ navegar</span>
            <span>Enter selecionar</span>
            <span>Esc fechar</span>
          </div>
        </Command>
      </div>
    </>
  )
}
