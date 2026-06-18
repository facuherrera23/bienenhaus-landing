import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface BadgeProps {
  children: ReactNode
  variant?: 'status' | 'type' | 'featured' | 'price' | 'sold' | 'accent' | 'default'
  className?: string
}

const variantStyles: Record<string, string> = {
  status: 'bg-accent/15 text-accent border-accent/20',
  type: 'bg-white/5 text-text-secondary border-white/10',
  featured: 'bg-accent text-black font-semibold border-accent',
  price: 'bg-black/60 backdrop-blur-sm text-white border-0',
  sold: 'bg-white/10 text-text-muted border-white/5',
  accent: 'bg-accent/10 text-accent border-accent/20',
  default: 'bg-surface-3 text-text-secondary border-border',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-2xs tracking-badge uppercase font-elegant font-semibold px-3 py-1 rounded-full border',
        variantStyles[variant] || variantStyles.default,
        className
      )}
    >
      {children}
    </span>
  )
}
