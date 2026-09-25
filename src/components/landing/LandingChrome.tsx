import type { BusinessHoursEntry, Vertical } from '../../types';
import { usePageContent } from '../../context/usePageContent';
import { LANDING_EXTRAS_SECTION } from '../../preview/bridge';

interface InfoCard {
  id: string;
  icon: string;
  title: string;
  rows: Array<{ id: string; label: string; value: string }>;
}

interface VerticalStyle {
  stickyBarClassName: string;
  stickyBarTextClassName: string;
  stickyPillClassName: string;
  primaryButtonClassName: string;
  secondaryButtonClassName: string;
  cardsSectionClassName: string;
}

/** Styling only - all copy lives in Page Content (`src/content/pages/landing.ts`). */
const STYLE: Record<Vertical, VerticalStyle> = {
  restaurant: {
    stickyBarClassName: 'bg-[#241F17] border-b border-[#C5A059]/30',
    stickyBarTextClassName: 'text-[#D3C4AF]',
    stickyPillClassName: 'text-[#C5A059]',
    primaryButtonClassName: 'border border-[#C5A059]/40 text-[#E5D4B3] hover:bg-[#C5A059]/20 hover:text-white',
    secondaryButtonClassName: 'bg-[#C5A059] text-[#1E1A14] hover:bg-[#d8b063]',
    cardsSectionClassName: 'bg-[#F4EFE6]',
  },
  gym: {
    stickyBarClassName: 'bg-on-surface border-b border-primary/30',
    stickyBarTextClassName: 'text-surface/70',
    stickyPillClassName: 'text-primary',
    primaryButtonClassName: 'border border-surface/30 text-surface hover:bg-surface/10',
    secondaryButtonClassName: 'bg-primary text-on-primary hover:bg-primary-container',
    cardsSectionClassName: 'bg-surface-container-low',
  },
  retail: {
    stickyBarClassName: 'bg-surface border-b border-outline-variant/30',
    stickyBarTextClassName: 'text-secondary',
    stickyPillClassName: 'text-primary',
    primaryButtonClassName: 'border border-outline-variant/40 text-on-surface hover:bg-surface-container-high',
    secondaryButtonClassName: 'bg-primary text-on-primary hover:bg-primary-container',
    cardsSectionClassName: 'bg-surface-container-low',
  },
};

interface LandingChromeProps {
  vertical: Vertical;
  address?: string;
  businessHours: BusinessHoursEntry[];
  isStickyShadowed: boolean;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
}

/** The public landing page's fixed platform chrome (sticky action bar + key info cards) - styled per Vertical; worded via Admin → Website → Page Content (per-Vertical defaults) (Multi-Vertical Platform Plan §2) instead of always looking like a restaurant. */
export function LandingChrome({ vertical, address, businessHours, isStickyShadowed, onPrimaryAction, onSecondaryAction }: LandingChromeProps) {
  const c = usePageContent('landing');
  const style = STYLE[vertical] ?? STYLE.restaurant;
  const locationLabel = (address ?? '').split(',').slice(-2, -1)[0]?.trim() || c.text('locationFallback');
  const dayLabel = new Map(c.list('weekdays').map((d) => [d.id, d.short]));
  const toRows = (key: string) => c.list(key).map((r) => ({ id: r.id, label: r.label ?? '', value: r.value ?? '' }));
  const cards: InfoCard[] = [
    { id: 'card1', icon: c.text('card1Icon'), title: c.text('card1Title'), rows: toRows('card1Rows') },
    { id: 'card2', icon: c.text('card2Icon'), title: c.text('card2Title'), rows: toRows('card2Rows') },
    {
      id: 'hours',
      icon: 'schedule',
      title: c.text('hoursTitle'),
      rows: businessHours.map((h) => ({
        id: h.day,
        label: dayLabel.get(h.day) || h.day,
        value: h.isClosed ? c.text('closedLabel') : c.text('hoursRange', { open: h.openTime ?? '', close: h.closeTime ?? '' }),
      })),
    },
  ];

  return (
    <>
      <div
        className={`sticky top-[73px] z-40 text-inherit transition-all duration-300 ${style.stickyBarClassName} ${
          isStickyShadowed ? 'shadow-2xl backdrop-blur-md' : 'shadow-md'
        }`}
      >
        <div className={`max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-4 flex flex-col md:flex-row justify-between items-center gap-4 ${style.stickyBarTextClassName}`}>
          <div className="flex items-center">
            <span className={`material-symbols-outlined mr-2 text-xl ${style.stickyPillClassName}`}>location_on</span>
            <span className="font-sans text-sm font-semibold">{locationLabel}</span>
            <span className="mx-3 opacity-40">•</span>
            <span className="text-xs text-green-300 bg-green-950/70 px-3 py-1 rounded-full font-semibold flex items-center gap-1.5 border border-green-700/40">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span>{c.text('openStatus')}</span>
            </span>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <button
              onClick={onPrimaryAction}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-sans text-sm font-medium transition-all ${style.primaryButtonClassName}`}
            >
              {c.text('primaryButton')}
            </button>
            <button
              onClick={onSecondaryAction}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-sans text-sm font-bold transition-all active:scale-95 shadow-lg ${style.secondaryButtonClassName}`}
            >
              {c.text('secondaryButton')}
            </button>
          </div>
        </div>
      </div>

      <section data-section={LANDING_EXTRAS_SECTION} className={`py-section-gap w-full border-b border-outline-variant/15 ${style.cardsSectionClassName}`}>
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map((card) => (
              <div key={card.id} className="bg-surface rounded-2xl p-8 shadow-sm border border-outline-variant/20 hover:shadow-md transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <span className="material-symbols-outlined text-primary text-2.5xl">{card.icon}</span>
                  <h3 className="font-serif text-2xl font-bold text-on-surface">{card.title}</h3>
                </div>
                <ul className="space-y-4 font-sans text-sm text-secondary">
                  {card.rows.map((row, idx) => (
                    <li key={row.id} className={`flex justify-between ${idx < card.rows.length - 1 ? 'border-b border-outline-variant/10 pb-3' : ''}`}>
                      <span>{row.label}</span> <span className="text-on-surface font-semibold">{row.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
