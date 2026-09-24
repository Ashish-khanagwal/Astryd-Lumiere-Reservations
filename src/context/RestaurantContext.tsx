import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext';
import { getSites } from '../services/sites';
import type { Restaurant } from '../types';

const DEFAULT_RESTAURANT_ID = import.meta.env.VITE_DEFAULT_RESTAURANT_ID || 'rest_lumiere';
const DEFAULT_RESTAURANT_SLUG = import.meta.env.VITE_DEFAULT_RESTAURANT_SLUG || 'lumiere-mayfair';
const DEFAULT_ORGANIZATION_ID = import.meta.env.VITE_DEFAULT_ORGANIZATION_ID || 'org_lumiere';
const ACTIVE_SITE_STORAGE_KEY = 'admin_active_site_id';

interface RestaurantContextValue {
  organizationId: string;
  restaurantId: string;
  restaurantSlug: string;
  /** Multi-Vertical Platform Plan §14, Phase 1 - the Sites this user can switch between within their Org; empty on the public site. */
  sites: Restaurant[];
  setActiveSiteId: (siteId: string) => void;
}

const RestaurantContext = createContext<RestaurantContextValue>({
  organizationId: DEFAULT_ORGANIZATION_ID,
  restaurantId: DEFAULT_RESTAURANT_ID,
  restaurantSlug: DEFAULT_RESTAURANT_SLUG,
  sites: [],
  setActiveSiteId: () => {},
});

/** Public site: always resolves to the single seeded restaurant (no real domain routing yet - Multi-Vertical Platform Plan §9.2 is what eventually replaces this with Host-header resolution). */
export function PublicRestaurantProvider({ children }: { children: ReactNode }) {
  return (
    <RestaurantContext.Provider
      value={{
        organizationId: DEFAULT_ORGANIZATION_ID,
        restaurantId: DEFAULT_RESTAURANT_ID,
        restaurantSlug: DEFAULT_RESTAURANT_SLUG,
        sites: [],
        setActiveSiteId: () => {},
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

/**
 * Admin: resolves the Org from the logged-in user, then which Site within it is "active" (Multi-Vertical
 * Platform Plan §10.2's Site switcher). Falls back to the user's own `restaurantId`, then the first Site
 * the API returns, then the global defaults - in that order - so this degrades gracefully for a
 * single-Site Org (today's only real case) while being ready for more.
 */
export function AdminRestaurantProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const organizationId = user?.organizationId ?? DEFAULT_ORGANIZATION_ID;

  const { data: sites } = useQuery({
    queryKey: ['sites', organizationId],
    queryFn: () => getSites(organizationId),
    enabled: Boolean(user),
  });

  const [activeSiteId, setActiveSiteIdState] = useState<string | null>(() =>
    localStorage.getItem(ACTIVE_SITE_STORAGE_KEY),
  );

  useEffect(() => {
    if (!sites || sites.length === 0) return;
    if (activeSiteId && sites.some((s) => s.id === activeSiteId)) return;
    const fallback = sites.find((s) => s.id === user?.restaurantId)?.id ?? sites[0].id;
    setActiveSiteIdState(fallback);
    localStorage.setItem(ACTIVE_SITE_STORAGE_KEY, fallback);
  }, [sites, activeSiteId, user?.restaurantId]);

  const setActiveSiteId = useCallback(
    (siteId: string) => {
      setActiveSiteIdState(siteId);
      localStorage.setItem(ACTIVE_SITE_STORAGE_KEY, siteId);
      // Every admin data hook keys its queries `['admin-<domain>', restaurantId, ...]` - re-scope them all in one go.
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && key.startsWith('admin-');
        },
      });
    },
    [queryClient],
  );

  const activeSite = sites?.find((s) => s.id === activeSiteId);
  const restaurantId = activeSite?.id ?? user?.restaurantId ?? DEFAULT_RESTAURANT_ID;
  const restaurantSlug = activeSite?.slug ?? DEFAULT_RESTAURANT_SLUG;

  return (
    <RestaurantContext.Provider value={{ organizationId, restaurantId, restaurantSlug, sites: sites ?? [], setActiveSiteId }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  return useContext(RestaurantContext);
}
