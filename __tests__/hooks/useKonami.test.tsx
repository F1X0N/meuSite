import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKonami } from '@/hooks/useKonami'

const dispatchKey = (key: string, target?: EventTarget) => {
  const event = new KeyboardEvent('keydown', { key, bubbles: true })
  if (target) {
    Object.defineProperty(event, 'target', { value: target, writable: false })
  }
  window.dispatchEvent(event)
}

const KONAMI = [
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
]

describe('useKonami', () => {
  it('dispara callback quando a sequência completa é digitada', () => {
    const cb = vi.fn()
    renderHook(() => useKonami(cb))
    act(() => {
      KONAMI.forEach((key) => dispatchKey(key))
    })
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it('não dispara com sequência incompleta', () => {
    const cb = vi.fn()
    renderHook(() => useKonami(cb))
    act(() => {
      KONAMI.slice(0, -1).forEach((key) => dispatchKey(key))
    })
    expect(cb).not.toHaveBeenCalled()
  })

  it('reseta progresso ao digitar tecla errada', () => {
    const cb = vi.fn()
    renderHook(() => useKonami(cb))
    act(() => {
      dispatchKey('ArrowUp')
      dispatchKey('ArrowUp')
      dispatchKey('Escape') // quebra o progresso
      KONAMI.forEach((key) => dispatchKey(key))
    })
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it('aceita B/A em maiúsculo (case-insensitive)', () => {
    const cb = vi.fn()
    renderHook(() => useKonami(cb))
    act(() => {
      KONAMI.slice(0, 8).forEach((key) => dispatchKey(key))
      dispatchKey('B')
      dispatchKey('A')
    })
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it('ignora keystrokes vindos de inputs', () => {
    const cb = vi.fn()
    const input = document.createElement('input')
    document.body.appendChild(input)
    renderHook(() => useKonami(cb))
    act(() => {
      KONAMI.forEach((k) => dispatchKey(k, input))
    })
    expect(cb).not.toHaveBeenCalled()
    document.body.removeChild(input)
  })

  it('detecta nova sequência mesmo logo após disparo anterior', () => {
    const cb = vi.fn()
    renderHook(() => useKonami(cb))
    act(() => {
      KONAMI.forEach((key) => dispatchKey(key))
      KONAMI.forEach((key) => dispatchKey(key))
    })
    expect(cb).toHaveBeenCalledTimes(2)
  })
})
