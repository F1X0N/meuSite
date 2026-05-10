'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'

type EasterEggContextValue = {
  matrixActive: boolean
  triggerMatrix: (durationMs?: number) => void
  reset: () => void
}

const EasterEggContext = createContext<EasterEggContextValue | null>(null)

const DEFAULT_MATRIX_DURATION_MS = 8000

export const EasterEggProvider = ({ children }: { children: ReactNode }) => {
  const [matrixActive, setMatrixActive] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  const clearMatrixTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const triggerMatrix = useCallback(
    (durationMs = DEFAULT_MATRIX_DURATION_MS) => {
      if (typeof window === 'undefined') return
      clearMatrixTimer()
      setMatrixActive(true)
      timeoutRef.current = window.setTimeout(() => {
        setMatrixActive(false)
        timeoutRef.current = null
      }, durationMs)
    },
    [clearMatrixTimer],
  )

  const reset = useCallback(() => {
    clearMatrixTimer()
    setMatrixActive(false)
  }, [clearMatrixTimer])

  useEffect(() => clearMatrixTimer, [clearMatrixTimer])

  return (
    <EasterEggContext.Provider value={{ matrixActive, triggerMatrix, reset }}>
      {children}
    </EasterEggContext.Provider>
  )
}

export const useEasterEggs = (): EasterEggContextValue => {
  const ctx = useContext(EasterEggContext)
  if (!ctx) {
    return { matrixActive: false, triggerMatrix: () => {}, reset: () => {} }
  }
  return ctx
}
