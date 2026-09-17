import { Outlet } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lg shadow-primary/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold text-on-surface mt-4 tracking-tight">Restaurant Admin</h1>
          <p className="text-sm text-secondary mt-1">Sign in to manage your website and menu</p>
        </div>
        <div className="admin-card p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
