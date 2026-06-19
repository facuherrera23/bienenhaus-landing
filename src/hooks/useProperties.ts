import { useQuery } from '@tanstack/react-query'
import { fetchProperties, fetchProperty, fetchSimilares, fetchRentals, fetchRental, fetchRentalSimilares } from '../services/properties'
import type { PropertyFilters } from '../types/api'
import type { OperationType } from '../types/property'

export function useProperties(filters?: PropertyFilters) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => fetchProperties(filters),
    placeholderData: (prev) => prev,
  })
}

export function useProperty(id: number | string) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => fetchProperty(id),
    enabled: !!id,
  })
}

export function useSimilares(id: number | string) {
  return useQuery({
    queryKey: ['similares', id],
    queryFn: () => fetchSimilares(id),
    enabled: !!id,
  })
}

export function useRentals(filters?: PropertyFilters) {
  return useQuery({
    queryKey: ['rentals', filters],
    queryFn: () => fetchRentals(filters),
    placeholderData: (prev) => prev,
  })
}

export function useRental(id: number | string) {
  return useQuery({
    queryKey: ['rental', id],
    queryFn: () => fetchRental(id),
    enabled: !!id,
  })
}

export function useRentalSimilares(id: number | string) {
  return useQuery({
    queryKey: ['rental-similares', id],
    queryFn: () => fetchRentalSimilares(id),
    enabled: !!id,
  })
}

export function useListings(operation: OperationType, filters?: PropertyFilters) {
  const venta = useProperties(filters)
  const alquiler = useRentals(filters)
  return operation === 'venta' ? venta : alquiler
}

export function useListing(id: number | string, operation: OperationType) {
  const venta = useProperty(id)
  const alquiler = useRental(id)
  return operation === 'venta' ? venta : alquiler
}

export function useSimilaresList(id: number | string, operation: OperationType) {
  const venta = useSimilares(id)
  const alquiler = useRentalSimilares(id)
  return operation === 'venta' ? venta : alquiler
}
