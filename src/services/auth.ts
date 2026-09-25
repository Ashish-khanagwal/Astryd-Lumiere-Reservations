import { http } from './http';
import type { LoginRequest, LoginResponse, User, ForgotPasswordRequest, SignupRequest, SignupResponse } from '../types';

export const login = (payload: LoginRequest) => http.post<LoginResponse>('/auth/login', payload);

/** Multi-Vertical Platform Plan §14 Phase 6 - public/unauthenticated; creates the Org + Owner + first Site. */
export const signup = (payload: SignupRequest) => http.post<SignupResponse>('/auth/signup', payload);

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
