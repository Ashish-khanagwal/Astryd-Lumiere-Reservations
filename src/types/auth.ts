import type { Id, ISODateString, Timestamps } from './common';
import type { PlatformModule } from './pageConfig';
import type { Vertical } from './restaurant';

export type Role = 'super_admin' | 'owner' | 'staff';

export interface Permission {
  menu: boolean;
  branding: boolean;
  homepage: boolean;
  media: boolean;
  offers: boolean;
  addons: boolean;
  settings: boolean;
  users: boolean;
  /** Multi-Vertical Platform Plan §5 - added alongside the Booking/Membership modules; applies per-Site. */
  booking: boolean;
  membership: boolean;
}

export interface User extends Timestamps {
  id: Id;
  organizationId: Id;
  email: string;
  name: string;
  role: Role;
  restaurantId: Id | null;
  /** Multi-Vertical Platform Plan §3.1/§5 - which Sites within the Org this user can touch; 'all' for owners/super admins. */
  siteAccess: Id[] | 'all';
  permissions?: Partial<Permission>;
  avatarUrl?: string | null;
  isActive: boolean;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: ISODateString;
}

export interface LoginRequest {
  orgId: string;
  email: string;
  password: string;
}

export type LoginResponse = Session;

export interface ForgotPasswordRequest {
  email: string;
}

/** Multi-Vertical Platform Plan §6A/§14 Phase 6 - the public self-serve signup wizard's payload; creates an Organization + Owner + first Site in one call. */
export interface SignupRequest {
  organizationName: string;
  vertical: Vertical;
  siteName: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  modules: Array<{ module: PlatformModule; navLabel: string; enabled: boolean }>;
  branding: { themePresetId: string; tagline: string };
}

export type SignupResponse = Session & { orgCode: string };
