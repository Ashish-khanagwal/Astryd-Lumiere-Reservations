import { http, HttpResponse } from 'msw';
import { db, nextId, nowIso } from '../db';

export const userHandlers = [
  http.get('*/api/v1/restaurants/:id/users', ({ params }) =>
    HttpResponse.json(db.data.users.filter((u) => u.restaurantId === params.id)),
  ),

  http.post('*/api/v1/restaurants/:id/users', async ({ params, request }) => {
    const restaurantId = params.id as string;
    const organizationId = db.data.restaurants.find((r) => r.id === restaurantId)?.organizationId ?? '';
    const body = (await request.json()) as Record<string, unknown>;
    const now = nowIso();
    const role = (body.role as 'owner' | 'staff') ?? 'staff';
    const user = {
      id: nextId('user'),
      organizationId,
      email: (body.email as string) ?? '',
      name: (body.name as string) ?? 'New User',
      role,
      restaurantId,
      siteAccess: role === 'owner' ? ('all' as const) : ((body.siteAccess as string[]) ?? [restaurantId]),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    db.data.users.push(user);
    db.save();
    return HttpResponse.json(user, { status: 201 });
  }),

  http.put('*/api/v1/restaurants/:id/users/:userId', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const user = db.data.users.find((u) => u.id === params.userId);
    if (!user) return HttpResponse.json({ error: { code: 'not_found', message: 'User not found.' } }, { status: 404 });
    Object.assign(user, body, { updatedAt: nowIso() });
    db.save();
    return HttpResponse.json(user);
  }),

  http.delete('*/api/v1/restaurants/:id/users/:userId', ({ params }) => {
    db.data.users = db.data.users.filter((u) => u.id !== params.userId);
    db.save();
    return HttpResponse.json({ message: 'User removed.' });
  }),
];
