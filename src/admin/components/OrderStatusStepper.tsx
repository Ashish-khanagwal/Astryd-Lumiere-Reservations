import { Check, Ban } from 'lucide-react';
import { BOARD_COLUMNS, ORDER_STATUS_LABEL } from '../pages/orders/orderMeta';
import type { OrderStatus } from '../../types';

interface OrderStatusStepperProps {
  status: OrderStatus;
}

/** Filled circle for done steps, highlighted circle for the current step, dim outline for future steps - connector lines colored only up to the current step. Cancelled short-circuits into a banner instead of the stepper. */
export function OrderStatusStepper({ status }: OrderStatusStepperProps) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
        <Ban className="h-4 w-4 shrink-0" />
        <span className="text-sm font-medium">This order was cancelled.</span>
      </div>
    );
  }

  const activeIndex = BOARD_COLUMNS.indexOf(status);

  return (
    <div className="flex items-start">
      {BOARD_COLUMNS.map((step, index) => {
        const isDone = index < activeIndex;
        const isCurrent = index === activeIndex;
        return (
          <div key={step} className="flex items-start flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 w-16 shrink-0">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors ${
                  isDone
                    ? 'bg-primary border-primary text-on-primary'
                    : isCurrent
                      ? 'border-primary text-primary bg-primary/10'
                      : 'border-outline-variant/40 text-secondary bg-surface'
                }`}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
              </div>
              <span className={`text-[11px] text-center leading-tight ${isCurrent ? 'text-primary font-semibold' : isDone ? 'text-on-surface font-medium' : 'text-secondary'}`}>
                {ORDER_STATUS_LABEL[step]}
              </span>
            </div>
            {index < BOARD_COLUMNS.length - 1 && (
              <div className={`h-0.5 flex-1 mt-3.5 rounded-full ${index < activeIndex ? 'bg-primary' : 'bg-outline-variant/30'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
