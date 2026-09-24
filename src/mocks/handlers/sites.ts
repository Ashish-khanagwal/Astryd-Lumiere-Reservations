import { http, HttpResponse } from 'msw';
import { db } from '../db';
import { userFromAuthHeader } from './auth';

export const siteHandlers = [
  http.get('*/api/v1/organizations/:orgId/sites', ({ params, request }) => {
    const caller = userFromAuthHeader(request);
    const orgSites = db.data.restaurants.filter((r) => r.organizationId === params.orgId);
    const visible =
      !caller || caller.siteAccess === 'all' ? orgSites : orgSites.filter((r) => caller.siteAccess.includes(r.id));
    return HttpResponse.json(visible);
  }),
];
