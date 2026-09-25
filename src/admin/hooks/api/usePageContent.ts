import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRestaurant } from '../../../context/RestaurantContext';
import * as pageContentService from '../../../services/pageContent';
import type { ContentFields, ContentPageKey } from '../../../types';

export function usePageContentDraft() {
  const { restaurantId } = useRestaurant();
  return useQuery({
    queryKey: ['admin-page-content-draft', restaurantId],
    queryFn: () => pageContentService.getPageContent(restaurantId, 'draft'),
  });
}

export function useUpdatePageContent() {
  const { restaurantId } = useRestaurant();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ page, fields }: { page: ContentPageKey; fields: ContentFields }) =>
      pageContentService.updatePageContent(restaurantId, page, fields),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-page-content-draft', restaurantId] }),
  });
}
