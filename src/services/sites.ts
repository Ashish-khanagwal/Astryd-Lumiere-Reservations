import { http } from './http';
import type { Restaurant } from '../types';

export interface SuperAdminSiteRow extends Restaurant {
  organizationName: string;
}

/** "Site" per the Multi-Vertical Platform Plan §2 is today's `Restaurant` row - no separate type yet (plan §12: no rename required for this phase). */
export const getSites = (organizationId: string) =>
  http.get<Restaurant[]>(`/organizations/${organizationId}/sites`);

/** Super Admin only (Plan §5.2) - every Site across every Org, for the Platform → Sites console. */
export const getAllSitesForSuperAdmin = () => http.get<SuperAdminSiteRow[]>('/superadmin/sites');

/** Super Admin only (Plan §5.2) - the sole write path for the "Powered by Astryd" footer badge. */
export const updateSiteBrandingBadge = (siteId: string, enabled: boolean) =>
  http.patch<Restaurant>(`/superadmin/sites/${siteId}/branding-badge`, { enabled });

/** Public, read-only - lets the storefront footer decide whether to show the badge. */
export const getSiteBrandingBadge = (siteId: string) =>
  http.get<{ enabled: boolean }>(`/public/sites/${siteId}/branding-badge`);
