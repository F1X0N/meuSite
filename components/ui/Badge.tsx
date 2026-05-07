import type { HTMLAttributes, ReactNode } from 'react'

type BadgeVariant = 'default' | 'secondary' | 'outline'

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant
  children?: ReactNode
}

const buildBadgeClasses = (variant: BadgeVariant) => {
  const variantMap: Record<BadgeVariant, string> = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent',
  }

  const baseClasses =
    'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'

  return `${baseClasses} ${variantMap[variant]}`
}

export const Badge = ({ variant = 'default', children, className = '', ...props }: BadgeProps) => (
  <span className={`${buildBadgeClasses(variant)} ${className}`} {...props}>
    {children}
  </span>
)
