export interface PaginatedResponse<T> {
  properties?: T[]
  rentals?: T[]
  total: number
  page: number
  pages: number
  has_prev: boolean
  has_next: boolean
  available_total?: number
}

export interface PublicSettings {
  site_name?: string
  site_description?: string
  hero_title?: string
  hero_subtitle?: string
  hero_video?: string
  hero_image?: string
  properties_count?: number
  agents_count?: number
  years_count?: number
  trust_count?: number
  wa_number?: string
  wa_number_2?: string
  contact_email?: string
  contact_phone?: string
  instagram?: string
  facebook?: string
  about_mission?: string
  about_vision?: string
  about_values?: string
  ga_id?: string
  [key: string]: unknown
}

export interface TasacionData {
  name: string
  phone: string
  property_type: string
  motivo: string
  email?: string
  city: string
  address?: string
  comments?: string
}

export interface ContactData {
  name: string
  email: string
  phone?: string
  message: string
}

export interface TestimonialData {
  id: number
  name: string
  role?: string
  avatar?: string
  content: string
  rating: number
  date?: string
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

export interface SearchFilters {
  search?: string
  type?: string
  beds?: string
  status?: string
  priceMin?: number
  priceMax?: number
  operation?: OperationType
  sort?: string
  page?: number
}

export type OperationType = 'venta' | 'alquiler'

export type SortOption = 'price_asc' | 'price_desc' | 'newest' | 'oldest'
