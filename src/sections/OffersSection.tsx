import type { OffersSectionContent } from '../types';

export interface OfferDisplayEntry {
  id: string;
  name: string;
  description: string;
  badgeLabel: string;
  imageUrl?: string;
  cta?: string;
}

interface OffersSectionProps {
  content?: Partial<OffersSectionContent> | null;
  offers: OfferDisplayEntry[];
  onCtaClick: () => void;
}

export const OffersSection = ({ content, offers, onCtaClick }: OffersSectionProps) => {
  if (offers.length === 0) return null;

  return (
    <section className="py-section-gap bg-[#F4EFE6] w-full border-b border-outline-variant/15">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="mb-12 text-center">
          {content?.eyebrow && (
            <span className="font-label-sm text-primary uppercase tracking-[0.2em] font-bold">{content?.eyebrow}</span>
          )}
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-on-surface mt-2">{content?.heading}</h2>
          {content?.description && (
            <p className="font-sans text-sm md:text-base text-secondary mt-2">{content?.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="relative bg-surface rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              {offer.imageUrl && (
                <div className="h-40 overflow-hidden">
                  <img src={offer.imageUrl} alt={offer.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6 flex flex-col flex-1">
                <span className="inline-block self-start px-3 py-1 rounded-full bg-primary text-on-primary text-xs font-bold uppercase tracking-wide mb-3">
                  {offer.badgeLabel}
                </span>
                <h3 className="font-serif text-xl font-bold text-on-surface mb-2">{offer.name}</h3>
                <p className="font-sans text-sm text-secondary leading-relaxed flex-1">{offer.description}</p>
                <button
                  onClick={onCtaClick}
                  className="mt-4 self-start font-sans text-sm text-primary font-bold flex items-center group hover:underline tracking-wide uppercase"
                >
                  <span>{offer.cta || 'View Menu'}</span>
                  <span className="material-symbols-outlined ml-1.5 text-lg transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
