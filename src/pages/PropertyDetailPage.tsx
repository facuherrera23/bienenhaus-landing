import { usePageTitle } from '../hooks/usePageTitle'
import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useListing, useSimilaresList } from '../hooks/useProperties'
import { PropertyCard } from '../components/catalog/PropertyCard'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { fadeUp, stagger } from '../animations/variants'
import { fmtPrice, fmtType, fmtStatus } from '../utils/formatters'
import type { OperationType } from '../types/api'

function Lightbox({ images, current, onClose, onNext, onPrev }: {
  images: string[]
  current: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-label="Visor de imágenes"
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose() }}
        className="absolute top-4 right-4 text-white/60 hover:text-white p-2 z-10"
        aria-label="Cerrar"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onPrev() }}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-2 z-10"
        aria-label="Anterior"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <img
        src={images[current]}
        alt={`Imagen ${current + 1} de ${images.length}`}
        className="max-h-[90vh] max-w-[90vw] object-contain select-none"
        onClick={(e) => e.stopPropagation()}
      />

      <button
        onClick={(e) => { e.stopPropagation(); onNext() }}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-2 z-10"
        aria-label="Siguiente"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-elegant text-sm text-white/60">
        {current + 1} / {images.length}
      </div>
    </div>
  )
}

export function PropertyDetailPage() {
  const { id, operation } = useParams<{ id: string; operation: string }>()
  const op = (operation === 'alquiler' ? 'alquiler' : 'venta') as OperationType
  usePageTitle(op === 'venta' ? 'Venta' : 'Alquiler')
  const { data: property, isLoading, isError } = useListing(id || '', op)
  const { data: similares } = useSimilaresList(id || '', op)

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  if (isLoading) {
    return (
      <div className="max-w-container mx-auto px-5 py-12">
        <div className="animate-shimmer bg-surface-3 rounded-lg h-[400px] mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 bg-surface-3 rounded w-2/3" />
            <div className="h-4 bg-surface-3 rounded w-1/3" />
            <div className="h-4 bg-surface-3 rounded w-full" />
          </div>
          <div className="h-64 bg-surface-3 rounded" />
        </div>
      </div>
    )
  }

  if (isError || !property) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="font-desc text-sm text-text-muted mb-4">No se pudo cargar la propiedad.</p>
          <Link to={`/${op}`} className="text-accent font-elegant text-xs hover:underline">Volver</Link>
        </div>
      </div>
    )
  }

  const images = (property as any).images || []
  const title = (property as any).title || ''
  const location = (property as any).location || ''
  const price = (property as any).price ?? (property as any).price_ars ?? 0
  const type = (property as any).type || ''
  const status = (property as any).status || ''
  const beds = (property as any).beds ?? 0
  const baths = (property as any).baths ?? 0
  const sqm = (property as any).sqm ?? 0
  const desc = (property as any).desc || (property as any).description_long || ''
  const features = (property as any).features || []
  const expenses = (property as any).expenses
  const agent = (property as any).agent

  return (
    <div className="min-h-screen">
      <div className="max-w-container mx-auto px-5 py-8">
        {/* Breadcrumb */}
        <nav className="font-desc text-xs text-text-muted mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-accent transition-colors">Inicio</Link>
          <span className="mx-2">/</span>
          <Link to={`/${op}`} className="hover:text-accent transition-colors">
            {op === 'venta' ? 'Venta' : 'Alquiler'}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-text-secondary">{title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Gallery + Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            {images.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-3"
              >
                <div
                  className="relative aspect-[16/9] bg-surface-3 rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => { setLightboxOpen(true); setLightboxIndex(0) }}
                >
                  <img
                    src={images[0]}
                    alt={title}
                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {(property as any).featured && <Badge variant="featured">Destacada</Badge>}
                    <Badge variant="status">{fmtStatus(status)}</Badge>
                    <Badge variant="type">{fmtType(type)}</Badge>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-md font-elegant text-xs text-white">
                    {images.length} fotos
                  </div>
                </div>

                {images.length > 1 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {images.slice(1, 5).map((img: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => { setLightboxOpen(true); setLightboxIndex(i + 1) }}
                        className="aspect-[4/3] bg-surface-3 rounded-lg overflow-hidden group"
                      >
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-300"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Title & Location */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <h1 className="font-display text-2xl md:text-3xl uppercase text-white">
                {title}
              </h1>
              <p className="font-desc text-sm text-text-secondary mt-2">{location}</p>
            </motion.div>

            {/* Specs row */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-4 gap-4 py-6 border-y border-border"
            >
              <motion.div variants={fadeUp} className="text-center">
                <span className="font-num font-bold text-lg sm:text-xl text-white">{beds}</span>
                <p className="font-desc text-2xs text-text-muted uppercase tracking-badge mt-1">Dorm.</p>
              </motion.div>
              <motion.div variants={fadeUp} className="text-center">
                <span className="font-num font-bold text-lg sm:text-xl text-white">{baths}</span>
                <p className="font-desc text-2xs text-text-muted uppercase tracking-badge mt-1">Baños</p>
              </motion.div>
              <motion.div variants={fadeUp} className="text-center">
                <span className="font-num font-bold text-lg sm:text-xl text-white">{sqm}</span>
                <p className="font-desc text-2xs text-text-muted uppercase tracking-badge mt-1">m²</p>
              </motion.div>
              {expenses ? (
                <motion.div variants={fadeUp} className="text-center">
                  <span className="font-num font-bold text-lg sm:text-xl text-accent">{expenses}</span>
                  <p className="font-desc text-2xs text-text-muted uppercase tracking-badge mt-1">Expensas</p>
                </motion.div>
              ) : (
                <div />
              )}
            </motion.div>

            {/* Description */}
            {desc && (
              <motion.div variants={fadeUp} initial="hidden" animate="visible">
                <h2 className="font-elegant font-semibold text-sm text-white mb-3 uppercase tracking-section">
                  Descripción
                </h2>
                <p className="font-desc text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                  {desc}
                </p>
              </motion.div>
            )}

            {/* Features */}
            {features.length > 0 && (
              <motion.div variants={fadeUp} initial="hidden" animate="visible">
                <h2 className="font-elegant font-semibold text-sm text-white mb-3 uppercase tracking-section">
                  Características
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {features.map((f: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 font-desc text-xs text-text-secondary">
                      <span className="w-1 h-1 rounded-full bg-accent/60" />
                      {f}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: Price card + Agent */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="bg-surface-2 border border-border rounded-lg p-6"
            >
              <span className="font-num font-bold text-2xl text-accent">
                {fmtPrice(price, op === 'alquiler' ? 'ARS' : 'USD')}
              </span>
              {op === 'alquiler' && (
                <p className="font-desc text-xs text-text-muted mt-1">Por mes</p>
              )}

              <div className="space-y-3 mt-6">
                <Button
                  variant="whatsapp"
                  as="a"
                  href={`https://wa.me/?text=Hola!%20Quiero%20saber%20más%20sobre%20${encodeURIComponent(title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  Consultar por WhatsApp
                </Button>
                <Button variant="outline" className="w-full">
                  Solicitar visita
                </Button>
              </div>

              {/* Share */}
              <div className="mt-6 pt-4 border-t border-border">
                <p className="font-elegant text-2xs tracking-badge uppercase text-text-muted mb-3">Compartir</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigator.share?.({ title, url: window.location.href })}
                    className="font-desc text-xs text-text-secondary hover:text-accent transition-colors"
                    aria-label="Compartir"
                  >
                    Compartir
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Agent card */}
            {agent && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="bg-surface-2 border border-border rounded-lg p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center font-display text-lg text-accent overflow-hidden flex-shrink-0">
                    {agent.avatar ? (
                      <img src={agent.avatar} alt={`${agent.name} ${agent.last}`} className="w-full h-full object-cover" />
                    ) : (
                      `${(agent.name || '?')[0]}${(agent.last || '')[0]}`
                    )}
                  </div>
                  <div>
                    <p className="font-elegant font-semibold text-sm text-white">
                      {agent.name} {agent.last}
                    </p>
                    <p className="font-desc text-xs text-text-muted">
                      {agent.specialty || 'Asesor Inmobiliario'}
                    </p>
                    {agent.license_number && (
                      <p className="font-desc text-2xs text-text-muted">Mat. {agent.license_number}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  {agent.whatsapp && (
                    <a
                      href={`https://wa.me/${agent.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-[#25D366] text-black text-xs font-elegant font-semibold py-2 rounded-md text-center hover:bg-[#20bd5a] transition-colors"
                    >
                      WhatsApp
                    </a>
                  )}
                  {agent.phone && (
                    <a
                      href={`tel:${agent.phone}`}
                      className="flex-1 border border-border text-text-secondary text-xs font-elegant py-2 rounded-md text-center hover:text-white hover:border-text-muted transition-colors"
                    >
                      Llamar
                    </a>
                  )}
                  {agent.email && (
                    <a
                      href={`mailto:${agent.email}`}
                      className="flex-1 border border-border text-text-secondary text-xs font-elegant py-2 rounded-md text-center hover:text-white hover:border-text-muted transition-colors"
                    >
                      Email
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Similares */}
        {similares && similares.length > 0 && (
          <section className="mt-16">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h2 className="font-display text-xl md:text-2xl uppercase text-white">
                Propiedades Similares
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similares.slice(0, 3).map((s: any) => (
                <PropertyCard
                  key={s.id}
                  property={{
                    id: s.id,
                    title: s.title,
                    location: s.location,
                    price: s.price || s.price_ars,
                    type: s.type,
                    status: s.status,
                    operation: op,
                    beds: s.beds,
                    baths: s.baths,
                    sqm: s.sqm,
                    images: s.images || [],
                    featured: s.featured,
                    expenses: s.expenses,
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <Lightbox
          images={images}
          current={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNext={() => setLightboxIndex((i) => (i + 1) % images.length)}
          onPrev={() => setLightboxIndex((i) => (i - 1 + images.length) % images.length)}
        />
      )}
    </div>
  )
}
