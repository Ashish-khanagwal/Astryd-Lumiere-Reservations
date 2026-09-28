import type { OffersSectionContent, TemplateVariant } from '../types';
import { usePageContent } from '../context/usePageContent';

export interface OfferDisplayEntry {
  id: string;
  name: string;
  description: string;
  badgeLabel: string;
  imageUrl?: string;
  cta?: string;
}

interface OffersSectionProps {
  variant?: TemplateVariant;
  content?: Partial<OffersSectionContent> | null;
  offers: OfferDisplayEntry[];
  onCtaClick: () => void;
}

interface ResolvedOffers {
  eyebrow?: string;
  heading?: string;
  description?: string;
  ctaFallback: string;
  offers: OfferDisplayEntry[];
  onCtaClick: () => void;
}

function OffersHeading({ eyebrow, heading, description }: Pick<ResolvedOffers, 'eyebrow' | 'heading' | 'description'>) {
  return (
    <div className="mb-12 text-center">
      {eyebrow && <span className="font-label-sm text-primary uppercase tracking-[0.2em] font-bold">{eyebrow}</span>}
      <h2 className="font-serif text-3xl md:text-4xl font-semibold text-on-surface mt-2">{heading}</h2>
      {description && <p className="font-sans text-sm md:text-base text-secondary mt-2">{description}</p>}
    </div>
  );
}

/** Layout A - Classic: an even grid of clean cards. */
const OffersSectionA = ({ eyebrow, heading, description, ctaFallback, offers, onCtaClick }: ResolvedOffers) => (
  <section className="py-section-gap bg-[#F4EFE6] w-full border-b border-outline-variant/15">
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      <OffersHeading eyebrow={eyebrow} heading={heading} description={description} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <div key={offer.id} className="relative bg-surface rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
            {offer.imageUrl && (
              <div className="h-40 overflow-hidden">
                <img src={offer.imageUrl} alt={offer.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6 flex flex-col flex-1">
              <span className="inline-block self-start px-3 py-1 rounded-full bg-primary text-on-primary text-xs font-bold uppercase tracking-wide mb-3">{offer.badgeLabel}</span>
              <h3 className="font-serif text-xl font-bold text-on-surface mb-2">{offer.name}</h3>
              <p className="font-sans text-sm text-secondary leading-relaxed flex-1">{offer.description}</p>
              <button onClick={onCtaClick} className="mt-4 self-start font-sans text-sm text-primary font-bold flex items-center group hover:underline tracking-wide uppercase">
                <span>{offer.cta || ctaFallback}</span>
                <span className="material-symbols-outlined ml-1.5 text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/** Layout B - Editorial: full-width horizontal banner cards, image left / text+CTA right, stacked. */
const OffersSectionB = ({ eyebrow, heading, description, ctaFallback, offers, onCtaClick }: ResolvedOffers) => (
  <section className="py-section-gap bg-[#F4EFE6] w-full border-b border-outline-variant/15">
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      <OffersHeading eyebrow={eyebrow} heading={heading} description={description} />
      <div className="flex flex-col gap-5">
        {offers.map((offer) => (
          <div key={offer.id} className="bg-surface rounded-2xl overflow-hidden border border-outline-variant/20 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row">
            {offer.imageUrl && (
              <div className="sm:w-64 h-48 sm:h-auto shrink-0 overflow-hidden">
                <img src={offer.imageUrl} alt={offer.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6 flex flex-col flex-1 justify-center">
              <span className="inline-block self-start px-3 py-1 rounded-full bg-primary text-on-primary text-xs font-bold uppercase tracking-wide mb-3">{offer.badgeLabel}</span>
              <h3 className="font-serif text-2xl font-bold text-on-surface mb-2">{offer.name}</h3>
              <p className="font-sans text-sm text-secondary leading-relaxed mb-4">{offer.description}</p>
              <button onClick={onCtaClick} className="self-start font-sans text-sm text-primary font-bold flex items-center group hover:underline tracking-wide uppercase">
                <span>{offer.cta || ctaFallback}</span>
                <span className="material-symbols-outlined ml-1.5 text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/** Layout C - Minimal: bold poster-style cards, image as background with text overlaid. */
const OffersSectionC = ({ eyebrow, heading, description, ctaFallback, offers, onCtaClick }: ResolvedOffers) => (
  <section className="py-section-gap bg-[#F4EFE6] w-full border-b border-outline-variant/15">
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      <OffersHeading eyebrow={eyebrow} heading={heading} description={description} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {offers.map((offer) => (
          <div key={offer.id} className="relative rounded-2xl overflow-hidden h-72 group">
            {offer.imageUrl && <img src={offer.imageUrl} alt={offer.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="relative z-10 h-full flex flex-col justify-end p-6">
              <span className="inline-block self-start px-3 py-1 rounded-full bg-white text-on-surface text-xs font-bold uppercase tracking-wide mb-3">{offer.badgeLabel}</span>
              <h3 className="font-serif text-2xl font-bold text-white mb-1">{offer.name}</h3>
              <p className="font-sans text-sm text-white/80 leading-relaxed mb-3 line-clamp-2">{offer.description}</p>
              <button onClick={onCtaClick} className="self-start font-sans text-sm text-white font-bold flex items-center group/cta hover:underline tracking-wide uppercase">
                <span>{offer.cta || ctaFallback}</span>
                <span className="material-symbols-outlined ml-1.5 text-lg transition-transform group-hover/cta:translate-x-1">arrow_forward</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const OffersSection = ({ variant = 'a', content, offers, onCtaClick }: OffersSectionProps) => {
  const c = usePageContent('landing');
  if (offers.length === 0) return null;
  const resolved: ResolvedOffers = { eyebrow: content?.eyebrow, heading: content?.heading, description: content?.description, ctaFallback: c.text('offerCtaFallback'), offers, onCtaClick };

  if (variant === 'b') return <OffersSectionB {...resolved} />;
  if (variant === 'c') return <OffersSectionC {...resolved} />;
  return <OffersSectionA {...resolved} />;
};
