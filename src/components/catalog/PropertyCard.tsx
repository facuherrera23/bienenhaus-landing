import { cn } from '../../utils/cn'
import { Badge } from '../ui/Badge'
import type { PropertyCardData } from '../../types/property'
import { fmtPrice, fmtType, fmtStatus } from '../../utils/formatters'

interface PropertyCardProps {
  property: PropertyCardData
  className?: string
}

export function PropertyCard({ property, className }: PropertyCardProps) {
  const image = property.images?.[0] || ''

  return (
    <article
      className={cn(
        'group relative bg-surface-2 border border-border rounded-lg overflow-hidden hover:border-border-medium transition-all duration-500',
        className
      )}
    >
      <a href={`/${property.operation}/${property.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-3">
          {image ? (
            <img
              src={image}
              alt={property.title}
              loading="lazy"
              className="w-full h-full object-cover grayscale-[30%] brightness-90 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted font-elegant text-sm">
              Sin imagen
            </div>
          )}

          {/* Badges overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {property.featured && <Badge variant="featured">Destacada</Badge>}
            <Badge variant="status">{fmtStatus(property.status)}</Badge>
            <Badge variant="type">{fmtType(property.type)}</Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-elegant font-semibold text-sm text-white group-hover:text-accent transition-colors line-clamp-1">
              {property.title}
            </h3>
            {property.expenses && (
              <span className="font-desc text-2xs text-text-muted whitespace-nowrap shrink-0">
                +{property.expenses}
              </span>
            )}
          </div>

          <p className="font-desc text-xs text-text-secondary mt-1 line-clamp-1">
            {property.location}
          </p>

          <div className="flex items-center gap-3 mt-3 font-desc text-xs text-text-muted">
            <span>{property.beds} dorm.</span>
            <span className="w-0.5 h-0.5 rounded-full bg-border-medium" />
            <span>{property.baths} baños</span>
            <span className="w-0.5 h-0.5 rounded-full bg-border-medium" />
            <span>{property.sqm} m²</span>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            <span className="font-num font-bold text-sm text-accent">
              {fmtPrice(property.price, property.operation === 'alquiler' ? 'ARS' : 'USD')}
            </span>
            <span className="font-elegant text-xs text-text-muted group-hover:text-accent transition-colors">
              Ver más →
            </span>
          </div>
        </div>
      </a>
    </article>
  )
}
