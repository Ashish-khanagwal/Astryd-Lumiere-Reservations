import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRestaurant } from '../../../context/RestaurantContext';
import * as pageConfigService from '../../../services/pageConfig';
import type { PageConfig, PlatformModule } from '../../../types';

export function usePageConfigs() {
  const { restaurantId } = useRestaurant();
  return useQuery({
    queryKey: ['admin-page-configs', restaurantId],
    queryFn: () => pageConfigService.getPageConfigs(restaurantId),
  });
}

export function useUpdatePageConfig() {
  const { restaurantId } = useRestaurant();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ module, patch }: { module: PlatformModule; patch: Partial<Pick<PageConfig, 'enabled' | 'navLabel' | 'order' | 'templateVariant'>> }) =>
      pageConfigService.updatePageConfig(restaurantId, module, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-page-configs', restaurantId] }),
  });
}
