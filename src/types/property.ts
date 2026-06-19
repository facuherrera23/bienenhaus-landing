export type OperationType = 'venta' | 'alquiler'

export type PropertyType = 'casa' | 'departamento' | 'finca' | 'terreno' | 'local' | 'otro'

export type PropertyStatus = 'disponible' | 'vendida' | 'alquilada' | 'oculta'

export interface Property {
  id: number | string
  title: string
  desc?: string
  description_long?: string
  location: string
  price: number
  price_ars: number
  type: PropertyType
  status: PropertyStatus
  operation: OperationType
  beds: number | string
  baths: number | string
  sqm: number | string
  images: string[]
  featured: boolean
  expenses?: string
  features?: string[]
  furnished?: boolean
  lat?: number
  lng?: number
  agent?: import('./agent').Agent
}

export interface PropertyFilters {
  search?: string
  type?: string
  beds?: string
  status?: string
  priceMin?: number
  priceMax?: number
  furnished?: boolean
  sort?: string
  page?: number
}

export interface Rental {
  id: number | string;
  title: string;
  desc?: string;
  location: string;
  price_ars: number;
  type: string;
  status: 'disponible' | 'alquilada';
  beds: number | string;
  baths: number | string;
  sqm: number | string;
  images: string[];
  featured: boolean;
  furnished?: boolean;
  expenses?: string;
  features?: string[];
  lat?: number;
  lng?: number;
  agent?: import('./agent').Agent;
}

export interface RentalFilters {
  search?: string;
  type?: string;
  beds?: string;
  status?: string;
  priceMin?: number;
  priceMax?: number;
  furnished?: boolean;
  sort?: string;
  page?: number;
}

export interface PropertyCardData {
  id: number | string
  title: string
  location: string
  price: number
  type: PropertyType
  status: PropertyStatus
  operation: OperationType
  beds: number | string
  baths: number | string
  sqm: number | string
  images: string[]
  featured: boolean
  expenses?: string
}
