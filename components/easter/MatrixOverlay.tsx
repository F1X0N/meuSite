'use client'

import { useEffect, useRef } from 'react'
import { useEasterEggs } from './EasterEggProvider'

const GLYPHS = '01アァカサタナハマヤラワガザダバパAEIOU+-=*/<>?'
const FONT_SIZE = 14

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Matrix-style canvas overlay. Roda apenas quando ativado via EasterEggProvider.
 * Se o usuário tem prefers-reduced-motion ativo, renderiza um overlay estático
 * (sem animação) — visual minimo, ainda telegrafa o easter egg.
 *
 * Canvas isolado, sem input externo, sem dangerouslySetInnerHTML.
 */
export const MatrixOverlay = () => {
  const { matrixActive, reset } = useEasterEggs()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!matrixActive) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') reset()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [matrixActive, reset])

  useEffect(() => {
    if (!matrixActive) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = prefersReducedMotion()

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const columnCount = () => Math.floor(canvas.width / FONT_SIZE)
    let drops: number[] = Array.from({ length: columnCount() }, () =>
      Math.floor(Math.random() * canvas.height / FONT_SIZE),
    )

    const onResize = () => {
      drops = Array.from({ length: columnCount() }, () =>
        Math.floor(Math.random() * canvas.height / FONT_SIZE),
      )
    }
    window.addEventListener('resize', onResize)

    let raf: number | null = null

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'hsl(193 70% 55%)'
      ctx.font = `${FONT_SIZE}px ui-monospace, monospace`

      for (let i = 0; i < drops.length; i++) {
        const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        const x = i * FONT_SIZE
        const y = drops[i] * FONT_SIZE
        ctx.fillText(ch, x, y)
        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i] += 1
      }

      raf = window.requestAnimationFrame(draw)
    }

    if (reduce) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'hsl(193 70% 55%)'
      ctx.font = `${FONT_SIZE}px ui-monospace, monospace`
      for (let i = 0; i < drops.length; i++) {
        const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        ctx.fillText(ch, i * FONT_SIZE, (i % 30) * FONT_SIZE + 40)
      }
    } else {
      draw()
    }

    return () => {
      if (raf !== null) window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('resize', onResize)
    }
  }, [matrixActive])

  if (!matrixActive) return null

  return (
    <div
      role="dialog"
      aria-label="Easter egg: matrix overlay"
      className="fixed inset-0 z-[60] pointer-events-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full bg-black" />
      <div className="absolute bottom-4 right-4 pointer-events-auto rounded-md bg-card/90 backdrop-blur px-3 py-2 text-xs font-mono text-muted-foreground border border-border">
        wake up · esc para sair
      </div>
    </div>
  )
}
