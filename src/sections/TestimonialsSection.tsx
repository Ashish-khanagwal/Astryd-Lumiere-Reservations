import type { TestimonialsSectionContent } from '../types';

interface TestimonialsSectionProps {
  content?: Partial<TestimonialsSectionContent> | null;
}

export const TestimonialsSection = ({ content }: TestimonialsSectionProps) => {
  const testimonialEntries = content?.testimonials;
  const testimonials = Array.isArray(testimonialEntries) ? [...testimonialEntries].sort((a, b) => a.order - b.order) : [];
  if (testimonials.length === 0) return null;

  return (
    <section className="py-section-gap bg-[#FBF9F9] w-full border-b border-outline-variant/15">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="mb-12 text-center">
          {content?.eyebrow && (
            <span className="font-label-sm text-primary uppercase tracking-[0.2em] font-bold">{content?.eyebrow}</span>
          )}
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-on-surface mt-2">{content?.heading}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-surface rounded-2xl p-8 shadow-sm border border-outline-variant/20 hover:shadow-md transition-all duration-300 flex flex-col"
            >
              {t.rating !== undefined && (
                <div className="flex gap-0.5 mb-4 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`material-symbols-outlined text-lg ${i < t.rating! ? 'filled' : ''}`}>
                      star
                    </span>
                  ))}
                </div>
              )}
              <p className="font-serif text-lg italic text-on-surface leading-relaxed flex-1">"{t.quote}"</p>
              <p className="font-sans text-sm font-bold text-secondary mt-6">{t.customerName}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
