import type { ReservationStatus, WeekDay } from '../../../types';

export const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  confirmed: 'Confirmed',
  seated: 'Seated',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
};

/** Alpha-tinted fill + solid border/text in the same hue, per status - kept in one place so a status always reads the same everywhere. */
export const RESERVATION_STATUS_COLOR: Record<ReservationStatus, { fill: string; border: string; text: string; dot: string }> = {
  confirmed: { fill: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', dot: 'bg-violet-500' },
  seated: { fill: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', dot: 'bg-sky-500' },
  completed: { fill: 'bg-surface-container-high', border: 'border-outline-variant/30', text: 'text-secondary', dot: 'bg-secondary' },
  cancelled: { fill: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
  no_show: { fill: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
};

export const WEEK_DAY_ORDER: WeekDay[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export const WEEK_DAY_LABEL: Record<WeekDay, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

export function formatTimeSlot(time: string | undefined | null): string {
  if (!time || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) return '—';

  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}
