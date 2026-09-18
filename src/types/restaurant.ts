import type { Id, ISODateString, Tenant, Timestamps, PublishStatus } from './common';

export type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface BusinessHoursEntry {
  day: WeekDay;
  isClosed: boolean;
  openTime: string | null; // "18:00"
  closeTime: string | null; // "23:00"
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  x?: string;
  whatsapp?: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  mapEmbedUrl?: string;
  latitude?: number;
  longitude?: number;
}

/** Controlled lists per plan §9/§10/§41 - never free-text/arbitrary CSS. */
export const FONT_OPTIONS = [
  'Cormorant Garamond',
  'Geist',
  'Inter',
  'Poppins',
  'Montserrat',
  'Playfair Display',
  'Roboto',
  'Lato',
  'DM Sans',
] as const;
export type FontOption = (typeof FONT_OPTIONS)[number];

export const FONT_WEIGHTS = ['light', 'regular', 'medium', 'semibold', 'bold'] as const;
export type FontWeight = (typeof FONT_WEIGHTS)[number];

export const HEADING_SIZES = ['sm', 'md', 'lg'] as const;
export type HeadingSize = (typeof HEADING_SIZES)[number];

export const BUTTON_STYLES = ['rounded', 'pill', 'square'] as const;
export type ButtonStyle = (typeof BUTTON_STYLES)[number];

export const BORDER_RADII = ['none', 'sm', 'md', 'lg', 'full'] as const;
export type BorderRadius = (typeof BORDER_RADII)[number];

export const NAV_POSITIONS = ['right', 'center'] as const;
export type NavPosition = (typeof NAV_POSITIONS)[number];

export interface ThemePreset {
  id: string;
  name: string;
  colors: {
    primary: string;
    onPrimary: string;
    primaryContainer: string;
    primaryFixed: string;
    primaryFixedDim: string;
    onPrimaryFixed: string;
    onPrimaryFixedVariant: string;
    tertiary: string;
  };
}

/** Selecting this id means the admin has picked a custom color instead of a named preset. */
export const CUSTOM_THEME_ID = 'custom';

/** Named, contrast-checked presets. Admins may also pick a custom color (see CUSTOM_THEME_ID), which is run through generatePaletteFromColor for contrast-safe derived tones. */
export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'dusty-gold',
    name: 'Dusty Gold',
    colors: {
      primary: '#785600',
      onPrimary: '#ffffff',
      primaryContainer: '#986d00',
      primaryFixed: '#ffdea6',
      primaryFixedDim: '#f7bd48',
      onPrimaryFixed: '#271900',
      onPrimaryFixedVariant: '#5d4200',
      tertiary: '#735c00',
    },
  },
  {
    id: 'emerald',
    name: 'Emerald',
    colors: {
      primary: '#00693c',
      onPrimary: '#ffffff',
      primaryContainer: '#00854e',
      primaryFixed: '#a1f2c1',
      primaryFixedDim: '#5fd991',
      onPrimaryFixed: '#00210f',
      onPrimaryFixedVariant: '#00512e',
      tertiary: '#3f6b00',
    },
  },
  {
    id: 'burgundy',
    name: 'Burgundy',
    colors: {
      primary: '#8f2a3a',
      onPrimary: '#ffffff',
      primaryContainer: '#a8384a',
      primaryFixed: '#ffd9dc',
      primaryFixedDim: '#ffb2ba',
      onPrimaryFixed: '#3f0011',
      onPrimaryFixedVariant: '#6f1526',
      tertiary: '#7c5800',
    },
  },
  {
    id: 'sapphire',
    name: 'Sapphire',
    colors: {
      primary: '#2f5fa8',
      onPrimary: '#ffffff',
      primaryContainer: '#3f71bd',
      primaryFixed: '#d6e2ff',
      primaryFixedDim: '#a9c6ff',
      onPrimaryFixed: '#001945',
      onPrimaryFixedVariant: '#0f3f74',
      tertiary: '#6a4d8f',
    },
  },
];

export interface BrandSettings extends Tenant, Timestamps {
  restaurantName: string;
  tagline?: string;
  logoMediaId: Id | null;
  faviconMediaId: Id | null;
  themePresetId: string;
  customPrimaryColor?: string;
  primaryFont: FontOption;
  headingFont: FontOption;
  fontWeight: FontWeight;
  buttonStyle: ButtonStyle;
  borderRadius: BorderRadius;
  navPosition?: NavPosition;
  headerBackgroundColor?: string;
  headerTextColor?: string;
  headerTextHoverColor?: string;
  socialLinks: SocialLinks;
  contact: ContactInfo;
  description: string;
  cuisineType: string;
  businessHours: BusinessHoursEntry[];
}

export interface Restaurant extends Timestamps {
  id: Id;
  slug: string;
  name: string;
  ownerUserId: Id;
  status: 'active' | 'suspended' | 'trial';
  domain?: string | null;
}

export interface WebsiteSettings extends Tenant, Timestamps {
  publishStatus: PublishStatus;
  publishedAt: ISODateString | null;
  seoTitle?: string;
  seoDescription?: string;
}
