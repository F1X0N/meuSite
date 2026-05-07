import type { HTMLAttributes, ReactNode } from 'react'

type CardSlotProps = HTMLAttributes<HTMLDivElement> & { children?: ReactNode }
type CardTitleProps = HTMLAttributes<HTMLHeadingElement> & { children?: ReactNode }
type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement> & { children?: ReactNode }

const buildCardClasses = () =>
  'rounded-2xl border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md'

export const Card = ({ children, className = '', ...props }: CardSlotProps) => (
  <div className={`${buildCardClasses()} ${className}`} {...props}>
    {children}
  </div>
)

export const CardHeader = ({ children, className = '', ...props }: CardSlotProps) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
    {children}
  </div>
)

export const CardTitle = ({ children, className = '', ...props }: CardTitleProps) => (
  <h3
    className={`text-lg font-semibold leading-snug tracking-tight md:text-xl ${className}`}
    {...props}
  >
    {children}
  </h3>
)

export const CardDescription = ({ children, className = '', ...props }: CardDescriptionProps) => (
  <p className={`text-sm text-muted-foreground ${className}`} {...props}>
    {children}
  </p>
)

export const CardContent = ({ children, className = '', ...props }: CardSlotProps) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
)
