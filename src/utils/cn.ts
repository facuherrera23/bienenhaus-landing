import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string, last?: string): string {
  const first = name?.charAt(0)?.toUpperCase() || ''
  const second = last?.charAt(0)?.toUpperCase() || ''
  return `${first}${second}` || '?'
}

export function proxyImgUrl(url: string | undefined | null, _width = 800): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return url
}
