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
  salon: {
    bg: 'bg-[#2B1D22]',
    glow: 'bg-gradient-to-b from-[#F2B8C6]/10 via-transparent to-black/40',
    text: 'text-[#EBD9DD]',
    accent: 'text-[#F2B8C6]',
    mutedText: 'text-[#CDB5BB]',
    hoverText: 'hover:text-white',
    borderTop: 'border-[#F2B8C6]/20',
    extraNavTarget: 'reservations',
  },
  coffee: {
    bg: 'bg-[#2B1B12]',
    glow: 'bg-gradient-to-b from-[#C99A62]/10 via-transparent to-black/40',
    text: 'text-[#E8D5BE]',
    accent: 'text-[#C99A62]',
    mutedText: 'text-[#CBB49B]',
    hoverText: 'hover:text-white',
    borderTop: 'border-[#C99A62]/20',
    extraNavTarget: 'menu',
  },
  laundry: {
    bg: 'bg-[#0E4A61]',
    glow: 'bg-gradient-to-b from-[#7FCBE8]/10 via-transparent to-black/40',
    text: 'text-[#CFE9F5]',
    accent: 'text-[#7FCBE8]',
    mutedText: 'text-[#A9C9D6]',
    hoverText: 'hover:text-white',
    borderTop: 'border-[#7FCBE8]/20',
    extraNavTarget: 'reservations',
  },
};

interface NavItem {
  key: string;
  label: string;
  onClick: () => void;
}

interface LegalLink {
  id: string;
  label: string;
  url: string;
}

interface ResolvedFooter {
  theme: FooterTheme;
  isLight: boolean;
  brandName: string;
  description: string;
  navHeading: string;
  navItems: NavItem[];
  contactHeading: string;
  address: string;
  phone: string;
  email: string;
  instagram: string;
  onShareClick: () => void;
  onInstagramClick: () => void;
  brandingBadgeEnabled: boolean;
  poweredByLabel: string;
  poweredByLogoAlt: string;
  legalLinks: LegalLink[];
}

const POWERED_BY_LOGO = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbsZIxMTMGTD3TOfdIZm391OfjJ-oJrf2h3HKZ3BckU_Pk9Xb4te2EC5d-YrvHHrXPiHQdB2_6OjGs1OAq-biSiEhxd6BuMJe3ffJKTjgOYY1pIqwUvbEXpqnX3gPsW1OXg5_s2RkBbp2RKyY5FqSqzv_g6By6qkOFUzb9_zB3EnRZsuf8N4hEDjKMWW67H_-YOCT4OhJKBxk07UzB_cmcBbfPBTvT7TppRA0gkxSOHdV274CcTZrNaygCHjJIlLG97a0Vv8v0lQs';

function SocialIcons({ theme, instagram, onShareClick, onInstagramClick, className = '' }: Pick<ResolvedFooter, 'theme' | 'instagram' | 'onShareClick' | 'onInstagramClick'> & { className?: string }) {
  return (
    <div className={`flex ${theme.accent} ${className}`}>
      <span className={`material-symbols-outlined cursor-pointer transition-colors ${theme.hoverText}`} onClick={onShareClick}>share</span>
      {instagram && (
        <span className={`material-symbols-outlined cursor-pointer transition-colors ${theme.hoverText}`} onClick={onInstagramClick}>camera</span>
      )}
    </div>
  );
}

function PoweredBy({ isLight, mutedText, label, logoAlt }: { isLight: boolean; mutedText: string; label: string; logoAlt: string }) {
  return (
    <div className={`flex items-center gap-2 font-label-sm ${mutedText}`}>
      <span className="tracking-widest uppercase text-[11px]">{label}</span>
      <img src={POWERED_BY_LOGO} alt={logoAlt} className={`h-6 w-auto object-contain ${isLight ? '' : 'brightness-110 contrast-125'}`} />
    </div>
  );
}

