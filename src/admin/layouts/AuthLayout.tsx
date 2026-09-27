import { Outlet, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

/** Heading per screen - this layout wraps login and both password screens, and serves every business type. */
const SCREEN_HEADING: Record<string, { title: string; subtitle: string }> = {
  '/login': { title: 'Login', subtitle: 'Sign in to manage your business website' },
  '/forgot-password': { title: 'Forgot password', subtitle: "We'll email you a link to reset it" },
  '/reset-password': { title: 'Reset password', subtitle: 'Choose a new password for your account' },
};

export function AuthLayout() {
  const { pathname } = useLocation();
  const heading = SCREEN_HEADING[pathname] ?? SCREEN_HEADING['/login'];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lg shadow-primary/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold text-on-surface mt-4 tracking-tight">{heading.title}</h1>
          <p className="text-sm text-secondary mt-1">{heading.subtitle}</p>
        </div>
        <div className="admin-card p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
