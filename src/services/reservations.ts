import { ApiError, http } from './http';
import type {
  PublicAvailability,
  PublicReservationConfirmation,
  PublicReservationInput,
  Reservation,
  ReservationAvailabilitySettings,
  ReservationStatus,
} from '../types';

const PUBLIC_API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

interface PublicApiErrorResponse {
  error?: string;
  message?: string;
}

interface PublicReservationResponse {
  success: boolean;
  confirmation_code: string;
  reservation: {
    date: string;
    time_slot: string;
    time_display: string;
    party_size: number;
    seating_preference: string;
    guest_name: string;
    guest_email: string;
  };
}

interface PublicAvailabilityResponse {
  available: boolean;
  date?: string;
  party_size?: number;
  reason?: string;
  slots?: {
    afternoon?: Array<{ time: string; time_24: string; available: boolean }>;
    evening?: Array<{ time: string; time_24: string; available: boolean }>;
  };
}

async function requestPublicApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${PUBLIC_API_BASE_URL}/api/v1${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init.headers },
    });
  } catch {
    throw new Error('Unable to reach the reservation service. Please check your connection and try again.');
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as PublicApiErrorResponse | null;
    throw new ApiError(
      response.status,
      body?.error ?? 'unknown',
      body?.message ?? (response.status >= 500 ? 'The reservation service is temporarily unavailable. Please try again shortly.' : response.statusText),
    );
  }

  return response.json() as Promise<T>;
}

export async function getPublicAvailability(
  businessId: string,
  date: string,
  partySize: number,
): Promise<PublicAvailability> {
  const params = new URLSearchParams({ date, party_size: String(partySize) });
  const response = await requestPublicApi<PublicAvailabilityResponse>(
    `/availability/${encodeURIComponent(businessId)}?${params}`,
  );

  return {
    available: response.available,
    date: response.date,
    partySize: response.party_size,
    reason: response.reason,
    slots: {
      afternoon: (response.slots?.afternoon ?? []).map((slot) => ({
        time: slot.time,
        time24: slot.time_24,
        available: slot.available,
      })),
      evening: (response.slots?.evening ?? []).map((slot) => ({
        time: slot.time,
        time24: slot.time_24,
        available: slot.available,
      })),
    },
  };
}

export async function createPublicReservation(
  businessId: string,
  input: PublicReservationInput,
): Promise<PublicReservationConfirmation> {
  const response = await requestPublicApi<PublicReservationResponse>('/reservations', {
    method: 'POST',
    body: JSON.stringify({
      business_id: businessId,
      booking: {
        date: input.date,
        time_slot: input.timeSlot,
        party_size: input.partySize,
        seating_preference: input.seatingPreference,
      },
      guest: {
        full_name: input.guestName,
        email: input.guestEmail,
        phone: input.guestPhone,
        special_requests: input.specialRequests,
        newsletter_opt_in: input.newsletterOptIn,
      },
    }),
  });

  return {
    confirmationCode: response.confirmation_code,
    date: response.reservation.date,
    timeSlot: response.reservation.time_slot,
    timeDisplay: response.reservation.time_display,
    partySize: response.reservation.party_size,
    seatingPreference: response.reservation.seating_preference,
    guestName: response.reservation.guest_name,
    guestEmail: response.reservation.guest_email,
  };
}

interface AdminReservationResponse {
  id?: string;
  businessId?: string;
  business_id?: string;
  confirmationCode?: string;
  confirmation_code?: string;
  status?: ReservationStatus;
  booking?: {
    date?: string;
    timeSlot?: string;
    time_slot?: string;
    timeDisplay?: string;
    time_display?: string;
    partySize?: number;
    party_size?: number;
    seatingPreference?: string;
    seating_preference?: string;
  };
  guest?: {
    fullName?: string;
    full_name?: string;
    email?: string;
    phone?: string;
    specialRequests?: string;
    special_requests?: string;
    newsletterOptIn?: boolean;
    newsletter_opt_in?: boolean;
  };
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

interface AdminReservationListResponse {
  reservations: AdminReservationResponse[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

function toTimeSlot(value: string | undefined): string {
  if (!value) return '';

  const twentyFourHour = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  if (twentyFourHour.test(value)) return value;

  const twelveHour = /^(\d{1,2}):([0-5]\d)\s*(AM|PM)$/i.exec(value.trim());
  if (!twelveHour) return '';

  const hour = Number(twelveHour[1]);
  const minute = twelveHour[2];
  const period = twelveHour[3].toUpperCase();
  if (hour < 1 || hour > 12) return '';

  const hour24 = (hour % 12) + (period === 'PM' ? 12 : 0);
  return `${String(hour24).padStart(2, '0')}:${minute}`;
}

function mapAdminReservation(reservation: AdminReservationResponse): Reservation {
  const booking = reservation.booking ?? {};
  const guest = reservation.guest ?? {};
  const createdAt = reservation.createdAt ?? reservation.created_at ?? '';
  return {
    id: reservation.id ?? '',
    restaurantId: reservation.businessId ?? reservation.business_id ?? '',
    confirmationCode: reservation.confirmationCode ?? reservation.confirmation_code ?? '',
    status: reservation.status ?? 'confirmed',
    date: booking.date ?? '',
    timeSlot: toTimeSlot(booking.timeSlot ?? booking.time_slot ?? booking.timeDisplay ?? booking.time_display),
    partySize: booking.partySize ?? booking.party_size ?? 0,
    seatingPreference: booking.seatingPreference ?? booking.seating_preference ?? '',
    guestName: guest.fullName ?? guest.full_name ?? '',
    guestEmail: guest.email ?? '',
    guestPhone: guest.phone ?? '',
    specialRequests: guest.specialRequests ?? guest.special_requests,
    newsletterOptIn: guest.newsletterOptIn ?? guest.newsletter_opt_in ?? false,
    placedAt: createdAt,
    createdAt,
    updatedAt: reservation.updatedAt ?? reservation.updated_at ?? createdAt,
  };
}

export async function getReservations(): Promise<Reservation[]> {
  const response = await http.get<AdminReservationListResponse>('/admin/reservations?limit=100');
  return response.reservations.map(mapAdminReservation);
}

export const createReservation = (restaurantId: string, payload: Partial<Reservation>) =>
  http.post<Reservation>(`/restaurants/${restaurantId}/reservations`, payload);

export async function updateReservationStatus(reservationId: string, status: ReservationStatus): Promise<Reservation> {
  const response = await http.patch<{ reservation: AdminReservationResponse }>(
    `/admin/reservations/${reservationId}/status`,
    { status },
  );
  return mapAdminReservation(response.reservation);
}

export const getReservationAvailability = (restaurantId: string) =>
  http.get<ReservationAvailabilitySettings>(`/restaurants/${restaurantId}/reservation-availability`);

export const updateReservationAvailability = (
  restaurantId: string,
  payload: Pick<ReservationAvailabilitySettings, 'days'>,
) => http.put<ReservationAvailabilitySettings>(`/restaurants/${restaurantId}/reservation-availability`, payload);
