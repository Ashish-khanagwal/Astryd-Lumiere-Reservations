import { http, HttpResponse } from 'msw';
import { db, nextId, nowIso } from '../db';
import type { ReservationAvailabilitySettings, ReservationDayAvailability } from '../../types';

function nextConfirmationCode() {
  return `LUM-${Math.floor(10000 + Math.random() * 89999)}`;
}

export const reservationHandlers = [
  http.get('*/api/v1/restaurants/:id/reservations', ({ params }) =>
    HttpResponse.json(
      db.data.reservations
        .filter((r) => r.restaurantId === params.id)
        .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()),
    ),
  ),

  http.post('*/api/v1/restaurants/:id/reservations', async ({ params, request }) => {
    const restaurantId = params.id as string;
    const body = (await request.json()) as Record<string, unknown>;
    const now = nowIso();
    const reservation = {
      id: nextId('reservation'),
      restaurantId,
      confirmationCode: nextConfirmationCode(),
      status: 'confirmed' as const,
      date: (body.date as string) ?? '',
      timeSlot: (body.timeSlot as string) ?? '',
      partySize: (body.partySize as number) ?? 1,
      seatingPreference: (body.seatingPreference as string) ?? 'Indoor',
      guestName: (body.guestName as string) ?? 'Guest',
      guestEmail: (body.guestEmail as string) ?? '',
      guestPhone: (body.guestPhone as string) ?? '',
      specialRequests: body.specialRequests as string | undefined,
      newsletterOptIn: (body.newsletterOptIn as boolean) ?? false,
      placedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    db.data.reservations.push(reservation);
    db.save();
    return HttpResponse.json(reservation, { status: 201 });
  }),

  http.patch('*/api/v1/restaurants/:id/reservations/:reservationId/status', async ({ params, request }) => {
    const body = (await request.json()) as { status?: string };
    const reservation = db.data.reservations.find((r) => r.id === params.reservationId);
    if (!reservation) {
      return HttpResponse.json({ error: { code: 'not_found', message: 'Reservation not found.' } }, { status: 404 });
    }
    if (body.status) {
      reservation.status = body.status as typeof reservation.status;
      reservation.updatedAt = nowIso();
    }
    db.save();
    return HttpResponse.json(reservation);
  }),

  http.get('*/api/v1/restaurants/:id/reservation-availability', ({ params }) => {
    const restaurantId = params.id as string;
    const settings = db.data.reservationAvailability[restaurantId];
    if (!settings) {
      return HttpResponse.json({ error: { code: 'not_found', message: 'Availability settings not found.' } }, { status: 404 });
    }
    return HttpResponse.json(settings);
  }),

  http.put('*/api/v1/restaurants/:id/reservation-availability', async ({ params, request }) => {
    const restaurantId = params.id as string;
    const body = (await request.json()) as { days?: ReservationDayAvailability[] };
    const settings: ReservationAvailabilitySettings = {
      restaurantId,
      days: body.days ?? db.data.reservationAvailability[restaurantId]?.days ?? [],
    };
    db.data.reservationAvailability[restaurantId] = settings;
    db.save();
    return HttpResponse.json(settings);
  }),
];
