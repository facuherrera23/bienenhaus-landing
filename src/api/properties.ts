import type { Property, Rental, PropertyFilters, RentalFilters } from '../types/property';
import type { PaginatedResponse } from '../types/api';
import { apiRequest } from './client';

function buildQuery(filters: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value != null && value !== '' && value !== false) {
      params.append(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function getProperties(
  filters: PropertyFilters = {}
): Promise<PaginatedResponse<Property>> {
  return apiRequest<PaginatedResponse<Property>>(
    'GET',
    `/api/properties${buildQuery(filters as Record<string, unknown>)}`
  );
}

export function getProperty(
  id: string | number
): Promise<Property> {
  return apiRequest<Property>('GET', `/api/properties/${id}`);
}

export function getRentals(
  filters: RentalFilters = {}
): Promise<PaginatedResponse<Rental>> {
  return apiRequest<PaginatedResponse<Rental>>(
    'GET',
    `/api/rentals${buildQuery(filters as Record<string, unknown>)}`
  );
}

export function getRental(
  id: string | number
): Promise<Rental> {
  return apiRequest<Rental>('GET', `/api/rentals/${id}`);
}

export function getPropertySimilares(
  id: string | number,
  limit?: number
): Promise<Property[]> {
  const qs = limit != null ? `?limit=${limit}` : '';
  return apiRequest<Property[]>('GET', `/api/properties/${id}/similares${qs}`);
}

export function getRentalSimilares(
  id: string | number,
  limit?: number
): Promise<Rental[]> {
  const qs = limit != null ? `?limit=${limit}` : '';
  return apiRequest<Rental[]>('GET', `/api/rentals/${id}/similares${qs}`);
}
