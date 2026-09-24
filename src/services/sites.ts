import { http } from './http';
import type { Restaurant } from '../types';

/** "Site" per the Multi-Vertical Platform Plan §2 is today's `Restaurant` row - no separate type yet (plan §12: no rename required for this phase). */
export const getSites = (organizationId: string) =>
  http.get<Restaurant[]>(`/organizations/${organizationId}/sites`);
