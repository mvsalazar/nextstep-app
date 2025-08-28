import type { ChildUser } from '@/types';
import { apiClient } from './client';

export const getChildren = async (): Promise<ChildUser[]> => {
  return apiClient.get<ChildUser[]>('/v1/children');
};

export const createChild = async (name: string, emoji?: string): Promise<ChildUser> => {
  return apiClient.post<ChildUser>('/v1/children', { name, emoji });
};

export const deleteChild = async (id: string): Promise<void> => {
  await apiClient.delete<{ success: boolean }>(`/v1/children/${id}`);
};

export const updateChild = async (id: string, updates: { name?: string; emoji?: string }): Promise<ChildUser> => {
  return apiClient.patch<ChildUser>(`/v1/children/${id}`, updates);
};
