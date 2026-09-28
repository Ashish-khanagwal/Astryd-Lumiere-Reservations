import type { HeroSectionContent, TemplateVariant } from '../types';
import { usePageContent } from '../context/usePageContent';

interface HeroSectionProps {
  variant?: TemplateVariant;
  content?: Partial<HeroSectionContent> | null;
  backgroundImageUrl?: string;
  onNavigate: (link: string) => void;
}

interface ResolvedHero {
  eyebrow: string;
  heading: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  buttonIcon: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  secondaryButtonIcon: string;
  heroImageUrl: string;
  overlayOpacity: number;
  onNavigate: (link: string) => void;
}

/** Layout A - Classic: full-bleed image, centered overlay text. Today's original hero, unchanged. */
const HeroSectionA = ({ eyebrow, heading, description, buttonText, buttonLink, buttonIcon, secondaryButtonText, secondaryButtonLink, secondaryButtonIcon, heroImageUrl, overlayOpacity, onNavigate }: ResolvedHero) => (
  <section id="discover" className="relative h-screen w-full flex items-center justify-center overflow-hidden">
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-black z-10" style={{ opacity: overlayOpacity / 100 }}></div>
      <div className="w-full h-full bg-cover bg-center scale-105 transition-transform duration-1000" style={{ backgroundImage: `url("${heroImageUrl}")` }}></div>
    </div>

    <div className="relative z-20 text-center px-margin-mobile fade-in max-w-4xl pt-16">
      {eyebrow && <span className="font-label-sm text-primary-fixed-dim uppercase tracking-[0.25em] mb-3 inline-block font-semibold">{eyebrow}</span>}
      <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl text-white mb-5 tracking-tight font-normal drop-shadow-lg">{heading}</h1>
      <p className="font-sans text-base md:text-lg text-white/85 max-w-2xl mx-auto drop-shadow leading-relaxed font-light mb-10">{description}</p>

      <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
        <button onClick={() => onNavigate(buttonLink)} className="px-8 py-3.5 rounded-xl bg-primary text-on-primary font-sans text-sm font-semibold hover:bg-primary-container shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2.5">
          <span className="material-symbols-outlined text-xl">{buttonIcon}</span>
          <span>{buttonText}</span>
        </button>
        {secondaryButtonText && secondaryButtonLink && (
          <button onClick={() => onNavigate(secondaryButtonLink)} className="px-8 py-3.5 rounded-xl bg-surface/20 text-white font-sans text-sm font-semibold hover:bg-surface/30 backdrop-blur-md shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2.5 border border-white/30">
            <span className="material-symbols-outlined text-xl">{secondaryButtonIcon}</span>
            <span>{secondaryButtonText}</span>
          </button>
        )}
      </div>
    </div>

    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce text-white/60">
      <span className="material-symbols-outlined text-3xl">expand_more</span>
    </div>
  </section>
);

/** Layout B - Editorial: split screen, text on a solid panel left, full-bleed image right. */
const HeroSectionB = ({ eyebrow, heading, description, buttonText, buttonLink, buttonIcon, secondaryButtonText, secondaryButtonLink, secondaryButtonIcon, heroImageUrl, onNavigate }: ResolvedHero) => (
  <section id="discover" className="relative w-full min-h-screen grid grid-cols-1 lg:grid-cols-2">
    <div className="flex items-center justify-center px-margin-mobile md:px-margin-desktop py-24 lg:py-0 bg-surface-container-low order-2 lg:order-1">
      <div className="max-w-lg fade-in">
        {eyebrow && <span className="font-label-sm text-primary uppercase tracking-[0.25em] mb-3 inline-block font-semibold">{eyebrow}</span>}
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl text-on-surface mb-5 tracking-tight font-normal leading-[1.05]">{heading}</h1>
        <p className="font-sans text-base md:text-lg text-secondary leading-relaxed font-light mb-10">{description}</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={() => onNavigate(buttonLink)} className="px-8 py-3.5 rounded-xl bg-primary text-on-primary font-sans text-sm font-semibold hover:bg-primary-container shadow-md transition-all active:scale-95 flex items-center justify-center gap-2.5">
            <span className="material-symbols-outlined text-xl">{buttonIcon}</span>
            <span>{buttonText}</span>
          </button>
          {secondaryButtonText && secondaryButtonLink && (
            <button onClick={() => onNavigate(secondaryButtonLink)} className="px-8 py-3.5 rounded-xl border border-outline-variant/40 text-on-surface font-sans text-sm font-semibold hover:bg-surface-container-high transition-all active:scale-95 flex items-center justify-center gap-2.5">
              <span className="material-symbols-outlined text-xl">{secondaryButtonIcon}</span>
              <span>{secondaryButtonText}</span>
            </button>
          )}
        </div>
      </div>
    </div>
    <div className="relative h-[45vh] lg:h-auto order-1 lg:order-2">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${heroImageUrl}")` }}></div>
    </div>
  </section>
);

/** Layout C - Minimal: full image, content anchored bottom-left at a smaller scale, gradient only at the base. */
const HeroSectionC = ({ eyebrow, heading, description, buttonText, buttonLink, buttonIcon, heroImageUrl, onNavigate }: ResolvedHero) => (
  <section id="discover" className="relative h-[85vh] w-full overflow-hidden">
    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${heroImageUrl}")` }}></div>
    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>

    <div className="relative z-10 h-full flex flex-col justify-end px-margin-mobile md:px-margin-desktop pb-16 max-w-container-max mx-auto">
      <div className="max-w-xl fade-in">
        {eyebrow && <span className="font-label-sm text-white/70 uppercase tracking-[0.2em] mb-2 inline-block font-semibold">{eyebrow}</span>}
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white mb-3 tracking-tight font-normal">{heading}</h1>
        <p className="font-sans text-sm md:text-base text-white/80 leading-relaxed font-light mb-6 max-w-md">{description}</p>
        <button onClick={() => onNavigate(buttonLink)} className="px-6 py-3 rounded-full bg-white text-on-surface font-sans text-sm font-semibold hover:bg-white/90 transition-all active:scale-95 inline-flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">{buttonIcon}</span>
          <span>{buttonText}</span>
        </button>
      </div>
    </div>
  </section>
);

export const HeroSection = ({ variant = 'a', content, backgroundImageUrl, onNavigate }: HeroSectionProps) => {
  const c = usePageContent('landing');
  const resolved: ResolvedHero = {
    eyebrow: content?.eyebrow?.trim() || c.text('heroEyebrow'),
    heading: content?.heading?.trim() || c.text('heroHeading'),
    description: content?.description?.trim() || c.text('heroDescription'),
    buttonText: content?.buttonText?.trim() || c.text('heroButtonText'),
    buttonLink: content?.buttonLink || '/reservations',
    buttonIcon: c.text('heroButtonIcon'),
    secondaryButtonText: content?.secondaryButtonText,
    secondaryButtonLink: content?.secondaryButtonLink,
    secondaryButtonIcon: c.text('heroSecondaryButtonIcon'),
    heroImageUrl: backgroundImageUrl || c.image('heroFallbackImage'),
    overlayOpacity: typeof content?.overlayOpacity === 'number' ? content.overlayOpacity : 50,
    onNavigate,
  };

  if (variant === 'b') return <HeroSectionB {...resolved} />;
  if (variant === 'c') return <HeroSectionC {...resolved} />;
  return <HeroSectionA {...resolved} />;
};
