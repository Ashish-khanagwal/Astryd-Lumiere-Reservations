import type { AboutSectionContent } from '../types';

interface AboutSectionProps {
  content?: Partial<AboutSectionContent> | null;
  imageUrl?: string;
  onImageClick: () => void;
}

export const AboutSection = ({ content, imageUrl, onImageClick }: AboutSectionProps) => {
  const heading = content?.heading?.trim() || 'A sanctuary of light and culinary precision.';
  const description = content?.description?.trim() || 'At Lumière, we believe the finest dining experiences are those where the service is felt but not seen.';
  const eyebrow = content?.eyebrow?.trim() || 'The Philosophy';

  return (
    <section className="py-section-gap bg-[#FBF9F9] w-full border-b border-outline-variant/15">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            {eyebrow && (
              <span className="font-label-sm text-primary tracking-[0.2em] uppercase font-bold block">
                {eyebrow}
              </span>
            )}
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-on-surface leading-tight font-normal">
              {heading}
            </h2>
            <p className="font-sans text-base md:text-lg text-secondary leading-relaxed font-light">
              {description}
            </p>

            {content?.quote && (
              <div className="flex items-center space-x-4 pt-4 border-l-2 border-primary/40 pl-5">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-2xl">restaurant</span>
                </div>
                <p className="font-serif text-lg md:text-xl italic text-on-surface">"{content?.quote}"</p>
              </div>
            )}
          </div>

          {imageUrl && (
            <div className="relative group cursor-pointer" onClick={onImageClick}>
              <div className="absolute -inset-4 bg-primary-fixed opacity-10 rounded-2xl group-hover:opacity-25 transition-opacity duration-500"></div>
              <div className="relative overflow-hidden rounded-2xl h-[480px] shadow-2xl border border-outline-variant/20">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={imageUrl}
                  alt={heading}
                />
                {content?.chefName && (
                  <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-4 rounded-xl text-white flex justify-between items-center border border-white/10">
                    <div>
                      <div className="font-serif text-lg font-bold">{content?.chefName}</div>
                      <div className="text-xs text-white/70 font-sans">Read the full story</div>
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
};
