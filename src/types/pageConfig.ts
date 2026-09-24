import type { Id, Tenant, Timestamps } from './common';

/** Multi-Vertical Platform Plan §2 - a functional page type with its own data model. */
export const PLATFORM_MODULES = ['catalog', 'booking', 'membership'] as const;
export type PlatformModule = (typeof PLATFORM_MODULES)[number];

/** Plan §8 - 3 fixed layouts per module, freely selectable regardless of Vertical. */
export const TEMPLATE_VARIANTS = ['a', 'b', 'c'] as const;
export type TemplateVariant = (typeof TEMPLATE_VARIANTS)[number];

/** Per-Site, per-module settings (Plan §3.1/§7). */
export interface PageConfig extends Tenant, Timestamps {
  id: Id;
  module: PlatformModule;
  enabled: boolean;
  navLabel: string;
  order: number;
  templateVariant: TemplateVariant;
}
