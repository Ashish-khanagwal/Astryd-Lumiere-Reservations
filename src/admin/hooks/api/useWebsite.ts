import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRestaurant } from '../../../context/RestaurantContext';
import * as homepageService from '../../../services/homepage';
import * as websiteService from '../../../services/website';
import type { BrandSettings, Homepage, HomepageSectionType } from '../../../types';

export function useHomepageDraft() {
  const { restaurantId } = useRestaurant();
  return useQuery({
    queryKey: ['admin-homepage-draft', restaurantId],
    queryFn: () => homepageService.getHomepage(restaurantId, 'draft'),
  });
}

export function useReorderSections() {
  const { restaurantId } = useRestaurant();
  const queryClient = useQueryClient();
  const queryKey = ['admin-homepage-draft', restaurantId] as const;
  return useMutation({
    mutationFn: (order: { sectionId: string; order: number }[]) =>
      homepageService.reorderHomepageSections(restaurantId, order),
    onMutate: async (order) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Homepage>(queryKey);
      if (previous) {
        const orderById = new Map(order.map((entry) => [entry.sectionId, entry.order]));
        queryClient.setQueryData<Homepage>(queryKey, {
          ...previous,
          sections: previous.sections
            .map((section) => ({ ...section, order: orderById.get(section.id) ?? section.order }))
            .sort((a, b) => a.order - b.order),
        });
      }
      return { previous };
    },
    onError: (_error, _order, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useUpdateSection() {
  const { restaurantId } = useRestaurant();
  const queryClient = useQueryClient();
  const queryKey = ['admin-homepage-draft', restaurantId] as const;
  return useMutation({
    mutationFn: ({ type, payload }: { type: HomepageSectionType; payload: { visible?: boolean; content?: Record<string, unknown> } }) =>
      homepageService.updateHomepageSection(restaurantId, type, payload),
    onMutate: async ({ type, payload }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Homepage>(queryKey);
      if (previous) {
        queryClient.setQueryData<Homepage>(queryKey, {
          ...previous,
          sections: previous.sections.map((section) => {
            if (section.type !== type) return section;
            return {
              ...section,
              visible: payload.visible ?? section.visible,
              content: payload.content ? { ...section.content, ...payload.content } : section.content,
            } as typeof section;
          }),
        });
      }
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useBrandDraft() {
  const { restaurantId } = useRestaurant();
  return useQuery({
    queryKey: ['admin-brand-draft', restaurantId],
    queryFn: () => websiteService.getBrandSettings(restaurantId, 'draft'),
  });
}

export function useUpdateBrand() {
  const { restaurantId } = useRestaurant();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<BrandSettings>) => websiteService.updateBrandSettings(restaurantId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-brand-draft', restaurantId] }),
  });
}

export function useWebsiteStatus() {
  const { restaurantId } = useRestaurant();
  return useQuery({
    queryKey: ['admin-website-status', restaurantId],
    queryFn: () => websiteService.getWebsiteSettings(restaurantId, 'draft'),
  });
}

export function usePublishWebsite() {
  const { restaurantId } = useRestaurant();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => websiteService.publishWebsite(restaurantId),
    onSuccess: () => queryClient.invalidateQueries(),
  });
}
