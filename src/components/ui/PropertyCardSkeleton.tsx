import { Skeleton } from './Skeleton'

export function PropertyCardSkeleton() {
  return (
    <div className="bg-surface-2 border border-border rounded-lg overflow-hidden">
      <Skeleton variant="image" className="rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton variant="text" className="h-5 w-3/4" />
        <Skeleton variant="text" className="h-3 w-1/2" />
        <div className="flex gap-3">
          <Skeleton variant="text" className="h-3 w-16" />
          <Skeleton variant="text" className="h-3 w-16" />
          <Skeleton variant="text" className="h-3 w-16" />
        </div>
        <div className="pt-3 border-t border-border">
          <Skeleton variant="text" className="h-5 w-1/3" />
        </div>
      </div>
    </div>
  )
}
