import { useState, useEffect, useCallback } from 'react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { ItemCustomizeModal } from '../ItemCustomizeModal';
import { CartAddAnimation } from '../CartAddAnimation';
import {
  ALL_MENU_ITEMS,
  type CartState,
  type MenuItem,
  getCartCount,
  getCartSubtotal,
  getCartUniqueCount,
  getItemQuantity,
  projectUniqueCountAfterAdd,
} from '../../data/menuItems';
import { usePageContent } from '../../context/usePageContent';

export interface CatalogViewProps {
  cart: CartState;
  onUpdateItemQty: (itemId: string, delta: number) => void;
  onAddToCart: (itemId: string, quantity: number, addonIds?: string[]) => void;
  onCheckout: () => void;
  onBackToWebsite: () => void;
  onBookTable: () => void;
  onToast: (msg: string) => void;
  cartUniqueCount?: number;
  onOpenCart?: () => void;
}

/** Variant A - "Menu Grid" (Multi-Vertical Platform Plan §8.2), the original design; suits a Restaurant but any Site can pick it. */
export const CatalogVariantA = ({
  cart,
  onUpdateItemQty,
  onAddToCart,
  onCheckout,
  onBackToWebsite,
  onBookTable,
  onToast,
  cartUniqueCount = 0,
  onOpenCart,
}: CatalogViewProps) => {
  const c = usePageContent('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Popular');
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeSection, setActiveSection] = useState('popular');
  const [customizeItem, setCustomizeItem] = useState<MenuItem | null>(null);
  const [cartFly, setCartFly] = useState<{ fromCount: number; toCount: number } | null>(null);

  const CATEGORY_TABS = [
    'Popular',
    'Veg',
    'Non-Veg',
    ...Array.from(new Set(ALL_MENU_ITEMS.map((item) => item.category))),
  ];

  /** Filter tabs stay keyed on stable ids; only the displayed label is editable. */
  const FILTER_LABELS: Record<string, string> = {
    Popular: c.text('a_filterPopular'),
    Veg: c.text('a_filterVeg'),
    'Non-Veg': c.text('a_filterNonVeg'),
  };

  const filteredItems = ALL_MENU_ITEMS.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === 'Popular') return true;
    if (selectedFilter === 'Veg') return item.isVeg === true;
    if (selectedFilter === 'Non-Veg') return item.isVeg !== true;
    return item.category.toLowerCase() === selectedFilter.toLowerCase();
  });

  const totalCartCount = getCartCount(cart);
  const totalCartPrice = getCartSubtotal(cart);

  const handleCustomizeConfirm = ({
    quantity,
    addonIds,
  }: {
    quantity: number;
    addonIds: string[];
  }) => {
    if (!customizeItem) return;

    const fromCount = getCartUniqueCount(cart);
    const toCount = projectUniqueCountAfterAdd(cart, customizeItem.id, addonIds);

    onAddToCart(customizeItem.id, quantity, addonIds);
    setCustomizeItem(null);
    setCartFly({ fromCount, toCount });
  };

  const handleCartFlyComplete = useCallback(() => {
    setCartFly(null);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['popular', 'burgers', 'starters', 'pizza', 'pasta', 'steaks', 'desserts', 'beverages'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 100) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      <Header
        currentPage="menu"
        onNavigateLanding={onBackToWebsite}
        onNavigateMenu={() => {}}
        onNavigateReservations={onBookTable}
        onToast={onToast}
        cartUniqueCount={cartFly ? cartFly.fromCount : cartUniqueCount}
        onOpenCart={onOpenCart}
      />

      <main className="flex-grow flex flex-col items-center pt-28 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        <div className="mb-10 bg-surface-container-low p-6 md:p-8 rounded-2xl border border-outline-variant/20 shadow-sm w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="font-label-sm text-primary uppercase tracking-[0.2em] font-bold">
                {c.text('a_eyebrow')}
              </span>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-on-surface mb-3 mt-1">
                {c.text('a_title')}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-secondary font-sans text-sm md:text-base">
                <div className="flex items-center gap-1.5 text-on-surface font-bold">
                  <span className="material-symbols-outlined text-primary text-xl filled">star</span>
                  <span>{c.text('a_rating')}</span>
                  <span className="text-secondary font-normal">{c.text('a_reviews')}</span>
                </div>
                <span className="w-1.5 h-1.5 bg-outline-variant rounded-full"></span>
                <span>{c.text('a_cuisine')}</span>
                <span className="w-1.5 h-1.5 bg-outline-variant rounded-full"></span>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary">schedule</span>
                  <span>{c.text('a_prepTime')}</span>
                </div>
                <span className="w-1.5 h-1.5 bg-outline-variant rounded-full"></span>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary">shopping_bag</span>
                  <span>{c.text('a_pickup')}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onToast(c.text('a_shareToast'))}
                className="flex items-center gap-2 px-5 py-2.5 border border-outline-variant/40 bg-surface rounded-xl hover:bg-surface-container-high transition-all text-on-surface font-sans text-sm font-medium"
              >
                <span className="material-symbols-outlined text-xl">share</span>
                <span>{c.text('a_shareButton')}</span>
              </button>
              <button
                onClick={() => {
                  setIsFavorite(!isFavorite);
                  onToast(isFavorite ? c.text('a_favoriteRemovedToast') : c.text('a_favoriteAddedToast'));
                }}
                className={`flex items-center gap-2 px-5 py-2.5 border rounded-xl transition-all font-sans text-sm font-medium ${
                  isFavorite
                    ? 'bg-rose-50 border-rose-300 text-rose-600'
                    : 'border-outline-variant/40 bg-surface hover:bg-surface-container-high text-on-surface'
                }`}
              >
                <span className={`material-symbols-outlined text-xl ${isFavorite ? 'filled text-rose-600' : ''}`}>
                  favorite
                </span>
                <span>{isFavorite ? c.text('a_favoritedButton') : c.text('a_favoriteButton')}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="sticky top-[73px] z-40 bg-background/95 backdrop-blur-md py-4 mb-8 w-full">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative w-full lg:max-w-md">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
                placeholder={c.text('a_searchPlaceholder')}
                className="w-full pl-12 pr-4 py-3.5 bg-surface border border-outline-variant/30 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>

            <div className="category-scroll flex gap-2.5 overflow-x-auto w-full">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedFilter(tab)}
                  className={`px-5 py-2.5 rounded-full font-body-md text-sm whitespace-nowrap transition-all active:scale-95 ${
                    selectedFilter === tab
                      ? 'bg-primary text-on-primary font-bold shadow-md'
                      : 'bg-surface border border-outline-variant/30 text-secondary hover:border-primary/50 hover:text-primary'
                  }`}
                >
                  {FILTER_LABELS[tab] ?? tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full">
          <aside className="md:col-span-3 lg:col-span-2 hidden md:block">
            <div className="sticky top-44 space-y-1.5 bg-surface p-3 rounded-2xl border border-outline-variant/20 shadow-sm">
              <h3 className="font-label-sm text-secondary uppercase tracking-widest px-3 mb-2">{c.text('a_sidebarTitle')}</h3>
              {c.list('a_sidebarCategories').map((cat) => (
                <a
                  key={cat.id}
                  href={`#${cat.id}`}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all font-body-md ${
                    activeSection === cat.id
                      ? 'bg-primary/10 text-primary font-bold border-l-4 border-primary'
                      : 'text-secondary hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                  <span>{cat.label}</span>
                </a>
              ))}
            </div>
          </aside>

          <div className="md:col-span-9 lg:col-span-10 space-y-12">
            {filteredItems.length === 0 ? (
              <div className="text-center py-16 bg-surface rounded-2xl border border-outline-variant/20">
                <span className="material-symbols-outlined text-4xl text-secondary mb-2">search_off</span>
                <h3 className="font-headline-md font-semibold text-on-surface">{c.text('a_emptyTitle')}</h3>
                <p className="font-body-md text-secondary mt-1">
                  {c.text('a_emptyText')}
                </p>
              </div>
            ) : (
              <>
                <section id="popular">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-on-surface">{c.text('a_popularHeading')}</h2>
                    <span className="text-secondary font-sans text-sm">{c.text('a_popularSubheading')}</span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredItems
                      .filter((i) => i.badge || i.rating >= 4.8)
                      .slice(0, 4)
                      .map((item) => (
                        <MenuItemCard
                          key={item.id}
                          item={item}
                          qty={getItemQuantity(cart, item.id)}
                          onUpdateQty={(delta) => onUpdateItemQty(item.id, delta)}
                          onAdd={() => setCustomizeItem(item)}
                        />
                      ))}
                  </div>
                </section>

                <section id="burgers">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-on-surface">{c.text('a_burgersHeading')}</h2>
                    <a href="#steaks" className="text-primary font-bold text-sm hover:underline">
                      {c.text('a_burgersLink')}
                    </a>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredItems
                      .filter((i) => i.category === 'Burgers' || i.category === 'Steaks')
                      .map((item) => (
                        <MenuItemCard
                          key={item.id}
                          item={item}
                          qty={getItemQuantity(cart, item.id)}
                          onUpdateQty={(delta) => onUpdateItemQty(item.id, delta)}
                          onAdd={() => setCustomizeItem(item)}
                        />
                      ))}
                  </div>
                </section>

                <section id="starters">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-on-surface">{c.text('a_startersHeading')}</h2>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredItems
                      .filter(
                        (i) =>
                          i.category === 'Starters' || i.category === 'Pizza' || i.category === 'Pasta'
                      )
                      .map((item) => (
                        <MenuItemCard
                          key={item.id}
                          item={item}
                          qty={getItemQuantity(cart, item.id)}
                          onUpdateQty={(delta) => onUpdateItemQty(item.id, delta)}
                          onAdd={() => setCustomizeItem(item)}
                        />
                      ))}
                  </div>
                </section>

                <section id="desserts">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-on-surface">
                      {c.text('a_dessertsHeading')}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredItems
                      .filter((i) => i.category === 'Desserts' || i.category === 'Beverages')
                      .map((item) => (
                        <MenuItemCard
                          key={item.id}
                          item={item}
                          qty={getItemQuantity(cart, item.id)}
                          onUpdateQty={(delta) => onUpdateItemQty(item.id, delta)}
                          onAdd={() => setCustomizeItem(item)}
                        />
                      ))}
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </main>

      {totalCartCount > 0 && !cartFly && (
        <div className="fixed bottom-6 right-6 left-6 md:left-auto z-50 animate-slideUp">
          <div className="bg-inverse-surface text-inverse-on-surface p-4 rounded-2xl shadow-2xl flex items-center gap-6 md:min-w-[360px] border border-white/10">
            <div className="flex flex-col">
              <span className="font-label-sm text-[11px] uppercase opacity-70 tracking-widest font-bold">
                {c.text('a_cartTitle')}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-sans text-xl font-bold">
                  {totalCartCount} {totalCartCount === 1 ? c.text('itemSingular') : c.text('itemPlural')}
                </span>
                <span className="opacity-50">•</span>
                <span className="font-serif text-2xl font-bold text-primary-fixed-dim">
                  ${totalCartPrice.toFixed(2)}
                </span>
              </div>
            </div>
            <button
              onClick={onCheckout}
              className="ml-auto bg-primary hover:bg-primary-container text-on-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg text-sm tracking-wide"
            >
              <span>{c.text('checkoutButton')}</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {cartFly && (
        <CartAddAnimation
          fromCount={cartFly.fromCount}
          toCount={cartFly.toCount}
          onComplete={handleCartFlyComplete}
        />
      )}
      <Footer
        onNavigateLanding={onBackToWebsite}
        onNavigateMenu={() => {}}
        onNavigateReservations={onBookTable}
        onToast={onToast}
      />

      {customizeItem && (
        <ItemCustomizeModal
          item={customizeItem}
          onClose={() => setCustomizeItem(null)}
          onConfirm={handleCustomizeConfirm}
        />
      )}
    </div>
  );
};

