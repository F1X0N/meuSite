'use client'

import type { ReactNode } from 'react'

/**
 * Wrapper de transição entre rotas — DESABILITADO temporariamente.
 *
 * Versões anteriores tentaram fade entre rotas com framer-motion + key=pathname,
 * mas hit dois bugs sucessivos com Next App Router + React 19:
 *  1. AnimatePresence + mode="wait" → motion.div novo monta com initial e nunca
 *     anima para animate.
 *  2. Sem AnimatePresence, motion.div ainda fica stuck em initial state em dev e
 *     em parte das navegações em prod.
 *
 * Implementação atual: passthrough (sem fade entre rotas). As animações de scroll
 * dentro de cada página (Reveal, StaggerContainer em components/motion) continuam
 * funcionando normalmente — só perdemos a transição entre rotas.
 *
 * Reabilitar quando framer-motion publicar fix oficial ou quando migrarmos para
 * View Transitions API nativa (Next 15.4+).
 */
export const PageTransition = ({ children }: { children: ReactNode }) => {
  return <>{children}</>
}
