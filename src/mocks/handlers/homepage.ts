import { http, HttpResponse } from 'msw';
import { db, nowIso } from '../db';
import type { PublishStatus } from '../../types';

function versionParam(request: Request): PublishStatus {
  const url = new URL(request.url);
  return (url.searchParams.get('version') as PublishStatus) || 'published';
}

export const homepageHandlers = [
  http.get('*/api/v1/restaurants/:id/homepage', ({ params, request }) => {
    const restaurantId = params.id as string;
    const version = versionParam(request);
    const homepage = db.data.homepage[restaurantId];
    if (!homepage) return HttpResponse.json({ error: { code: 'not_found', message: 'Not found.' } }, { status: 404 });
    return HttpResponse.json(homepage[version]);
  }),

  http.put('*/api/v1/restaurants/:id/homepage/sections/order', async ({ params, request }) => {
    const restaurantId = params.id as string;
    const { order } = (await request.json()) as { order: { sectionId: string; order: number }[] };
    const homepage = db.data.homepage[restaurantId];
    if (!homepage) return HttpResponse.json({ error: { code: 'not_found', message: 'Not found.' } }, { status: 404 });
    const orderById = new Map(order.map((entry) => [entry.sectionId, entry.order]));
    homepage.draft = {
      ...homepage.draft,
      sections: homepage.draft.sections
        .map((section) => ({
          ...section,
          order: orderById.get(section.id) ?? section.order,
        }))
        .sort((a, b) => a.order - b.order),
    };
    db.save();
    return HttpResponse.json(homepage.draft.sections);
  }),

  http.put('*/api/v1/restaurants/:id/homepage/sections/:type', async ({ params, request }) => {
    const restaurantId = params.id as string;
    const type = params.type as string;
    if (type === 'order') {
      return HttpResponse.json({ error: { code: 'not_found', message: 'Not found.' } }, { status: 404 });
    }
    const body = (await request.json()) as { visible?: boolean; content?: Record<string, unknown> };
    const homepage = db.data.homepage[restaurantId];
    if (!homepage) return HttpResponse.json({ error: { code: 'not_found', message: 'Not found.' } }, { status: 404 });
    const current = homepage.draft.sections.find((s) => s.type === type);
    if (!current) return HttpResponse.json({ error: { code: 'not_found', message: 'Section not found.' } }, { status: 404 });
    const section = {
      ...current,
      visible: body.visible ?? current.visible,
      content: body.content ? { ...current.content, ...body.content } : current.content,
      updatedAt: nowIso(),
    } as typeof current;
    homepage.draft = {
      ...homepage.draft,
      sections: homepage.draft.sections.map((s) => (s.type === type ? section : s)),
    };
    db.save();
    return HttpResponse.json(section);
  }),
];
