import { cn } from '../../utils/cn'

type BadgeVariant = 'default' | 'status' | 'type' | 'featured' | 'price' | 'sold' | 'accent'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface-3 text-text-secondary border-border',
  status: 'bg-accent/10 text-accent border-accent/20',
  type: 'bg-white/5 text-text-secondary border-white/10',
  featured: 'bg-accent text-black font-semibold border-accent',
  price: 'bg-surface-3 text-white border-border',
  sold: 'bg-error/10 text-error border-error/20',
  accent: 'bg-accent/10 text-accent border-accent/20',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-elegant text-2xs tracking-badge uppercase px-2 py-0.5 rounded border',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
