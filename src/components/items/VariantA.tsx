import { useMemo, useState } from 'react';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { ALL_MENU_ITEMS, type MenuItem } from '../../data/menuItems';
import { usePageContent } from '../../context/usePageContent';

/** Internal sentinel for the "show everything" filter - its visible label comes from Page Content. */
const ALL = '__all__';

export interface ItemsViewProps {
  onNavigateLanding: () => void;
  onNavigateMenu: () => void;
  onNavigateReservations: () => void;
  onToast: (msg: string) => void;
  cartUniqueCount?: number;
  onOpenCart?: () => void;
}

/** Variant A - "Editorial Showcase" (Multi-Vertical Platform Plan §8.5); full-bleed, lookbook-style browsing - view only, no cart. Suits a Restaurant but any Site can pick it. */
export const ItemsVariantA = ({
  onNavigateLanding,
  onNavigateMenu,
  onNavigateReservations,
  onToast,
  cartUniqueCount = 0,
  onOpenCart,
}: ItemsViewProps) => {
  const c = usePageContent('items');
  const [selectedFilter, setSelectedFilter] = useState(ALL);

  const categories = useMemo(() => [ALL, ...Array.from(new Set(ALL_MENU_ITEMS.map((item) => item.category)))], []);
  const groups = useMemo(() => {
    const byCategory = new Map<string, MenuItem[]>();
    ALL_MENU_ITEMS.filter((item) => selectedFilter === ALL || item.category === selectedFilter).forEach((item) => {
      if (!byCategory.has(item.category)) byCategory.set(item.category, []);
      byCategory.get(item.category)!.push(item);
    });
    return Array.from(byCategory.entries());
  }, [selectedFilter]);

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

      <main className="flex-grow pt-28 pb-28">
        <div className="text-center max-w-2xl mx-auto px-margin-mobile mb-14">
          <span className="font-label-sm text-primary uppercase tracking-[0.3em] font-bold">{c.text('a_eyebrow')}</span>
          <h1 className="font-serif text-4xl md:text-6xl font-semibold text-on-surface mt-3">{c.text('a_title')}</h1>
          <p className="text-secondary mt-4 font-sans">
            {c.text('a_introBefore')}{' '}
            <button onClick={onNavigateMenu} className="text-primary font-semibold hover:underline">
              {c.text('a_introLink')}
            </button>{' '}
            {c.text('a_introAfter')}
          </p>
        </div>

        <div className="flex justify-center gap-2.5 overflow-x-auto px-margin-mobile mb-16 category-scroll">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-5 py-2.5 rounded-full font-body-md text-sm whitespace-nowrap transition-all active:scale-95 ${
                selectedFilter === cat
                  ? 'bg-primary text-on-primary font-bold shadow-md'
                  : 'bg-surface border border-outline-variant/30 text-secondary hover:border-primary/50 hover:text-primary'
              }`}
            >
              {cat === ALL ? c.text('a_allFilter') : cat}
            </button>
          ))}
        </div>

        <div className="space-y-24">
          {groups.map(([category, items]) => (
            <section key={category} className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
              <div className="flex items-center gap-6 mb-10">
                <h2 className="font-serif text-2xl md:text-4xl font-bold text-on-surface whitespace-nowrap">{category}</h2>
                <span className="h-px flex-1 bg-outline-variant/30" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-16">
                {items.map((item, idx) => (
                  <figure
                    key={item.id}
                    className={`group ${idx % 3 === 0 ? 'md:col-span-2' : ''}`}
                  >
                    <div className={`relative overflow-hidden rounded-3xl ${idx % 3 === 0 ? 'aspect-[16/8]' : 'aspect-[4/3]'}`}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
                      {item.badge && (
                        <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-on-primary text-[10px] font-bold uppercase tracking-widest rounded-full shadow">
                          {item.badge}
                        </span>
                      )}
                      <figcaption className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between gap-4">
                        <div>
                          <h3 className="font-serif text-2xl font-bold text-white leading-tight">{item.name}</h3>
                          <p className="text-white/80 text-sm mt-1 line-clamp-2 max-w-md">{item.description}</p>
                        </div>
                        <span className="font-serif text-xl font-bold text-white shrink-0">${item.price.toFixed(2)}</span>
                      </figcaption>
                    </div>
                  </figure>
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
