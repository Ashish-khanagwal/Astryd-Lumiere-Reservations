import { useMemo } from 'react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { ALL_MENU_ITEMS, type MenuItem } from '../../data/menuItems';
import type { ItemsViewProps } from './VariantA';
import { usePageContent } from '../../context/usePageContent';

/** Variant B - "Program Spotlight" (Multi-Vertical Platform Plan §8.5); large-card rails grouped by program, built to sell the program rather than show a bookable calendar - view only, no cart. Suits a Gym. */
export const ItemsVariantB = ({
  onNavigateLanding,
  onNavigateMenu,
  onNavigateReservations,
  onToast,
  cartUniqueCount = 0,
  onOpenCart,
}: ItemsViewProps) => {
  const c = usePageContent('items');
  const groups = useMemo(() => {
    const byCategory = new Map<string, MenuItem[]>();
    ALL_MENU_ITEMS.forEach((item) => {
      if (!byCategory.has(item.category)) byCategory.set(item.category, []);
      byCategory.get(item.category)!.push(item);
    });
    return Array.from(byCategory.entries());
  }, []);

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

      <main className="flex-grow pt-28 pb-24">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-14 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-primary uppercase tracking-[0.3em] font-bold text-xs">{c.text('b_eyebrow')}</span>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-on-surface mt-2">{c.text('b_title')}</h1>
          </div>
          <button
            onClick={onNavigateReservations}
            className="self-start md:self-auto px-6 py-3 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary-container transition-all active:scale-95 shadow-sm text-sm tracking-wide"
          >
            {c.text('b_reserveButton')}
          </button>
        </div>

        <div className="space-y-16">
          {groups.map(([category, items]) => (
            <section key={category} className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-2xl font-bold text-on-surface">{category}</h2>
                <span className="text-xs text-secondary font-semibold uppercase tracking-wide">{c.text('b_programCount', { count: items.length })}</span>
              </div>

              <div className="flex gap-6 overflow-x-auto pb-4 category-scroll">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="shrink-0 w-[300px] bg-surface rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="relative h-44">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 text-white text-[11px] font-bold uppercase tracking-wide rounded-full backdrop-blur-sm">
                        {item.prepTime}
                      </span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-serif text-lg font-bold text-on-surface leading-tight">{item.name}</h3>
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary/10 text-primary shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-secondary text-sm line-clamp-2 leading-relaxed">{item.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs font-semibold text-on-surface">
                          <span className="material-symbols-outlined text-sm text-primary filled">star</span>
                          <span>{item.rating} ({item.reviews})</span>
                        </div>
                        <span className="font-serif text-lg font-bold text-primary">${item.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer onNavigateLanding={onNavigateLanding} onNavigateMenu={onNavigateMenu} onNavigateReservations={onNavigateReservations} onToast={onToast} />
    </div>
  );
};
