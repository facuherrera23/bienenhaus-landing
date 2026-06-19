import { useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRentals } from '../hooks/useProperties'
import { PropertyCard } from '../components/catalog/PropertyCard'
import { PropertyCardSkeleton } from '../components/ui/PropertyCardSkeleton'
import { PriceRangeSlider } from '../components/search/PriceRangeSlider'
import { fadeUp, stagger } from '../animations/variants'
import { PROPERTY_TYPES, BED_OPTIONS, STATUS_OPTIONS_ALQUILER, SORT_OPTIONS } from '../constants'
import type { PropertyFilters } from '../types/api'

export function RentalsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<PropertyFilters>({
    search: searchParams.get('search') || undefined,
    type: searchParams.get('type') || undefined,
    beds: searchParams.get('beds') || undefined,
    status: searchParams.get('status') || undefined,
    sort: searchParams.get('sort') || undefined,
    priceMin: searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : undefined,
    priceMax: searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : undefined,
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
  })

  const { data, isLoading } = useRentals(filters)

  const updateFilter = (key: string, value: string | number | undefined) => {
    const next = { ...filters, [key]: value || undefined, page: 1 }
    setFilters(next)
    const params = new URLSearchParams()
    Object.entries(next).forEach(([k, v]) => {
      if (v != null && v !== '') params.set(k, String(v))
    })
    setSearchParams(params)
  }

  const items = data?.rentals || []
  const totalPages = data?.pages || 1
  const currentPage = filters.page || 1

  return (
    <div className="min-h-screen">
      <div className="max-w-container mx-auto px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="font-display text-2xl md:text-3xl uppercase text-white">
            Propiedades en Alquiler
          </h1>
        </motion.div>

        {/* Filters */}
        <div className="bg-surface-1/80 backdrop-blur-lg border border-border rounded-xl p-6 mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
            <div className="lg:col-span-2">
              <input
                type="text"
                placeholder="Buscar propiedad..."
                value={filters.search || ''}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full bg-surface-3 border border-border rounded-lg px-4 py-4 text-sm text-white placeholder:text-text-muted font-desc focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>
            <select
              value={filters.type || ''}
              onChange={(e) => updateFilter('type', e.target.value)}
              className="w-full bg-surface-3 border border-border rounded-lg px-3 py-4 text-sm text-white font-desc appearance-none cursor-pointer focus:outline-none focus:border-accent/50"
            >
              {PROPERTY_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={filters.beds || ''}
              onChange={(e) => updateFilter('beds', e.target.value)}
              className="w-full bg-surface-3 border border-border rounded-lg px-3 py-4 text-sm text-white font-desc appearance-none cursor-pointer focus:outline-none focus:border-accent/50"
            >
              {BED_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={filters.status || ''}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="w-full bg-surface-3 border border-border rounded-lg px-3 py-4 text-sm text-white font-desc appearance-none cursor-pointer focus:outline-none focus:border-accent/50"
            >
              {STATUS_OPTIONS_ALQUILER.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={filters.sort || ''}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="w-full bg-surface-3 border border-border rounded-lg px-3 py-4 text-sm text-white font-desc appearance-none cursor-pointer focus:outline-none focus:border-accent/50"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <PriceRangeSlider
              min={0}
              max={500000}
              valueMin={filters.priceMin || 0}
              valueMax={filters.priceMax || 500000}
              onChange={(min, max) => {
                setFilters((prev) => ({ ...prev, priceMin: min, priceMax: max, page: 1 }))
              }}
              prefix="ARS"
            />
          </div>

          <div className="flex justify-between items-center mt-4">
            <span className="font-desc text-xs text-text-muted">
              {data?.total != null ? `${data.total} propiedades encontradas` : ''}
            </span>
            <button
              onClick={() => {
                setFilters({ page: 1 })
                setSearchParams(new URLSearchParams())
              }}
              className="font-elegant text-xs text-text-secondary hover:text-white transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-desc text-sm text-text-muted">No hay propiedades disponibles.</p>
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {items.map((item: any) => (
              <motion.div key={item.id} variants={fadeUp}>
                <PropertyCard
                  property={{
                    id: item.id,
                    title: item.title,
                    location: item.location,
                    price: item.price_ars,
                    type: item.type,
                    status: item.status,
                    operation: 'alquiler',
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => updateFilter('page', Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="font-elegant text-xs text-text-secondary hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed px-4 py-3"
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => updateFilter('page', i + 1)}
                className={`w-11 h-11 rounded-md text-xs font-elegant transition-colors ${
                  currentPage === i + 1
                    ? 'bg-accent text-black font-semibold'
                    : 'text-text-secondary hover:text-white hover:bg-surface-3'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => updateFilter('page', Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="font-elegant text-xs text-text-secondary hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed px-4 py-3"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
