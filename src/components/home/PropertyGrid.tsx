import type { Property, Rental } from '../../types/property'
import { PropertyCard } from '../property/PropertyCard'
import { Skeleton } from '../ui/Skeleton'

type CardProperty = Property | Rental

interface PropertyGridProps {
  properties: CardProperty[]
  loading: boolean
  operation: 'venta' | 'alquiler'
  page?: number
  pages?: number
  onPageChange?: (page: number) => void
}

function SkeletonCard() {
  return (
    <div className="bg-surface-2 border border-border rounded-lg overflow-hidden">
      <Skeleton className="h-[220px] rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="pt-2 border-t border-border">
          <Skeleton className="h-7 w-28" />
        </div>
      </div>
    </div>
  )
}

export function PropertyGrid({
  properties,
  loading,
  operation,
  page = 1,
  pages = 1,
  onPageChange,
}: PropertyGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (!properties.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-text-muted font-display text-2xl uppercase tracking-tight">
          No hay propiedades disponibles
        </span>
        <span className="text-text-muted font-desc text-sm mt-2">
          Intentá ajustar los filtros de búsqueda
        </span>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property, i) => (
          <PropertyCard
            key={property.id}
            property={property}
            operation={operation}
            index={i}
          />
        ))}
      </div>

      {/* Pagination */}
      {pages > 1 && onPageChange && (
        <div className="flex items-center justify-center gap-2 mt-12">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i + 1)}
              className={`w-10 h-10 rounded-md text-sm font-elegant font-semibold transition-colors ${
                page === i + 1
                  ? 'bg-accent text-black'
                  : 'bg-surface-2 border border-border text-text-secondary hover:text-white'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
