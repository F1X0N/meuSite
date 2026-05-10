'use client'

import { useEffect, useRef } from 'react'

const PRIMARY = 'color: hsl(193 70% 45%); font-weight: 700;'
const MUTED = 'color: #888;'

/**
 * Imprime um convite no console do browser para devs curiosos que abrem
 * o devtools. Roda uma vez por mount.
 *
 * Sem env vars privadas, sem secrets. Apenas convite e link público do repo.
 */
export const ConsoleArt = () => {
  const printedRef = useRef(false)

  useEffect(() => {
    if (printedRef.current) return
    printedRef.current = true
    if (typeof window === 'undefined') return

    const lines = [
      '%cjsv · josivan amorim%c',
      'stack · next 15 · react 19 · tailwind · ai sdk',
      'source · github.com/F1X0N/meuSite',
      'dica · ⌘+K e digite %c:hire%c, %c:source%c, %c:matrix%c · ou tente %c↑↑↓↓←→←→BA',
    ].join('\n')

    // eslint-disable-next-line no-console
    console.log(
      lines,
      PRIMARY,
      MUTED,
      PRIMARY,
      MUTED,
      PRIMARY,
      MUTED,
      PRIMARY,
      MUTED,
      PRIMARY,
    )
  }, [])

  return null
}
