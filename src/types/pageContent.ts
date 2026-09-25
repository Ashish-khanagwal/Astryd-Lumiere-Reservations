import type { PlatformModule, TemplateVariant } from './pageConfig';

/** Every public page whose text/images can be edited from Admin → Website → Page Content. `global` = header, footer, cart drawer and shared modals. */
export const CONTENT_PAGE_KEYS = ['landing', 'items', 'catalog', 'booking', 'membership', 'checkout', 'global'] as const;
export type ContentPageKey = (typeof CONTENT_PAGE_KEYS)[number];

export type ContentListItem = { id: string } & Record<string, string>;
export type ContentValue = string | ContentListItem[];
export type ContentFields = Record<string, ContentValue>;

/** Sparse per-Site overrides; anything missing falls back to the code defaults for the Site's Vertical. */
export type PageContentMap = Partial<Record<ContentPageKey, ContentFields>>;

export type ContentFieldType = 'text' | 'textarea' | 'image' | 'list';

export interface ContentFieldDef {
  key: string;
  label: string;
  type: ContentFieldType;
  hint?: string;
  /** For `list` fields - the editable properties of each item. */
  itemFields?: Array<{ key: string; label: string; type: 'text' | 'textarea' | 'image' }>;
  /** Items can be edited but not added/removed (their ids are referenced by code). */
  fixedItems?: boolean;
}

export interface ContentGroupDef {
  id: string;
  title: string;
  description?: string;
  /** Micro-labels, toasts, errors, aria labels - collapsed by default in the editor. */
  advanced?: boolean;
  /** Only relevant when the page's module uses one of these layouts. */
  variants?: TemplateVariant[];
  fields: ContentFieldDef[];
}

export interface ContentPageDefinition {
  key: ContentPageKey;
  label: string;
  description: string;
  /** Appended to the preview URL so Preview opens this page. */
  previewHash: string;
  module?: PlatformModule;
  groups: ContentGroupDef[];
  defaults: ContentFields;
  verticalDefaults?: Partial<Record<'restaurant' | 'gym' | 'retail', ContentFields>>;
}
