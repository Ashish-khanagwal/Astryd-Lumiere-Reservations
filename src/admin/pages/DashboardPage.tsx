import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  LayoutGrid,
  Tag,
  PlusCircle,
  Globe,
  ArrowRight,
  CreditCard,
  ShoppingBag,
  Clapperboard,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMenu } from '../hooks/api/useMenu';
import { useOffers } from '../hooks/api/useOffers';
import { useAddons } from '../hooks/api/useAddons';
import { useBrandDraft, useWebsiteStatus } from '../hooks/api/useWebsite';
import { MetricCard } from '../components/MetricCard';
import { Skeleton } from '../components/Skeleton';
import { StickyHeader } from '../components/PageHeader';

function formatRelative(iso?: string) {
  if (!iso) return 'Just now';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.round(diff / 60000));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function AvailabilityChart({
  points,
  empty,
}: {
  points: { label: string; value: number }[];
  empty?: boolean;
}) {
  const width = 320;
  const height = 120;
  const padX = 12;
  const padY = 16;

  if (empty || points.length === 0) {
    return (
      <div className="flex h-[7.5rem] flex-col items-center justify-center text-center px-4">
        <p className="text-sm font-semibold text-on-surface">No menu data yet</p>
        <p className="text-xs text-secondary mt-1">Add categories and dishes to see availability here.</p>
      </div>
    );
  }

  const values = points.map((p) => p.value);
  const max = Math.max(100, ...values);
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const series = points.length === 1 ? [points[0], points[0]] : points;
  const coords = series.map((p, i) => {
    const x = padX + (i / (series.length - 1)) * innerW;
    const y = padY + innerH - (p.value / max) * innerH * 0.92;
    return { x, y, ...p };
  });
  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  const area = `${line} L ${coords[coords.length - 1].x} ${height - padY} L ${coords[0].x} ${height - padY} Z`;
  const active = coords[coords.length - 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[7.5rem]" role="img" aria-label="Availability by category">
      <defs>
        <linearGradient id="availFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
        </linearGradient>
      </defs>
      {Array.from({ length: 3 }).map((_, i) => {
        const y = padY + ((i + 1) / 4) * innerH;
        return <line key={i} x1={padX} y1={y} x2={width - padX} y2={y} stroke="#eef2ff" strokeWidth="1" />;
      })}
      <path d={area} fill="url(#availFill)" />
      <path d={line} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1={active.x} y1={padY} x2={active.x} y2={height - padY} stroke="#c7d2fe" strokeDasharray="3 4" />
      <circle cx={active.x} cy={active.y} r="5" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
    </svg>
  );
}

