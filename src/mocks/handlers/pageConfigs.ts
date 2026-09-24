import { http, HttpResponse } from 'msw';
import { db, nowIso } from '../db';
import type { PageConfig } from '../../types';

export const pageConfigHandlers = [
  http.get('*/api/v1/sites/:id/pages', ({ params }) =>
    HttpResponse.json(
      db.data.pageConfigs.filter((p) => p.restaurantId === params.id).sort((a, b) => a.order - b.order),
    ),
  ),

  http.patch('*/api/v1/sites/:id/pages/:module', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Pick<PageConfig, 'enabled' | 'navLabel' | 'order' | 'templateVariant'>>;
    const config = db.data.pageConfigs.find((p) => p.restaurantId === params.id && p.module === params.module);
    if (!config) {
      return HttpResponse.json({ error: { code: 'not_found', message: 'Page config not found.' } }, { status: 404 });
    }
    Object.assign(config, body, { updatedAt: nowIso() });
    db.save();
    return HttpResponse.json(config);
  }),
];
