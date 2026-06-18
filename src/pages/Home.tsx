import { useState } from 'react'
import { Hero } from '../components/home/Hero'
import { FilterBar } from '../components/home/FilterBar'
import { PropertyTabs } from '../components/home/PropertyTabs'
import { PropertyGrid } from '../components/home/PropertyGrid'
import { AgentsSection } from '../components/home/AgentsSection'
import { ValuationSection } from '../components/home/ValuationSection'
import { AboutSection } from '../components/home/AboutSection'
import { ContactSection } from '../components/home/ContactSection'
import { CTASection } from '../components/home/CTASection'
import { Container } from '../components/ui/Container'
import { useProperties, useRentals } from '../hooks/useProperties'
import type { PropertyFilters, RentalFilters } from '../types/property'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'venta' | 'alquiler'>('venta')
  const [filters, setFilters] = useState<PropertyFilters | RentalFilters>({})

  const {
    data: saleData,
    isLoading: saleLoading,
    error: saleError,
  } = useProperties(filters as PropertyFilters)

  const {
    data: rentalData,
    isLoading: rentalLoading,
    error: rentalError,
  } = useRentals(filters as RentalFilters)

  const isVenta = activeTab === 'venta'
  const properties = (isVenta
    ? (saleData?.properties ?? [])
    : (rentalData?.rentals ?? [])) as any
  const loading = isVenta ? saleLoading : rentalLoading
  const error = isVenta ? saleError : rentalError
  const page = isVenta ? (saleData?.page ?? 1) : (rentalData?.page ?? 1)
  const pages = isVenta ? (saleData?.pages ?? 1) : (rentalData?.pages ?? 1)

  function handlePageChange(newPage: number) {
    setFilters((prev) => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <Hero />

      <section className="section-block">
        <Container>
          <div className="space-y-8">
            <PropertyTabs activeTab={activeTab} onTabChange={setActiveTab} />
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              operation={activeTab}
            />
            {error && (
              <div className="text-center py-8">
                <span className="text-error font-desc text-sm">
                  Error al cargar propiedades.
                </span>
              </div>
            )}
            <PropertyGrid
              properties={properties}
              loading={loading}
              operation={activeTab}
              page={page}
              pages={pages}
              onPageChange={handlePageChange}
            />
          </div>
        </Container>
      </section>

      <AboutSection />
      <AgentsSection />
      <ValuationSection />
      <ContactSection />
      <CTASection />
    </>
  )
}