function AvailabilityRing({ percent }: { percent: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = c * (1 - clamped / 100);

  return (
    <div className="relative h-[108px] w-[108px] shrink-0">
      <svg viewBox="0 0 88 88" className="h-full w-full -rotate-90">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="#818cf8"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">{clamped}%</div>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: menu, isLoading: menuLoading } = useMenu();
  const { data: offers } = useOffers();
  const { data: addons } = useAddons();
  const { data: website } = useWebsiteStatus();
  const { data: brand } = useBrandDraft();

  const items = menu?.items ?? [];
  const categories = menu?.categories ?? [];
  const available = items.filter((i) => i.isAvailable).length;
  const unavailable = items.length - available;
  const availablePct = items.length ? Math.round((available / items.length) * 100) : 0;
  const isPublished = website?.publishStatus === 'published';
  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const restaurantName = brand?.restaurantName ?? 'your restaurant';
  const activeOffers = offers?.filter((o) => o.isActive).length ?? 0;

  const chartPoints = useMemo(() => {
    if (!categories.length) return [{ label: 'Menu', value: availablePct }];
    return categories.slice(0, 6).map((cat) => {
      const catItems = items.filter((i) => i.categoryId === cat.id);
      const pct = catItems.length ? Math.round((catItems.filter((i) => i.isAvailable).length / catItems.length) * 100) : 0;
      return { label: cat.name, value: pct };
    });
  }, [categories, items, availablePct]);

  const recentItems = useMemo(
    () =>
      [...items]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 4),
    [items]
  );

  const activityIcons = [ShoppingBag, Clapperboard, UtensilsCrossed, Tag];

  const quickActions = [
    { label: 'Add Menu Item', description: 'Create a new dish or drink', icon: PlusCircle, to: '/admin/menu/items/new' },
    { label: 'Manage Menu', description: 'Organize items and categories', icon: UtensilsCrossed, to: '/admin/menu/items' },
    { label: 'Edit Website', description: 'Pages, sections, text & layout', icon: Globe, to: '/admin/website/pages' },
  ];

  if (menuLoading) {
    return (
      <div className="space-y-5">
        <StickyHeader>
          <p className="text-sm text-secondary">Hi {firstName},</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">Welcome back</h1>
        </StickyHeader>
        <div className="grid grid-cols-12 gap-4 lg:gap-5 items-start">
          <Skeleton className="col-span-12 lg:col-span-6 h-36 rounded-3xl" />
          <Skeleton className="col-span-12 lg:col-span-6 h-44 rounded-3xl" />
          <Skeleton className="col-span-12 lg:col-span-7 h-52 rounded-3xl" />
          <Skeleton className="col-span-12 lg:col-span-5 h-52 rounded-3xl" />
          <Skeleton className="col-span-12 md:col-span-6 xl:col-span-4 h-64 rounded-3xl" />
          <Skeleton className="col-span-12 md:col-span-6 xl:col-span-4 h-64 rounded-3xl" />
          <Skeleton className="col-span-12 xl:col-span-4 h-40 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <StickyHeader>
        <div className="flex flex-wrap items-end justify-between gap-3 min-w-0">
          <div className="min-w-0">
            <p className="text-sm text-secondary">Hi {firstName},</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">Welcome back</h1>
          </div>
        </div>
      </StickyHeader>

      <div className="grid grid-cols-12 gap-4 lg:gap-5">
        <div className="col-span-12 lg:col-span-6 flex flex-col sm:flex-row gap-4 min-w-0">
          <MetricCard
            className="flex-1"
            label="Menu Items"
            value={items.length}
            icon={UtensilsCrossed}
            tone="primary"
            onClick={() => navigate('/admin/menu/items')}
          />
          <MetricCard
            className="flex-1"
            label="Categories"
            value={categories.length}
            icon={LayoutGrid}
            tone="tertiary"
            onClick={() => navigate('/admin/menu/categories')}
          />
          <MetricCard
            className="flex-1"
            label="Active Offers"
            value={activeOffers}
            icon={Tag}
            tone="secondary"
            onClick={() => navigate('/admin/menu/offers')}
          />
        </div>

        <div className="col-span-12 lg:col-span-6 min-w-0 admin-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-secondary">Menu Availability</p>
              <div className="text-3xl font-bold text-on-surface tracking-tight mt-1">{availablePct}%</div>
            </div>
            <div className="flex rounded-full bg-surface-container-low p-1 text-[11px] font-semibold text-secondary">
              <span className="rounded-full bg-white px-2.5 py-1 text-primary shadow-sm">Now</span>
            </div>
          </div>
          <AvailabilityChart points={chartPoints} empty={items.length === 0 && categories.length === 0} />
          {!(items.length === 0 && categories.length === 0) && (
            <div className="flex flex-wrap gap-2 text-[11px] text-secondary">
              {chartPoints.map((p) => (
                <span key={p.label} className="truncate max-w-[7rem]">
                  {p.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-12 lg:col-span-7 min-w-0 admin-card p-6 sm:p-8 flex flex-col sm:flex-row gap-6">
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">
              {isPublished ? 'Your site is live' : 'Publish your site'}
            </h2>
            <p className="text-sm text-secondary mt-2 max-w-md leading-relaxed">
              {isPublished
                ? `Guests can browse ${restaurantName} online. Keep sections, hours, and the menu in sync.`
                : 'Use the website builder to finish homepage sections, then publish so guests can find you.'}
            </p>
            <button
              onClick={() => navigate('/admin/website/pages/home')}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-on-primary shadow-md shadow-primary/20 hover:bg-primary-container transition-colors self-start"
            >
              {isPublished ? 'Edit website' : 'Set up website'}
            </button>
          </div>
          <div className="w-full sm:w-56 shrink-0 rounded-3xl bg-gradient-to-br from-[#6366f1] via-[#7c6cf0] to-[#c4b5fd] p-5 text-white shadow-lg shadow-primary/20 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide uppercase text-white/80">Website</span>
              <CreditCard className="h-5 w-5 text-white/80" />
            </div>
            <div className="mt-6 text-lg font-bold truncate">{restaurantName}</div>
            <div className="mt-1 text-xs font-medium text-white/80">{isPublished ? 'Published' : 'Draft'}</div>
            <div className="mt-6 flex items-center justify-between text-[11px] text-white/75">
              <span className="truncate">{user?.name}</span>
              <span>{website?.publishedAt ? new Date(website.publishedAt).toLocaleDateString() : '—'}</span>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 min-w-0 admin-card p-5 sm:p-6 flex flex-col justify-between bg-gradient-to-br from-white to-indigo-50/60">
          <div>
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" />
              Add-ons
            </div>
            <div className="text-3xl font-bold text-on-surface mt-2">{addons?.length ?? 0}</div>
            <p className="text-sm text-secondary mt-2">Extras guests can add when they customize a dish.</p>
          </div>
          <button
            onClick={() => navigate('/admin/menu/addons')}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-container transition-colors"
          >
            Manage add-ons
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="col-span-12 md:col-span-6 xl:col-span-4 min-w-0 admin-card p-5 sm:p-6">
          <h3 className="text-base font-bold text-on-surface tracking-tight mb-4">Recent menu</h3>
          {recentItems.length === 0 ? (
            <p className="text-sm text-secondary">No menu items yet. Add your first dish to get started.</p>
          ) : (
            <ul className="space-y-3">
              {recentItems.map((item, index) => {
                const Icon = activityIcons[index % activityIcons.length];
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => navigate(`/admin/menu/items/${item.id}`)}
                      className="w-full flex items-center gap-3 rounded-2xl p-1.5 -mx-1.5 hover:bg-surface-container-low transition-colors text-left min-w-0"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-on-surface truncate">{item.name}</div>
                        <div className="text-[11px] text-secondary">{formatRelative(item.updatedAt)}</div>
                      </div>
                      <span className={`text-xs font-bold shrink-0 ${item.isAvailable ? 'text-emerald-500' : 'text-rose-400'}`}>
                        {item.isAvailable ? 'In' : 'Out'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="col-span-12 md:col-span-6 xl:col-span-4 min-w-0 admin-card p-5 sm:p-6">
          <h3 className="text-base font-bold text-on-surface tracking-tight mb-4">Quick actions</h3>
          <ul className="space-y-3">
            {quickActions.map((action) => (
              <li key={action.label}>
                <button
                  onClick={() => navigate(action.to)}
                  className="group w-full flex items-center gap-3 rounded-2xl p-1.5 -mx-1.5 hover:bg-surface-container-low transition-colors text-left min-w-0"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <action.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-on-surface truncate">{action.label}</div>
                    <div className="text-[11px] text-secondary truncate">{action.description}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-secondary opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-12 xl:col-span-4 min-w-0 rounded-3xl bg-[#1e2a78] p-6 text-white shadow-lg shadow-indigo-900/20 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-white/70">Menu ready</p>
            <h3 className="text-2xl font-bold tracking-tight mt-1">
              {availablePct === 100 ? 'Complete' : `${available} available`}
            </h3>
            <p className="text-xs text-white/60 mt-2">
              {unavailable === 0 ? 'Every dish is on the menu.' : `${unavailable} currently hidden from guests.`}
            </p>
          </div>
          <AvailabilityRing percent={availablePct} />
        </div>
      </div>
    </div>
  );
}
