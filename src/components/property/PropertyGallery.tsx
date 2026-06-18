import { useState } from 'react'
import { motion } from 'framer-motion'
import { Maximize, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, proxyImgUrl } from '../../lib/utils'
import { fmtPrice, fmtPriceARS, fmtType, fmtStatus } from '../../lib/formatters'
import type { Property, Rental } from '../../types/property'
import { Badge } from '../ui/Badge'
import { Lightbox } from './Lightbox'

interface PropertyGalleryProps {
  property: Property | Rental
  operation: 'venta' | 'alquiler'
}

export function PropertyGallery({ property, operation }: PropertyGalleryProps) {
  const [selected, setSelected] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const images = property.images?.length ? property.images : ['']
  const isRental = operation === 'alquiler'
  const price = isRental
    ? fmtPriceARS((property as Rental).price_ars)
    : fmtPrice((property as Property).price)

  return (
    <>
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[520px] rounded-lg overflow-hidden bg-surface-2">
        <motion.img
          key={selected}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          src={proxyImgUrl(images[selected])}
          alt={property.title}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => setLightboxOpen(true)}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

        <div className="absolute top-4 left-4 flex gap-2">
          <Badge variant="status">{fmtStatus(property.status, operation)}</Badge>
          <Badge variant="type">{fmtType(property.type)}</Badge>
          {property.featured && <Badge variant="featured">Destacado</Badge>}
        </div>

        <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
          <h1 className="font-display text-2xl md:text-3xl uppercase tracking-tight text-white mb-1">
            {property.title}
          </h1>
          <p className="text-xs md:text-sm text-text-secondary font-desc mb-1">{property.location}</p>
          <span className="font-num text-lg md:text-xl font-bold text-accent">{price}</span>
        </div>

        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
          aria-label="Ver en pantalla completa"
        >
          <Maximize className="h-4 w-4" />
        </button>

        <div className="absolute top-4 right-16 px-2.5 py-1 rounded-full bg-black/50 text-xs font-num text-white">
          {selected + 1} / {images.length}
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={() => setSelected((p) => (p === 0 ? images.length - 1 : p - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setSelected((p) => (p === images.length - 1 ? 0 : p + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-thin">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={cn(
                'flex-shrink-0 w-20 h-16 rounded-md overflow-hidden border-2 transition-all duration-200',
                i === selected ? 'border-accent opacity-100' : 'border-transparent opacity-50 hover:opacity-80',
              )}
            >
              <img
                src={proxyImgUrl(img)}
                alt={`${property.title} - ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      <Lightbox
        images={images}
        initialIndex={selected}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  )
}
