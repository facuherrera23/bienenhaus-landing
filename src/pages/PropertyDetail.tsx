import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Container } from '../components/ui/Container'
import { Skeleton } from '../components/ui/Skeleton'
import { PropertyGallery } from '../components/property/PropertyGallery'
import { PropertySpecs } from '../components/property/PropertySpecs'
import { PropertyMap } from '../components/property/PropertyMap'
import { PriceCard } from '../components/property/PriceCard'
import { AgentCard } from '../components/property/AgentCard'
import { SimilaresCarousel } from '../components/property/SimilaresCarousel'
import { InquiryModal } from '../components/property/InquiryModal'
import { getProperty, getRental, getPropertySimilares, getRentalSimilares } from '../api/properties'
import { fadeUp, stagger } from '../animations/variants'

interface PropertyDetailProps {
  operation: 'venta' | 'alquiler'
}

type AnyProperty = Record<string, unknown>

export default function PropertyDetail({ operation }: PropertyDetailProps) {
  const { id } = useParams<{ id: string }>()
  const [inquiryOpen, setInquiryOpen] = useState(false)

  const { data: raw, isLoading, error } = useQuery({
    queryKey: [operation === 'venta' ? 'property' : 'rental', id],
    queryFn: () =>
      (operation === 'venta' ? getProperty(id!) : getRental(id!)) as unknown as Promise<AnyProperty>,
    enabled: !!id,
  })

  const { data: rawSimilares = [] } = useQuery({
    queryKey: [operation === 'venta' ? 'similares' : 'rental-similares', id],
    queryFn: () =>
      (operation === 'venta' ? getPropertySimilares(id!, 6) : getRentalSimilares(id!, 6)) as unknown as Promise<AnyProperty[]>,
    enabled: !!id,
  })

  const property = raw as AnyProperty
  const similares = rawSimilares as AnyProperty[]

  if (isLoading) {
    return (
      <div className="pt-24 pb-16">
        <Container>
          <Skeleton className="h-[400px] md:h-[520px] rounded-lg mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-40 mt-8" />
              <Skeleton className="h-[380px] mt-8" />
            </div>
            <div className="hidden lg:block">
              <Skeleton className="h-[400px] rounded-lg sticky top-24" />
            </div>
          </div>
        </Container>
      </div>
    )
  }

  if (error || !property || !property.title) {
    return (
      <div className="pt-24 pb-16">
        <Container>
          <div className="text-center py-20">
            <p className="font-desc text-text-secondary mb-4">No se pudo cargar la propiedad.</p>
            <Link
              to={operation === 'venta' ? '/venta' : '/alquiler'}
              className="inline-flex items-center gap-2 text-sm text-accent hover:underline font-elegant"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a {operation === 'venta' ? 'venta' : 'alquiler'}
            </Link>
          </div>
        </Container>
      </div>
    )
  }

  const hasMap = !!(property.lat && property.lng)

  const desc = String(property.description_long ?? property.desc ?? 'Sin descripción disponible.')
  const agent = property.agent as Record<string, unknown> | null

  const pTitle = String(property.title ?? '')

  return (
    <div className="pt-24 pb-16">
      <Container>
        <Link
          to={operation === 'venta' ? '/venta' : '/alquiler'}
          className="inline-flex items-center gap-2 text-xs font-elegant tracking-wide text-text-secondary hover:text-accent transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a {operation === 'venta' ? 'venta' : 'alquiler'}
        </Link>

          <PropertyGallery property={property as never} operation={operation} />

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 mt-8"
        >
          <div className="space-y-10">
            <motion.div variants={fadeUp}>
              <PropertySpecs property={property as never} />
            </motion.div>

            <motion.div variants={fadeUp}>
              <h2 className="font-display text-lg uppercase tracking-tight mb-4">Descripción</h2>
              <p className="font-desc text-sm text-text-secondary leading-relaxed whitespace-pre-line">{desc}</p>
            </motion.div>

            {hasMap && (
              <motion.div variants={fadeUp}>
                <h2 className="font-display text-lg uppercase tracking-tight mb-4">Ubicación</h2>
                <PropertyMap
                  lat={property.lat as number}
                  lng={property.lng as number}
                  location={property.location as string}
                />
              </motion.div>
            )}

            {agent && !!(agent.id) && (
              <motion.div variants={fadeUp}>
                <h2 className="font-display text-lg uppercase tracking-tight mb-4">Agente</h2>
                <AgentCard agent={agent as never} />
              </motion.div>
            )}

            {similares.length > 0 && (
              <motion.div variants={fadeUp}>
                <h2 className="font-display text-lg uppercase tracking-tight mb-6">Propiedades Similares</h2>
                <SimilaresCarousel similares={similares as never[]} loading={false} operation={operation} />
              </motion.div>
            )}

            <motion.div variants={fadeUp}>
              <div className="bg-gradient-to-br from-surface-2 via-surface-1 to-surface-2 border-t-2 border-accent/30 rounded-lg p-8 md:p-12 text-center">
                <h2 className="font-display text-2xl md:text-3xl uppercase tracking-tight mb-4">
                  ¿Te interesa esta propiedad?
                </h2>
                <p className="font-desc text-sm text-text-secondary mb-6 max-w-lg mx-auto">
                  Contactanos para más información o coordiná una visita.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Hola, me interesa esta propiedad: ${pTitle}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-md font-elegant font-semibold transition-all duration-200 text-sm py-3 px-8 bg-accent text-black hover:bg-accent-dark"
                  >
                    Consultar por WhatsApp
                  </a>
                  <button
                    onClick={() => setInquiryOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-md font-elegant font-semibold transition-all duration-200 text-sm py-3 px-8 border border-border text-text-secondary hover:text-white hover:border-text-muted"
                  >
                    Formulario de contacto
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="hidden lg:block">
              <PriceCard
              property={property as never}
              operation={operation}
              onInquiryOpen={() => setInquiryOpen(true)}
            />
          </div>
        </motion.div>

        <InquiryModal
          isOpen={inquiryOpen}
          onClose={() => setInquiryOpen(false)}
          propertyTitle={pTitle}
        />
      </Container>
    </div>
  )
}
