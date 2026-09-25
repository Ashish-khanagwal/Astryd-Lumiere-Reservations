import { http, HttpResponse } from 'msw';
import { db, nowIso } from '../db';
import { CONTENT_PAGE_KEYS, type ContentFields, type ContentPageKey, type PublishStatus } from '../../types';

function store(siteId: string) {
  db.data.pageContent[siteId] ??= { draft: {}, published: {} };
  return db.data.pageContent[siteId];
}

export const pageContentHandlers = [
  http.get('*/api/v1/restaurants/:id/page-content', ({ params, request }) => {
    const version = (new URL(request.url).searchParams.get('version') as PublishStatus) || 'published';
    return HttpResponse.json(store(params.id as string)[version]);
  }),

  /** Replaces (not merges) the page's draft overrides, so a key the editor dropped reverts that field to its default. */
  http.put('*/api/v1/restaurants/:id/page-content/:page', async ({ params, request }) => {
    const page = params.page as ContentPageKey;
    if (!CONTENT_PAGE_KEYS.includes(page)) {
      return HttpResponse.json({ error: { code: 'not_found', message: 'Unknown page.' } }, { status: 404 });
    }
    const body = (await request.json()) as { fields?: ContentFields };
    const s = store(params.id as string);
    s.draft = { ...s.draft, [page]: body.fields ?? {} };
    db.save();
    return HttpResponse.json({ page, fields: s.draft[page], updatedAt: nowIso() });
  }),
];
