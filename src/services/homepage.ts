import { http } from './http';
import type { Homepage, HomepageSection, HomepageSectionType, PublishStatus, TemplateVariant } from '../types';

export const getHomepage = (restaurantId: string, version: PublishStatus = 'published') =>
  http.get<Homepage>(`/restaurants/${restaurantId}/homepage?version=${version}`);

export const reorderHomepageSections = (
  restaurantId: string,
  order: { sectionId: string; order: number }[],
) =>
  http.put<HomepageSection[]>(`/restaurants/${restaurantId}/homepage/sections/order`, { order });

export const updateHomepageSection = (
  restaurantId: string,
  type: HomepageSectionType,
  payload: { visible?: boolean; content?: Record<string, unknown>; templateVariant?: TemplateVariant },
) => http.put<HomepageSection>(`/restaurants/${restaurantId}/homepage/sections/${type}`, payload);
