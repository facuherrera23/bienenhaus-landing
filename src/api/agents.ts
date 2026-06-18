import type { Agent } from '../types/agent';
import { apiRequest } from './client';

export function getAgents(): Promise<Agent[]> {
  return apiRequest<Agent[]>('GET', '/api/agents');
}
