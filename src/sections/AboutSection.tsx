import type { AboutSectionContent, TemplateVariant } from '../types';
import { usePageContent } from '../context/usePageContent';

interface AboutSectionProps {
  variant?: TemplateVariant;
  content?: Partial<AboutSectionContent> | null;
  imageUrl?: string;
  onImageClick: () => void;
}

interface ResolvedAbout {
  eyebrow: string;
  heading: string;
  description: string;
  quote?: string;
  chefName?: string;
  storyLink: string;
  imageUrl?: string;
  onImageClick: () => void;
}

/** Layout A - Classic: text left, image with a floating name card right. */
const AboutSectionA = ({ eyebrow, heading, description, quote, chefName, storyLink, imageUrl, onImageClick }: ResolvedAbout) => (
  <section className="py-section-gap bg-[#FBF9F9] w-full border-b border-outline-variant/15">
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          {eyebrow && <span className="font-label-sm text-primary tracking-[0.2em] uppercase font-bold block">{eyebrow}</span>}
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-on-surface leading-tight font-normal">{heading}</h2>
          <p className="font-sans text-base md:text-lg text-secondary leading-relaxed font-light">{description}</p>
          {quote && (
            <div className="flex items-center space-x-4 pt-4 border-l-2 border-primary/40 pl-5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-2xl">restaurant</span>
              </div>
              <p className="font-serif text-lg md:text-xl italic text-on-surface">"{quote}"</p>
            </div>
          )}
        </div>

        {imageUrl && (
          <div className="relative group cursor-pointer" onClick={onImageClick}>
            <div className="absolute -inset-4 bg-primary-fixed opacity-10 rounded-2xl group-hover:opacity-25 transition-opacity duration-500"></div>
            <div className="relative overflow-hidden rounded-2xl h-[480px] shadow-2xl border border-outline-variant/20">
              <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={imageUrl} alt={heading} />
              {chefName && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-4 rounded-xl text-white flex justify-between items-center border border-white/10">
                  <div>
                    <div className="font-serif text-lg font-bold">{chefName}</div>
                    <div className="text-xs text-white/70 font-sans">{storyLink}</div>
                  </div>
                  <span className="material-symbols-outlined">zoom_in</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  </section>
);

/** Layout B - Editorial: mirrored (image left), the quote as a large standalone blockquote. */
const AboutSectionB = ({ eyebrow, heading, description, quote, chefName, storyLink, imageUrl, onImageClick }: ResolvedAbout) => (
  <section className="py-section-gap bg-[#FBF9F9] w-full border-b border-outline-variant/15">
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {imageUrl && (
          <div className="relative group cursor-pointer order-2 lg:order-1" onClick={onImageClick}>
            <div className="relative overflow-hidden rounded-2xl h-[480px] shadow-2xl border border-outline-variant/20">
              <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={imageUrl} alt={heading} />
              {chefName && (
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-on-surface flex items-center gap-2">
                  <span className="font-serif text-sm font-bold">{chefName}</span>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="space-y-8 order-1 lg:order-2">
          {eyebrow && <span className="font-label-sm text-primary tracking-[0.2em] uppercase font-bold block">{eyebrow}</span>}
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-on-surface leading-tight font-normal">{heading}</h2>
          <p className="font-sans text-base md:text-lg text-secondary leading-relaxed font-light">{description}</p>
          {quote && (
            <blockquote className="font-serif text-2xl md:text-3xl italic text-on-surface leading-snug border-t border-outline-variant/20 pt-6">
              "{quote}"
              {chefName && <span className="block mt-3 font-sans not-italic text-sm font-semibold text-secondary">— {chefName}, {storyLink}</span>}
            </blockquote>
          )}
        </div>
      </div>
    </div>
  </section>
);

/** Layout C - Minimal: full-width image banner, then a centered narrow text column below (magazine style). */
const AboutSectionC = ({ eyebrow, heading, description, quote, chefName, storyLink, imageUrl, onImageClick }: ResolvedAbout) => (
  <section className="py-section-gap bg-[#FBF9F9] w-full border-b border-outline-variant/15">
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      {imageUrl && (
        <div className="relative group cursor-pointer mb-14 rounded-2xl overflow-hidden h-[320px] md:h-[420px] shadow-sm border border-outline-variant/20" onClick={onImageClick}>
          <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={imageUrl} alt={heading} />
        </div>
      )}
      <div className="max-w-2xl mx-auto text-center space-y-6">
        {eyebrow && <span className="font-label-sm text-primary tracking-[0.2em] uppercase font-bold block">{eyebrow}</span>}
        <h2 className="font-serif text-3xl md:text-4xl text-on-surface leading-tight font-normal">{heading}</h2>
        <p className="font-sans text-base text-secondary leading-relaxed font-light">{description}</p>
        {quote && (
          <p className="font-serif text-lg italic text-on-surface pt-2">
            "{quote}"{chefName && <span className="block mt-2 font-sans not-italic text-xs font-bold uppercase tracking-wide text-secondary">{chefName} · {storyLink}</span>}
          </p>
        )}
      </div>
    </div>
  </section>
);

export const AboutSection = ({ variant = 'a', content, imageUrl, onImageClick }: AboutSectionProps) => {
  const c = usePageContent('landing');
  const resolved: ResolvedAbout = {
    eyebrow: content?.eyebrow?.trim() || c.text('aboutEyebrow'),
    heading: content?.heading?.trim() || c.text('aboutHeading'),
    description: content?.description?.trim() || c.text('aboutDescription'),
    quote: content?.quote,
    chefName: content?.chefName,
    storyLink: c.text('aboutStoryLink'),
    imageUrl,
    onImageClick,
  };

  if (variant === 'b') return <AboutSectionB {...resolved} />;
  if (variant === 'c') return <AboutSectionC {...resolved} />;
  return <AboutSectionA {...resolved} />;
};
