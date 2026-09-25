import { http } from './http';
import type { PageConfig, PlatformModule } from '../types';

export const getPageConfigs = (siteId: string) => http.get<PageConfig[]>(`/sites/${siteId}/pages`);

export const updatePageConfig = (
  siteId: string,
  module: PlatformModule,
  patch: Partial<Pick<PageConfig, 'enabled' | 'navLabel' | 'order' | 'templateVariant'>>,
) => http.patch<PageConfig>(`/sites/${siteId}/pages/${module}`, patch);
