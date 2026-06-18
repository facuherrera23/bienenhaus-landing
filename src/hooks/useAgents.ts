import { useQuery } from '@tanstack/react-query'
import { getAgents } from '../api/agents'
import type { Agent } from '../types/agent'

export function useAgents() {
  return useQuery<Agent[]>({
    queryKey: ['agents'],
    queryFn: getAgents,
  })
}
