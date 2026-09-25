import type { Id, Tenant, Timestamps } from './common';

/** Multi-Vertical Platform Plan §9/§12 - the always-present platform_subdomain row can never be removed; custom_domain rows are Org-added. */
export const DOMAIN_MAPPING_TYPES = ['platform_subdomain', 'custom_domain'] as const;
export type DomainMappingType = (typeof DOMAIN_MAPPING_TYPES)[number];

/** Plan §9.1 - CNAME for a subdomain (e.g. "www"), A for an apex/root domain. */
export const DOMAIN_RECORD_TYPES = ['CNAME', 'A'] as const;
export type DomainRecordType = (typeof DOMAIN_RECORD_TYPES)[number];

export const DOMAIN_VERIFICATION_STATUSES = ['pending', 'verified', 'failed'] as const;
export type DomainVerificationStatus = (typeof DOMAIN_VERIFICATION_STATUSES)[number];

export const DOMAIN_SSL_STATUSES = ['pending', 'issued', 'failed'] as const;
export type DomainSslStatus = (typeof DOMAIN_SSL_STATUSES)[number];

/** Plan §9.2 - a Host-header → Site mapping; every request resolves through this before anything Site-scoped happens. */
export interface DomainMapping extends Tenant, Timestamps {
  id: Id;
  type: DomainMappingType;
  hostname: string;
  recordType: DomainRecordType;
  recordName: string;
  recordValue: string;
  verificationStatus: DomainVerificationStatus;
  sslStatus: DomainSslStatus;
}
