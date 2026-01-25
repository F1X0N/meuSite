type GIconProps = {
  name: string
  size?: 16 | 20 | 24 | 28 | 32
  weight?: 300 | 400 | 500 | 700
  fill?: 0 | 1
  className?: string
}

export const GIcon = ({ 
  name, 
  size = 24, 
  weight = 400, 
  fill = 0, 
  className = '' 
}: GIconProps) => (
  <span
    className={`material-symbols-rounded ${className}`}
    style={{
      fontSize: `${size}px`,
      fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}`,
    }}
  >
    {name}
  </span>
)
