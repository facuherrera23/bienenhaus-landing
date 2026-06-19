import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useFilterStore } from '../../store/useFilterStore'
import { useListings } from '../../hooks/useProperties'
import { PropertyCard } from './PropertyCard'
import { PropertyCardSkeleton } from '../ui/PropertyCardSkeleton'
import { fadeUp, stagger } from '../../animations/variants'

export function CuratedCatalog() {
  const { activeTab, filters } = useFilterStore()
  const { data, isLoading, isError } = useListings(activeTab, { ...filters, page: 1 })

  const items = data?.properties || data?.rentals || []

  return (
    <section className="py-24 px-5">
      <div className="max-w-container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="font-elegant text-2xs tracking-section uppercase text-accent mb-3 block">
            Catálogo Curado
          </span>
          <h2 className="font-display text-2xl md:text-3xl uppercase text-white">
            Propiedades Seleccionadas
          </h2>
          <p className="font-desc text-sm text-text-secondary max-w-lg mx-auto mt-3">
            Cada propiedad es cuidadosamente seleccionada para ofrecerte las mejores opciones del mercado.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="font-desc text-sm text-text-muted">
              Error al cargar propiedades. Intenta de nuevo.
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-desc text-sm text-text-muted">
              No hay propiedades disponibles actualmente.
            </p>
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {items.slice(0, 6).map((item: any) => (
              <motion.div key={item.id} variants={fadeUp}>
                <PropertyCard
                  property={{
                    id: item.id,
                    title: item.title,
                    location: item.location,
                    price: item.price || item.price_ars,
                    type: item.type,
                    status: item.status,
                    operation: activeTab,
                    beds: item.beds,
                    baths: item.baths,
                    sqm: item.sqm,
                    images: item.images || [],
                    featured: item.featured,
                    expenses: item.expenses,
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link
            to={`/${activeTab}`}
            className="inline-flex items-center gap-2 border border-border text-text-secondary hover:text-white hover:border-text-muted font-elegant font-semibold text-sm py-3 px-8 rounded-md transition-colors"
          >
            Ver todas las propiedades
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
