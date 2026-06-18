import { Search, RotateCcw } from 'lucide-react'
import type { PropertyFilters, RentalFilters } from '../../types/property'
import { Select } from '../ui/Select'

type Filters = PropertyFilters | RentalFilters

interface FilterBarProps {
  filters: Filters
  onChange: (key: string, value: string | number | boolean) => void
  onReset: () => void
  operation: 'venta' | 'alquiler'
}

const typeOptions = [
  { value: '', label: 'Todos' },
  { value: 'casa', label: 'Casa' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'finca', label: 'Finca' },
  { value: 'local', label: 'Local' },
  { value: 'otro', label: 'Otro' },
]

const bedsOptions = [
  { value: '', label: 'Cualquier' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4+' },
]

const statusOptions = [
  { value: '', label: 'Todos' },
  { value: 'disponible', label: 'Disponible' },
  { value: 'vendida', label: 'Vendida' },
]

const statusRentOptions = [
  { value: '', label: 'Todos' },
  { value: 'disponible', label: 'Disponible' },
  { value: 'alquilada', label: 'Alquilada' },
]

const sortOptions = [
  { value: '', label: 'Por defecto' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'newest', label: 'Más recientes' },
]

export function FilterBar({ filters, onChange, onReset, operation }: FilterBarProps) {
  const isRental = operation === 'alquiler'
  const rentalFilters = filters as RentalFilters

  const hasActiveFilters =
    filters.search ||
    filters.type ||
    filters.beds ||
    filters.status ||
    filters.priceMin ||
    filters.priceMax ||
    filters.sort ||
    (isRental && rentalFilters.furnished)

  return (
    <div className="bg-surface-2 border border-border rounded-lg p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-elegant tracking-wider uppercase text-text-muted">Filtros</h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-2xs font-elegant tracking-wide text-accent hover:text-accent-dark transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar..."
            value={filters.search ?? ''}
            onChange={(e) => onChange('search', e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-md pl-9 pr-3 py-2.5 text-sm text-white font-desc placeholder:text-text-muted transition-colors duration-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
          />
        </div>

        <Select
          options={typeOptions}
          value={filters.type ?? ''}
          onChange={(e) => onChange('type', e.target.value)}
          placeholder="Tipo"
        />

        <Select
          options={bedsOptions}
          value={filters.beds ?? ''}
          onChange={(e) => onChange('beds', e.target.value)}
          placeholder="Dormitorios"
        />

        <Select
          options={isRental ? statusRentOptions : statusOptions}
          value={filters.status ?? ''}
          onChange={(e) => onChange('status', e.target.value)}
          placeholder="Estado"
        />

        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder={isRental ? '$0' : 'USD 0'}
            value={filters.priceMin ?? ''}
            onChange={(e) => onChange('priceMin', e.target.value ? Number(e.target.value) : 0)}
            className="w-full bg-surface-2 border border-border rounded-md px-3 py-2.5 text-sm text-white font-desc placeholder:text-text-muted transition-colors duration-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
          />
          <span className="text-text-muted text-xs flex-shrink-0">—</span>
          <input
            type="number"
            placeholder={isRental ? '$2M' : 'USD 500k'}
            value={filters.priceMax ?? ''}
            onChange={(e) => onChange('priceMax', e.target.value ? Number(e.target.value) : 0)}
            className="w-full bg-surface-2 border border-border rounded-md px-3 py-2.5 text-sm text-white font-desc placeholder:text-text-muted transition-colors duration-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
          />
        </div>

        <Select
          options={sortOptions}
          value={filters.sort ?? ''}
          onChange={(e) => onChange('sort', e.target.value)}
          placeholder="Ordenar"
        />

        {isRental && (
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rentalFilters.furnished ?? false}
              onChange={(e) => onChange('furnished', e.target.checked)}
              className="w-4 h-4 rounded border-border bg-surface-2 text-accent focus:ring-accent/30 focus:ring-1 cursor-pointer"
            />
            <span className="text-xs font-elegant tracking-wide text-text-secondary uppercase">
              Amoblado
            </span>
          </label>
        )}
      </div>
    </div>
  )
}
