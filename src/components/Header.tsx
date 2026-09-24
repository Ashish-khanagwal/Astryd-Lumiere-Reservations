import React, { useState } from 'react';
import { usePublicData } from '../context/PublicDataContext';

interface HeaderProps {
  currentPage: 'landing' | 'menu' | 'reservations';
  onNavigateLanding: () => void;
  onNavigateMenu: () => void;
  onNavigateReservations: () => void;
  onToast?: (msg: string) => void;
  cartUniqueCount?: number;
  onOpenCart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigateLanding,
  onNavigateMenu,
  onNavigateReservations,
  cartUniqueCount = 0,
  onOpenCart,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { brand, mediaMap, getNavLabel } = usePublicData();
  const brandName = brand?.restaurantName ?? 'Lumière';
  const catalogLabel = getNavLabel('catalog', 'Menu');
  const bookingLabel = getNavLabel('booking', 'Reservation');
  const logoUrl = brand?.logoMediaId ? mediaMap.get(brand.logoMediaId)?.fileUrl : undefined;
  const navPosition = brand?.navPosition ?? 'right';

  const headerStyle: React.CSSProperties & Record<string, string | undefined> = {
    backgroundColor: brand?.headerBackgroundColor,
    '--nav-color': brand?.headerTextColor,
    '--nav-hover-color': brand?.headerTextHoverColor,
  };
  const navLinkInactiveClass = 'text-[var(--nav-color,#5f5e5e)] hover:text-[var(--nav-hover-color,#1b1c1c)]';

  const cartButton = onOpenCart ? (
    <button
      type="button"
      id="header-cart-btn"
      onClick={onOpenCart}
      className="relative w-10 h-10 flex items-center justify-center text-on-surface rounded-full hover:bg-surface-container-low transition-colors"
      aria-label={`Open cart${cartUniqueCount > 0 ? `, ${cartUniqueCount} items` : ''}`}
    >
      <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
      {cartUniqueCount > 0 && (
        <span
          key={cartUniqueCount}
          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center leading-none shadow-sm header-cart-badge-pop"
        >
          {cartUniqueCount > 99 ? '99+' : cartUniqueCount}
        </span>
      )}
    </button>
  ) : null;

  return (
    <header
      style={headerStyle}
      className="fixed top-0 left-0 right-0 z-50 bg-surface shadow-[0_4px_20px_rgba(0,0,0,0.04)] h-20 border-b border-outline-variant/20 transition-all"
    >
      <div className="relative max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop h-full flex justify-between items-center">
        <div
          onClick={onNavigateLanding}
          className="font-serif text-2xl sm:text-3xl tracking-tight font-semibold text-on-surface flex items-center gap-2.5 cursor-pointer group"
        >
          {logoUrl ? (
            <img src={logoUrl} alt={brandName} className="h-8 w-auto object-contain" />
          ) : (
            <span className="material-symbols-outlined text-primary text-2.5xl group-hover:rotate-12 transition-transform duration-300">
              auto_awesome
            </span>
          )}
          <span className="group-hover:text-primary transition-colors">{brandName}</span>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <nav
            className={`flex items-center space-x-9 ${
              navPosition === 'center' ? 'absolute left-1/2 top-0 h-full -translate-x-1/2 flex items-center' : ''
            }`}
          >
            <button
              onClick={onNavigateLanding}
              className={`font-sans text-sm tracking-wide py-1 font-medium transition-colors relative ${
                currentPage === 'landing'
                  ? 'text-primary font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full'
                  : navLinkInactiveClass
              }`}
            >
              Discover
            </button>

            <button
              onClick={onNavigateMenu}
              className={`font-sans text-sm tracking-wide py-1 font-medium transition-colors relative ${
                currentPage === 'menu'
                  ? 'text-primary font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full'
                  : navLinkInactiveClass
              }`}
            >
              {catalogLabel}
            </button>

            <button
              onClick={onNavigateReservations}
              className={`font-sans text-sm tracking-wide py-1 font-medium transition-colors relative ${
                currentPage === 'reservations'
                  ? 'text-primary font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full'
                  : navLinkInactiveClass
              }`}
            >
              {bookingLabel}
            </button>
          </nav>

          {cartButton}
        </div>

        <div className="md:hidden flex items-center gap-1">
          {cartButton}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center text-on-surface rounded-full hover:bg-surface-container-low transition-colors"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          style={{ backgroundColor: brand?.headerBackgroundColor }}
          className="md:hidden bg-surface border-b border-outline-variant/20 px-6 py-5 space-y-3.5 animate-fadeIn shadow-xl"
        >
          <button
            onClick={() => {
              onNavigateLanding();
              setIsMobileMenuOpen(false);
            }}
            className={`block w-full text-left font-sans text-base py-2.5 font-medium transition-colors ${
              currentPage === 'landing' ? 'text-primary font-bold' : navLinkInactiveClass
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => {
              onNavigateMenu();
              setIsMobileMenuOpen(false);
            }}
            className={`block w-full text-left font-sans text-base py-2.5 font-medium transition-colors ${
              currentPage === 'menu' ? 'text-primary font-bold' : navLinkInactiveClass
            }`}
          >
            {catalogLabel}
          </button>
          <button
            onClick={() => {
              onNavigateReservations();
              setIsMobileMenuOpen(false);
            }}
            className={`block w-full text-left font-sans text-base py-2.5 font-medium transition-colors ${
              currentPage === 'reservations' ? 'text-primary font-bold' : navLinkInactiveClass
            }`}
          >
            {bookingLabel}
          </button>
        </div>
      )}
    </header>
  );
};
