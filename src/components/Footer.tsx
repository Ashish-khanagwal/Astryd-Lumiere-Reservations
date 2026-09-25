import React from 'react';
import { usePublicData } from '../context/PublicDataContext';
import { usePageContent } from '../context/usePageContent';
import type { Vertical } from '../types';

interface FooterProps {
  onNavigateLanding: () => void;
  onNavigateMenu: () => void;
  onNavigateReservations: () => void;
  onToast?: (msg: string) => void;
}

interface FooterTheme {
  bg: string;
  glow: string;
  text: string;
  accent: string;
  mutedText: string;
  hoverText: string;
  borderTop: string;
  extraNavTarget: 'reservations' | 'menu';
}

/** Multi-Vertical Platform Plan §2 - the footer is fixed platform chrome that renders on every public page, so it needs its own per-Vertical identity instead of always looking like a restaurant's. */
const FOOTER_THEME: Record<Vertical, FooterTheme> = {
  restaurant: {
    bg: 'bg-[#241F17]',
    glow: 'bg-gradient-to-b from-[#B89B5F]/10 via-transparent to-black/40',
    text: 'text-[#E5D4B3]',
    accent: 'text-[#C5A059]',
    mutedText: 'text-[#D3C4AF]',
    hoverText: 'hover:text-white',
    borderTop: 'border-[#C5A059]/30',
    extraNavTarget: 'reservations',
  },
  gym: {
    bg: 'bg-[#14181C]',
    glow: 'bg-gradient-to-b from-primary/10 via-transparent to-black/40',
    text: 'text-white/80',
    accent: 'text-primary',
    mutedText: 'text-white/60',
    hoverText: 'hover:text-white',
    borderTop: 'border-primary/20',
    extraNavTarget: 'reservations',
  },
  retail: {
    bg: 'bg-surface-container-high',
    glow: 'bg-gradient-to-b from-primary/5 via-transparent to-transparent',
    text: 'text-on-surface',
    accent: 'text-primary',
    mutedText: 'text-secondary',
    hoverText: 'hover:text-on-surface',
    borderTop: 'border-outline-variant/30',
    extraNavTarget: 'menu',
  },
};

