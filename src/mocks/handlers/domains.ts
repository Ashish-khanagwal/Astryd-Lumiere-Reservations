import { http, HttpResponse } from 'msw';
import { db, nextId, nowIso } from '../db';
import type { DomainMapping, DomainRecordType } from '../../types';

/** Plan §9.1 - "www"/subdomain hostnames get a CNAME, an apex/root domain (no subdomain label) gets an A record. */
function recordFor(hostname: string): { recordType: DomainRecordType; recordName: string; recordValue: string } {
  const labels = hostname.split('.');
  const isApex = labels.length <= 2;
  if (isApex) {
    return { recordType: 'A', recordName: '@', recordValue: '76.76.21.21' };
  }
  return { recordType: 'CNAME', recordName: labels[0], recordValue: 'cname.ourplatform.com' };
}

/** No real DNS to poll against in a mock backend - simulate the background cron by auto-promoting a pending
 * domain once it's been sitting long enough that a real check would plausibly have already run. */
const AUTO_VERIFY_AFTER_MS = 8000;

function tickPendingDomains(siteId: string) {
  const now = Date.now();
  let changed = false;
  db.data.domainMappings
    .filter((d) => d.restaurantId === siteId && d.verificationStatus === 'pending')
    .forEach((d) => {
      if (now - new Date(d.createdAt).getTime() >= AUTO_VERIFY_AFTER_MS) {
        d.verificationStatus = 'verified';
        d.sslStatus = 'issued';
        d.updatedAt = nowIso();
        changed = true;
      }
    });
  if (changed) db.save();
}

export const domainHandlers = [
  http.get('*/api/v1/sites/:id/domains', ({ params }) => {
    const siteId = params.id as string;
    tickPendingDomains(siteId);
    return HttpResponse.json(
      db.data.domainMappings
        .filter((d) => d.restaurantId === siteId)
        .sort((a, b) => (a.type === b.type ? 0 : a.type === 'platform_subdomain' ? -1 : 1)),
    );
  }),

  http.post('*/api/v1/sites/:id/domains', async ({ params, request }) => {
    const siteId = params.id as string;
    const body = (await request.json()) as { hostname?: string };
    const hostname = body.hostname?.trim().toLowerCase();
    if (!hostname) {
      return HttpResponse.json({ error: { code: 'invalid_hostname', message: 'Enter a domain.' } }, { status: 400 });
    }
    if (db.data.domainMappings.some((d) => d.hostname === hostname)) {
      return HttpResponse.json({ error: { code: 'duplicate_hostname', message: 'That domain is already in use.' } }, { status: 409 });
    }
    const now = nowIso();
    const domain: DomainMapping = {
      id: nextId('domain'),
      restaurantId: siteId,
      type: 'custom_domain',
      hostname,
      ...recordFor(hostname),
      verificationStatus: 'pending',
      sslStatus: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    db.data.domainMappings.push(domain);
    db.save();
    return HttpResponse.json(domain, { status: 201 });
  }),

  http.post('*/api/v1/sites/:id/domains/:domainId/verify', ({ params }) => {
    const domain = db.data.domainMappings.find((d) => d.id === params.domainId && d.restaurantId === params.id);
    if (!domain) {
      return HttpResponse.json({ error: { code: 'not_found', message: 'Domain not found.' } }, { status: 404 });
    }
    // A manual "check now" always resolves immediately - there's no real registrar to query in a mock.
    domain.verificationStatus = 'verified';
    domain.sslStatus = 'issued';
    domain.updatedAt = nowIso();
    db.save();
    return HttpResponse.json(domain);
  }),

  http.delete('*/api/v1/sites/:id/domains/:domainId', ({ params }) => {
    const domain = db.data.domainMappings.find((d) => d.id === params.domainId && d.restaurantId === params.id);
    if (domain?.type === 'platform_subdomain') {
      return HttpResponse.json({ error: { code: 'not_removable', message: 'The default domain can\'t be removed.' } }, { status: 400 });
    }
    db.data.domainMappings = db.data.domainMappings.filter((d) => !(d.id === params.domainId && d.restaurantId === params.id));
    db.save();
    return HttpResponse.json({ message: 'Domain removed.' });
  }),
];
