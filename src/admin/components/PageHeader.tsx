import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

/**
 * Keeps a page's title block pinned to the top of the admin scroll area while the content scrolls
 * underneath. Sticks below a PublishBar when the page has one (it publishes its height as
 * `--sticky-offset` on the page root). Solid background on purpose - opacity modifiers on the theme's
 * CSS-variable colours don't generate CSS under the Tailwind CDN build.
 */
export function StickyHeader({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  // No sentinel element: an extra sibling would become the page's first child and break `space-y-*` spacing.
  useEffect(() => {
    const el = ref.current;
    const scroller = el?.closest('main');
    if (!el || !scroller) return;
    const update = () => {
      const offset = parseFloat(getComputedStyle(el).top) || 0;
      setStuck(scroller.scrollTop > 0 && el.getBoundingClientRect().top - scroller.getBoundingClientRect().top <= offset + 0.5);
    };
    update();
    scroller.addEventListener('scroll', update, { passive: true });
    return () => scroller.removeEventListener('scroll', update);
  }, []);

  return (
    <div
      ref={ref}
      // No drop shadow when pinned (by request) - just a hairline so scrolled content doesn't blur into the title.
      className={`sticky z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-background border-b ${stuck ? 'border-slate-200' : 'border-transparent'}`}
      style={{ top: 'var(--sticky-offset, 0px)' }}
    >
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  eyebrow?: string;
}

export function PageHeader({ title, description, icon: Icon, actions, eyebrow }: PageHeaderProps) {
  return (
    <StickyHeader>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          {Icon && (
            <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>
          )}
          <div className="min-w-0">
            {eyebrow && <div className="text-xs font-bold uppercase tracking-widest text-primary mb-1">{eyebrow}</div>}
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface truncate tracking-tight">{title}</h1>
            {description && <p className="text-secondary text-sm mt-1 max-w-2xl">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </StickyHeader>
  );
}
