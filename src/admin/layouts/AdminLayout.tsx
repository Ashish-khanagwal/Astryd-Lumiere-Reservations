import { Outlet, useMatch } from 'react-router-dom';
import { SidebarProvider } from '../context/SidebarContext';
import { Sidebar } from '../components/Sidebar';
import { AdminTopBar } from '../components/AdminTopBar';

function AdminLayoutContent() {
  // The Site Editor is a full-bleed workspace (edit panel + live preview), not a padded, width-capped page.
  const isFullBleed = Boolean(useMatch('/admin/website/pages/:page'));

  return (
    <div className="h-screen flex bg-background font-sans overflow-hidden">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <AdminTopBar />
        {isFullBleed ? (
          <main className="flex-1 min-h-0 overflow-hidden">
            <Outlet />
          </main>
        ) : (
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <Outlet />
            </div>
          </main>
        )}
      </div>
    </div>
  );
}

export function AdminLayout() {
  return (
    <SidebarProvider>
      <AdminLayoutContent />
    </SidebarProvider>
  );
}
