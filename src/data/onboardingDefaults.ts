import type { PlatformModule, TemplateVariant, Vertical } from '../types';

/** Multi-Vertical Platform Plan §6, step 1 - Vertical only ever seeds defaults below, never gates a feature. */
export const VERTICAL_LABEL: Record<Vertical, string> = {
  restaurant: 'Restaurant',
  gym: 'Gym / Fitness Studio',
  retail: 'Retail / Shop',
  salon: 'Salon / Beauty',
  coffee: 'Coffee Shop / Café',
};

export const VERTICAL_DESCRIPTION: Record<Vertical, string> = {
  restaurant: 'Dishes, tables, and a loyalty club - dining, takeaway, and reservations.',
  gym: 'Programs, classes, and memberships - browse-first, book a spot, manage members.',
  retail: 'Products, appointments, and a VIP club - shop online or book a fitting.',
  salon: 'A service menu, online appointments, and a VIP membership - book a stylist in a few taps.',
  coffee: 'A menu, order-ahead pickup, and a rewards card - order online and skip the line.',
};

export interface ModuleDefault {
  module: PlatformModule;
  navLabel: string;
  enabled: boolean;
  /** Overrides the Vertical's default layout for this one module (e.g. a Salon's appointment booking). */
  templateVariant?: TemplateVariant;
}

/** Plan §6 step 3 table - pre-checked and editable immediately; fixed module order per §7.1 (Items → Catalog → Booking → Membership). */
export const VERTICAL_MODULE_DEFAULTS: Record<Vertical, ModuleDefault[]> = {
  restaurant: [
    { module: 'items', navLabel: 'Menu', enabled: true },
    { module: 'catalog', navLabel: 'Online Order', enabled: true },
    { module: 'booking', navLabel: 'Reservations', enabled: true },
    { module: 'membership', navLabel: 'Membership', enabled: false },
  ],
  gym: [
    { module: 'items', navLabel: 'Programs', enabled: true },
    { module: 'catalog', navLabel: 'Shop', enabled: false },
    { module: 'booking', navLabel: 'Classes', enabled: true },
    { module: 'membership', navLabel: 'Membership', enabled: true },
  ],
  retail: [
    { module: 'items', navLabel: 'Products', enabled: true },
    { module: 'catalog', navLabel: 'Online Order', enabled: true },
    { module: 'booking', navLabel: 'Appointments', enabled: false },
    { module: 'membership', navLabel: 'Loyalty', enabled: true },
  ],
  salon: [
    { module: 'items', navLabel: 'Services', enabled: true, templateVariant: 'a' },
    { module: 'catalog', navLabel: 'Shop', enabled: false, templateVariant: 'a' },
    { module: 'booking', navLabel: 'Book Now', enabled: true, templateVariant: 'c' },
    { module: 'membership', navLabel: 'Memberships', enabled: true, templateVariant: 'c' },
  ],
  coffee: [
    { module: 'items', navLabel: 'Menu', enabled: true, templateVariant: 'a' },
    { module: 'catalog', navLabel: 'Order Ahead', enabled: true, templateVariant: 'a' },
    { module: 'booking', navLabel: 'Reserve a Table', enabled: false, templateVariant: 'a' },
    { module: 'membership', navLabel: 'Rewards', enabled: true, templateVariant: 'a' },
  ],
};

/** Plan §8.6 - Vertical only pre-selects a layout at Site creation; owners can switch any module to any layout in Settings → Pages. */
export const VERTICAL_TEMPLATE_VARIANT: Record<Vertical, TemplateVariant> = {
  restaurant: 'a',
  gym: 'b',
  retail: 'c',
  salon: 'a',
  coffee: 'a',
};

/** The layout a new Site's module starts on - the module's own override, else the Vertical's default. */
export function defaultTemplateVariant(vertical: Vertical, module: PlatformModule): TemplateVariant {
  return VERTICAL_MODULE_DEFAULTS[vertical].find((d) => d.module === module)?.templateVariant ?? VERTICAL_TEMPLATE_VARIANT[vertical];
}
