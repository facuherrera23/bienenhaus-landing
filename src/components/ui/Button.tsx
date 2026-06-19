import { cn } from '../../utils/cn'

type ButtonVariant = 'accent' | 'outline' | 'ghost' | 'whatsapp'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'target' | 'rel'> {
  variant?: ButtonVariant
  size?: ButtonSize
  as?: 'button' | 'a'
  href?: string
  target?: string
  rel?: string
}

const variantStyles: Record<ButtonVariant, string> = {
  accent:
    'bg-accent text-black hover:bg-accent-dark font-semibold focus-visible:ring-accent',
  outline:
    'border border-border text-text-secondary hover:text-white hover:border-text-muted focus-visible:ring-text-muted',
  ghost:
    'text-text-secondary hover:text-white hover:bg-white/5 focus-visible:ring-text-muted',
  whatsapp:
    'bg-[#25D366] text-black hover:bg-[#20bd5a] font-semibold focus-visible:ring-[#25D366]',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'py-3 px-4 text-xs',
  md: 'py-4 px-6 text-sm',
  lg: 'py-4 px-8 text-sm',
}

export function Button({
  variant = 'accent',
  size = 'md',
  as = 'button',
  href,
  className,
  ...props
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 font-elegant rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed',
    variantStyles[variant],
    sizeStyles[size],
    className
  )

  if (as === 'a' && href) {
    return <a href={href} className={classes} {...(props as any)} />
  }

  return <button className={classes} {...props} />
}
