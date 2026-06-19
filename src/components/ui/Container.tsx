import { cn } from '../../utils/cn'

interface ContainerProps {
  children: React.ReactNode
  className?: string
  as?: 'div' | 'section' | 'article' | 'header' | 'footer'
}

export function Container({ children, className, as: Tag = 'div' }: ContainerProps) {
  return (
    <Tag className={cn('max-w-container mx-auto px-5', className)}>
      {children}
    </Tag>
  )
}
