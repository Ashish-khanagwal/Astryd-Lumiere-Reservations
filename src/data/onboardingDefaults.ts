import type { PlatformModule, TemplateVariant, Vertical } from '../types';

/** Multi-Vertical Platform Plan §6, step 1 - Vertical only ever seeds defaults below, never gates a feature. */
export const VERTICAL_LABEL: Record<Vertical, string> = {
  restaurant: 'Restaurant',
  gym: 'Gym / Fitness Studio',
  retail: 'Retail / Shop',
};

export const VERTICAL_DESCRIPTION: Record<Vertical, string> = {
  restaurant: 'Dishes, tables, and a loyalty club - dining, takeaway, and reservations.',
  gym: 'Programs, classes, and memberships - browse-first, book a spot, manage members.',
  retail: 'Products, appointments, and a VIP club - shop online or book a fitting.',
};

export interface ModuleDefault {
  module: PlatformModule;
  navLabel: string;
  enabled: boolean;
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
};

/** Plan §8.6 - Vertical only pre-selects a layout at Site creation; owners can switch any module to any layout in Settings → Pages. */
export const VERTICAL_TEMPLATE_VARIANT: Record<Vertical, TemplateVariant> = {
  restaurant: 'a',
  gym: 'b',
  retail: 'c',
};
