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

export const getReservations = (restaurantId: string) =>
  http.get<Reservation[]>(`/restaurants/${restaurantId}/reservations`);

export const createReservation = (restaurantId: string, payload: Partial<Reservation>) =>
  http.post<Reservation>(`/restaurants/${restaurantId}/reservations`, payload);

export const updateReservationStatus = (restaurantId: string, reservationId: string, status: ReservationStatus) =>
  http.patch<Reservation>(`/restaurants/${restaurantId}/reservations/${reservationId}/status`, { status });

export const getReservationAvailability = (restaurantId: string) =>
  http.get<ReservationAvailabilitySettings>(`/restaurants/${restaurantId}/reservation-availability`);

export const updateReservationAvailability = (
  restaurantId: string,
  payload: Pick<ReservationAvailabilitySettings, 'days'>,
) => http.put<ReservationAvailabilitySettings>(`/restaurants/${restaurantId}/reservation-availability`, payload);
