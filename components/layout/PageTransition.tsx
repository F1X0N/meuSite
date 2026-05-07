'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { ReactNode } from 'react'

/**
 * Wrapper de transição entre rotas.
 *
 * NÃO usa AnimatePresence + mode="wait": esse padrão tem bug conhecido com Next
 * App Router onde o motion.div novo monta com initial=0 e a animação para
 * animate=1 não dispara, deixando a página invisível até hard reload (CTRL+F5).
 *
 * Versão simplificada: cada rota nova gera um novo motion.div via key=pathname,
 * que entra direto com fade-in. Sem exit animation (Next limpa DOM antigo).
 *
 * Wrapper estável (sempre motion.div) para evitar remount após hidratação para
 * usuários com prefers-reduced-motion. Nesse caso, só zeramos a transition.
 */
export const PageTransition = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      key={pathname}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
