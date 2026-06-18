import type { Agent } from './agent';

export interface Property {
  id: number | string;
  title: string;
  desc?: string;
  description_long?: string;
  location: string;
  price: number;
  type: 'casa' | 'departamento' | 'finca' | 'terreno' | 'local' | 'otro';
  status: 'disponible' | 'vendida' | 'oculta';
  beds: number | string;
  baths: number | string;
  sqm: number | string;
  images: string[];
  featured: boolean;
  expenses?: string;
  features?: string[];
  lat?: number;
  lng?: number;
  agent?: Agent;
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
  agent?: Agent;
}

export interface PropertyFilters {
  search?: string;
  type?: string;
  beds?: string;
  status?: string;
  priceMin?: number;
  priceMax?: number;
  sort?: string;
  page?: number;
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
