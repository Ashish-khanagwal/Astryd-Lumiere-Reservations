import { Image, Info, UtensilsCrossed, Images, Tag, Quote, MapPin, type LucideIcon } from 'lucide-react';

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
