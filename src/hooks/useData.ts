import { useQuery } from '@tanstack/react-query'
import { fetchAgents, fetchSettings } from '../services'

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
    staleTime: 5 * 60 * 1000,
  })
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    staleTime: 10 * 60 * 1000,
  })
}
