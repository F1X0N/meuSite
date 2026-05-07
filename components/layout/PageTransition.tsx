'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { ReactNode } from 'react'

const enterVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
}

const enterTransition = {
  duration: 0.3,
  ease: 'easeOut' as const,
}

const exitTransition = {
  duration: 0.2,
  ease: 'easeIn' as const,
}

const noTransition = { duration: 0 }

const scrollToHashIfPresent = (smooth: boolean) => {
  if (typeof window === 'undefined') return
  const hash = window.location.hash
  if (!hash || hash.length < 2) return
  const id = hash.slice(1)
  const target = document.getElementById(id)
  target?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })
}

export const PageTransition = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()

  const initial = prefersReducedMotion ? false : enterVariants.initial
  const exit = prefersReducedMotion ? enterVariants.animate : enterVariants.exit
  const transition = prefersReducedMotion ? noTransition : { ...enterTransition, exit: exitTransition }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={initial}
        animate={enterVariants.animate}
        exit={exit}
        transition={transition}
        onAnimationComplete={() => scrollToHashIfPresent(!prefersReducedMotion)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
