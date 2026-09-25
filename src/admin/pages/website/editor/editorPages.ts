import { CalendarDays, Crown, Home, LayoutGrid, Paintbrush, PanelTop, ShoppingBag, ShoppingCart, type LucideIcon } from 'lucide-react';
import type { ContentPageKey, PlatformModule } from '../../../../types';

export type EditorPageKey = 'home' | 'items' | 'catalog' | 'booking' | 'membership' | 'checkout' | 'header-footer' | 'theme';
export type EditorTab = 'sections' | 'content' | 'layout' | 'settings' | 'header' | 'style';

export interface EditorPageDef {
  key: EditorPageKey;
  /** Fallback name; module pages show the owner's own nav label instead. */
  title: string;
  description: string;
  icon: LucideIcon;
  group: 'pages' | 'site';
  module?: PlatformModule;
  contentPage?: ContentPageKey;
  previewHash: string;
  tabs: EditorTab[];
}

export const EDITOR_PAGES: EditorPageDef[] = [
  { key: 'home', title: 'Home', description: 'Your homepage - sections, hero, story, gallery and more.', icon: Home, group: 'pages', contentPage: 'landing', previewHash: '#/', tabs: ['sections', 'content'] },
  { key: 'items', title: 'Menu / Items', description: 'A browse-only showcase of what you offer.', icon: LayoutGrid, group: 'pages', module: 'items', contentPage: 'items', previewHash: '#/items', tabs: ['content', 'layout', 'settings'] },
  { key: 'catalog', title: 'Online Order', description: 'Where customers add items to their cart and check out.', icon: ShoppingBag, group: 'pages', module: 'catalog', contentPage: 'catalog', previewHash: '#/menu', tabs: ['content', 'layout', 'settings'] },
  { key: 'booking', title: 'Reservations', description: 'Tables, classes or appointments.', icon: CalendarDays, group: 'pages', module: 'booking', contentPage: 'booking', previewHash: '#/reservations', tabs: ['content', 'layout', 'settings'] },
  { key: 'membership', title: 'Membership', description: 'Plans, sign-up and member perks.', icon: Crown, group: 'pages', module: 'membership', contentPage: 'membership', previewHash: '#/membership', tabs: ['content', 'layout', 'settings'] },
  { key: 'checkout', title: 'Checkout', description: 'The order summary and payment page, opened from the cart.', icon: ShoppingCart, group: 'pages', contentPage: 'checkout', previewHash: '#/checkout', tabs: ['content'] },
  { key: 'header-footer', title: 'Header & Footer', description: 'Logo, name, navigation, footer and shared labels - shown on every page.', icon: PanelTop, group: 'site', contentPage: 'global', previewHash: '#/', tabs: ['header', 'content'] },
  { key: 'theme', title: 'Colors & Fonts', description: 'Your site-wide color theme and typography.', icon: Paintbrush, group: 'site', previewHash: '#/', tabs: ['style'] },
];

export const EDITOR_PAGE_BY_KEY = Object.fromEntries(EDITOR_PAGES.map((p) => [p.key, p])) as Record<EditorPageKey, EditorPageDef>;

export const TAB_LABEL: Record<EditorTab, string> = {
  sections: 'Sections',
  content: 'Text & images',
  layout: 'Layout',
  settings: 'Settings',
  header: 'Header',
  style: 'Colors & fonts',
};

/** Which editor page a public-site hash belongs to, so clicking around the preview follows along. */
export function editorPageForHash(hash: string): EditorPageKey | undefined {
  const page = EDITOR_PAGES.find((p) => p.group === 'pages' && p.previewHash === hash);
  return page?.key;
}

export function isEditorPageKey(value: string | undefined): value is EditorPageKey {
  return Boolean(value && value in EDITOR_PAGE_BY_KEY);
}
