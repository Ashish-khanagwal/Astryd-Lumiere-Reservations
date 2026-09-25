import { http } from './http';
import type { DomainMapping } from '../types';

export const getDomains = (siteId: string) => http.get<DomainMapping[]>(`/sites/${siteId}/domains`);

export const addDomain = (siteId: string, hostname: string) =>
  http.post<DomainMapping>(`/sites/${siteId}/domains`, { hostname });

export const verifyDomain = (siteId: string, domainId: string) =>
  http.post<DomainMapping>(`/sites/${siteId}/domains/${domainId}/verify`);

export const deleteDomain = (siteId: string, domainId: string) =>
  http.delete<{ message: string }>(`/sites/${siteId}/domains/${domainId}`);
