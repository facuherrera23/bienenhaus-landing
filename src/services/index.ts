import { get, post } from './client'
import type { Agent } from '../types/agent'
import type { PublicSettings, TasacionData, ContactData } from '../types/api'

export function fetchAgents(): Promise<Agent[]> {
  return get<Agent[]>('/api/agents')
}

export async function fetchSettings(): Promise<PublicSettings> {
  const raw = await get<{ data?: Record<string, unknown>; ok?: boolean } & Record<string, unknown>>('/api/settings?public=true')
  const d: Record<string, unknown> = raw.data ?? raw

  return {
    hero_image: (d.hero_image_url as string) || (d.hero_image as string) || undefined,
    hero_video: (d.hero_video_url as string) || (d.hero_video as string) || undefined,
    hero_subtitle: (d.about_eyebrow as string) || (d.hero_subtitle as string) || undefined,
    years_count: (d.hero_years ? Number(d.hero_years) : d.years_count as number) || undefined,
    wa_number: (d.whatsapp as string) || (d.wa_number as string) || undefined,
    wa_number_2: (d.whatsapp2 as string) || (d.wa_number_2 as string) || undefined,
    contact_phone: (d.phone as string) || (d.contact_phone as string) || undefined,
    contact_email: (d.email as string) || (d.contact_email as string) || undefined,
    about_mission: (d.about_mision as string) || (d.about_mission as string) || undefined,
    about_vision: (d.about_vision as string) || undefined,
    about_values: (d.about_values as string) || undefined,
    properties_count: (d.properties_count as number) || (d.total_properties as number) || 150,
    agents_count: (d.agents_count as number) || (d.total_agents as number) || 10,
    trust_count: (d.trust_count as number) || 100,
    instagram: (d.instagram as string) || undefined,
    facebook: (d.facebook as string) || undefined,
    ga_id: (d.ga_id as string) || undefined,
  }
}

export function submitTasacion(data: TasacionData): Promise<{ success: boolean }> {
  return post<{ success: boolean }>('/api/tasacion', data)
}

export function submitContact(data: ContactData): Promise<{ success: boolean }> {
  return post<{ success: boolean }>('/api/contact', data)
}
