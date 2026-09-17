import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, User as UserIcon, ChevronsUpDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface UserMenuProps {
  collapsed?: boolean;
  variant?: 'sidebar' | 'header';
}

function getInitials(name?: string) {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function UserMenu({ collapsed = false, variant = 'sidebar' }: UserMenuProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const isHeader = variant === 'header';

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
  };

  const menu = (
    <div
      className={`absolute w-56 rounded-2xl border border-outline-variant/40 bg-surface shadow-2xl p-2 z-50 ${
        isHeader ? 'right-0 top-full mt-2' : collapsed ? 'left-0 bottom-full mb-2' : 'left-0 right-0 bottom-full mb-2 w-auto'
      }`}
    >
      <div className="px-3 py-2 border-b border-outline-variant/30 mb-1">
        <div className="text-sm font-semibold text-on-surface truncate">{user?.name}</div>
        <div className="text-xs text-secondary capitalize truncate">{user?.role.replace('_', ' ')}</div>
      </div>
      <button
        onClick={() => {
          setOpen(false);
          navigate('/admin/settings/account');
        }}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-secondary hover:bg-surface-container-high hover:text-on-surface transition-colors"
      >
        <UserIcon className="h-4 w-4" />
        Account
      </button>
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-secondary hover:bg-surface-container-high hover:text-on-surface transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Log Out
      </button>
    </div>
  );

  const avatar = (
    <div className="w-8 h-8 shrink-0 rounded-full bg-[#1e2a78] flex items-center justify-center text-white font-bold text-xs">
      {getInitials(user?.name)}
    </div>
  );

  if (collapsed && !isHeader) {
    return (
      <div className="relative flex justify-center" ref={rootRef}>
        <button onClick={() => setOpen((v) => !v)} aria-label="Account menu">
          <div className="w-9 h-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {getInitials(user?.name)}
          </div>
        </button>
        {open && menu}
      </div>
    );
  }

  if (isHeader) {
    return (
      <div className="relative shrink-0" ref={rootRef}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2.5 max-w-[16rem] rounded-full bg-white pl-1 pr-3 py-1 shadow-[0_8px_24px_rgba(79,70,229,0.06)] ring-1 ring-outline-variant/40 hover:ring-primary/30 transition-colors"
          aria-label="Account menu"
          aria-expanded={open}
        >
          {avatar}
          <span className="min-w-0 truncate text-sm font-semibold text-on-surface">{user?.name}</span>
          <ChevronDown className={`h-4 w-4 text-secondary shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && menu}
      </div>
    );
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-surface-container-high transition-colors"
        aria-label="Account menu"
      >
        <div className="w-9 h-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
          {getInitials(user?.name)}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <div className="text-sm font-semibold text-on-surface truncate">{user?.name}</div>
          <div className="text-xs text-secondary capitalize truncate">{user?.role?.replace('_', ' ')}</div>
        </div>
        <ChevronsUpDown className="h-4 w-4 text-secondary shrink-0" />
      </button>
      {open && menu}
    </div>
  );
}
