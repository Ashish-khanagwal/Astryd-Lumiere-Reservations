import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRestaurant } from '../../../context/RestaurantContext';
import { useDraftSave } from '../../context/DraftSaveContext';
import { useAdminToast } from '../../context/AdminToastContext';
import * as homepageService from '../../../services/homepage';
import * as websiteService from '../../../services/website';
import type { BrandSettings, Homepage, HomepageSectionType, TemplateVariant } from '../../../types';

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
    mutationFn: ({ type, payload }: { type: HomepageSectionType; payload: { visible?: boolean; content?: Record<string, unknown>; templateVariant?: TemplateVariant } }) =>
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
              templateVariant: payload.templateVariant ?? section.templateVariant,
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
  const { flushDraft } = useDraftSave();
  const { showToast } = useAdminToast();
  return useMutation({
    mutationKey: ['publish-website', restaurantId],
    mutationFn: async () => {
      await flushDraft();
      const cache = queryClient.getMutationCache();
      const pending = cache.getAll().filter((m) => m.state.status === 'pending' && m.options.mutationKey?.[0] !== 'publish-website');
      if (pending.length) await new Promise<void>((resolve, reject) => {
        const check = () => {
          const failed = pending.find((m) => m.state.status === 'error');
          if (failed) { cleanup(); reject(failed.state.error); }
          else if (pending.every((m) => m.state.status === 'success')) { cleanup(); resolve(); }
        };
        const unsubscribe = cache.subscribe(check);
        const timeout = window.setTimeout(() => { cleanup(); reject(new Error('Draft changes are still saving. Please retry publishing.')); }, 30000);
        const cleanup = () => { unsubscribe(); window.clearTimeout(timeout); };
        check();
      });
      return websiteService.publishWebsite(restaurantId);
    },
    onError: (error) => showToast(error instanceof Error ? error.message : 'Publishing failed. Your draft is preserved.'),
    onSuccess: () => queryClient.invalidateQueries(),
  });
}
