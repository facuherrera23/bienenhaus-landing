import { API_BASE } from './constants';

export function cn(
  ...classes: (string | false | null | undefined)[]
): string {
  return classes.filter(Boolean).join(' ');
}

export function proxyImgUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (
    url.startsWith('blob:') ||
    url.startsWith('data:') ||
    url.startsWith('/') ||
    url.includes('cloudinary.com')
  ) {
    return url;
  }
  return `${API_BASE}/api/proxy-image?url=${encodeURIComponent(url)}`;
}

export function getInitials(name: string, last?: string): string {
  const first = name?.charAt(0)?.toUpperCase() || '';
  const second = last?.charAt(0)?.toUpperCase() || '';
  return `${first}${second}` || '?';
}
