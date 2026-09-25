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

/** Variant B - "Program Schedule" (Multi-Vertical Platform Plan §8.2); suits a Gym, grouping the same Catalog items into a weekly-schedule-style layout instead of dish cards. */
export const CatalogVariantB = ({
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
  const [customizeItem, setCustomizeItem] = useState<MenuItem | null>(null);
  const [cartFly, setCartFly] = useState<{ fromCount: number; toCount: number } | null>(null);

  const groups = useMemo(() => {
    const byCategory = new Map<string, MenuItem[]>();
    ALL_MENU_ITEMS.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()),
    ).forEach((item) => {
      if (!byCategory.has(item.category)) byCategory.set(item.category, []);
      byCategory.get(item.category)!.push(item);
    });
    return Array.from(byCategory.entries());
  }, [searchQuery]);

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
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-primary uppercase tracking-[0.2em] font-bold text-xs">{c.text('b_eyebrow')}</span>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-on-surface mt-1">{c.text('b_title')}</h1>
          </div>
          <div className="relative w-full md:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-lg">search</span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={c.text('b_searchPlaceholder')}
              className="w-full pl-10 pr-3 py-2.5 bg-surface border border-outline-variant/30 rounded-xl text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="space-y-8">
          {groups.map(([category, items]) => (
            <section key={category} className="bg-surface rounded-2xl border border-outline-variant/20 overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/10 flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-on-surface">{category}</h2>
                <span className="text-xs text-secondary font-semibold uppercase tracking-wide">{c.text('b_sessionCount', { count: items.length })}</span>
              </div>
              <div className="divide-y divide-outline-variant/10">
                {items.map((item) => {
                  const qty = getItemQuantity(cart, item.id);
                  return (
                    <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-surface-container-low/60 transition-colors">
                      <div className="w-16 shrink-0 text-center">
                        <span className="text-xs font-bold text-primary uppercase tracking-wide">{item.prepTime}</span>
                      </div>
                      <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-on-surface truncate">{item.name}</h3>
                          {item.badge && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary/10 text-primary shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-secondary line-clamp-1">{item.description}</p>
                      </div>
                      <span className="font-serif text-lg font-bold text-primary shrink-0">${item.price.toFixed(2)}</span>
                      <div className="shrink-0">
                        {qty > 0 ? (
                          <div className="flex items-center bg-surface-container-high rounded-xl overflow-hidden border border-outline-variant/30">
                            <button onClick={() => onUpdateItemQty(item.id, -1)} className="p-2 hover:bg-outline-variant/20">
                              <span className="material-symbols-outlined text-sm">remove</span>
                            </button>
                            <span className="px-3 font-bold min-w-[32px] text-center text-sm">{qty}</span>
                            <button onClick={() => setCustomizeItem(item)} className="p-2 hover:bg-outline-variant/20">
                              <span className="material-symbols-outlined text-sm">add</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setCustomizeItem(item)}
                            className="px-5 py-2 bg-on-surface text-on-primary rounded-xl font-bold hover:bg-primary transition-all text-xs tracking-wider uppercase"
                          >
                            {c.text('b_addButton')}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>

      {totalCartCount > 0 && !cartFly && (
        <div className="fixed bottom-6 right-6 left-6 md:left-auto z-50 animate-slideUp">
          <div className="bg-inverse-surface text-inverse-on-surface p-4 rounded-2xl shadow-2xl flex items-center gap-6 md:min-w-[360px] border border-white/10">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase opacity-70 tracking-widest font-bold">{c.text('b_cartTitle')}</span>
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
