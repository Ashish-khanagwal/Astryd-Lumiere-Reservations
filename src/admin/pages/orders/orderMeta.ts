import type { OrderStatus } from '../../../types';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'New',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

/** Alpha-tinted fill + solid border/text in the same hue, per status - kept in one place so a status always reads the same everywhere. */
export const ORDER_STATUS_COLOR: Record<OrderStatus, { fill: string; border: string; text: string; dot: string }> = {
  pending: { fill: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', dot: 'bg-sky-500' },
  confirmed: { fill: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', dot: 'bg-violet-500' },
  preparing: { fill: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  ready: { fill: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  completed: { fill: 'bg-surface-container-high', border: 'border-outline-variant/30', text: 'text-secondary', dot: 'bg-secondary' },
  cancelled: { fill: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
};

/** Board column order - cancelled orders live in their own filtered view instead of a permanent column. */
export const BOARD_COLUMNS: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];

/** What tapping the card's primary action does - mirrors a kitchen-display "advance to next stage" flow. */
export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'completed',
};

export const NEXT_ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  pending: 'Accept',
  confirmed: 'Start Preparing',
  preparing: 'Mark Ready',
  ready: 'Complete',
};

export type OrderUrgency = 'fresh' | 'warning' | 'overdue';

const WARNING_AFTER_MS = 8 * 60 * 1000;
const OVERDUE_AFTER_MS = 15 * 60 * 1000;

/** How long an order has sat in its current stage, colour-escalated the longer it waits - same thresholds as the reference kitchen-display design. */
export function getOrderUrgency(statusUpdatedAt: string, now: number): OrderUrgency {
  const elapsed = now - new Date(statusUpdatedAt).getTime();
  if (elapsed >= OVERDUE_AFTER_MS) return 'overdue';
  if (elapsed >= WARNING_AFTER_MS) return 'warning';
  return 'fresh';
}

export const URGENCY_ACCENT: Record<OrderUrgency, string> = {
  fresh: 'bg-primary',
  warning: 'bg-amber-500',
  overdue: 'bg-rose-500',
};

export const URGENCY_TEXT: Record<OrderUrgency, string> = {
  fresh: 'text-secondary',
  warning: 'text-amber-700 font-semibold',
  overdue: 'text-rose-700 font-semibold',
};

export function formatElapsed(fromIso: string, now: number): string {
  const mins = Math.max(0, Math.floor((now - new Date(fromIso).getTime()) / 60000));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return `${hours}h ${rem}m`;
}
