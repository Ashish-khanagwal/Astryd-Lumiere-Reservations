import { http } from './http';

export interface MainOrganization {
  id: string;
  name: string;
  locations: Array<{ id: string; name: string }>;
}

export interface SiteMapping {
  locationId: string;
  utcOffset: string;
  tableMappings: Record<string, number>;
  durationMinutes: number;
  kdsEnabled: boolean;
}

export interface WebsiteSyncState {
  link: { mainOrgId: string; mainOrgName: string; sites: Record<string, SiteMapping> } | null;
  sites: Array<{ restaurantId: string; name: string; vertical: string }>;
}

export const getWebsiteSync = (organizationId: string) =>
  http.get<WebsiteSyncState>(`/website-sync/organizations/${organizationId}`);

export const getMainCandidates = (organizationId: string) =>
  http.get<{ organizations: MainOrganization[] }>(`/website-sync/organizations/${organizationId}/candidates`);

export const linkMainOrganization = (organizationId: string, mainOrgId: string) =>
  http.post(`/website-sync/organizations/${organizationId}/link`, { mainOrgId });

export const getWebsiteTables = (organizationId: string, siteId: string) =>
  http.get<{ tables: Array<{ id: string; name: string; capacity: number }> }>(
    `/website-sync/organizations/${organizationId}/sites/${siteId}/tables`,
  );

export const saveWebsiteSiteMapping = (organizationId: string, siteId: string, mapping: SiteMapping) =>
  http.put(`/website-sync/organizations/${organizationId}/sites/${siteId}`, mapping);

export const getWebsiteSyncStatus = (organizationId: string) =>
  http.get<{ counts: Record<string, number> }>(`/website-sync/organizations/${organizationId}/status`);
