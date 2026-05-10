'use client'

import { useEffect, useRef } from 'react'

const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
] as const

const isInputElement = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  )
}

/**
 * Listener global da sequência Konami: ↑↑↓↓←→←→BA.
 * Ignora eventos que vêm de inputs (não dispara enquanto o usuário digita).
 * Comparação case-insensitive em B/A.
 *
 * Dispara `onComplete` uma vez por sequência completa. Reseta progresso a cada
 * tecla errada. Sem cleanup de timer (não tem janela de tempo).
 */
export const useKonami = (onComplete: () => void) => {
  const indexRef = useRef(0)
  const callbackRef = useRef(onComplete)

  useEffect(() => {
    callbackRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handler = (event: KeyboardEvent) => {
      if (isInputElement(event.target)) return

      const expected = KONAMI_SEQUENCE[indexRef.current]
      const pressed = event.key
      const matches =
        pressed === expected ||
        (expected.length === 1 && pressed.toLowerCase() === expected)

      if (!matches) {
        indexRef.current = pressed === KONAMI_SEQUENCE[0] ? 1 : 0
        return
      }

      indexRef.current += 1
      if (indexRef.current === KONAMI_SEQUENCE.length) {
        indexRef.current = 0
        callbackRef.current()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}
