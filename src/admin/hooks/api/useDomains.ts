import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRestaurant } from '../../../context/RestaurantContext';
import * as domainService from '../../../services/domains';
import type { DomainMapping } from '../../../types';

export function useDomains() {
  const { restaurantId } = useRestaurant();
  return useQuery({
    queryKey: ['admin-domains', restaurantId],
    queryFn: () => domainService.getDomains(restaurantId),
    // Poll while a domain is still waiting on DNS/SSL, so "pending" flips to "verified" on screen without a manual refresh.
    refetchInterval: (query) => {
      const data = query.state.data as DomainMapping[] | undefined;
      return data?.some((d) => d.verificationStatus === 'pending') ? 3000 : false;
    },
  });
}

export function useAddDomain() {
  const { restaurantId } = useRestaurant();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (hostname: string) => domainService.addDomain(restaurantId, hostname),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-domains', restaurantId] }),
  });
}

export function useVerifyDomain() {
  const { restaurantId } = useRestaurant();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (domainId: string) => domainService.verifyDomain(restaurantId, domainId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-domains', restaurantId] }),
  });
}

export function useDeleteDomain() {
  const { restaurantId } = useRestaurant();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (domainId: string) => domainService.deleteDomain(restaurantId, domainId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-domains', restaurantId] }),
  });
}
