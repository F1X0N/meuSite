'use client'

import Link, { type LinkProps } from 'next/link'
import { useRouter } from 'next/navigation'
import { type AnchorHTMLAttributes, type MouseEvent, type ReactNode, useCallback } from 'react'

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> &
  Pick<LinkProps, 'href' | 'replace' | 'scroll' | 'prefetch'> & {
    children: ReactNode
  }

const isModifiedClick = (e: MouseEvent) =>
  e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0

const supportsViewTransitions = () =>
  typeof document !== 'undefined' &&
  typeof (document as Document & { startViewTransition?: unknown }).startViewTransition === 'function'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const TransitionLink = ({ href, children, onClick, replace, scroll, prefetch, ...rest }: Props) => {
  const router = useRouter()

  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e)
      if (e.defaultPrevented) return
      if (isModifiedClick(e)) return
      if (!supportsViewTransitions() || prefersReducedMotion()) return

      e.preventDefault()
      const target = typeof href === 'string' ? href : href.toString()
      const doc = document as Document & {
        startViewTransition: (cb: () => void) => unknown
      }
      doc.startViewTransition(() => {
        if (replace) {
          router.replace(target, { scroll })
        } else {
          router.push(target, { scroll })
        }
      })
    },
    [href, onClick, replace, router, scroll],
  )

  return (
    <Link href={href} onClick={handleClick} replace={replace} scroll={scroll} prefetch={prefetch} {...rest}>
      {children}
    </Link>
  )
}
