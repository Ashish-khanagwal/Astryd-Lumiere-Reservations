import { http, HttpResponse } from 'msw';
import { db, nextId, nowIso } from '../db';
import type { OrderLineItem } from '../../types';

export const orderHandlers = [
  http.get('*/api/v1/restaurants/:id/orders', ({ params }) =>
    HttpResponse.json(
      db.data.orders
        .filter((o) => o.restaurantId === params.id)
        .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()),
    ),
  ),

  http.post('*/api/v1/restaurants/:id/orders', async ({ params, request }) => {
    const restaurantId = params.id as string;
    const body = (await request.json()) as Record<string, unknown>;
    const now = nowIso();
    const items = (body.items as OrderLineItem[]) ?? [];
    const order = {
      id: nextId('order'),
      restaurantId,
      orderNumber: String(1000 + db.data.orders.length + 1),
      status: 'pending' as const,
      service: (body.service as 'pickup' | 'delivery') ?? 'pickup',
      paymentMethod: (body.paymentMethod as 'apple' | 'google' | 'card' | 'cash') ?? 'card',
      customerName: (body.customerName as string) ?? 'Guest',
      customerPhone: (body.customerPhone as string) ?? '',
      customerEmail: (body.customerEmail as string) ?? '',
      address: body.address as string | undefined,
      instructions: body.instructions as string | undefined,
      items,
      subtotal: (body.subtotal as number) ?? 0,
      taxes: (body.taxes as number) ?? 0,
      deliveryFee: (body.deliveryFee as number) ?? 0,
      total: (body.total as number) ?? 0,
      placedAt: now,
      statusUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    db.data.orders.push(order);
    db.save();
    return HttpResponse.json(order, { status: 201 });
  }),

  http.patch('*/api/v1/restaurants/:id/orders/:orderId/status', async ({ params, request }) => {
    const body = (await request.json()) as { status?: string };
    const order = db.data.orders.find((o) => o.id === params.orderId);
    if (!order) return HttpResponse.json({ error: { code: 'not_found', message: 'Order not found.' } }, { status: 404 });
    if (body.status) {
      order.status = body.status as typeof order.status;
      order.statusUpdatedAt = nowIso();
      order.updatedAt = nowIso();
    }
    db.save();
    return HttpResponse.json(order);
  }),
];
