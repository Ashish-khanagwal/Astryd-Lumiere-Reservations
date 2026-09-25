import { useAuth } from '../../context/AuthContext';

export function usePermissions() {
  const { user, can, isSuperAdmin, isOwner, isStaff } = useAuth();
  return {
    role: user?.role,
    isSuperAdmin,
    isOwner,
    isStaff,
    canManageWebsite: can('homepage') || can('branding'),
    canManageBranding: can('branding'),
    canManageMedia: can('media'),
    canManageMenu: can('menu'),
    canManageOffers: can('offers'),
    canManageAddons: can('addons'),
    canManageSettings: can('settings'),
    canManageUsers: can('users'),
    canManageBooking: can('booking'),
    canManageMembership: can('membership'),
    canDeleteMenuItems: !isStaff,
  };
}
