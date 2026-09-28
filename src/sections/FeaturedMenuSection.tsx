import type { FeaturedMenuSectionContent, TemplateVariant } from '../types';
import { usePageContent } from '../context/usePageContent';

export interface FeaturedMenuDisplayItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  badge?: string;
}

interface FeaturedMenuSectionProps {
  variant?: TemplateVariant;
  content?: Partial<FeaturedMenuSectionContent> | null;
  items: FeaturedMenuDisplayItem[];
  onViewMenu: () => void;
}

interface ResolvedFeatured {
  eyebrow?: string;
  heading?: string;
  description?: string;
  viewAllLabel: string;
  priceLabel: (price: number) => string;
  items: FeaturedMenuDisplayItem[];
  onViewMenu: () => void;
}

function SectionHeading({ eyebrow, heading, description, viewAllLabel, onViewMenu, align = 'between' }: Pick<ResolvedFeatured, 'eyebrow' | 'heading' | 'description' | 'viewAllLabel' | 'onViewMenu'> & { align?: 'between' | 'center' }) {
  const textBlock = (
    <div className={align === 'center' ? 'text-center' : ''}>
      {eyebrow && <span className="font-label-sm text-primary uppercase tracking-[0.2em] font-bold">{eyebrow}</span>}
      <h2 className="font-serif text-3xl md:text-4xl font-semibold text-on-surface mt-2">{heading}</h2>
      {description && <p className={`font-sans text-sm md:text-base text-secondary mt-2 ${align === 'center' ? 'mx-auto max-w-xl' : 'max-w-xl'}`}>{description}</p>}
    </div>
  );
  const link = (
    <button onClick={onViewMenu} className="self-start md:self-auto font-sans text-sm text-primary font-bold flex items-center group hover:underline tracking-wide uppercase">
      <span>{viewAllLabel}</span>
      <span className="material-symbols-outlined ml-2 transition-transform group-hover:translate-x-1">arrow_forward</span>
    </button>
  );
  if (align === 'center') {
    return (
      <div className="mb-12 text-center">
        {textBlock}
        <div className="mt-4 flex justify-center">{link}</div>
      </div>
    );
  }
  return (
    <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      {textBlock}
      {link}
    </div>
  );
}

/** Layout A - Classic: an even 4-up card grid. */
const FeaturedMenuSectionA = ({ eyebrow, heading, description, viewAllLabel, priceLabel, items, onViewMenu }: ResolvedFeatured) => (
  <section className="py-section-gap bg-[#FBF9F9] w-full border-b border-outline-variant/15">
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      <SectionHeading eyebrow={eyebrow} heading={heading} description={description} viewAllLabel={viewAllLabel} onViewMenu={onViewMenu} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-surface rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="relative h-44 overflow-hidden">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              {item.badge && <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-primary text-on-primary text-[10px] font-bold uppercase rounded-full shadow">{item.badge}</span>}
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start gap-2 mb-1.5">
                <h3 className="font-serif text-lg font-bold text-on-surface leading-tight">{item.name}</h3>
                <span className="font-serif text-lg text-primary font-bold whitespace-nowrap">{priceLabel(item.price)}</span>
              </div>
              <p className="text-secondary font-sans text-sm line-clamp-2 leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/** Layout B - Editorial: a horizontal scrolling rail of larger cards. */
const FeaturedMenuSectionB = ({ eyebrow, heading, description, viewAllLabel, priceLabel, items, onViewMenu }: ResolvedFeatured) => (
  <section className="py-section-gap bg-[#FBF9F9] w-full border-b border-outline-variant/15">
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      <SectionHeading eyebrow={eyebrow} heading={heading} description={description} viewAllLabel={viewAllLabel} onViewMenu={onViewMenu} />
      <div className="flex gap-6 overflow-x-auto pb-4 snap-x category-scroll">
        {items.map((item) => (
          <div key={item.id} className="snap-start shrink-0 w-80 bg-surface rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="relative h-56 overflow-hidden">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              {item.badge && <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-primary text-on-primary text-[10px] font-bold uppercase rounded-full shadow">{item.badge}</span>}
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="font-serif text-xl font-bold text-on-surface leading-tight">{item.name}</h3>
                <span className="font-serif text-xl text-primary font-bold whitespace-nowrap">{priceLabel(item.price)}</span>
              </div>
              <p className="text-secondary font-sans text-sm leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/** Layout C - Minimal: one large spotlight item beside a compact stacked list of the rest. */
const FeaturedMenuSectionC = ({ eyebrow, heading, description, viewAllLabel, priceLabel, items, onViewMenu }: ResolvedFeatured) => {
  const [spotlight, ...rest] = items;
  if (!spotlight) return null;
  return (
    <section className="py-section-gap bg-[#FBF9F9] w-full border-b border-outline-variant/15">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <SectionHeading eyebrow={eyebrow} heading={heading} description={description} viewAllLabel={viewAllLabel} onViewMenu={onViewMenu} align="center" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="relative rounded-2xl overflow-hidden h-72 lg:h-full group">
            <img src={spotlight.image} alt={spotlight.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent flex flex-col justify-end p-6">
              {spotlight.badge && <span className="self-start mb-2 px-2.5 py-0.5 bg-primary text-on-primary text-[10px] font-bold uppercase rounded-full">{spotlight.badge}</span>}
              <h3 className="font-serif text-2xl font-bold text-white">{spotlight.name}</h3>
              <p className="text-white/80 font-sans text-sm mt-1 line-clamp-2">{spotlight.description}</p>
              <span className="font-serif text-xl text-white font-bold mt-2">{priceLabel(spotlight.price)}</span>
            </div>
          </div>
          <div className="flex flex-col divide-y divide-outline-variant/15 border border-outline-variant/15 rounded-2xl overflow-hidden">
            {rest.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 bg-surface hover:bg-surface-container-low transition-colors">
                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif text-base font-bold text-on-surface truncate">{item.name}</h4>
                  <p className="text-secondary font-sans text-xs line-clamp-1">{item.description}</p>
                </div>
                <span className="font-serif text-sm text-primary font-bold whitespace-nowrap">{priceLabel(item.price)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const FeaturedMenuSection = ({ variant = 'a', content, items, onViewMenu }: FeaturedMenuSectionProps) => {
  const c = usePageContent('landing');
  if (items.length === 0) return null;
  const resolved: ResolvedFeatured = {
    eyebrow: content?.eyebrow,
    heading: content?.heading,
    description: content?.description,
    viewAllLabel: c.text('featuredViewAll'),
    priceLabel: (price) => c.text('featuredPrice', { price: price.toFixed(2) }),
    items,
    onViewMenu,
  };

  if (variant === 'b') return <FeaturedMenuSectionB {...resolved} />;
  if (variant === 'c') return <FeaturedMenuSectionC {...resolved} />;
  return <FeaturedMenuSectionA {...resolved} />;
};
