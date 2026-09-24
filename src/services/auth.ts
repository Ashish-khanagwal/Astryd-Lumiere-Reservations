import { http } from './http';
import type { LoginRequest, LoginResponse, User, ForgotPasswordRequest } from '../types';

export const login = (payload: LoginRequest) => http.post<LoginResponse>('/auth/login', payload);

export interface SuperAdminLoginRequest {
  email: string;
  password: string;
}

/** Multi-Vertical Platform Plan §5.1 - Super Admin isn't scoped to an Org, so this deliberately skips the `orgId` field `login()` requires. */
export const loginSuperAdmin = (payload: SuperAdminLoginRequest) =>
  http.post<LoginResponse>('/auth/super-admin-login', payload);

export const logout = () => http.post<{ message: string }>('/auth/logout');

export const forgotPassword = (payload: ForgotPasswordRequest) =>
  http.post<{ message: string }>('/auth/forgot-password', payload);

export const getCurrentUser = () => http.get<{ user: User }>('/auth/me');
