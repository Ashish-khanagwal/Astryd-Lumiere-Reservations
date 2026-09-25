import { http } from './http';
import type { ContentFields, ContentPageKey, PageContentMap, PublishStatus } from '../types';

export const getPageContent = (siteId: string, version: PublishStatus = 'published') =>
  http.get<PageContentMap>(`/restaurants/${siteId}/page-content?version=${version}`);

export const updatePageContent = (siteId: string, page: ContentPageKey, fields: ContentFields) =>
  http.put<{ page: ContentPageKey; fields: ContentFields }>(`/restaurants/${siteId}/page-content/${page}`, { fields });
