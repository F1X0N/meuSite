'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
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

export const PageTransition = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <>{children}</>
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={enterVariants.initial}
        animate={enterVariants.animate}
        exit={enterVariants.exit}
        transition={{ ...enterTransition, exit: exitTransition }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
