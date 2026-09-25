import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.tsx';
import { AdminApp } from './admin/AdminApp';
import { queryClient } from './queryClient';

async function bootstrap() {
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCKS === 'true') {
    const { worker } = await import('./mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }

  // The platform's own paths (login, super-admin login, and the bare root) always render the admin
  // app, not a client's website - a client's site is only ever reached via ?preview=true from inside
  // the admin (Multi-Vertical Platform Plan §4/§4.1; real tenant domains land differently once §9 ships).
  const path = window.location.pathname;
  const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true';
  const platformPaths = ['/', '/login', '/signup', '/super-admin', '/forgot-password', '/reset-password'];
  const isAdmin = !isPreview && (path.startsWith('/admin') || platformPaths.includes(path));

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>{isAdmin ? <AdminApp /> : <App />}</QueryClientProvider>
    </StrictMode>,
  );
}

bootstrap();
