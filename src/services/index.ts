import { get, post } from './client'
import type { Agent } from '../types/agent'
import type { PublicSettings, TasacionData, ContactData } from '../types/api'

export function fetchAgents(): Promise<Agent[]> {
  return get<Agent[]>('/api/agents')
}

export function fetchSettings(): Promise<PublicSettings> {
  return get<PublicSettings>('/api/settings?public=true')
}

export function submitTasacion(data: TasacionData): Promise<{ success: boolean }> {
  return post<{ success: boolean }>('/api/tasacion', data)
}

export function submitContact(data: ContactData): Promise<{ success: boolean }> {
  return post<{ success: boolean }>('/api/contact', data)
}
