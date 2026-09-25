import { http, HttpResponse } from 'msw';
import { db, nowIso } from '../db';
import type { PublishStatus } from '../../types';

function versionParam(request: Request): PublishStatus {
  const url = new URL(request.url);
  return (url.searchParams.get('version') as PublishStatus) || 'published';
}

export const websiteHandlers = [
  http.get('*/api/v1/restaurants/:id/website', ({ params }) => {
    const settings = db.data.website[params.id as string];
    if (!settings) return HttpResponse.json({ error: { code: 'not_found', message: 'Not found.' } }, { status: 404 });
    return HttpResponse.json(settings);
  }),

  http.put('*/api/v1/restaurants/:id/website', async ({ params, request }) => {
    const restaurantId = params.id as string;
    const body = (await request.json()) as Record<string, unknown>;
    const existing = db.data.website[restaurantId];
    const updated = { ...existing, ...body, restaurantId, updatedAt: nowIso() };
    db.data.website[restaurantId] = updated as typeof existing;
    db.save();
    return HttpResponse.json(updated);
  }),

  http.get('*/api/v1/restaurants/:id/brand', ({ params, request }) => {
    const restaurantId = params.id as string;
    const version = versionParam(request);
    const brand = db.data.brand[restaurantId];
    if (!brand) return HttpResponse.json({ error: { code: 'not_found', message: 'Not found.' } }, { status: 404 });
    return HttpResponse.json(brand[version]);
  }),

  http.put('*/api/v1/restaurants/:id/brand', async ({ params, request }) => {
    const restaurantId = params.id as string;
    const body = (await request.json()) as Record<string, unknown>;
    const brand = db.data.brand[restaurantId];
    if (!brand) return HttpResponse.json({ error: { code: 'not_found', message: 'Not found.' } }, { status: 404 });
    brand.draft = { ...brand.draft, ...body, restaurantId, updatedAt: nowIso() };
    db.save();
    return HttpResponse.json(brand.draft);
  }),

  http.post('*/api/v1/restaurants/:id/publish', ({ params }) => {
    const restaurantId = params.id as string;
    const brand = db.data.brand[restaurantId];
    const homepage = db.data.homepage[restaurantId];
    const now = nowIso();
    if (brand) brand.published = { ...brand.draft };
    if (homepage) homepage.published = { ...homepage.draft, status: 'published' };
    const pageContent = db.data.pageContent[restaurantId];
    if (pageContent) pageContent.published = structuredClone(pageContent.draft);
    const website = db.data.website[restaurantId];
    if (website) {
      website.publishStatus = 'published';
      website.publishedAt = now;
      website.updatedAt = now;
    }
    db.save();
    return HttpResponse.json({ publishedAt: now, message: 'Website published.' });
  }),
];
