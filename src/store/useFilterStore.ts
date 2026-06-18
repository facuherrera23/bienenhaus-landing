import { create } from 'zustand'

interface SaleFilters {
  search: string
  type: string
  beds: string
  status: string
  priceMin: number
  priceMax: number
  sort: string
  page: number
}

interface RentalFilters {
  search: string
  type: string
  beds: string
  status: string
  priceMin: number
  priceMax: number
  furnished: boolean
  sort: string
  page: number
}

interface FilterStore {
  saleFilters: SaleFilters
  setSaleFilter: (key: string, value: string | number) => void
  resetSaleFilters: () => void
  rentalFilters: RentalFilters
  setRentalFilter: (key: string, value: string | number | boolean) => void
  resetRentalFilters: () => void
  activeTab: 'venta' | 'alquiler'
  setActiveTab: (tab: 'venta' | 'alquiler') => void
}

const defaultSaleFilters: SaleFilters = {
  search: '',
  type: '',
  beds: '',
  status: '',
  priceMin: 0,
  priceMax: 0,
  sort: '',
  page: 1,
}

const defaultRentalFilters: RentalFilters = {
  search: '',
  type: '',
  beds: '',
  status: '',
  priceMin: 0,
  priceMax: 0,
  furnished: false,
  sort: '',
  page: 1,
}

export const useFilterStore = create<FilterStore>((set) => ({
  saleFilters: { ...defaultSaleFilters },
  setSaleFilter: (key, value) =>
    set((state) => ({
      saleFilters: { ...state.saleFilters, [key]: value, page: key === 'page' ? (value as number) : 1 },
    })),
  resetSaleFilters: () =>
    set({ saleFilters: { ...defaultSaleFilters } }),
  rentalFilters: { ...defaultRentalFilters },
  setRentalFilter: (key, value) =>
    set((state) => ({
      rentalFilters: { ...state.rentalFilters, [key]: value, page: key === 'page' ? (value as number) : 1 },
    })),
  resetRentalFilters: () =>
    set({ rentalFilters: { ...defaultRentalFilters } }),
  activeTab: 'venta',
  setActiveTab: (tab) => set({ activeTab: tab }),
}))
