import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  ExternalLink,
  ShoppingBag,
  CalendarDays,
  type LucideIcon,
} from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';
import { useSidebar } from '../context/SidebarContext';
import { Tooltip } from './Tooltip';

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
  flat?: boolean;
}

const COLLAPSED_STORAGE_KEY = 'admin_sidebar_collapsed';
const EXPANDED_GROUPS_STORAGE_KEY = 'admin_sidebar_expanded_groups';

function loadExpandedGroups(): Set<string> {
  try {
    const raw = localStorage.getItem(EXPANDED_GROUPS_STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {
    /* ignore */
  }
  return new Set(['website', 'menu', 'restaurant', 'settings']);
}

function saveExpandedGroups(groups: Set<string>) {
  localStorage.setItem(EXPANDED_GROUPS_STORAGE_KEY, JSON.stringify([...groups]));
}

function CollapsibleGroup({
  label,
  itemCount,
  hasActiveChild,
  isExpanded,
  onToggle,
  children,
}: {
  label: string;
  itemCount: number;
  hasActiveChild: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!innerRef.current) return;
    const ro = new ResizeObserver(([entry]) => setMeasuredHeight(entry.contentRect.height));
    ro.observe(innerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className={`flex w-full items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors select-none ${
          hasActiveChild ? 'text-primary' : 'text-secondary hover:text-on-surface'
        }`}
      >
        <span className="flex-1 text-left text-[11px] font-bold uppercase tracking-widest">{label}</span>
        {!isExpanded && itemCount > 0 && (
          <span
            className={`rounded-full min-w-[16px] text-center px-1 py-px text-[9px] font-semibold leading-tight ${
              hasActiveChild ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-secondary'
            }`}
          >
            {itemCount}
          </span>
        )}
        <ChevronDown className={`h-3 w-3 shrink-0 transition-transform duration-200 ${!isExpanded ? '-rotate-90' : ''}`} />
      </button>
      <div
        className="overflow-hidden transition-[max-height,opacity] duration-200 ease-in-out"
        style={{ maxHeight: isExpanded ? measuredHeight ?? 1000 : 0, opacity: isExpanded ? 1 : 0 }}
      >
        <div ref={innerRef} className="space-y-0.5 pt-1 pb-1">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const perms = usePermissions();
  const location = useLocation();
  const { mobileOpen, closeMobile, searchQuery, setSearchQuery } = useSidebar();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => localStorage.getItem(COLLAPSED_STORAGE_KEY) === 'true');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(loadExpandedGroups);

  const groups: NavGroup[] = useMemo(
    () => [
      {
        key: 'main',
        title: '',
        flat: true,
        visible: true,
        items: [
          { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
          { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
          { to: '/admin/reservations', label: 'Reservations', icon: CalendarDays },
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
        title: 'Menu',
        visible: perms.canManageMenu,
        items: [
          { to: '/admin/menu/categories', label: 'Categories', icon: LayoutGrid },
          { to: '/admin/menu/items', label: 'Menu Items', icon: UtensilsCrossed },
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
          ...(perms.canManageUsers ? [{ to: '/admin/settings/users', label: 'Users', icon: Users }] : []),
        ],
      },
    ],
    [perms.canManageWebsite, perms.canManageMenu, perms.canManageBranding, perms.canManageUsers]
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

  const prevPathRef = useRef(location.pathname);
  useEffect(() => {
    if (location.pathname === prevPathRef.current) return;
    prevPathRef.current = location.pathname;
    for (const group of visibleGroups) {
      if (group.flat) continue;
      if (group.items.some((item) => isActive(item))) {
        setExpandedGroups((prev) => {
          if (prev.has(group.key)) return prev;
          const next = new Set(prev).add(group.key);
          saveExpandedGroups(next);
          return next;
        });
        break;
      }
    }
  }, [location.pathname, visibleGroups, isActive]);

  useEffect(() => {
    closeMobile();
  }, [location.pathname, closeMobile]);

  useEffect(() => {
    setSearchQuery('');
  }, [location.pathname, setSearchQuery]);

  const toggleGroup = useCallback((key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      saveExpandedGroups(next);
      return next;
    });
  }, []);

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
        const hasActiveChild = group.items.some((item) => isActive(item));
        const isSearching = searchQuery.trim().length > 0;

        if (collapsed) {
          return (
            <div key={group.key} className="flex flex-col items-center gap-1 w-full">
              {idx > 0 && <div className="w-8 h-px bg-outline-variant/40 my-1" />}
              {group.items.map((item) => renderItem(item, true))}
            </div>
          );
        }

        if (group.flat) {
          return (
            <div key={group.key} className="space-y-0.5 pb-2">
              {group.items.map((item) => renderItem(item, false))}
            </div>
          );
        }

        if (isSearching) {
          return (
            <div key={group.key} className="pb-2">
              <div className="px-3 mb-1.5 text-[11px] font-bold uppercase tracking-widest text-secondary">{group.title}</div>
              <div className="space-y-0.5">{group.items.map((item) => renderItem(item, false))}</div>
            </div>
          );
        }

        return (
          <CollapsibleGroup
            key={group.key}
            label={group.title}
            itemCount={group.items.length}
            hasActiveChild={hasActiveChild}
            isExpanded={expandedGroups.has(group.key)}
            onToggle={() => toggleGroup(group.key)}
          >
            {group.items.map((item) => renderItem(item, false))}
          </CollapsibleGroup>
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
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-md shadow-primary/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-on-surface truncate tracking-tight">Lumière</span>
            </div>
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
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="flex w-full flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-colors"
                aria-label="Preview live site"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="w-full text-center text-[10px] leading-tight font-medium">Preview</span>
              </a>
              <Tooltip label="Expand sidebar">
                <button onClick={toggleCollapse} className="p-1.5 rounded-lg text-secondary hover:bg-surface-container-high" aria-label="Expand sidebar">
                  <PanelLeftOpen className="h-[18px] w-[18px]" />
                </button>
              </Tooltip>
            </div>
          ) : (
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="block rounded-3xl bg-gradient-to-br from-[#6d7cff] via-[#6b8bff] to-[#a78bfa] p-4 text-white shadow-lg shadow-primary/20 hover:brightness-105 transition"
            >
              <div className="text-sm font-bold leading-snug">Preview live site</div>
              <p className="text-[11px] text-white/80 mt-1">See what guests see on your restaurant website.</p>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-primary">
                Open
                <ExternalLink className="h-3 w-3" />
              </span>
            </a>
          )}
        </div>
      </aside>
    </>
  );
}
