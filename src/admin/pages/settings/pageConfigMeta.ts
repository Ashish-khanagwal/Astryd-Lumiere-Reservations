import type { PlatformModule, TemplateVariant } from '../../../types';

export const MODULE_LABEL: Record<PlatformModule, string> = {
  items: 'Items',
  catalog: 'Catalog',
  booking: 'Booking',
  membership: 'Membership',
};

export const MODULE_DESCRIPTION: Record<PlatformModule, string> = {
  items: 'A stylish, browse-only showcase of your menu/programs/products - no cart, no checkout. Reads the same items as Catalog.',
  catalog: 'Today\'s "Menu" - dishes, programs, or products, depending on how you rename it.',
  booking: 'Today\'s "Reservations" - tables, classes, or appointments, depending on how you rename it.',
  membership: 'Plans and members - loyalty, gym membership, or a VIP club.',
};

/** Multi-Vertical Platform Plan §8 - a variant name only ever suggests a vertical; any Site can pick any of the 3. */
export const VARIANT_LABEL: Record<PlatformModule, Record<TemplateVariant, string>> = {
  items: {
    a: 'Editorial Showcase - full-bleed photography, lookbook spacing (suits Restaurant)',
    b: 'Program Spotlight - large-card rail grouped by program (suits Gym)',
    c: 'Product Lookbook - minimal-chrome masonry grid (suits Retail)',
  },
  catalog: {
    a: 'Menu Grid - dish cards with photo, price, description (suits Restaurant)',
    b: 'Program Schedule - weekly class-style grid (suits Gym)',
    c: 'Product List - dense filterable catalog (suits Retail)',
  },
  booking: {
    a: 'Table Reservation - date/time/party-size flow (suits Restaurant)',
    b: 'Class/Session Booking - weekly timetable, spots left (suits Gym)',
    c: 'Appointment Booking - staff + duration slot picker (suits Retail)',
  },
  membership: {
    a: 'Loyalty/Rewards (suits Restaurant)',
    b: 'Plan Tiers + Check-in (suits Gym)',
    c: 'VIP/Store Credit Club (suits Retail)',
  },
};
