import { createContext, useContext, type ReactNode } from 'react';
import { useAuth } from './AuthContext';

const DEFAULT_RESTAURANT_ID = import.meta.env.VITE_DEFAULT_RESTAURANT_ID || 'rest_lumiere';
const DEFAULT_RESTAURANT_SLUG = import.meta.env.VITE_DEFAULT_RESTAURANT_SLUG || 'lumiere-mayfair';
const DEFAULT_ORGANIZATION_ID = import.meta.env.VITE_DEFAULT_ORGANIZATION_ID || 'org_lumiere';

interface RestaurantContextValue {
  organizationId: string;
  restaurantId: string;
  restaurantSlug: string;
}

const RestaurantContext = createContext<RestaurantContextValue>({
  organizationId: DEFAULT_ORGANIZATION_ID,
  restaurantId: DEFAULT_RESTAURANT_ID,
  restaurantSlug: DEFAULT_RESTAURANT_SLUG,
});

/** Public site: always resolves to the single seeded restaurant (no real domain routing yet - Multi-Vertical Platform Plan §9.2 is what eventually replaces this with Host-header resolution). */
export function PublicRestaurantProvider({ children }: { children: ReactNode }) {
  return (
    <RestaurantContext.Provider
      value={{ organizationId: DEFAULT_ORGANIZATION_ID, restaurantId: DEFAULT_RESTAURANT_ID, restaurantSlug: DEFAULT_RESTAURANT_SLUG }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

/** Admin: resolves from the logged-in user's organizationId/restaurantId (falls back to the defaults for super_admin, whose cross-tenant management is out of MVP scope). */
export function AdminRestaurantProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const organizationId = user?.organizationId ?? DEFAULT_ORGANIZATION_ID;
  const restaurantId = user?.restaurantId ?? DEFAULT_RESTAURANT_ID;
  return (
    <RestaurantContext.Provider value={{ organizationId, restaurantId, restaurantSlug: DEFAULT_RESTAURANT_SLUG }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  return useContext(RestaurantContext);
}