interface MenuItemCardProps {
  item: MenuItem;
  qty: number;
  onUpdateQty: (delta: number) => void;
  onAdd: () => void;
}

const MenuItemCard = ({ item, qty, onUpdateQty, onAdd }: MenuItemCardProps) => {
  const c = usePageContent('catalog');
  return (
    <div className="bg-surface p-5 rounded-2xl border border-outline-variant/30 flex gap-5 transition-all duration-300 hover:shadow-lg group hover:-translate-y-1">
      <div className="relative w-32 h-32 md:w-36 md:h-36 shrink-0 overflow-hidden rounded-xl border border-outline-variant/20">
        <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={item.image}
          alt={item.name}
        />
        {item.badge && (
          <span className="absolute top-2 left-2 px-2.5 py-0.5 bg-primary text-on-primary text-[10px] font-bold uppercase rounded-full shadow">
            {item.badge}
          </span>
        )}
      </div>

      <div className="flex flex-col justify-between flex-grow">
        <div>
          <div className="flex justify-between items-start mb-1.5 gap-2">
            <h3 className="font-serif text-lg font-bold text-on-surface leading-tight">{item.name}</h3>
            <span className="font-serif text-xl text-primary font-bold">${item.price.toFixed(2)}</span>
          </div>
          <p className="text-secondary font-sans text-sm line-clamp-2 mb-3 leading-relaxed">{item.description}</p>
          <div className="flex items-center gap-3 text-xs text-secondary font-sans">
            <div className="flex items-center gap-1 font-semibold text-on-surface">
              <span className="material-symbols-outlined text-sm text-primary filled">star</span>
              <span>
                {item.rating} ({item.reviews})
              </span>
            </div>
            <span className="w-1 h-1 bg-outline-variant rounded-full"></span>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span>{item.prepTime}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          {qty > 0 ? (
            <div className="flex items-center bg-surface-container-high rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm">
              <button onClick={() => onUpdateQty(-1)} className="p-2 hover:bg-outline-variant/20 transition-colors">
                <span className="material-symbols-outlined text-sm">remove</span>
              </button>
              <span className="px-4 font-bold min-w-[36px] text-center text-sm">{qty}</span>
              <button onClick={onAdd} className="p-2 hover:bg-outline-variant/20 transition-colors" aria-label={c.text('a_addAnotherAria')}>
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onAdd}
              className="px-6 py-2 bg-on-surface text-on-primary rounded-xl font-bold hover:bg-primary transition-all active:scale-95 shadow-sm text-xs tracking-wider uppercase"
            >
              {c.text('a_addButton')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
