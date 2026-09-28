import type { GallerySectionContent, TemplateVariant } from '../types';

export interface ResolvedGalleryImage {
  src: string;
  title: string;
  caption: string;
  colSpan: string;
}

interface GallerySectionProps {
  variant?: TemplateVariant;
  content?: Partial<GallerySectionContent> | null;
  images: ResolvedGalleryImage[];
  onImageClick: (index: number) => void;
}

/** Fixed rotation of bento-grid spans, keyed by position - not admin-editable (plan §13: gallery layout stays fixed). */
const COL_SPAN_ROTATION = [
  'col-span-4 md:col-span-6',
  'col-span-2 md:col-span-3',
  'col-span-2 md:col-span-3',
  'col-span-2 md:col-span-3',
  'col-span-6 md:col-span-9',
];

export function resolveGalleryColSpan(index: number) {
  return COL_SPAN_ROTATION[index % COL_SPAN_ROTATION.length];
}

interface ResolvedGallery {
  eyebrow?: string;
  heading?: string;
  description?: string;
  images: ResolvedGalleryImage[];
  onImageClick: (index: number) => void;
}

function GalleryHeading({ eyebrow, heading, description }: Pick<ResolvedGallery, 'eyebrow' | 'heading' | 'description'>) {
  return (
    <div className="mb-12 text-center">
      {eyebrow && <span className="font-label-sm text-primary uppercase tracking-[0.2em] font-bold">{eyebrow}</span>}
      <h2 className="font-serif text-3xl md:text-4xl font-semibold text-on-surface mt-2">{heading}</h2>
      {description && <p className="font-sans text-sm md:text-base text-secondary mt-2">{description}</p>}
    </div>
  );
}

/** Layout A - Classic: a bento-style grid with varied tile sizes. */
const GallerySectionA = ({ eyebrow, heading, description, images, onImageClick }: ResolvedGallery) => (
  <section className="py-section-gap bg-[#F4EFE6] w-full border-b border-outline-variant/15">
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      <GalleryHeading eyebrow={eyebrow} heading={heading} description={description} />
      <div className="grid grid-cols-4 md:grid-cols-12 gap-5 auto-rows-[260px]">
        {images.map((img, idx) => (
          <div key={idx} onClick={() => onImageClick(idx)} className={`${img.colSpan} rounded-2xl overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-xl transition-all border border-outline-variant/20`}>
            <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={img.src} alt={img.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-white">
              <h4 className="font-serif text-xl font-bold">{img.title}</h4>
              <p className="font-sans text-xs text-white/80 line-clamp-1 mt-1">{img.caption}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/** Layout B - Editorial: a uniform equal-size grid, no bento variety. */
const GallerySectionB = ({ eyebrow, heading, description, images, onImageClick }: ResolvedGallery) => (
  <section className="py-section-gap bg-[#F4EFE6] w-full border-b border-outline-variant/15">
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      <GalleryHeading eyebrow={eyebrow} heading={heading} description={description} />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {images.map((img, idx) => (
          <div key={idx} onClick={() => onImageClick(idx)} className="aspect-square rounded-2xl overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-xl transition-all border border-outline-variant/20">
            <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={img.src} alt={img.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
              <h4 className="font-serif text-lg font-bold">{img.title}</h4>
              <p className="font-sans text-xs text-white/80 line-clamp-1 mt-1">{img.caption}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/** Layout C - Minimal: a horizontal scrolling filmstrip, no grid. */
const GallerySectionC = ({ eyebrow, heading, description, images, onImageClick }: ResolvedGallery) => (
  <section className="py-section-gap bg-[#F4EFE6] w-full border-b border-outline-variant/15">
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
      <GalleryHeading eyebrow={eyebrow} heading={heading} description={description} />
    </div>
    <div className="flex gap-5 overflow-x-auto px-margin-mobile md:px-margin-desktop pb-4 snap-x category-scroll">
      {images.map((img, idx) => (
        <div key={idx} onClick={() => onImageClick(idx)} className="snap-start shrink-0 w-[320px] h-[420px] rounded-2xl overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-xl transition-all border border-outline-variant/20">
          <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={img.src} alt={img.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-white">
            <h4 className="font-serif text-xl font-bold">{img.title}</h4>
            <p className="font-sans text-xs text-white/80 line-clamp-1 mt-1">{img.caption}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export const GallerySection = ({ variant = 'a', content, images, onImageClick }: GallerySectionProps) => {
  if (!Array.isArray(images) || images.length === 0) return null;
  const resolved: ResolvedGallery = { eyebrow: content?.eyebrow, heading: content?.heading, description: content?.description, images, onImageClick };

  if (variant === 'b') return <GallerySectionB {...resolved} />;
  if (variant === 'c') return <GallerySectionC {...resolved} />;
  return <GallerySectionA {...resolved} />;
};
