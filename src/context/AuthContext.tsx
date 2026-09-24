import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import * as authService from '../services/auth';
import { setAuthToken } from '../services/http';
import type { Permission, Role, User } from '../types';

const TOKEN_STORAGE_KEY = 'lumiere-cms-token';

const ROLE_DEFAULT_PERMISSIONS: Record<Role, Permission> = {
  super_admin: { menu: true, branding: true, homepage: true, media: true, offers: true, addons: true, settings: true, users: true, booking: true, membership: true },
  owner: { menu: true, branding: true, homepage: true, media: true, offers: true, addons: true, settings: true, users: false, booking: true, membership: true },
  staff: { menu: true, branding: false, homepage: false, media: false, offers: false, addons: false, settings: false, users: false, booking: true, membership: false },
};

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isOwner: boolean;
  isStaff: boolean;
  can: (permission: keyof Permission) => boolean;
  login: (orgId: string, email: string, password: string) => Promise<void>;
  loginSuperAdmin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    setAuthToken(token);
    authService
      .getCurrentUser()
      .then(({ user }) => setUser(user))
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setAuthToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (orgId: string, email: string, password: string) => {
    const session = await authService.login({ orgId, email, password });
    localStorage.setItem(TOKEN_STORAGE_KEY, session.token);
    setAuthToken(session.token);
    setUser(session.user);
  };

  const loginSuperAdmin = async (email: string, password: string) => {
    const session = await authService.loginSuperAdmin({ email, password });
    localStorage.setItem(TOKEN_STORAGE_KEY, session.token);
    setAuthToken(session.token);
    setUser(session.user);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setAuthToken(null);
      setUser(null);
    }
  };

  const can = (permission: keyof Permission) => {
    if (!user) return false;
    const base = ROLE_DEFAULT_PERMISSIONS[user.role];
    return user.permissions?.[permission] ?? base[permission];
  };

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    isSuperAdmin: user?.role === 'super_admin',
    isOwner: user?.role === 'owner',
    isStaff: user?.role === 'staff',
    can,
    login,
    loginSuperAdmin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
