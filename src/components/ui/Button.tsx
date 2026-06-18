import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'accent' | 'outline' | 'ghost' | 'whatsapp'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  className?: string
  as?: 'button' | 'a'
  href?: string
}

const variantStyles: Record<string, string> = {
  accent: 'bg-accent text-black font-semibold hover:bg-accent-dark transition-colors',
  outline: 'border border-border text-text-secondary hover:text-white hover:border-text-muted transition-colors',
  ghost: 'text-text-secondary hover:text-white transition-colors',
  whatsapp: 'bg-[#25D366] text-white font-semibold hover:bg-[#20bd5a] transition-colors',
}

const sizeStyles: Record<string, string> = {
  sm: 'text-xs py-2 px-4',
  md: 'text-sm py-3 px-6',
  lg: 'text-base py-4 px-8',
}

export function Button({
  variant = 'accent',
  size = 'md',
  className,
  children,
  as,
  href,
  ...props
}: ButtonProps) {
  const cls = cn(
    'inline-flex items-center justify-center gap-2 rounded-md font-elegant font-semibold transition-all duration-200',
    variantStyles[variant],
    sizeStyles[size],
    className
  )

  if (as === 'a' && href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    )
  }

  return (
    <button className={cls} {...props}>
      {children}
    </button>
  )
}
