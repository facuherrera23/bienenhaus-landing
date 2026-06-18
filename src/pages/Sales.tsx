import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Container } from '../components/ui/Container'
import { FilterBar } from '../components/listing/FilterBar'
import { Pagination } from '../components/listing/Pagination'
import { PropertyCard } from '../components/property/PropertyCard'
import { Skeleton } from '../components/ui/Skeleton'
import { useProperties } from '../hooks/useProperties'
import type { PropertyFilters } from '../types/property'

export default function Sales() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<PropertyFilters>({
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || '',
    beds: searchParams.get('beds') || '',
    status: searchParams.get('status') || '',
    priceMin: searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : 0,
    priceMax: searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : 0,
    sort: searchParams.get('sort') || '',
    page: Number(searchParams.get('page')) || 1,
  })

  const { data, isLoading } = useProperties(filters)

  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.type) params.set('type', filters.type)
    if (filters.beds) params.set('beds', filters.beds)
    if (filters.status) params.set('status', filters.status)
    if (filters.priceMin) params.set('priceMin', String(filters.priceMin))
    if (filters.priceMax) params.set('priceMax', String(filters.priceMax))
    if (filters.sort) params.set('sort', filters.sort)
    if (filters.page && filters.page > 1) params.set('page', String(filters.page))
    setSearchParams(params, { replace: true })
  }, [filters, setSearchParams])

  const handleFilterChange = (key: string, value: string | number | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  const handleReset = () => {
    setFilters({ page: 1 })
  }

  const properties = data?.properties ?? []
  const totalPages = data?.pages ?? 1
  const availableTotal = data?.available_total

  return (
    <div className="pt-24 pb-16">
      <Container>
        <div className="mb-8">
          <p className="font-elegant text-2xs tracking-eyebrow uppercase text-accent mb-2">VENTA</p>
          <h1 className="font-display text-3xl md:text-4xl uppercase tracking-tight">Propiedades en Venta</h1>
          <p className="font-desc text-sm text-text-secondary mt-2">
            {availableTotal !== undefined ? `${availableTotal} propiedades disponibles` : 'Explorá nuestra selección'}
          </p>
        </div>

        <div className="mb-6">
          <FilterBar filters={filters} onChange={handleFilterChange} onReset={handleReset} operation="venta" />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-desc text-text-secondary">No hay propiedades que coincidan con los filtros.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} operation="venta" />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={filters.page || 1}
                totalPages={totalPages}
                onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
              />
            )}
          </>
        )}
      </Container>
    </div>
  )
}
