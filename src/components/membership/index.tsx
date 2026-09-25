import { usePublicData } from '../../context/PublicDataContext';
import { MembershipVariantA, type MembershipViewProps } from './VariantA';
import { MembershipVariantB } from './VariantB';
import { MembershipVariantC } from './VariantC';

export type { MembershipViewProps };

/** Multi-Vertical Platform Plan §8/§10.3 - picks the Site's chosen Membership layout; defaults to Variant A when unset. */
export function MembershipView(props: MembershipViewProps) {
  const { getTemplateVariant } = usePublicData();
  const variant = getTemplateVariant('membership');
  if (variant === 'b') return <MembershipVariantB {...props} />;
  if (variant === 'c') return <MembershipVariantC {...props} />;
  return <MembershipVariantA {...props} />;
}
