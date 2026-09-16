import type { HomepageSection, MediaAsset } from '../types';
import { resolveGalleryColSpan, type ResolvedGalleryImage } from './GallerySection';

export function resolveGalleryImages(
  sections: HomepageSection[],
  mediaMap: Map<string, MediaAsset>,
): ResolvedGalleryImage[] {
  const gallery = sections.find((s) => s.type === 'gallery');
  if (!gallery || gallery.type !== 'gallery') return [];
  const images = gallery.content?.images;
  if (!Array.isArray(images)) return [];

  return [...images]
    .sort((a, b) => a.order - b.order)
    .map((img, idx) => ({
      src: mediaMap.get(img.mediaId)?.fileUrl ?? '',
      title: mediaMap.get(img.mediaId)?.altText ?? '',
      caption: img.caption ?? '',
      colSpan: resolveGalleryColSpan(idx),
    }));
}
