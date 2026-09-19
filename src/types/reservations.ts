import type { Id, ISODateString, Tenant, Timestamps } from './common';
import type { WeekDay } from './restaurant';

export const RESERVATION_STATUSES = ['confirmed', 'seated', 'completed', 'cancelled', 'no_show'] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export interface Reservation extends Tenant, Timestamps {
  id: Id;
  confirmationCode: string;
  status: ReservationStatus;
  date: string; // "YYYY-MM-DD"
  timeSlot: string; // "18:30"
  partySize: number;
  seatingPreference: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
  newsletterOptIn: boolean;
  placedAt: ISODateString;
}

export interface ReservationTimeSlot {
  time: string; // "18:30", 24h for stable sorting/editing
  isOpen: boolean;
}

export interface ReservationDayAvailability {
  day: WeekDay;
  slots: ReservationTimeSlot[];
}

export interface ReservationAvailabilitySettings extends Tenant {
  days: ReservationDayAvailability[];
}
