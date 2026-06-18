import type { TasacionData, ContactData, PublicSettings } from '../types/api';
import { apiRequest } from './client';

export function sendTasacion(data: TasacionData): Promise<unknown> {
  return apiRequest<unknown>('POST', '/api/tasacion', data);
}

export function sendContact(data: ContactData): Promise<unknown> {
  return apiRequest<unknown>('POST', '/api/contact', data);
}

export function getPublicSettings(): Promise<PublicSettings> {
  return apiRequest<PublicSettings>('GET', '/api/settings?public=true');
}
