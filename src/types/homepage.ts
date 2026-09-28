import type { Id, ISODateString, PublishStatus } from './common';
import type { HeadingSize } from './restaurant';
import type { TemplateVariant } from './pageConfig';

export type HomepageSectionType =
  | 'hero'
  | 'about'
  | 'featured_menu'
  | 'gallery'
  | 'testimonials'
  | 'offers'
  | 'location';

interface BaseSectionContent {
  headingSize?: HeadingSize;
}

export interface HeroSectionContent extends BaseSectionContent {
  eyebrow?: string;
  heading: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  backgroundMediaId: Id | null;
  overlayOpacity: number; // 0-100
}

export interface AboutSectionContent extends BaseSectionContent {
  eyebrow?: string;
  heading: string;
  description: string;
  imageMediaId: Id | null;
  quote?: string;
  buttonText?: string;
  buttonLink?: string;
  /** Folds in "Chef Story" content - not a separate section type per plan §6. */
  chefName?: string;
  chefQuote?: string;
  chefBio?: string;
  chefImageMediaId?: Id | null;
}

export interface FeaturedMenuSectionContent extends BaseSectionContent {
  eyebrow?: string;
  heading: string;
  description?: string;
  /** Sourced from central Menu Management (plan §13); empty = auto-use isFeatured items. */
  selectedItemIds: Id[];
}

export interface GalleryImageEntry {
  mediaId: Id;
  caption?: string;
  order: number;
}

export interface GallerySectionContent extends BaseSectionContent {
  eyebrow?: string;
  heading: string;
  description?: string;
  images: GalleryImageEntry[];
}

export interface TestimonialEntry {
  id: Id;
  customerName: string;
  customerImageMediaId?: Id | null;
  quote: string;
  rating?: number;
  order: number;
}

export interface TestimonialsSectionContent extends BaseSectionContent {
  eyebrow?: string;
  heading: string;
  testimonials: TestimonialEntry[];
}

export interface OffersSectionContent extends BaseSectionContent {
  eyebrow?: string;
  heading: string;
  description?: string;
  selectedOfferIds: Id[];
}

export interface LocationSectionContent extends BaseSectionContent {
  heading: string;
  addressOverride?: string;
  mapEmbedUrlOverride?: string;
  showHoursTable: boolean;
}

export interface HomepageSectionContentMap {
  hero: HeroSectionContent;
  about: AboutSectionContent;
  featured_menu: FeaturedMenuSectionContent;
  gallery: GallerySectionContent;
  testimonials: TestimonialsSectionContent;
  offers: OffersSectionContent;
  location: LocationSectionContent;
}

export type HomepageSection = {
  [K in HomepageSectionType]: {
    id: Id;
    restaurantId: Id;
    type: K;
    order: number;
    visible: boolean;
    /** Plan §8-style layout choice, scoped per section instead of per module; defaults to Layout A (Classic). */
    templateVariant: TemplateVariant;
    content: HomepageSectionContentMap[K];
    updatedAt: ISODateString;
  };
}[HomepageSectionType];

export interface Homepage {
  restaurantId: Id;
  status: PublishStatus;
  sections: HomepageSection[];
}
