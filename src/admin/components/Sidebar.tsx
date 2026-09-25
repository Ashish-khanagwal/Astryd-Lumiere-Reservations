import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  PanelTop,
  Palette,
  Image,
  LayoutGrid,
  UtensilsCrossed,
  PlusCircle,
  Tag,
  Store,
  Phone,
  Clock,
  Share2,
  User,
  Users,
  Sparkles,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Eye,
  ShoppingBag,
  CalendarDays,
  ChevronsUpDown,
  Check,
  LayoutList,
  Building2,
  Crown,
  Globe,
  type LucideIcon,
} from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';
import { useSidebar } from '../context/SidebarContext';
import { draftPreviewUrl, useDraftSave } from '../context/DraftSaveContext';
import { useRestaurant } from '../../context/RestaurantContext';
import { usePageConfigs } from '../hooks/api/usePageConfigs';
import { Tooltip } from './Tooltip';
import { PreviewModal } from './PreviewModal';

/** Multi-Vertical Platform Plan §10.2 - only appears once an Org has more than one Site; a single-Site Org sees the plain brand mark, unchanged. */
function SiteSwitcher() {
  const { restaurantId, sites, setActiveSiteId } = useRestaurant();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [isOpen]);

  if (sites.length <= 1) {
    return (
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-md shadow-primary/20">
          <Sparkles className="h-4 w-4" />
        </div>
        <span className="text-lg font-bold text-on-surface truncate tracking-tight">Lumière</span>
      </div>
    );
  }

  const activeSite = sites.find((s) => s.id === restaurantId) ?? sites[0];

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 min-w-0 rounded-xl px-1.5 py-1 -ml-1.5 hover:bg-surface-container-low transition-colors"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-md shadow-primary/20">
          <Sparkles className="h-4 w-4" />
        </div>
        <span className="text-sm font-bold text-on-surface truncate tracking-tight flex-1 text-left">{activeSite.name}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-secondary" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-64 rounded-xl border border-outline-variant/20 bg-surface shadow-lg z-50 py-1.5">
          <div className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-widest text-secondary">Sites</div>
          {sites.map((site) => (
            <button
              key={site.id}
              type="button"
              onClick={() => {
                setActiveSiteId(site.id);
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left text-on-surface hover:bg-surface-container-low transition-colors"
            >
              <span className="flex-1 truncate">{site.name}</span>
              {site.id === activeSite.id && <Check className="h-4 w-4 text-primary shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

interface NavGroup {
  key: string;
  title: string;
  items: NavItem[];
  visible: boolean;
}

const COLLAPSED_STORAGE_KEY = 'admin_sidebar_collapsed';

export function Sidebar() {
  const perms = usePermissions();
  const location = useLocation();
  const { mobileOpen, closeMobile, searchQuery, setSearchQuery } = useSidebar();
  const { flushDraft } = useDraftSave();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePreview = async () => {
    await flushDraft();
    setIsPreviewOpen(true);
  };

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => localStorage.getItem(COLLAPSED_STORAGE_KEY) === 'true');

  const { data: pageConfigs } = usePageConfigs();
  const catalogLabel = pageConfigs?.find((p) => p.module === 'catalog')?.navLabel || 'Menu';
  const bookingLabel = pageConfigs?.find((p) => p.module === 'booking')?.navLabel || 'Reservations';
  const membershipConfig = pageConfigs?.find((p) => p.module === 'membership');
  const membershipLabel = membershipConfig?.navLabel || 'Membership';

  const groups: NavGroup[] = useMemo(
    () => [
      {
        key: 'main',
        title: '',
        visible: true,
        items: [
          { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
          { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
          { to: '/admin/reservations', label: bookingLabel, icon: CalendarDays },
          ...(membershipConfig?.enabled && perms.canManageMembership
            ? [{ to: '/admin/membership', label: membershipLabel, icon: Crown }]
            : []),
        ],
      },
      {
        key: 'website',
        title: 'Website',
        visible: perms.canManageWebsite,
        items: [
          { to: '/admin/website/homepage', label: 'Homepage', icon: Home },
          { to: '/admin/website/header', label: 'Header', icon: PanelTop },
          { to: '/admin/website/branding', label: 'Branding', icon: Palette },
          { to: '/admin/website/media', label: 'Media Library', icon: Image },
        ],
      },
      {
        key: 'menu',
        title: catalogLabel,
        visible: perms.canManageMenu,
        items: [
          { to: '/admin/menu/categories', label: 'Categories', icon: LayoutGrid },
          { to: '/admin/menu/items', label: `${catalogLabel} Items`, icon: UtensilsCrossed },
          { to: '/admin/menu/addons', label: 'Add-ons', icon: PlusCircle },
          { to: '/admin/menu/offers', label: 'Offers', icon: Tag },
        ],
      },
      {
        key: 'restaurant',
        title: 'Restaurant',
        visible: perms.canManageBranding,
        items: [
          { to: '/admin/restaurant/information', label: 'Information', icon: Store },
          { to: '/admin/restaurant/contact', label: 'Contact', icon: Phone },
          { to: '/admin/restaurant/hours', label: 'Opening Hours', icon: Clock },
          { to: '/admin/restaurant/social', label: 'Social Media', icon: Share2 },
        ],
      },
      {
        key: 'settings',
        title: 'Settings',
        visible: true,
        items: [
          { to: '/admin/settings/account', label: 'Account', icon: User },
          { to: '/admin/settings/pages', label: 'Pages', icon: LayoutList },
          ...(perms.canManageSettings ? [{ to: '/admin/settings/domains', label: 'Domains', icon: Globe }] : []),
          ...(perms.canManageUsers ? [{ to: '/admin/settings/users', label: 'Users', icon: Users }] : []),
        ],
      },
      {
        key: 'platform',
        title: 'Platform',
        visible: perms.isSuperAdmin,
        items: [{ to: '/admin/superadmin/sites', label: 'All Sites', icon: Building2 }],
      },
    ],
    [
      perms.canManageWebsite,
      perms.canManageMenu,
      perms.canManageBranding,
      perms.canManageUsers,
      perms.canManageSettings,
      perms.canManageMembership,
      perms.isSuperAdmin,
      catalogLabel,
      bookingLabel,
      membershipConfig?.enabled,
      membershipLabel,
    ]
  );

  const visibleGroups = useMemo(() => groups.filter((g) => g.visible), [groups]);

  const displayGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return visibleGroups;
    return visibleGroups
      .map((g) => ({ ...g, items: g.items.filter((i) => i.label.toLowerCase().includes(q)) }))
      .filter((g) => g.items.length > 0);
  }, [visibleGroups, searchQuery]);

  const isActive = useCallback(
    (item: NavItem) => (item.end ? location.pathname === item.to : location.pathname === item.to || location.pathname.startsWith(item.to + '/')),
    [location.pathname]
  );

  useEffect(() => {
    closeMobile();
  }, [location.pathname, closeMobile]);

  useEffect(() => {
    setSearchQuery('');
  }, [location.pathname, setSearchQuery]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSED_STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'b' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleCollapse();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleCollapse]);

  const renderItem = (item: NavItem, collapsed: boolean) => {
    const active = isActive(item);
    const Icon = item.icon;

    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        className={`relative rounded-xl text-sm font-medium transition-colors ${
          collapsed ? 'flex flex-col items-center justify-center gap-1 w-full px-1 py-2' : 'flex items-center gap-3 px-3 py-2.5'
        } ${active ? 'bg-primary/10 text-primary font-semibold' : 'text-secondary hover:bg-surface-container-low hover:text-on-surface'}`}
      >
        {active && !collapsed && (
          <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-primary" />
        )}
        <Icon className="h-[18px] w-[18px] shrink-0" />
        {collapsed ? (
          <span className="w-full text-center text-[10px] leading-tight font-medium line-clamp-2">{item.label}</span>
        ) : (
          <span className="truncate">{item.label}</span>
        )}
      </NavLink>
    );
  };

  const renderNav = (collapsed: boolean) => (
    <nav className={`flex-1 overflow-y-auto py-4 ${collapsed ? 'px-2 flex flex-col items-center gap-1' : 'px-3 space-y-1'}`}>
      {displayGroups.map((group, idx) => {
        if (collapsed) {
          return (
            <div key={group.key} className="flex flex-col items-center gap-1 w-full">
              {idx > 0 && <div className="w-8 h-px bg-outline-variant/40 my-1" />}
              {group.items.map((item) => renderItem(item, true))}
            </div>
          );
        }

        return (
          <div key={group.key} className="pb-2">
            {group.title && (
              <div className="px-3 mb-1.5 text-[11px] font-bold uppercase tracking-widest text-secondary">{group.title}</div>
            )}
            <div className="space-y-0.5">{group.items.map((item) => renderItem(item, false))}</div>
          </div>
        );
      })}
    </nav>
  );

  const effectiveCollapsed = mobileOpen ? false : isCollapsed;

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[#1e2a78]/40 lg:hidden" onClick={closeMobile} aria-hidden="true" />
      )}

      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-50 shrink-0 h-full bg-surface flex flex-col transition-[width,transform] duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:flex'
        }`}
        style={{ width: effectiveCollapsed ? 'var(--admin-sidebar-w-collapsed)' : 'var(--admin-sidebar-w)' }}
      >
        <div className={`h-16 shrink-0 flex items-center ${effectiveCollapsed ? 'justify-center px-2' : 'justify-between px-5'}`}>
          {effectiveCollapsed ? (
            <Tooltip label="Expand sidebar (Ctrl+B)">
              <button onClick={toggleCollapse} className="p-1.5 rounded-xl text-primary hover:bg-primary/10" aria-label="Expand sidebar">
                <Sparkles className="h-6 w-6" />
              </button>
            </Tooltip>
          ) : (
            <SiteSwitcher />
          )}

          {!effectiveCollapsed && (
            <button
              onClick={toggleCollapse}
              className="hidden lg:inline-flex p-1.5 rounded-lg text-secondary hover:bg-surface-container-low hover:text-on-surface transition-colors"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-[18px] w-[18px]" />
            </button>
          )}

          {mobileOpen && (
            <button onClick={closeMobile} className="lg:hidden p-1 rounded-lg text-secondary hover:bg-surface-container-high" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {renderNav(effectiveCollapsed)}

        <div className="shrink-0 p-3 space-y-2">
          {effectiveCollapsed ? (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => void handlePreview()}
                className="flex w-full flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-colors"
                aria-label="Preview website"
              >
                <Eye className="h-4 w-4" />
                <span className="w-full text-center text-[10px] leading-tight font-medium">Preview</span>
              </button>
              <Tooltip label="Expand sidebar">
                <button onClick={toggleCollapse} className="p-1.5 rounded-lg text-secondary hover:bg-surface-container-high" aria-label="Expand sidebar">
                  <PanelLeftOpen className="h-[18px] w-[18px]" />
                </button>
              </Tooltip>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void handlePreview()}
              className="block w-full text-left rounded-3xl bg-gradient-to-br from-[#6d7cff] via-[#6b8bff] to-[#a78bfa] p-4 text-white shadow-lg shadow-primary/20 hover:brightness-105 transition"
            >
              <div className="text-sm font-bold leading-snug">Preview website</div>
              <p className="text-[11px] text-white/80 mt-1">Saves your latest edits, then shows the whole site right here.</p>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-primary">
                Preview
                <Eye className="h-3 w-3" />
              </span>
            </button>
          )}
        </div>
      </aside>

      <PreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} url={draftPreviewUrl()} />
    </>
  );
}
