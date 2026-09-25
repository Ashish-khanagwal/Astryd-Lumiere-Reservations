import { useMemo } from 'react';
import { usePublicData } from './PublicDataContext';
import { fillTokens, resolvePageContent } from '../content/registry';
import type { ContentListItem, ContentPageKey } from '../types';

type Vars = Record<string, string | number | undefined>;

/**
 * Public-site accessor for Admin → Website → Page Content. Every string supports `{brand}`, `{city}` and
 * `{cuisine}` (cuisine/style, else tagline - from Brand settings) plus any caller-supplied `{token}`.
 */
export function usePageContent(page: ContentPageKey) {
  const { pageContent, vertical, brand } = usePublicData();

  return useMemo(() => {
    const fields = resolvePageContent(vertical, page, pageContent);
    const city = (brand?.contact?.address ?? '').split(',').slice(-2, -1)[0]?.trim() ?? '';
    const baseVars: Vars = { brand: brand?.restaurantName ?? '', city, cuisine: brand?.cuisineType || brand?.tagline || '' };

    const text = (key: string, vars?: Vars): string => {
      const value = fields[key];
      return typeof value === 'string' ? fillTokens(value, { ...baseVars, ...vars }) : '';
    };

    const list = (key: string, vars?: Vars): ContentListItem[] => {
      const value = fields[key];
      if (!Array.isArray(value)) return [];
      return value.map((item) => {
        const out: ContentListItem = { id: item.id };
        for (const [k, v] of Object.entries(item)) {
          if (k !== 'id') out[k] = fillTokens(v, { ...baseVars, ...vars });
        }
        return out;
      });
    };

    const image = (key: string): string => {
      const value = fields[key];
      return typeof value === 'string' ? value : '';
    };

    return { text, list, image };
  }, [page, pageContent, vertical, brand]);
}
