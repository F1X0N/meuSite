'use client'

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { motionVariants } from '@/config/motion'

type RevealProps = {
  children: React.ReactNode
  className?: string
  delay?: number
}

export const Reveal = ({ children, className = '', delay = 0 }: RevealProps) => {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={motionVariants.revealUp}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

type StaggerContainerProps = {
  children: React.ReactNode
  className?: string
}

export const StaggerContainer = ({ children, className = '' }: StaggerContainerProps) => {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={motionVariants.stagger}
      className={className}
    >
      {children}
    </motion.div>
  )
}

type FadeInProps = {
  children: React.ReactNode
  className?: string
  delay?: number
}

export const FadeIn = ({ children, className = '', delay = 0 }: FadeInProps) => {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
