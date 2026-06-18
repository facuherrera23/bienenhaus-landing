import { useQuery } from '@tanstack/react-query'
import { getPublicSettings } from '../api/valuations'
import type { PublicSettings } from '../types/api'

export function useSettings() {
  return useQuery<PublicSettings>({
    queryKey: ['publicSettings'],
    queryFn: getPublicSettings,
  })
}
