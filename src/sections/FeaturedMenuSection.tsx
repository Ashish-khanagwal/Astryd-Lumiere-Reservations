import type { FeaturedMenuSectionContent } from '../types';
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
  content?: Partial<FeaturedMenuSectionContent> | null;
  items: FeaturedMenuDisplayItem[];
  onViewMenu: () => void;
}

export const FeaturedMenuSection = ({ content, items, onViewMenu }: FeaturedMenuSectionProps) => {
  const c = usePageContent('landing');
  if (items.length === 0) return null;

  return (
    <section className="py-section-gap bg-[#FBF9F9] w-full border-b border-outline-variant/15">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            {content?.eyebrow && (
              <span className="font-label-sm text-primary uppercase tracking-[0.2em] font-bold">{content?.eyebrow}</span>
            )}
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-on-surface mt-2">{content?.heading}</h2>
            {content?.description && (
              <p className="font-sans text-sm md:text-base text-secondary mt-2 max-w-xl">{content?.description}</p>
            )}
          </div>
          <button
            onClick={onViewMenu}
            className="self-start md:self-auto font-sans text-sm text-primary font-bold flex items-center group hover:underline tracking-wide uppercase"
          >
            <span>{c.text('featuredViewAll')}</span>
            <span className="material-symbols-outlined ml-2 transition-transform group-hover:translate-x-1">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-surface rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm hover:shadow-lg transition-all duration-300 group"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {item.badge && (
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-primary text-on-primary text-[10px] font-bold uppercase rounded-full shadow">
                    {item.badge}
                  </span>
                )}
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <h3 className="font-serif text-lg font-bold text-on-surface leading-tight">{item.name}</h3>
                  <span className="font-serif text-lg text-primary font-bold whitespace-nowrap">
                    {c.text('featuredPrice', { price: item.price.toFixed(2) })}
                  </span>
                </div>
                <p className="text-secondary font-sans text-sm line-clamp-2 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
