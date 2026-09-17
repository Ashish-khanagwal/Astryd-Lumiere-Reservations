import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '../context/SidebarContext';
import { Sidebar } from '../components/Sidebar';
import { AdminTopBar } from '../components/AdminTopBar';

function AdminLayoutContent() {
  return (
    <div className="h-screen flex bg-background font-sans overflow-hidden">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <AdminTopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <Outlet />
          </div>
        </main>
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
