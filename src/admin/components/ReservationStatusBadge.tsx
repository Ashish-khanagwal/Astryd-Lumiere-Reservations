import { RESERVATION_STATUS_COLOR, RESERVATION_STATUS_LABEL } from '../pages/reservations/reservationMeta';
import type { ReservationStatus } from '../../types';

interface ReservationStatusBadgeProps {
  status: ReservationStatus;
}

/** Alpha-tinted fill + solid border/text in the status's hue - mirrors OrderStatusBadge's color mapping. */
export function ReservationStatusBadge({ status }: ReservationStatusBadgeProps) {
  const c = RESERVATION_STATUS_COLOR[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.fill} ${c.border} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {RESERVATION_STATUS_LABEL[status]}
    </span>
  );
}
