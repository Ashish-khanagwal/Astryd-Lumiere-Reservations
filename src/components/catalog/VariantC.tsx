import { useState, useCallback, useMemo } from 'react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { ItemCustomizeModal } from '../ItemCustomizeModal';
import { CartAddAnimation } from '../CartAddAnimation';
import {
  ALL_MENU_ITEMS,
  getCartCount,
  getCartSubtotal,
  getCartUniqueCount,
  getItemQuantity,
  projectUniqueCountAfterAdd,
  type MenuItem,
} from '../../data/menuItems';
import type { CatalogViewProps } from './VariantA';
import { usePageContent } from '../../context/usePageContent';

/** Variant C - "Product List" (Multi-Vertical Platform Plan §8.2); suits Retail - a dense, filterable list instead of Variant A's photo-forward cards. */
export const CatalogVariantC = ({
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
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [customizeItem, setCustomizeItem] = useState<MenuItem | null>(null);
  const [cartFly, setCartFly] = useState<{ fromCount: number; toCount: number } | null>(null);

  const categories = useMemo(() => Array.from(new Set(ALL_MENU_ITEMS.map((i) => i.category))), []);

  const filteredItems = useMemo(
    () =>
      ALL_MENU_ITEMS.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
      }),
    [searchQuery, categoryFilter],
  );

  const totalCartCount = getCartCount(cart);
  const totalCartPrice = getCartSubtotal(cart);

  const handleCustomizeConfirm = ({ quantity, addonIds }: { quantity: number; addonIds: string[] }) => {
    if (!customizeItem) return;
    const fromCount = getCartUniqueCount(cart);
    const toCount = projectUniqueCountAfterAdd(cart, customizeItem.id, addonIds);
    onAddToCart(customizeItem.id, quantity, addonIds);
    setCustomizeItem(null);
    setCartFly({ fromCount, toCount });
  };

  const handleCartFlyComplete = useCallback(() => setCartFly(null), []);

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

      <main className="flex-grow pt-28 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-primary uppercase tracking-[0.2em] font-bold text-xs">{c.text('c_eyebrow')}</span>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-on-surface mt-1">{c.text('c_title')}</h1>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-lg">search</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={c.text('c_searchPlaceholder')}
                className="w-full pl-10 pr-3 py-2.5 bg-surface border border-outline-variant/30 rounded-xl text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 bg-surface border border-outline-variant/30 rounded-xl text-sm outline-none focus:border-primary transition-colors"
            >
              <option value="all">{c.text('c_allCategories')}</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-outline-variant/20 overflow-hidden shadow-sm">
          <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-3 bg-surface-container-low border-b border-outline-variant/10 text-xs font-bold uppercase tracking-wide text-secondary">
            <span></span>
            <span>{c.text('c_colProduct')}</span>
            <span>{c.text('c_colCategory')}</span>
            <span className="text-right">{c.text('c_colPrice')}</span>
            <span className="text-right">{c.text('c_colQty')}</span>
          </div>
          <div className="divide-y divide-outline-variant/10">
            {filteredItems.length === 0 ? (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-4xl text-secondary mb-2">inventory_2</span>
                <p className="text-secondary text-sm">{c.text('c_emptyText')}</p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const qty = getItemQuantity(cart, item.id);
                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 px-5 py-3 hover:bg-surface-container-low/60 transition-colors"
                  >
                    <img src={item.image} alt={item.name} className="w-11 h-11 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-on-surface text-sm truncate">{item.name}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-primary/10 text-primary shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="sm:hidden text-xs text-secondary">{item.category}</span>
                    </div>
                    <span className="hidden sm:inline text-sm text-secondary">{item.category}</span>
                    <span className="text-right font-semibold text-on-surface text-sm">${item.price.toFixed(2)}</span>
                    <div className="justify-self-end">
                      {qty > 0 ? (
                        <div className="flex items-center bg-surface-container-high rounded-lg overflow-hidden border border-outline-variant/30">
                          <button onClick={() => onUpdateItemQty(item.id, -1)} className="p-1.5 hover:bg-outline-variant/20">
                            <span className="material-symbols-outlined text-sm">remove</span>
                          </button>
                          <span className="px-2.5 font-bold min-w-[28px] text-center text-xs">{qty}</span>
                          <button onClick={() => setCustomizeItem(item)} className="p-1.5 hover:bg-outline-variant/20">
                            <span className="material-symbols-outlined text-sm">add</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setCustomizeItem(item)}
                          className="px-4 py-1.5 bg-on-surface text-on-primary rounded-lg font-bold hover:bg-primary transition-all text-[11px] tracking-wider uppercase"
                        >
                          {c.text('c_addButton')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {totalCartCount > 0 && !cartFly && (
        <div className="fixed bottom-6 right-6 left-6 md:left-auto z-50 animate-slideUp">
          <div className="bg-inverse-surface text-inverse-on-surface p-4 rounded-2xl shadow-2xl flex items-center gap-6 md:min-w-[360px] border border-white/10">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase opacity-70 tracking-widest font-bold">{c.text('c_cartTitle')}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold">
                  {totalCartCount} {totalCartCount === 1 ? c.text('itemSingular') : c.text('itemPlural')}
                </span>
                <span className="opacity-50">•</span>
                <span className="font-serif text-2xl font-bold text-primary-fixed-dim">${totalCartPrice.toFixed(2)}</span>
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

      {cartFly && <CartAddAnimation fromCount={cartFly.fromCount} toCount={cartFly.toCount} onComplete={handleCartFlyComplete} />}

      <Footer onNavigateLanding={onBackToWebsite} onNavigateMenu={() => {}} onNavigateReservations={onBookTable} onToast={onToast} />

      {customizeItem && (
        <ItemCustomizeModal item={customizeItem} onClose={() => setCustomizeItem(null)} onConfirm={handleCustomizeConfirm} />
      )}
    </div>
  );
};
