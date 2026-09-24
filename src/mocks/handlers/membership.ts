import { http, HttpResponse } from 'msw';
import { db, nextId, nowIso } from '../db';
import type { MemberStatus, MembershipBillingInterval } from '../../types';

function nextBillingDateFor(interval: MembershipBillingInterval, from: Date): string | null {
  if (interval === 'one_time') return null;
  const d = new Date(from);
  if (interval === 'monthly') d.setMonth(d.getMonth() + 1);
  if (interval === 'quarterly') d.setMonth(d.getMonth() + 3);
  if (interval === 'yearly') d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

export const membershipHandlers = [
  // Plans
  http.get('*/api/v1/sites/:id/membership/plans', ({ params }) =>
    HttpResponse.json(
      db.data.membershipPlans.filter((p) => p.restaurantId === params.id).sort((a, b) => a.order - b.order),
    ),
  ),

  http.post('*/api/v1/sites/:id/membership/plans', async ({ params, request }) => {
    const restaurantId = params.id as string;
    const body = (await request.json()) as Record<string, unknown>;
    const now = nowIso();
    const plan = {
      id: nextId('plan'),
      restaurantId,
      name: (body.name as string) ?? 'New Plan',
      description: (body.description as string) ?? '',
      priceCents: (body.priceCents as number) ?? 0,
      billingInterval: (body.billingInterval as MembershipBillingInterval) ?? 'monthly',
      benefits: (body.benefits as string[]) ?? [],
      isActive: (body.isActive as boolean) ?? true,
      order: db.data.membershipPlans.filter((p) => p.restaurantId === restaurantId).length,
      createdAt: now,
      updatedAt: now,
    };
    db.data.membershipPlans.push(plan);
    db.save();
    return HttpResponse.json(plan, { status: 201 });
  }),

  http.patch('*/api/v1/sites/:id/membership/plans/:planId', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const plan = db.data.membershipPlans.find((p) => p.id === params.planId);
    if (!plan) return HttpResponse.json({ error: { code: 'not_found', message: 'Plan not found.' } }, { status: 404 });
    Object.assign(plan, body, { updatedAt: nowIso() });
    db.save();
    return HttpResponse.json(plan);
  }),

  http.delete('*/api/v1/sites/:id/membership/plans/:planId', ({ params }) => {
    db.data.membershipPlans = db.data.membershipPlans.filter((p) => p.id !== params.planId);
    db.save();
    return HttpResponse.json({ message: 'Plan removed.' });
  }),

  // Members
  http.get('*/api/v1/sites/:id/membership/members', ({ params, request }) => {
    const email = new URL(request.url).searchParams.get('email')?.trim().toLowerCase();
    return HttpResponse.json(
      db.data.members
        .filter((m) => m.restaurantId === params.id)
        .filter((m) => !email || m.customerEmail.toLowerCase() === email)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    );
  }),

  http.post('*/api/v1/sites/:id/membership/members', async ({ params, request }) => {
    const restaurantId = params.id as string;
    const body = (await request.json()) as Record<string, unknown>;
    const now = nowIso();
    const plan = db.data.membershipPlans.find((p) => p.id === body.planId);
    const startDate = (body.startDate as string) ?? now.slice(0, 10);
    const member = {
      id: nextId('member'),
      restaurantId,
      planId: (body.planId as string) ?? '',
      customerName: (body.customerName as string) ?? 'New Member',
      customerEmail: (body.customerEmail as string) ?? '',
      customerPhone: (body.customerPhone as string) ?? '',
      status: 'active' as MemberStatus,
      startDate,
      nextBillingDate: plan ? nextBillingDateFor(plan.billingInterval, new Date(startDate)) : null,
      notes: body.notes as string | undefined,
      createdAt: now,
      updatedAt: now,
    };
    db.data.members.push(member);
    db.save();
    return HttpResponse.json(member, { status: 201 });
  }),

  http.patch('*/api/v1/sites/:id/membership/members/:memberId', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const member = db.data.members.find((m) => m.id === params.memberId);
    if (!member) return HttpResponse.json({ error: { code: 'not_found', message: 'Member not found.' } }, { status: 404 });
    Object.assign(member, body, { updatedAt: nowIso() });
    db.save();
    return HttpResponse.json(member);
  }),

  http.delete('*/api/v1/sites/:id/membership/members/:memberId', ({ params }) => {
    db.data.members = db.data.members.filter((m) => m.id !== params.memberId);
    db.save();
    return HttpResponse.json({ message: 'Member removed.' });
  }),

  // Check-ins
  http.get('*/api/v1/sites/:id/membership/members/:memberId/check-ins', ({ params }) =>
    HttpResponse.json(
      db.data.memberCheckIns
        .filter((c) => c.memberId === params.memberId)
        .sort((a, b) => new Date(b.checkedInAt).getTime() - new Date(a.checkedInAt).getTime()),
    ),
  ),

  http.post('*/api/v1/sites/:id/membership/members/:memberId/check-ins', ({ params }) => {
    const checkIn = {
      id: nextId('checkin'),
      restaurantId: params.id as string,
      memberId: params.memberId as string,
      checkedInAt: nowIso(),
    };
    db.data.memberCheckIns.push(checkIn);
    db.save();
    return HttpResponse.json(checkIn, { status: 201 });
  }),
];
