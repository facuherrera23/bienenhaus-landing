export interface Agent {
  id: number
  name: string
  last: string
  specialty?: string
  bio?: string
  avatar?: string
  phone?: string
  whatsapp?: string
  email?: string
  license_number?: string
  years?: number
}

export interface AgentCardData {
  id: number
  name: string
  last: string
  fullName: string
  specialty?: string
  avatar?: string
  phone?: string
  whatsapp?: string
  email?: string
  license_number?: string
}
