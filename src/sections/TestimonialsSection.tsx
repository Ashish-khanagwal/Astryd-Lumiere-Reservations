import type { TestimonialsSectionContent, TemplateVariant } from '../types';

interface TestimonialsSectionProps {
  variant?: TemplateVariant;
  content?: Partial<TestimonialsSectionContent> | null;
}

interface Testimonial {
  id: string;
  customerName: string;
  quote: string;
  rating?: number;
  order: number;
}

interface ResolvedTestimonials {
  heading?: string;
  testimonials: Testimonial[];
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-primary">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`material-symbols-outlined text-lg ${i < rating ? 'filled' : ''}`}>star</span>
      ))}
    </div>
  );
}

/** Layout A - Classic: an even grid of review cards. */
const TestimonialsSectionA = ({ heading, testimonials }: ResolvedTestimonials) => (
  <section className="py-section-gap bg-[#FBF9F9] w-full border-b border-outline-variant/15">
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      <div className="mb-12 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-on-surface mt-2">{heading}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div key={t.id} className="bg-surface rounded-2xl p-8 shadow-sm border border-outline-variant/20 hover:shadow-md transition-all duration-300 flex flex-col">
            {t.rating !== undefined && <div className="mb-4"><Stars rating={t.rating} /></div>}
            <p className="font-serif text-lg italic text-on-surface leading-relaxed flex-1">"{t.quote}"</p>
            <p className="font-sans text-sm font-bold text-secondary mt-6">{t.customerName}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/** Layout B - Editorial: large centered pull-quotes stacked vertically, minimal chrome. */
const TestimonialsSectionB = ({ heading, testimonials }: ResolvedTestimonials) => (
  <section className="py-section-gap bg-[#FBF9F9] w-full border-b border-outline-variant/15">
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      <div className="mb-14 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-on-surface mt-2">{heading}</h2>
      </div>
      <div className="max-w-3xl mx-auto space-y-14">
        {testimonials.map((t) => (
          <div key={t.id} className="text-center">
            {t.rating !== undefined && <div className="mb-4 flex justify-center"><Stars rating={t.rating} /></div>}
            <p className="font-serif text-2xl md:text-3xl italic text-on-surface leading-snug">"{t.quote}"</p>
            <p className="font-sans text-sm font-bold text-secondary mt-4 uppercase tracking-wide">{t.customerName}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/** Layout C - Minimal: a dense single-column list, one row per review. */
const TestimonialsSectionC = ({ heading, testimonials }: ResolvedTestimonials) => (
  <section className="py-section-gap bg-[#FBF9F9] w-full border-b border-outline-variant/15">
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      <div className="mb-10 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-on-surface mt-2">{heading}</h2>
      </div>
      <div className="max-w-2xl mx-auto divide-y divide-outline-variant/15 border border-outline-variant/15 rounded-2xl overflow-hidden">
        {testimonials.map((t) => (
          <div key={t.id} className="flex items-start gap-4 p-5 bg-surface">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-serif font-bold">
              {t.customerName.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="font-sans text-sm font-bold text-on-surface">{t.customerName}</p>
                {t.rating !== undefined && <Stars rating={t.rating} />}
              </div>
              <p className="font-sans text-sm text-secondary mt-1 leading-relaxed">{t.quote}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const TestimonialsSection = ({ variant = 'a', content }: TestimonialsSectionProps) => {
  const testimonialEntries = content?.testimonials;
  const testimonials = Array.isArray(testimonialEntries) ? [...testimonialEntries].sort((a, b) => a.order - b.order) : [];
  if (testimonials.length === 0) return null;
  const resolved: ResolvedTestimonials = { heading: content?.heading, testimonials };

  if (variant === 'b') return <TestimonialsSectionB {...resolved} />;
  if (variant === 'c') return <TestimonialsSectionC {...resolved} />;
  return <TestimonialsSectionA {...resolved} />;
};
