export const API_BASE: string =
  import.meta.env.VITE_API_BASE || (window as any).__API_BASE__ || ''

export const SITE_NAME = 'Bienenhaus'
export const SITE_DESCRIPTION = 'Inmobiliaria premium en Córdoba. Compra, venta y alquiler de propiedades.'
export const LOCATION = 'CÓRDOBA · ARGENTINA'

export const NAV_LINKS = [
  { label: 'Inicio', path: '/' },
  { label: 'Venta', path: '/venta' },
  { label: 'Alquiler', path: '/alquiler' },
  { label: 'Tasación', path: '/#tasacion' },
  { label: 'Contacto', path: '/#contacto' },
] as const

export const PROPERTY_TYPES = [
  { value: '', label: 'Todos' },
  { value: 'casa', label: 'Casa' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'finca', label: 'Finca' },
  { value: 'local', label: 'Local' },
] as const

export const BED_OPTIONS = [
  { value: '', label: 'Dormitorios' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
] as const

export const STATUS_OPTIONS_VENTA = [
  { value: '', label: 'Estado' },
  { value: 'disponible', label: 'Disponible' },
  { value: 'vendida', label: 'Vendida' },
] as const

export const STATUS_OPTIONS_ALQUILER = [
  { value: '', label: 'Estado' },
  { value: 'disponible', label: 'Disponible' },
  { value: 'alquilada', label: 'Alquilada' },
] as const

export const SORT_OPTIONS = [
  { value: '', label: 'Ordenar' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'newest', label: 'Más nuevos' },
  { value: 'oldest', label: 'Más antiguos' },
] as const

export const CAROUSEL_ITEMS = [
  'REAL ESTATE', 'TASACIONES', 'INVERSIONES', 'PROPIEDADES',
  'CASAS · DEPARTAMENTOS', 'TERRENOS · FINCAS', 'LOCALES COMERCIALES',
  'DESARROLLOS INMOBILIARIOS', 'ALQUILER', 'VENTA',
] as const
