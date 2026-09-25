import { http, HttpResponse } from 'msw';
import { db, nowIso } from '../db';
import { userFromAuthHeader } from './auth';

function forbidden() {
  return HttpResponse.json({ error: { code: 'forbidden', message: 'Super Admin access required.' } }, { status: 403 });
}

export const siteHandlers = [
  http.get('*/api/v1/organizations/:orgId/sites', ({ params, request }) => {
    const caller = userFromAuthHeader(request);
    const orgSites = db.data.restaurants.filter((r) => r.organizationId === params.orgId);
    const visible =
      !caller || caller.siteAccess === 'all' ? orgSites : orgSites.filter((r) => caller.siteAccess.includes(r.id));
    return HttpResponse.json(visible);
  }),

  /** Multi-Vertical Platform Plan §5.2 - every Site across every Org, for the Platform → Sites console. Super Admin only. */
  http.get('*/api/v1/superadmin/sites', ({ request }) => {
    const caller = userFromAuthHeader(request);
    if (!caller || caller.role !== 'super_admin') return forbidden();
    const orgNameById = new Map(db.data.organizations.map((o) => [o.id, o.name]));
    const rows = db.data.restaurants.map((site) => ({
      ...site,
      organizationName: orgNameById.get(site.organizationId) ?? 'Unknown organization',
    }));
    return HttpResponse.json(rows);
  }),

  /** The only write path for `brandingBadgeEnabled` - deliberately separate from the Org-editable brand/website endpoints. Super Admin only. */
  http.patch('*/api/v1/superadmin/sites/:id/branding-badge', async ({ params, request }) => {
    const caller = userFromAuthHeader(request);
    if (!caller || caller.role !== 'super_admin') return forbidden();
    const body = (await request.json()) as { enabled?: boolean };
    const site = db.data.restaurants.find((r) => r.id === params.id);
    if (!site) return HttpResponse.json({ error: { code: 'not_found', message: 'Site not found.' } }, { status: 404 });
    if (typeof body.enabled === 'boolean') site.brandingBadgeEnabled = body.enabled;
    site.updatedAt = nowIso();
    db.save();
    return HttpResponse.json(site);
  }),

  /** Public, read-only - lets the storefront footer decide whether to render the badge, and lets the whole public site style itself per Vertical (Plan §2), without exposing anything else about the Site. */
  http.get('*/api/v1/public/sites/:id/branding-badge', ({ params }) => {
    const site = db.data.restaurants.find((r) => r.id === params.id);
    return HttpResponse.json({ enabled: site?.brandingBadgeEnabled ?? true, vertical: site?.vertical ?? 'restaurant' });
  }),
];
