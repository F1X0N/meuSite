'use client'

import { motion } from 'framer-motion'
import { TransitionLink } from '@/components/layout/TransitionLink'
import { GIcon } from '@/components/icons/GIcon'
import { useReducedMotion } from '@/hooks/useReducedMotion'

type BackLinkProps = {
  href: string
  label?: string
}

export const BackLink = ({ href, label = 'Voltar' }: BackLinkProps) => {
  const prefersReducedMotion = useReducedMotion()

  const initial = prefersReducedMotion ? false : { opacity: 0, x: -8 }
  const animate = prefersReducedMotion ? undefined : { opacity: 1, x: 0 }
  const transition = prefersReducedMotion ? undefined : { duration: 0.3, ease: 'easeOut' as const }

  return (
    <motion.div initial={initial} animate={animate} transition={transition}>
      <TransitionLink
        href={href}
        className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        <GIcon
          name="arrow_back"
          size={18}
          className="transition-transform group-hover:-translate-x-1 duration-200"
        />
        {label}
      </TransitionLink>
    </motion.div>
  )
}
