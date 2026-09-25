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

export interface VariantInfo {
  name: string;
  description: string;
  suits: string;
}

/** Multi-Vertical Platform Plan §8 - a variant name only ever suggests a vertical; any Site can pick any of the 3. */
export const VARIANT_INFO: Record<PlatformModule, Record<TemplateVariant, VariantInfo>> = {
  items: {
    a: { name: 'Editorial Showcase', description: 'Full-bleed photography with generous, lookbook-style spacing.', suits: 'Restaurant' },
    b: { name: 'Program Spotlight', description: 'Large cards in scrolling rails, grouped by program.', suits: 'Gym' },
    c: { name: 'Product Lookbook', description: 'A minimal, image-first grid for browsing the range.', suits: 'Retail' },
  },
  catalog: {
    a: { name: 'Menu Grid', description: 'Dish cards with photo, price and description, plus a category sidebar.', suits: 'Restaurant' },
    b: { name: 'Program Schedule', description: 'A weekly class-style list grouped by category.', suits: 'Gym' },
    c: { name: 'Product List', description: 'A dense, filterable catalog table with quick add.', suits: 'Retail' },
  },
  booking: {
    a: { name: 'Table Reservation', description: 'Step-by-step date, time and party-size booking with seating choice.', suits: 'Restaurant' },
    b: { name: 'Class / Session Booking', description: 'A weekly timetable showing spots left in each session.', suits: 'Gym' },
    c: { name: 'Appointment Booking', description: 'Pick a service, then a date and time slot.', suits: 'Retail' },
  },
  membership: {
    a: { name: 'Loyalty / Rewards', description: 'A friendly rewards club with a simple "how it works".', suits: 'Restaurant' },
    b: { name: 'Plan Tiers + Check-in', description: 'Side-by-side plan comparison with visit tracking.', suits: 'Gym' },
    c: { name: 'VIP / Store Credit Club', description: 'An exclusive club with perks and early access.', suits: 'Retail' },
  },
};

/** Which public page each module renders on, so a layout preview opens straight to it. */
export const MODULE_PREVIEW_HASH: Record<PlatformModule, string> = {
  items: '#/items',
  catalog: '#/menu',
  booking: '#/reservations',
  membership: '#/membership',
};
