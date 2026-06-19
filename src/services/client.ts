import { API_BASE } from '../constants'

class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`

  const config: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body)
  }

  const res = await fetch(url, config)

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new ApiError(text || `HTTP ${res.status}`, res.status)
  }

  return res.json()
}

export function get<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: 'GET' })
}

export function post<T>(endpoint: string, data: unknown): Promise<T> {
  return request<T>(endpoint, { method: 'POST', body: data as BodyInit })
}

export { ApiError }
