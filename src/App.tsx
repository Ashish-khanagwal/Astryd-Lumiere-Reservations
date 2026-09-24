import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { ReservationModal } from './components/ReservationModal';
import { OrderOnlineModal } from './components/OrderOnlineModal';
import { GalleryLightbox } from './components/GalleryLightbox';
import { ChefStoryModal } from './components/ChefStoryModal';
import { Toast } from './components/Toast';
import { CatalogView } from './components/catalog';
import { OrderSummaryView } from './components/OrderSummaryView';
import { BookingView } from './components/booking';
import { MembershipView } from './components/membership';
import { ScrollToTop } from './components/ScrollToTop';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { PublicRestaurantProvider } from './context/RestaurantContext';
import { PublicDataProvider, usePublicData } from './context/PublicDataContext';
import { ThemeProvider } from './theme/ThemeProvider';
import { HeroSection } from './sections/HeroSection';
import { SectionRenderer } from './sections/SectionRenderer';
import { resolveGalleryImages } from './sections/galleryUtils';
import type { ResolvedGalleryImage } from './sections/GallerySection';
import {
  type CartState,
  getCartCount,
  getCartUniqueCount,
  addCartLine,
  updateCartLineQty,
  updateItemQty,
  removeCartLine,
  removeCartAddon,
  updateCartLineNote,
} from './data/menuItems';

type AppPage = 'landing' | 'menu' | 'reservations' | 'membership' | 'checkout';

const CART_STORAGE_KEY = 'lumiere-cart';

const DAY_LABEL: Record<string, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
};

function pageFromHash(): AppPage {
  const raw = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  if (raw === 'menu' || raw === 'reservations' || raw === 'membership' || raw === 'checkout') {
    return raw;
  }
  return 'landing';
}

function hashForPage(page: AppPage) {
  return page === 'landing' ? '#/' : `#/${page}`;
}

