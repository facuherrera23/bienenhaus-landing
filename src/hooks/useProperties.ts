import { useQuery } from '@tanstack/react-query'
import { getProperties, getRentals } from '../api/properties'
import type { PropertyFilters, RentalFilters } from '../types/property'

export function useProperties(filters: PropertyFilters = {}) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => getProperties(filters),
    placeholderData: (prev) => prev,
  })
}

export function useRentals(filters: RentalFilters = {}) {
  return useQuery({
    queryKey: ['rentals', filters],
    queryFn: () => getRentals(filters),
    placeholderData: (prev) => prev,
  })
}
