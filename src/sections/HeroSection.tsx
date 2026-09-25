import type { HeroSectionContent } from '../types';
import { usePageContent } from '../context/usePageContent';

interface HeroSectionProps {
  content?: Partial<HeroSectionContent> | null;
  backgroundImageUrl?: string;
  onNavigate: (link: string) => void;
}

export const HeroSection = ({ content, backgroundImageUrl, onNavigate }: HeroSectionProps) => {
  const c = usePageContent('landing');
  const heading = content?.heading?.trim() || c.text('heroHeading');
  const description = content?.description?.trim() || c.text('heroDescription');
  const buttonText = content?.buttonText?.trim() || c.text('heroButtonText');
  const buttonLink = content?.buttonLink || '/reservations';
  const eyebrow = content?.eyebrow?.trim() || c.text('heroEyebrow');
  const configuredOverlayOpacity = content?.overlayOpacity;
  const overlayOpacity = typeof configuredOverlayOpacity === 'number' ? configuredOverlayOpacity : 50;
  const heroImageUrl = backgroundImageUrl || c.image('heroFallbackImage');
  const secondaryButtonText = content?.secondaryButtonText;
  const secondaryButtonLink = content?.secondaryButtonLink;

  return (
    <section id="discover" className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black z-10" style={{ opacity: overlayOpacity / 100 }}></div>
        <div
          className="w-full h-full bg-cover bg-center scale-105 transition-transform duration-1000"
          style={{ backgroundImage: `url("${heroImageUrl}")` }}
        ></div>
      </div>

      <div className="relative z-20 text-center px-margin-mobile fade-in max-w-4xl pt-16">
        {eyebrow && (
          <span className="font-label-sm text-primary-fixed-dim uppercase tracking-[0.25em] mb-3 inline-block font-semibold">
            {eyebrow}
          </span>
        )}
        <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl text-white mb-5 tracking-tight font-normal drop-shadow-lg">
          {heading}
        </h1>
        <p className="font-sans text-base md:text-lg text-white/85 max-w-2xl mx-auto drop-shadow leading-relaxed font-light mb-10">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
          <button
            onClick={() => onNavigate(buttonLink)}
            className="px-8 py-3.5 rounded-xl bg-primary text-on-primary font-sans text-sm font-semibold hover:bg-primary-container shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2.5"
          >
            <span className="material-symbols-outlined text-xl">table_restaurant</span>
            <span>{buttonText}</span>
          </button>
          {secondaryButtonText && secondaryButtonLink && (
            <button
              onClick={() => onNavigate(secondaryButtonLink)}
              className="px-8 py-3.5 rounded-xl bg-surface/20 text-white font-sans text-sm font-semibold hover:bg-surface/30 backdrop-blur-md shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2.5 border border-white/30"
            >
              <span className="material-symbols-outlined text-xl">restaurant_menu</span>
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
};
