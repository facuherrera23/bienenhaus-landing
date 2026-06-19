import { create } from 'zustand'
import type { PropertyFilters, OperationType } from '../types/api'

interface FilterStore {
  activeTab: OperationType
  filters: PropertyFilters
  setActiveTab: (tab: OperationType) => void
  setFilters: (filters: PropertyFilters) => void
  updateFilter: (key: keyof PropertyFilters, value: string | number | boolean | undefined) => void
  resetFilters: () => void
}

const defaultFilters: PropertyFilters = {
  search: undefined,
  type: undefined,
  beds: undefined,
  status: undefined,
  priceMin: undefined,
  priceMax: undefined,
  sort: undefined,
  page: 1,
}

export const useFilterStore = create<FilterStore>((set) => ({
  activeTab: 'venta',
  filters: { ...defaultFilters },

  setActiveTab: (tab) => set({ activeTab: tab, filters: { ...defaultFilters } }),

  setFilters: (filters) => set({ filters }),

  updateFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value || undefined, page: 1 },
    })),

  resetFilters: () => set({ filters: { ...defaultFilters } }),
}))
