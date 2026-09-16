import type { GallerySectionContent } from '../types';

export interface ResolvedGalleryImage {
  src: string;
  title: string;
  caption: string;
  colSpan: string;
}

interface GallerySectionProps {
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

export const GallerySection = ({ content, images, onImageClick }: GallerySectionProps) => {
  if (!Array.isArray(images) || images.length === 0) return null;

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

        <div className="grid grid-cols-4 md:grid-cols-12 gap-5 auto-rows-[260px]">
          {images.map((img, idx) => (
            <div
              key={idx}
              onClick={() => onImageClick(idx)}
              className={`${img.colSpan} rounded-2xl overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-xl transition-all border border-outline-variant/20`}
            >
              <img
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                src={img.src}
                alt={img.title}
              />
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
};
