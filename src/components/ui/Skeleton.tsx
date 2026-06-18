import { cn } from '../../lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'card' | 'text' | 'avatar' | 'image'
}

const variantStyles: Record<string, string> = {
  card: 'h-[380px]',
  text: 'h-4 w-full',
  avatar: 'h-10 w-10 rounded-full',
  image: 'h-[260px]',
}

export function Skeleton({ className, variant }: SkeletonProps) {
  return <div className={cn('skeleton-pulse', variant ? variantStyles[variant] : '', className)} />
}
