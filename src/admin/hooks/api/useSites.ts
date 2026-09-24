import { useQuery } from '@tanstack/react-query';
import * as siteService from '../../../services/sites';

/** Takes `organizationId` explicitly (not via `useRestaurant()`) so `RestaurantContext` can use this hook itself without a circular dependency. */
export function useSites(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['sites', organizationId],
    queryFn: () => siteService.getSites(organizationId as string),
    enabled: Boolean(organizationId),
  });
}
