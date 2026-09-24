import { usePublicData } from '../../context/PublicDataContext';
import { BookingVariantA, type BookingViewProps } from './VariantA';
import { BookingVariantB } from './VariantB';
import { BookingVariantC } from './VariantC';

export type { BookingViewProps };

/** Multi-Vertical Platform Plan §8/§10.3 - picks the Site's chosen Booking layout; defaults to Variant A when unset. */
export function BookingView(props: BookingViewProps) {
  const { getTemplateVariant } = usePublicData();
  const variant = getTemplateVariant('booking');
  if (variant === 'b') return <BookingVariantB {...props} />;
  if (variant === 'c') return <BookingVariantC {...props} />;
  return <BookingVariantA {...props} />;
}
