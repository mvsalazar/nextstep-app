import type { ApiResponse } from '@/types';
import { apiClient } from './client';

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  role: 'parent' | 'guardian';
};

export type AuthResult = {
  token: string;
  user: AuthUser;
};

export const signup = async (params: { email: string; password: string; name?: string }): Promise<AuthResult> => {
  return apiClient.post<AuthResult>('/v1/auth/signup', params);
};

export const login = async (params: { email: string; password: string }): Promise<AuthResult> => {
  return apiClient.post<AuthResult>('/v1/auth/login', params);
};

export const logout = async (): Promise<ApiResponse<{ success: boolean }>> => {
  return apiClient.post<ApiResponse<{ success: boolean }>>('/v1/auth/logout');
};

export const getMe = async (): Promise<AuthUser> => {
  return apiClient.get<AuthUser>('/v1/me');
};