/** Layout A - Classic: a 4-column grid (brand, nav, contact), with a bottom bar. */
const FooterA = ({ theme, isLight, brandName, description, navHeading, navItems, contactHeading, address, phone, email, instagram, onShareClick, onInstagramClick, brandingBadgeEnabled, poweredByLabel, poweredByLogoAlt, legalLinks }: ResolvedFooter) => (
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
          <h4 className={`font-label-sm uppercase mb-6 font-bold tracking-[0.2em] ${theme.accent}`}>{navHeading}</h4>
          <ul className={`space-y-3.5 font-sans text-sm ${theme.text}`}>
            {navItems.map((item) => (
              <li key={item.key}><button className={`${theme.hoverText} transition-colors text-left`} onClick={item.onClick}>{item.label}</button></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className={`font-label-sm uppercase mb-6 font-bold tracking-[0.2em] ${theme.accent}`}>{contactHeading}</h4>
          <ul className={`space-y-3.5 font-sans text-sm ${theme.text}`}>
            <li className={theme.mutedText}>{address}</li>
            <li className={theme.mutedText}>{phone}</li>
            <li className={theme.mutedText}>{email}</li>
            <li className="pt-3"><SocialIcons theme={theme} instagram={instagram} onShareClick={onShareClick} onInstagramClick={onInstagramClick} className="space-x-4" /></li>
          </ul>
        </div>
      </div>

      <div className={`flex flex-col md:flex-row items-center pt-8 border-t ${theme.borderTop} font-label-sm gap-4 text-xs ${theme.mutedText} ${brandingBadgeEnabled ? 'justify-between' : 'justify-end'}`}>
        {brandingBadgeEnabled && <PoweredBy isLight={isLight} mutedText={theme.mutedText} label={poweredByLabel} logoAlt={poweredByLogoAlt} />}
        <div className="flex space-x-6">
          {legalLinks.map((link) => <a key={link.id} className={`${theme.hoverText} transition-colors`} href={link.url || '#'}>{link.label}</a>)}
        </div>
      </div>
    </div>
  </footer>
);

/** Layout B - Editorial: centered and single-column - everything stacked in the middle. */
const FooterB = ({ theme, isLight, brandName, description, navItems, contactHeading, address, phone, email, instagram, onShareClick, onInstagramClick, brandingBadgeEnabled, poweredByLabel, poweredByLogoAlt, legalLinks }: ResolvedFooter) => (
  <footer className={`${theme.bg} ${theme.text} border-t ${theme.borderTop} pt-16 pb-8 w-full mt-auto shadow-2xl relative overflow-hidden`}>
    <div className={`absolute inset-0 ${theme.glow} pointer-events-none`}></div>
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10 text-center">
      <h2 className={`font-serif text-3xl md:text-4xl tracking-tight font-bold flex items-center justify-center gap-2.5 ${isLight ? 'text-on-surface' : 'text-white'}`}>
        <span className={`material-symbols-outlined text-3xl ${theme.accent}`}>auto_awesome</span>
        <span>{brandName}</span>
      </h2>
      <p className={`font-sans text-sm max-w-md mx-auto leading-relaxed mt-4 ${theme.mutedText}`}>{description}</p>

      <nav className={`flex flex-wrap items-center justify-center gap-x-8 gap-y-2 font-sans text-sm mt-10 ${theme.text}`}>
        {navItems.map((item) => (
          <button key={item.key} className={`${theme.hoverText} transition-colors`} onClick={item.onClick}>{item.label}</button>
        ))}
      </nav>

      <div className="mt-8 space-y-1">
        <p className={`font-label-sm uppercase tracking-[0.2em] font-bold text-xs ${theme.accent}`}>{contactHeading}</p>
        <p className={`font-sans text-sm ${theme.mutedText}`}>{address}</p>
        <p className={`font-sans text-sm ${theme.mutedText}`}>{phone} · {email}</p>
      </div>
      <SocialIcons theme={theme} instagram={instagram} onShareClick={onShareClick} onInstagramClick={onInstagramClick} className="justify-center space-x-5 mt-5" />

      <div className={`flex flex-col items-center pt-8 mt-10 border-t ${theme.borderTop} font-label-sm gap-4 text-xs ${theme.mutedText}`}>
        {brandingBadgeEnabled && <PoweredBy isLight={isLight} mutedText={theme.mutedText} label={poweredByLabel} logoAlt={poweredByLogoAlt} />}
        <div className="flex space-x-6">
          {legalLinks.map((link) => <a key={link.id} className={`${theme.hoverText} transition-colors`} href={link.url || '#'}>{link.label}</a>)}
        </div>
      </div>
    </div>
  </footer>
);

/** Layout C - Minimal: a bold split - a large wordmark and description on the left, two compact columns right. */
const FooterC = ({ theme, isLight, brandName, description, navHeading, navItems, contactHeading, address, phone, email, instagram, onShareClick, onInstagramClick, brandingBadgeEnabled, poweredByLabel, poweredByLogoAlt, legalLinks }: ResolvedFooter) => (
  <footer className={`${theme.bg} ${theme.text} border-t ${theme.borderTop} pt-16 pb-8 w-full mt-auto shadow-2xl relative overflow-hidden`}>
    <div className={`absolute inset-0 ${theme.glow} pointer-events-none`}></div>
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 mb-16">
        <div className="lg:col-span-3">
          <h2 className={`font-serif text-5xl md:text-6xl tracking-tight font-bold leading-none ${isLight ? 'text-on-surface' : 'text-white'}`}>{brandName}</h2>
          <p className={`font-sans text-sm max-w-sm leading-relaxed mt-5 ${theme.mutedText}`}>{description}</p>
          <SocialIcons theme={theme} instagram={instagram} onShareClick={onShareClick} onInstagramClick={onInstagramClick} className="space-x-4 mt-6" />
        </div>
        <div className="lg:col-span-1">
          <h4 className={`font-label-sm uppercase mb-5 font-bold tracking-[0.2em] text-xs ${theme.accent}`}>{navHeading}</h4>
          <ul className={`space-y-2.5 font-sans text-sm ${theme.text}`}>
            {navItems.map((item) => (
              <li key={item.key}><button className={`${theme.hoverText} transition-colors text-left`} onClick={item.onClick}>{item.label}</button></li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-1">
          <h4 className={`font-label-sm uppercase mb-5 font-bold tracking-[0.2em] text-xs ${theme.accent}`}>{contactHeading}</h4>
          <ul className={`space-y-2.5 font-sans text-sm ${theme.mutedText}`}>
            <li>{address}</li>
            <li>{phone}</li>
            <li>{email}</li>
          </ul>
        </div>
      </div>

      <div className={`flex flex-col md:flex-row items-center pt-8 border-t ${theme.borderTop} font-label-sm gap-4 text-xs ${theme.mutedText} ${brandingBadgeEnabled ? 'justify-between' : 'justify-end'}`}>
        {brandingBadgeEnabled && <PoweredBy isLight={isLight} mutedText={theme.mutedText} label={poweredByLabel} logoAlt={poweredByLogoAlt} />}
        <div className="flex space-x-6">
          {legalLinks.map((link) => <a key={link.id} className={`${theme.hoverText} transition-colors`} href={link.url || '#'}>{link.label}</a>)}
        </div>
      </div>
    </div>
  </footer>
);

export const Footer: React.FC<FooterProps> = ({ onNavigateLanding, onNavigateMenu, onNavigateReservations, onToast }) => {
  const { brand, getNavLabel, brandingBadgeEnabled, isModuleEnabled, vertical, getChromeVariant } = usePublicData();
  const c = usePageContent('global');
  const theme = FOOTER_THEME[vertical] ?? FOOTER_THEME.restaurant;
  const isLight = vertical === 'retail';
  const itemsEnabled = isModuleEnabled('items');
  const membershipEnabled = isModuleEnabled('membership');
  const catalogEnabled = isModuleEnabled('catalog');
  const bookingEnabled = isModuleEnabled('booking');
  const onExtraNav = theme.extraNavTarget === 'menu' ? onNavigateMenu : onNavigateReservations;

  const navItems: NavItem[] = [
    { key: 'landing', label: c.text('navHomeLabel'), onClick: onNavigateLanding },
    ...(itemsEnabled ? [{ key: 'items', label: getNavLabel('items', 'Menu'), onClick: () => { window.location.hash = '#/items'; } }] : []),
    ...(catalogEnabled ? [{ key: 'menu', label: getNavLabel('catalog', 'Menu'), onClick: onNavigateMenu }] : []),
    ...(bookingEnabled ? [{ key: 'reservations', label: getNavLabel('booking', 'Reservation'), onClick: onNavigateReservations }] : []),
    ...((theme.extraNavTarget === 'menu' ? catalogEnabled : bookingEnabled) ? [{ key: 'extra', label: c.text('footerExtraNavLabel'), onClick: onExtraNav }] : []),
    ...(membershipEnabled ? [{ key: 'membership', label: getNavLabel('membership', 'Membership'), onClick: () => { window.location.hash = '#/membership'; } }] : []),
  ];

  const resolved: ResolvedFooter = {
    theme,
    isLight,
    brandName: brand?.restaurantName ?? 'Lumière',
    description: brand?.description ?? c.text('footerDescription'),
    navHeading: c.text('footerNavHeading'),
    navItems,
    contactHeading: c.text('footerContactHeading'),
    address: brand?.contact?.address ?? c.text('footerAddressFallback'),
    phone: brand?.contact?.phone ?? c.text('footerPhoneFallback'),
    email: brand?.contact?.email ?? c.text('footerEmailFallback'),
    instagram: brand?.socialLinks?.instagram ?? '',
    onShareClick: () => onToast?.(c.text('shareToast')),
    onInstagramClick: () => onToast?.(c.text('instagramToast')),
    brandingBadgeEnabled,
    poweredByLabel: c.text('poweredByLabel'),
    poweredByLogoAlt: c.text('poweredByLogoAlt'),
    legalLinks: c.list('legalLinks').map((link) => ({ id: link.id, label: link.label ?? '', url: link.url ?? '' })),
  };

  const variant = getChromeVariant('footer');
  if (variant === 'b') return <FooterB {...resolved} />;
  if (variant === 'c') return <FooterC {...resolved} />;
  return <FooterA {...resolved} />;
};
