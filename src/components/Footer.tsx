import React from 'react';
import { usePublicData } from '../context/PublicDataContext';

interface FooterProps {
  onNavigateLanding: () => void;
  onNavigateMenu: () => void;
  onNavigateReservations: () => void;
  onToast?: (msg: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateLanding,
  onNavigateMenu,
  onNavigateReservations,
  onToast,
}) => {
  const { brand, getNavLabel, brandingBadgeEnabled } = usePublicData();
  const brandName = brand?.restaurantName ?? 'Lumière';
  const catalogLabel = getNavLabel('catalog', 'Menu');
  const bookingLabel = getNavLabel('booking', 'Reservation');
  const description =
    brand?.description ??
    'Experience the invisible excellence of modern French cuisine in the heart of Mayfair. Part of the Haute-Cuisine Group.';
  const contact = brand?.contact;
  const instagram = brand?.socialLinks?.instagram ?? '';

  return (
    <footer className="bg-[#241F17] text-[#E5D4B3] border-t border-[#C5A059]/30 pt-16 pb-8 w-full mt-auto shadow-2xl relative overflow-hidden">
      {/* Subtle Dusty Gold Ambient Glow Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#B89B5F]/10 via-transparent to-black/40 pointer-events-none"></div>

      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h2 className="font-serif text-3xl md:text-4xl tracking-tight font-bold text-white flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#C5A059] text-3xl">auto_awesome</span>
              <span className="text-white">{brandName}</span>
            </h2>
            <p className="font-sans text-sm text-[#D3C4AF] max-w-sm leading-relaxed">{description}</p>
          </div>

          <div>
            <h4 className="font-label-sm text-[#C5A059] uppercase mb-6 font-bold tracking-[0.2em]">Navigation</h4>
            <ul className="space-y-3.5 font-sans text-sm text-[#E5D4B3]">
              <li>
                <button className="hover:text-white transition-colors text-left" onClick={onNavigateLanding}>
                  Discover
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors text-left" onClick={onNavigateMenu}>
                  {catalogLabel}
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors text-left" onClick={onNavigateReservations}>
                  {bookingLabel}
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors text-left" onClick={onNavigateReservations}>
                  Private Dining
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-label-sm text-[#C5A059] uppercase mb-6 font-bold tracking-[0.2em]">Contact</h4>
            <ul className="space-y-3.5 font-sans text-sm text-[#E5D4B3]">
              <li className="text-[#D3C4AF]">{contact?.address ?? '12 Berkeley Square, Mayfair, London'}</li>
              <li className="text-[#D3C4AF]">{contact?.phone ?? '+44 (0) 20 7123 4567'}</li>
              <li className="text-[#D3C4AF]">{contact?.email ?? 'hello@lumiere-dining.com'}</li>
              <li className="flex space-x-4 pt-3 text-[#C5A059]">
                <span
                  className="material-symbols-outlined cursor-pointer hover:text-white transition-colors"
                  onClick={() => onToast?.('Share link copied')}
                >
                  share
                </span>
                {instagram && (
                  <span
                    className="material-symbols-outlined cursor-pointer hover:text-white transition-colors"
                    onClick={() => onToast?.('Instagram page opened')}
                  >
                    camera
                  </span>
                )}
              </li>
            </ul>
          </div>
        </div>

        <div className={`flex flex-col md:flex-row items-center pt-8 border-t border-[#C5A059]/20 text-[#D3C4AF] font-label-sm gap-4 text-xs ${brandingBadgeEnabled ? 'justify-between' : 'justify-end'}`}>
          {brandingBadgeEnabled && (
            <div className="flex items-center gap-2 text-[#D3C4AF] font-label-sm">
              <span className="tracking-widest uppercase text-[11px]">POWERED BY</span>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbsZIxMTMGTD3TOfdIZm391OfjJ-oJrf2h3HKZ3BckU_Pk9Xb4te2EC5d-YrvHHrXPiHQdB2_6OjGs1OAq-biSiEhxd6BuMJe3ffJKTjgOYY1pIqwUvbEXpqnX3gPsW1OXg5_s2RkBbp2RKyY5FqSqzv_g6By6qkOFUzb9_zB3EnRZsuf8N4hEDjKMWW67H_-YOCT4OhJKBxk07UzB_cmcBbfPBTvT7TppRA0gkxSOHdV274CcTZrNaygCHjJIlLG97a0Vv8v0lQs"
                alt="Astryd Logo"
                className="h-6 w-auto object-contain brightness-110 contrast-125"
              />
            </div>
          )}
          <div className="flex space-x-6">
            <a className="hover:text-white transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-white transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-white transition-colors" href="#">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
