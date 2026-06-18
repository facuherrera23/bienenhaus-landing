import { Search } from 'lucide-react'
import type { PropertyFilters, RentalFilters } from '../../types/property'

interface FilterBarProps {
  filters: PropertyFilters | RentalFilters
  setFilters: (filters: any) => void
  operation: 'venta' | 'alquiler'
}

const propertyTypes = [
  { value: '', label: 'Todos' },
  { value: 'casa', label: 'Casa' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'finca', label: 'Finca' },
  { value: 'local', label: 'Local' },
]

const bedOptions = [
  { value: '', label: 'Dormitorios' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
]

const statusOptionsVenta = [
  { value: '', label: 'Estado' },
  { value: 'disponible', label: 'Disponible' },
  { value: 'vendida', label: 'Vendida' },
]

const statusOptionsAlquiler = [
  { value: '', label: 'Estado' },
  { value: 'disponible', label: 'Disponible' },
  { value: 'alquilada', label: 'Alquilada' },
]

const sortOptions = [
  { value: '', label: 'Ordenar' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'newest', label: 'Más nuevos' },
  { value: 'oldest', label: 'Más antiguos' },
]

export function FilterBar({ filters, setFilters, operation }: FilterBarProps) {
  function update(key: string, value: string | number | undefined) {
    setFilters({ ...filters, [key]: value || undefined, page: 1 })
  }

  return (
    <div className="bg-surface-1/80 backdrop-blur-lg border border-border rounded-lg p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 items-end">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />
          <input
            type="text"
            placeholder="Buscar propiedad..."
            value={(filters as PropertyFilters).search || ''}
            onChange={(e) => update('search', e.target.value)}
            className="w-full bg-surface-3 border border-border rounded-md pl-9 pr-3 py-3 text-sm text-white placeholder:text-text-muted font-desc focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>

        {/* Type */}
        <select
          value={(filters as PropertyFilters).type || ''}
          onChange={(e) => update('type', e.target.value)}
          className="w-full bg-surface-3 border border-border rounded-md px-3 py-3 text-sm text-white font-desc focus:outline-none focus:border-accent/50 transition-colors appearance-none cursor-pointer"
        >
          {propertyTypes.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Beds */}
        <select
          value={(filters as PropertyFilters).beds || ''}
          onChange={(e) => update('beds', e.target.value)}
          className="w-full bg-surface-3 border border-border rounded-md px-3 py-3 text-sm text-white font-desc focus:outline-none focus:border-accent/50 transition-colors appearance-none cursor-pointer"
        >
          {bedOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          value={(filters as PropertyFilters).status || ''}
          onChange={(e) => update('status', e.target.value)}
          className="w-full bg-surface-3 border border-border rounded-md px-3 py-3 text-sm text-white font-desc focus:outline-none focus:border-accent/50 transition-colors appearance-none cursor-pointer"
        >
          {(operation === 'alquiler' ? statusOptionsAlquiler : statusOptionsVenta).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={(filters as PropertyFilters).sort || ''}
          onChange={(e) => update('sort', e.target.value)}
          className="w-full bg-surface-3 border border-border rounded-md px-3 py-3 text-sm text-white font-desc focus:outline-none focus:border-accent/50 transition-colors appearance-none cursor-pointer"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Filter Button */}
        <button
          type="button"
          className="w-full bg-accent text-black font-elegant font-semibold text-sm py-3 px-6 rounded-md hover:bg-accent-dark transition-colors"
        >
          Filtrar
        </button>
      </div>

      {/* Price range row */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <input
          type="number"
          placeholder="Precio min."
          value={(filters as PropertyFilters).priceMin ?? ''}
          onChange={(e) =>
            update('priceMin', e.target.value ? Number(e.target.value) : undefined)
          }
          className="w-full bg-surface-3 border border-border rounded-md px-3 py-3 text-sm text-white placeholder:text-text-muted font-desc focus:outline-none focus:border-accent/50 transition-colors"
        />
        <input
          type="number"
          placeholder="Precio max."
          value={(filters as PropertyFilters).priceMax ?? ''}
          onChange={(e) =>
            update('priceMax', e.target.value ? Number(e.target.value) : undefined)
          }
          className="w-full bg-surface-3 border border-border rounded-md px-3 py-3 text-sm text-white placeholder:text-text-muted font-desc focus:outline-none focus:border-accent/50 transition-colors"
        />
      </div>
    </div>
  )
}