export const Footer: React.FC<FooterProps> = ({
  onNavigateLanding,
  onNavigateMenu,
  onNavigateReservations,
  onToast,
}) => {
  const { brand, getNavLabel, brandingBadgeEnabled, isModuleEnabled, vertical } = usePublicData();
  const c = usePageContent('global');
  const theme = FOOTER_THEME[vertical] ?? FOOTER_THEME.restaurant;
  const isLight = vertical === 'retail';
  const brandName = brand?.restaurantName ?? 'Lumière';
  const itemsLabel = getNavLabel('items', 'Menu');
  const catalogLabel = getNavLabel('catalog', 'Menu');
  const bookingLabel = getNavLabel('booking', 'Reservation');
  const membershipLabel = getNavLabel('membership', 'Membership');
  const itemsEnabled = isModuleEnabled('items');
  const membershipEnabled = isModuleEnabled('membership');
  const description = brand?.description ?? c.text('footerDescription');
  const contact = brand?.contact;
  const instagram = brand?.socialLinks?.instagram ?? '';
  const onExtraNav = theme.extraNavTarget === 'menu' ? onNavigateMenu : onNavigateReservations;

  return (
    <footer className={`${theme.bg} ${theme.text} border-t ${theme.borderTop} pt-16 pb-8 w-full mt-auto shadow-2xl relative overflow-hidden`}>
      <div className={`absolute inset-0 ${theme.glow} pointer-events-none`}></div>

      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h2 className={`font-serif text-3xl md:text-4xl tracking-tight font-bold flex items-center gap-2.5 ${isLight ? 'text-on-surface' : 'text-white'}`}>
              <span className={`material-symbols-outlined text-3xl ${theme.accent}`}>auto_awesome</span>
              <span>{brandName}</span>
            </h2>
            <p className={`font-sans text-sm max-w-sm leading-relaxed ${theme.mutedText}`}>{description}</p>
          </div>

          <div>
            <h4 className={`font-label-sm uppercase mb-6 font-bold tracking-[0.2em] ${theme.accent}`}>{c.text('footerNavHeading')}</h4>
            <ul className={`space-y-3.5 font-sans text-sm ${theme.text}`}>
              <li>
                <button className={`${theme.hoverText} transition-colors text-left`} onClick={onNavigateLanding}>
                  {c.text('navHomeLabel')}
                </button>
              </li>
              {itemsEnabled && (
                <li>
                  <button
                    className={`${theme.hoverText} transition-colors text-left`}
                    onClick={() => { window.location.hash = '#/items'; }}
                  >
                    {itemsLabel}
                  </button>
                </li>
              )}
              <li>
                <button className={`${theme.hoverText} transition-colors text-left`} onClick={onNavigateMenu}>
                  {catalogLabel}
                </button>
              </li>
              <li>
                <button className={`${theme.hoverText} transition-colors text-left`} onClick={onNavigateReservations}>
                  {bookingLabel}
                </button>
              </li>
              <li>
                <button className={`${theme.hoverText} transition-colors text-left`} onClick={onExtraNav}>
                  {c.text('footerExtraNavLabel')}
                </button>
              </li>
              {membershipEnabled && (
                <li>
                  <button
                    className={`${theme.hoverText} transition-colors text-left`}
                    onClick={() => { window.location.hash = '#/membership'; }}
                  >
                    {membershipLabel}
                  </button>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className={`font-label-sm uppercase mb-6 font-bold tracking-[0.2em] ${theme.accent}`}>{c.text('footerContactHeading')}</h4>
            <ul className={`space-y-3.5 font-sans text-sm ${theme.text}`}>
              <li className={theme.mutedText}>{contact?.address ?? c.text('footerAddressFallback')}</li>
              <li className={theme.mutedText}>{contact?.phone ?? c.text('footerPhoneFallback')}</li>
              <li className={theme.mutedText}>{contact?.email ?? c.text('footerEmailFallback')}</li>
              <li className={`flex space-x-4 pt-3 ${theme.accent}`}>
                <span
                  className={`material-symbols-outlined cursor-pointer transition-colors ${theme.hoverText}`}
                  onClick={() => onToast?.(c.text('shareToast'))}
                >
                  share
                </span>
                {instagram && (
                  <span
                    className={`material-symbols-outlined cursor-pointer transition-colors ${theme.hoverText}`}
                    onClick={() => onToast?.(c.text('instagramToast'))}
                  >
                    camera
                  </span>
                )}
              </li>
            </ul>
          </div>
        </div>

        <div className={`flex flex-col md:flex-row items-center pt-8 border-t ${theme.borderTop} font-label-sm gap-4 text-xs ${theme.mutedText} ${brandingBadgeEnabled ? 'justify-between' : 'justify-end'}`}>
          {brandingBadgeEnabled && (
            <div className={`flex items-center gap-2 font-label-sm ${theme.mutedText}`}>
              <span className="tracking-widest uppercase text-[11px]">{c.text('poweredByLabel')}</span>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbsZIxMTMGTD3TOfdIZm391OfjJ-oJrf2h3HKZ3BckU_Pk9Xb4te2EC5d-YrvHHrXPiHQdB2_6OjGs1OAq-biSiEhxd6BuMJe3ffJKTjgOYY1pIqwUvbEXpqnX3gPsW1OXg5_s2RkBbp2RKyY5FqSqzv_g6By6qkOFUzb9_zB3EnRZsuf8N4hEDjKMWW67H_-YOCT4OhJKBxk07UzB_cmcBbfPBTvT7TppRA0gkxSOHdV274CcTZrNaygCHjJIlLG97a0Vv8v0lQs"
                alt={c.text('poweredByLogoAlt')}
                className={`h-6 w-auto object-contain ${isLight ? '' : 'brightness-110 contrast-125'}`}
              />
            </div>
          )}
          <div className="flex space-x-6">
            {c.list('legalLinks').map((link) => (
              <a key={link.id} className={`${theme.hoverText} transition-colors`} href={link.url || '#'}>{link.label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
