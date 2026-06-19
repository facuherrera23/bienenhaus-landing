import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { useFilterStore } from '../../store/useFilterStore'
import { PROPERTY_TYPES, BED_OPTIONS, SORT_OPTIONS } from '../../constants'

export function PremiumSearch() {
  const navigate = useNavigate()
  const { activeTab, filters, updateFilter } = useFilterStore()
  const [searchValue, setSearchValue] = useState(filters.search || '')

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const path = activeTab === 'venta' ? '/venta' : '/alquiler'
    navigate(path)
  }, [activeTab, navigate])

  return (
    <section className="relative -mt-16 z-20 px-5">
      <div className="max-w-container mx-auto">
        <motion.form
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          onSubmit={handleSubmit}
          className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-[0_0_40px_rgba(32,184,171,0.08)]"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
              />
              <input
                type="text"
                placeholder="Buscar propiedad..."
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value)
                  updateFilter('search', e.target.value || undefined)
                }}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-3.5 text-sm text-white placeholder:text-text-muted font-desc focus:outline-none focus:border-accent/50 focus:shadow-[0_0_12px_rgba(32,184,171,0.1)] transition-all"
              />
            </div>

            {/* Type */}
            <select
              value={filters.type || ''}
              onChange={(e) => updateFilter('type', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3.5 text-sm text-white font-desc focus:outline-none focus:border-accent/50 transition-all appearance-none cursor-pointer"
            >
              {PROPERTY_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-surface-2">
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Beds */}
            <select
              value={filters.beds || ''}
              onChange={(e) => updateFilter('beds', e.target.value as any)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3.5 text-sm text-white font-desc focus:outline-none focus:border-accent/50 transition-all appearance-none cursor-pointer"
            >
              {BED_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-surface-2">
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={filters.sort || ''}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3.5 text-sm text-white font-desc focus:outline-none focus:border-accent/50 transition-all appearance-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-surface-2">
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-accent text-black font-elegant font-semibold text-sm py-3.5 px-6 rounded-xl hover:bg-accent-dark transition-all hover:shadow-[0_0_20px_rgba(32,184,171,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Buscar
            </button>
          </div>
        </motion.form>
      </div>
    </section>
  )
}
