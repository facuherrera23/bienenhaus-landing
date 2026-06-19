import { get } from './client'
import type { PaginatedResponse, PropertyFilters } from '../types/api'
import type { Property } from '../types/property'

export function fetchProperties(filters?: PropertyFilters): Promise<PaginatedResponse<Property>> {
  const params = new URLSearchParams()
  if (filters?.search) params.set('search', filters.search)
  if (filters?.type) params.set('type', filters.type)
  if (filters?.beds) params.set('beds', filters.beds)
  if (filters?.status) params.set('status', filters.status)
  if (filters?.priceMin != null) params.set('price_min', String(filters.priceMin))
  if (filters?.priceMax != null) params.set('price_max', String(filters.priceMax))
  if (filters?.sort) params.set('sort', filters.sort)
  if (filters?.page) params.set('page', String(filters.page))

  const qs = params.toString()
  return get<PaginatedResponse<Property>>(`/api/properties${qs ? `?${qs}` : ''}`)
}

export function fetchProperty(id: number | string): Promise<Property> {
  return get<Property>(`/api/properties/${id}`)
}

export function fetchSimilares(id: number | string): Promise<Property[]> {
  return get<Property[]>(`/api/properties/${id}/similares`)
}

export function fetchRentals(filters?: PropertyFilters): Promise<PaginatedResponse<Property>> {
  const params = new URLSearchParams()
  if (filters?.search) params.set('search', filters.search)
  if (filters?.type) params.set('type', filters.type)
  if (filters?.beds) params.set('beds', filters.beds)
  if (filters?.status) params.set('status', filters.status)
  if (filters?.priceMin != null) params.set('price_min', String(filters.priceMin))
  if (filters?.priceMax != null) params.set('price_max', String(filters.priceMax))
  if (filters?.furnished != null) params.set('furnished', String(filters.furnished))
  if (filters?.sort) params.set('sort', filters.sort)
  if (filters?.page) params.set('page', String(filters.page))

  const qs = params.toString()
  return get<PaginatedResponse<Property>>(`/api/rentals${qs ? `?${qs}` : ''}`)
}

export function fetchRental(id: number | string): Promise<Property> {
  return get<Property>(`/api/rentals/${id}`)
}

export function fetchRentalSimilares(id: number | string): Promise<Property[]> {
  return get<Property[]>(`/api/rentals/${id}/similares`)
}
