import { usePublicData } from '../../context/PublicDataContext';
import { CatalogVariantA, type CatalogViewProps } from './VariantA';
import { CatalogVariantB } from './VariantB';
import { CatalogVariantC } from './VariantC';

export type { CatalogViewProps };

/** Multi-Vertical Platform Plan §8/§10.3 - picks the Site's chosen Catalog layout; defaults to Variant A when unset. */
export function CatalogView(props: CatalogViewProps) {
  const { getTemplateVariant } = usePublicData();
  const variant = getTemplateVariant('catalog');
  if (variant === 'b') return <CatalogVariantB {...props} />;
  if (variant === 'c') return <CatalogVariantC {...props} />;
  return <CatalogVariantA {...props} />;
}
