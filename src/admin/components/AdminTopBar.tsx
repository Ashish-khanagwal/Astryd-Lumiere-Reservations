import { Menu, Search } from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';
import { UserMenu } from './UserMenu';

export function AdminTopBar() {
  const { openMobile, searchQuery, setSearchQuery } = useSidebar();

  return (
    <header className="shrink-0 h-16 flex items-center gap-3 px-4 sm:px-6 lg:px-8">
      <button
        onClick={openMobile}
        className="lg:hidden h-10 w-10 rounded-full bg-surface shadow-sm flex items-center justify-center text-secondary hover:text-on-surface transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1 min-w-0" />

      <div className="relative w-40 sm:w-56 lg:w-72">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search"
          className="w-full h-10 rounded-full border-0 bg-white pl-10 pr-4 text-sm text-on-surface placeholder:text-secondary shadow-[0_8px_24px_rgba(79,70,229,0.06)] outline-none ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <UserMenu variant="header" />
    </header>
  );
}