function loadCart(): CartState {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function AppShell() {
  const { brand, sections, mediaMap, items, offers, isLoading } = usePublicData();
  const [currentPage, setCurrentPageState] = useState<AppPage>(() => pageFromHash());
  const [cart, setCart] = useState<CartState>(() => loadCart());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isChefStoryOpen, setIsChefStoryOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isStickyShadowed, setIsStickyShadowed] = useState(false);

  const setCurrentPage = useCallback((page: AppPage) => {
    setCurrentPageState(page);
    const next = hashForPage(page);
    if (window.location.hash !== next) {
      window.location.hash = next;
    }
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const page = pageFromHash();
      setCurrentPageState(page);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
  };

  const navigateFromLink = useCallback(
    (link: string) => {
      if (link.includes('reservation')) setCurrentPage('reservations');
      else if (link.includes('menu')) setCurrentPage('menu');
      else if (link.includes('membership')) setCurrentPage('membership');
      else setCurrentPage('landing');
    },
    [setCurrentPage],
  );

  const handleUpdateItemQty = (itemId: string, delta: number) => {
    setCart((prev) => updateItemQty(prev, itemId, delta));
  };

  const handleUpdateLineQty = (lineId: string, delta: number) => {
    setCart((prev) => updateCartLineQty(prev, lineId, delta));
  };

  const handleRemoveLine = (lineId: string) => {
    setCart((prev) => removeCartLine(prev, lineId));
  };

  const handleRemoveAddon = (lineId: string, addonId: string) => {
    setCart((prev) => removeCartAddon(prev, lineId, addonId));
  };

  const handleUpdateLineNote = (lineId: string, note: string) => {
    setCart((prev) => updateCartLineNote(prev, lineId, note));
  };

  const handleAddToCart = (itemId: string, quantity: number, addonIds: string[] = []) => {
    setCart((prev) => addCartLine(prev, itemId, quantity, addonIds));
  };

  const handleCheckout = () => {
    if (getCartCount(cart) === 0) {
      triggerToast('Add items to your cart before checkout.');
      return;
    }
    setIsCartOpen(false);
    setCurrentPage('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cartUniqueCount = getCartUniqueCount(cart);

  const cartDrawer = (
    <CartDrawer
      isOpen={isCartOpen}
      cart={cart}
      onClose={() => setIsCartOpen(false)}
      onUpdateLineQty={handleUpdateLineQty}
      onRemoveLine={handleRemoveLine}
      onRemoveAddon={handleRemoveAddon}
      onCheckout={handleCheckout}
    />
  );

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setIsStickyShadowed(true);
      } else {
        setIsStickyShadowed(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-on-surface font-sans">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (currentPage === 'checkout') {
    return (
      <>
        <OrderSummaryView
          cart={cart}
          onClearCart={() => setCart([])}
          onUpdateLineQty={handleUpdateLineQty}
          onRemoveLine={handleRemoveLine}
          onRemoveAddon={handleRemoveAddon}
          onUpdateLineNote={handleUpdateLineNote}
          onNavigateLanding={() => setCurrentPage('landing')}
          onNavigateMenu={() => setCurrentPage('menu')}
          onNavigateReservations={() => setCurrentPage('reservations')}
          onToast={triggerToast}
          cartUniqueCount={cartUniqueCount}
          onOpenCart={() => setIsCartOpen(true)}
        />
        {cartDrawer}
        <ScrollToTop />
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      </>
    );
  }

  if (currentPage === 'reservations') {
    return (
      <>
        <BookingView
          onNavigateLanding={() => setCurrentPage('landing')}
          onNavigateMenu={() => setCurrentPage('menu')}
          onToast={triggerToast}
          cartUniqueCount={cartUniqueCount}
          onOpenCart={() => setIsCartOpen(true)}
        />
        {cartDrawer}
        <ScrollToTop />
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      </>
    );
  }

  if (currentPage === 'membership') {
    return (
      <>
        <MembershipView
          onNavigateLanding={() => setCurrentPage('landing')}
          onNavigateMenu={() => setCurrentPage('menu')}
          onNavigateReservations={() => setCurrentPage('reservations')}
          onToast={triggerToast}
          cartUniqueCount={cartUniqueCount}
          onOpenCart={() => setIsCartOpen(true)}
        />
        {cartDrawer}
        <ScrollToTop />
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      </>
    );
  }

  if (currentPage === 'menu') {
    return (
      <>
        <CatalogView
          cart={cart}
          onUpdateItemQty={handleUpdateItemQty}
          onAddToCart={handleAddToCart}
          onCheckout={handleCheckout}
          onBackToWebsite={() => setCurrentPage('landing')}
          onBookTable={() => setCurrentPage('reservations')}
          onToast={triggerToast}
          cartUniqueCount={cartUniqueCount}
          onOpenCart={() => setIsCartOpen(true)}
        />

        <ReservationModal isOpen={isReserveModalOpen} onClose={() => setIsReserveModalOpen(false)} onSuccess={triggerToast} />
        <ChefStoryModal isOpen={isChefStoryOpen} onClose={() => setIsChefStoryOpen(false)} />

        {cartDrawer}
        <ScrollToTop />
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      </>
    );
  }

  const heroSection = sections.find((s) => s.type === 'hero' && s.visible);
  const restSections = sections.filter((s) => s.type !== 'hero');
  const heroBackgroundMediaId = heroSection?.type === 'hero' ? heroSection.content?.backgroundMediaId : undefined;
  let galleryImages: ResolvedGalleryImage[] = [];
  try {
    galleryImages = resolveGalleryImages(sections, mediaMap);
  } catch {
    // An invalid CMS gallery must not prevent the rest of the public site from rendering.
    galleryImages = [];
  }
  const openStatus = 'Open for Dinner';

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans antialiased">
      <Header
        currentPage="landing"
        onNavigateLanding={() => setCurrentPage('landing')}
        onNavigateMenu={() => setCurrentPage('menu')}
        onNavigateReservations={() => setCurrentPage('reservations')}
        onNavigateMembership={() => setCurrentPage('membership')}
        onToast={triggerToast}
        cartUniqueCount={cartUniqueCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="pt-0 flex-1">
        {heroSection?.type === 'hero' && (
          <HeroSection
            content={heroSection.content}
            backgroundImageUrl={
              heroBackgroundMediaId ? mediaMap.get(heroBackgroundMediaId)?.fileUrl : undefined
            }
            onNavigate={navigateFromLink}
          />
        )}

        {/* Sticky Action Bar - fixed platform chrome, not admin-editable */}
        <div
          className={`sticky top-[73px] z-40 bg-[#241F17] border-b border-[#C5A059]/30 text-[#E5D4B3] transition-all duration-300 ${
            isStickyShadowed ? 'shadow-2xl bg-[#241F17]/95 backdrop-blur-md' : 'shadow-md'
          }`}
        >
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center text-[#D3C4AF]">
              <span className="material-symbols-outlined text-[#C5A059] mr-2 text-xl">location_on</span>
              <span className="font-sans text-sm font-semibold text-white">{(brand?.contact?.address ?? '').split(',').slice(-2, -1)[0]?.trim() || 'Mayfair, London'}</span>
              <span className="mx-3 text-[#C5A059]/40">•</span>
              <span className="text-xs text-green-300 bg-green-950/70 px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 border border-green-700/40">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span>{openStatus}</span>
              </span>
            </div>

            <div className="flex items-center space-x-3 w-full md:w-auto">
              <button
                onClick={() => setCurrentPage('menu')}
                className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-[#C5A059]/40 text-[#E5D4B3] font-sans text-sm font-medium hover:bg-[#C5A059]/20 hover:text-white transition-all"
              >
                Order Online
              </button>
              <button
                onClick={() => setCurrentPage('reservations')}
                className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-[#C5A059] text-[#1E1A14] font-sans text-sm font-bold hover:bg-[#d8b063] transition-all active:scale-95 shadow-lg"
              >
                Reserve a Table
              </button>
            </div>
          </div>
        </div>

        {/* Key Info Cards - Amenities/Details are fixed platform chrome; Opening Hours is sourced from Brand Settings */}
        <section className="py-section-gap bg-[#F4EFE6] w-full border-b border-outline-variant/15">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-surface rounded-2xl p-8 shadow-sm border border-outline-variant/20 hover:shadow-md transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <span className="material-symbols-outlined text-primary text-2.5xl">concierge</span>
                  <h3 className="font-serif text-2xl font-bold text-on-surface">Amenities</h3>
                </div>
                <ul className="space-y-4 font-sans text-sm text-secondary">
                  <li className="flex justify-between border-b border-outline-variant/10 pb-3">
                    <span>Valet Parking</span> <span className="text-on-surface font-semibold">Available</span>
                  </li>
                  <li className="flex justify-between border-b border-outline-variant/10 pb-3">
                    <span>Private Dining</span> <span className="text-on-surface font-semibold">Vault Room</span>
                  </li>
                  <li className="flex justify-between border-b border-outline-variant/10 pb-3">
                    <span>Wheelchair Access</span> <span className="text-on-surface font-semibold">Fully Accessible</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Wi-Fi</span> <span className="text-on-surface font-semibold">Complimentary</span>
                  </li>
                </ul>
              </div>

              <div className="bg-surface rounded-2xl p-8 shadow-sm border border-outline-variant/20 hover:shadow-md transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <span className="material-symbols-outlined text-primary text-2.5xl">info</span>
                  <h3 className="font-serif text-2xl font-bold text-on-surface">The Details</h3>
                </div>
                <ul className="space-y-4 font-sans text-sm text-secondary">
                  <li className="flex justify-between border-b border-outline-variant/10 pb-3">
                    <span>Dress Code</span> <span className="text-on-surface font-semibold">Smart Casual</span>
                  </li>
                  <li className="flex justify-between border-b border-outline-variant/10 pb-3">
                    <span>Dining Style</span> <span className="text-on-surface font-semibold">Fine Dining</span>
                  </li>
                  <li className="flex justify-between border-b border-outline-variant/10 pb-3">
                    <span>Payment</span> <span className="text-on-surface font-semibold">Visa, MC, AMEX</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Corkage</span> <span className="text-on-surface font-semibold">$50 per bottle</span>
                  </li>
                </ul>
              </div>

              <div className="bg-surface rounded-2xl p-8 shadow-sm border border-outline-variant/20 hover:shadow-md transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <span className="material-symbols-outlined text-primary text-2.5xl">schedule</span>
                  <h3 className="font-serif text-2xl font-bold text-on-surface">Opening Hours</h3>
                </div>
                <ul className="space-y-4 font-sans text-sm text-secondary">
                  {(brand?.businessHours ?? []).map((h) => (
                    <li key={h.day} className="flex justify-between border-b border-outline-variant/10 pb-3 last:border-0">
                      <span>{DAY_LABEL[h.day]}</span>
                      <span className="text-on-surface font-semibold">
                        {h.isClosed ? 'Closed' : `${h.openTime} - ${h.closeTime}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <SectionRenderer
          sections={restSections}
          brand={brand}
          mediaMap={mediaMap}
          items={items}
          offers={offers}
          onNavigate={navigateFromLink}
          onAboutImageClick={() => setIsChefStoryOpen(true)}
          onGalleryImageClick={(idx) => setLightboxIndex(idx)}
          onViewMenu={() => setCurrentPage('menu')}
        />
      </main>

      <Footer
        onNavigateLanding={() => setCurrentPage('landing')}
        onNavigateMenu={() => setCurrentPage('menu')}
        onNavigateReservations={() => setCurrentPage('reservations')}
        onToast={triggerToast}
      />

      {cartDrawer}

      <ReservationModal isOpen={isReserveModalOpen} onClose={() => setIsReserveModalOpen(false)} onSuccess={triggerToast} />
      <OrderOnlineModal isOpen={isOrderOpen} onClose={() => setIsOrderOpen(false)} onSuccess={triggerToast} />

      <GalleryLightbox
        isOpen={lightboxIndex !== null}
        images={galleryImages}
        currentIndex={lightboxIndex || 0}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(idx) => setLightboxIndex(idx)}
      />

      <ChefStoryModal isOpen={isChefStoryOpen} onClose={() => setIsChefStoryOpen(false)} />

      <ScrollToTop />

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
}

function ThemedShell() {
  const { brand } = usePublicData();
  return (
    <ThemeProvider brand={brand}>
      <AppShell />
    </ThemeProvider>
  );
}

function App() {
  return (
    <PublicRestaurantProvider>
      <PublicDataProvider>
        <ThemedShell />
      </PublicDataProvider>
    </PublicRestaurantProvider>
  );
}

export default App;
