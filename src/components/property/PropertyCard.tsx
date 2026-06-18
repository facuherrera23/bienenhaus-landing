import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Bed, Bath, Maximize } from 'lucide-react'
import type { Property, Rental } from '../../types/property'
import { proxyImgUrl, getInitials } from '../../lib/utils'
import { fmtPrice, fmtPriceARS, fmtType, fmtStatus } from '../../lib/formatters'
import { Badge } from '../ui/Badge'

type CardProperty = Property | Rental

interface PropertyCardProps {
  property: CardProperty
  operation: 'venta' | 'alquiler'
  index?: number
}

export function PropertyCard({ property, operation, index = 0 }: PropertyCardProps) {
  const img = property.images?.[0]
  const linkBase = operation === 'venta' ? '/venta' : '/alquiler'
  const isRental = operation === 'alquiler'
  const price = isRental
    ? fmtPriceARS((property as Rental).price_ars)
    : fmtPrice((property as Property).price)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link
        to={`${linkBase}/${property.id}`}
        className="group block bg-surface-2 border border-border rounded-lg overflow-hidden hover:border-accent/40 transition-all duration-300"
      >
        <div className="relative h-[220px] overflow-hidden">
          {img ? (
            <img
              src={proxyImgUrl(img)}
              alt={property.title}
              className="w-full h-full object-cover grayscale-[30%] brightness-90 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface-3">
              <span className="text-text-muted font-display text-2xl uppercase tracking-wide">
                {getInitials(property.title)}
              </span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="type">{fmtType(property.type)}</Badge>
            {property.featured && (
              <Badge variant="featured">Destacado</Badge>
            )}
          </div>
          <div className="absolute top-3 right-3">
            <Badge variant="status">
              {'price_ars' in property ? fmtStatus(property.status, 'alquiler') : fmtStatus(property.status, 'venta')}
            </Badge>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <h3 className="font-display text-lg uppercase tracking-tight truncate">
            {property.title}
          </h3>

          <div className="flex items-center gap-1.5 text-text-muted">
            <MapPin size={12} className="shrink-0" />
            <span className="font-desc text-xs truncate">{property.location}</span>
          </div>

          <div className="flex items-center gap-4 text-text-secondary">
            <span className="flex items-center gap-1 text-xs" title="Dormitorios">
              <Bed size={14} /> {property.beds}
            </span>
            <span className="flex items-center gap-1 text-xs" title="Baños">
              <Bath size={14} /> {property.baths}
            </span>
            <span className="flex items-center gap-1 text-xs" title="Metros">
              <Maximize size={14} /> {property.sqm} m²
            </span>
          </div>

          <div className="pt-2 border-t border-border">
            <span className="font-num text-accent text-xl font-bold tracking-tight">
              {price}
            </span>
            {isRental && (property as Rental).expenses && (
              <span className="block font-desc text-2xs text-text-muted mt-0.5">
                + {fmtPriceARS(Number((property as Rental).expenses))} expensas
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
