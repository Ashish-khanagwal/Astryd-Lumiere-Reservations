import { Image, Info, UtensilsCrossed, Images, Tag, Quote, MapPin, type LucideIcon } from 'lucide-react';
import type { HomepageSectionType, TemplateVariant } from '../../../types';

export const SECTION_LABEL: Record<string, string> = {
  hero: 'Hero',
  about: 'About',
  featured_menu: 'Featured Menu',
  gallery: 'Gallery',
  offers: 'Offers',
  testimonials: 'Testimonials',
  location: 'Location',
};

export const SECTION_ICON: Record<string, LucideIcon> = {
  hero: Image,
  about: Info,
  featured_menu: UtensilsCrossed,
  gallery: Images,
  offers: Tag,
  testimonials: Quote,
  location: MapPin,
};

export interface SectionVariantInfo {
  name: string;
  description: string;
}

/** 3 layout choices per homepage section - one consistent style story: A Classic (today's design, unchanged),
 * B Editorial (bolder, more asymmetric), C Minimal (denser, quieter). Every variant reuses the section's
 * existing content, so switching layout never requires re-entering text or images. */
export const SECTION_VARIANT_INFO: Record<HomepageSectionType, Record<TemplateVariant, SectionVariantInfo>> = {
  hero: {
    a: { name: 'Classic', description: 'Full-bleed image with centered, overlaid text.' },
    b: { name: 'Editorial', description: 'Split screen - text on a solid panel, image alongside it.' },
    c: { name: 'Minimal', description: 'Full image with the headline anchored bottom-left, at a smaller scale.' },
  },
  about: {
    a: { name: 'Classic', description: 'Text on one side, a photo with a floating name card on the other.' },
    b: { name: 'Editorial', description: 'Mirrored layout with the quote shown as a large standalone line.' },
    c: { name: 'Minimal', description: 'A full-width photo banner, then centered text below it.' },
  },
  featured_menu: {
    a: { name: 'Classic', description: 'An even grid of cards.' },
    b: { name: 'Editorial', description: 'Large cards in a horizontal scrolling rail.' },
    c: { name: 'Minimal', description: 'One large spotlight item beside a compact list of the rest.' },
  },
  gallery: {
    a: { name: 'Classic', description: 'A bento-style grid with varied tile sizes.' },
    b: { name: 'Editorial', description: 'A uniform, equal-size grid.' },
    c: { name: 'Minimal', description: 'A horizontal scrolling filmstrip of larger photos.' },
  },
  offers: {
    a: { name: 'Classic', description: 'An even grid of clean cards.' },
    b: { name: 'Editorial', description: 'Full-width horizontal banners, stacked.' },
    c: { name: 'Minimal', description: 'Bold poster-style cards with the photo as a background.' },
  },
  testimonials: {
    a: { name: 'Classic', description: 'An even grid of review cards.' },
    b: { name: 'Editorial', description: 'Large centered pull-quotes, stacked.' },
    c: { name: 'Minimal', description: 'A dense single-column list of reviews.' },
  },
  location: {
    a: { name: 'Classic', description: 'A map beside an address/phone/hours card.' },
    b: { name: 'Editorial', description: 'Three info blocks on top, a full-width map below.' },
    c: { name: 'Minimal', description: 'A large map with a floating info card over one corner.' },
  },
};
