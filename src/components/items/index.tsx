import { usePublicData } from '../../context/PublicDataContext';
import { ItemsVariantA, type ItemsViewProps } from './VariantA';
import { ItemsVariantB } from './VariantB';
import { ItemsVariantC } from './VariantC';

export type { ItemsViewProps };

/** Multi-Vertical Platform Plan §8.5/§10.3 - picks the Site's chosen Items layout; defaults to Variant A when unset. */
export function ItemsView(props: ItemsViewProps) {
  const { getTemplateVariant } = usePublicData();
  const variant = getTemplateVariant('items');
  if (variant === 'b') return <ItemsVariantB {...props} />;
  if (variant === 'c') return <ItemsVariantC {...props} />;
  return <ItemsVariantA {...props} />;
}
