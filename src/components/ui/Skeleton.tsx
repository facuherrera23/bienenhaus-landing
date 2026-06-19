import { cn } from '../../utils/cn'

type SkeletonVariant = 'text' | 'card' | 'avatar' | 'image'

interface SkeletonProps {
  variant?: SkeletonVariant
  className?: string
}

export function Skeleton({ variant = 'text', className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-shimmer bg-surface-3 rounded-md',
        variant === 'text' && 'h-4 w-full',
        variant === 'card' && 'h-[300px] w-full rounded-lg',
        variant === 'avatar' && 'h-12 w-12 rounded-full',
        variant === 'image' && 'aspect-[4/3] w-full rounded-lg',
        className
      )}
      aria-hidden="true"
    />
  )
}
