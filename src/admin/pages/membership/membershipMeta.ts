import type { MemberStatus, MembershipBillingInterval } from '../../../types';

export const MEMBER_STATUS_LABEL: Record<MemberStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

/** Alpha-tinted fill + solid border/text in the same hue - mirrors OrderStatusBadge/ReservationStatusBadge's color mapping. */
export const MEMBER_STATUS_COLOR: Record<MemberStatus, { fill: string; border: string; text: string; dot: string }> = {
  active: { fill: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  paused: { fill: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  cancelled: { fill: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
  expired: { fill: 'bg-surface-container-high', border: 'border-outline-variant/30', text: 'text-secondary', dot: 'bg-secondary' },
};

export const BILLING_INTERVAL_LABEL: Record<MembershipBillingInterval, string> = {
  one_time: 'One-time',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
