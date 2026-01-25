const createVariantClasses = () => ({
  primary:
    'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline:
    'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
})

const createSizeClasses = () => ({
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 py-2',
  lg: 'h-11 px-8 text-lg',
})

const buildButtonClasses = (variant, size) => {
  const variantClasses = createVariantClasses()
  const sizeClasses = createSizeClasses()
  const baseClasses =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

  return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`
}

export const Button = ({ variant = 'primary', size = 'md', children, ...props }) => (
  <button className={buildButtonClasses(variant, size)} {...props}>
    {children}
  </button>
)
