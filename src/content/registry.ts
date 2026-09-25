import type { ContentFields, ContentPageDefinition, ContentPageKey, PageContentMap, Vertical } from '../types';
import { landingContent } from './pages/landing';
import { itemsContent } from './pages/items';
import { catalogContent } from './pages/catalog';
import { bookingContent } from './pages/booking';
import { membershipContent } from './pages/membership';
import { checkoutContent } from './pages/checkout';
import { globalContent } from './pages/global';

export const CONTENT_PAGES: Record<ContentPageKey, ContentPageDefinition> = {
  landing: landingContent,
  items: itemsContent,
  catalog: catalogContent,
  booking: bookingContent,
  membership: membershipContent,
  checkout: checkoutContent,
  global: globalContent,
};

export function contentDefaults(vertical: Vertical, page: ContentPageKey): ContentFields {
  const def = CONTENT_PAGES[page];
  return { ...def.defaults, ...(def.verticalDefaults?.[vertical] ?? {}) };
}

/** Code defaults for the Site's Vertical, overlaid with whatever the owner has edited. */
export function resolvePageContent(vertical: Vertical, page: ContentPageKey, stored: PageContentMap | undefined): ContentFields {
  return { ...contentDefaults(vertical, page), ...(stored?.[page] ?? {}) };
}

/** Replaces `{token}` placeholders; unknown tokens are left as-is so a typo is visible rather than silently blank. */
export function fillTokens(template: string, vars: Record<string, string | number | undefined>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = vars[name];
    return value === undefined ? match : String(value);
  });
}
