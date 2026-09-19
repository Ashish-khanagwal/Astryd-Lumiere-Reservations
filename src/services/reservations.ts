import { http } from './http';
import type { Reservation, ReservationAvailabilitySettings, ReservationStatus } from '../types';

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
