import { http, HttpResponse } from 'msw';
import { db, nextId, nowIso } from '../db';
import type { ReservationAvailabilitySettings, ReservationDayAvailability } from '../../types';

const WEEK_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

interface MockAvailabilityPayload {
  operating_hours: Array<{
    day_of_week: number;
    open_time: string;
    close_time: string;
    slot_duration_mins: number;
    max_per_slot: number;
    is_closed: boolean;
    disabled_slots: string[];
  }>;
  blocked_dates: Array<{ date: string; reason?: string }>;
}

function availabilityResponse(settings: ReservationAvailabilitySettings) {
  return {
    business_id: settings.restaurantId,
    operating_hours: settings.days.map((day) => ({
      day_of_week: WEEK_DAYS.indexOf(day.day),
      open_time: day.openTime,
      close_time: day.closeTime,
      slot_duration_mins: day.slotDurationMins,
      max_per_slot: day.maxPerSlot,
      is_closed: day.isClosed,
      disabled_slots: day.slots.filter((slot) => !slot.isOpen).map((slot) => slot.time),
      slots: day.slots.map((slot) => ({ time: slot.time, is_open: slot.isOpen })),
    })),
    blocked_dates: settings.blockedDates.map((entry) => ({ date: entry.date, reason: entry.reason })),
  };
}

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

  http.get('*/api/v1/admin/reservation-availability', () => {
    const restaurantId = Object.keys(db.data.reservationAvailability)[0];
    const settings = db.data.reservationAvailability[restaurantId];
    if (!settings) {
      return HttpResponse.json({ error: { code: 'not_found', message: 'Availability settings not found.' } }, { status: 404 });
    }
    return HttpResponse.json(availabilityResponse(settings));
  }),

  http.put('*/api/v1/admin/reservation-availability', async ({ request }) => {
    const restaurantId = Object.keys(db.data.reservationAvailability)[0];
    const body = (await request.json()) as MockAvailabilityPayload;
    const settings: ReservationAvailabilitySettings = {
      restaurantId,
      days: body.operating_hours.map((hours): ReservationDayAvailability => ({
        day: WEEK_DAYS[hours.day_of_week],
        isClosed: hours.is_closed,
        openTime: hours.open_time,
        closeTime: hours.close_time,
        slotDurationMins: hours.slot_duration_mins,
        maxPerSlot: hours.max_per_slot,
        slots: db.data.reservationAvailability[restaurantId].days[hours.day_of_week]?.slots.map((slot) => ({
          ...slot,
          isOpen: !hours.disabled_slots.includes(slot.time),
        })) ?? [],
      })),
      blockedDates: body.blocked_dates.map((entry) => ({ date: entry.date, reason: entry.reason ?? '' })),
    };
    db.data.reservationAvailability[restaurantId] = settings;
    db.save();
    return HttpResponse.json(availabilityResponse(settings));
  }),
];
