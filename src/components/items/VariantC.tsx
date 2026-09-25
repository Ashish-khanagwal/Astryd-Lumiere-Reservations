import { useMemo, useState } from 'react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { ALL_MENU_ITEMS } from '../../data/menuItems';
import type { ItemsViewProps } from './VariantA';

/** Variant C - "Product Lookbook" (Multi-Vertical Platform Plan §8.5); minimal-chrome masonry grid for browsing the range - view only, no cart, no stock/variant chips. Suits Retail. */
export const ItemsVariantC = ({
  onNavigateLanding,
  onNavigateMenu,
  onNavigateReservations,
  onToast,
  cartUniqueCount = 0,
  onOpenCart,
}: ItemsViewProps) => {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const categories = useMemo(() => Array.from(new Set(ALL_MENU_ITEMS.map((i) => i.category))), []);
  const items = useMemo(
    () => ALL_MENU_ITEMS.filter((item) => categoryFilter === 'all' || item.category === categoryFilter),
    [categoryFilter],
  );

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      <Header
        currentPage="items"
        onNavigateLanding={onNavigateLanding}
        onNavigateMenu={onNavigateMenu}
        onNavigateReservations={onNavigateReservations}
        onToast={onToast}
        cartUniqueCount={cartUniqueCount}
        onOpenCart={onOpenCart}
      />

      <main className="flex-grow pt-28 pb-24 max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-primary uppercase tracking-[0.3em] font-bold text-xs">Lookbook</span>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-on-surface mt-2">The Collection</h1>
          </div>
          <div className="flex gap-2 overflow-x-auto category-scroll">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                categoryFilter === 'all' ? 'bg-primary text-on-primary' : 'bg-surface border border-outline-variant/30 text-secondary hover:text-primary'
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  categoryFilter === c ? 'bg-primary text-on-primary' : 'bg-surface border border-outline-variant/30 text-secondary hover:text-primary'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((item) => (
            <div key={item.id} className="group">
              <div className="relative overflow-hidden rounded-2xl bg-surface-container-low aspect-square">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm font-semibold truncate">{item.name}</p>
                  <p className="text-white/80 text-xs">${item.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-on-surface truncate">{item.name}</span>
                <span className="text-sm font-bold text-primary shrink-0">${item.price.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer onNavigateLanding={onNavigateLanding} onNavigateMenu={onNavigateMenu} onNavigateReservations={onNavigateReservations} onToast={onToast} />
    </div>
  );
};
