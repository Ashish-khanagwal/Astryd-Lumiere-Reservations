import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from '../pages/orders/orderMeta';
import type { OrderStatus } from '../../types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

/** Alpha-tinted fill + solid border/text in the status's hue - same color mapping used on the board and stepper. */
export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const c = ORDER_STATUS_COLOR[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.fill} ${c.border} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}
