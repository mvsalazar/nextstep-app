import type { Settings } from '@/types';
import { apiClient } from './client';

export const getSettings = async (): Promise<Settings> => {
  return apiClient.get<Settings>('/v1/settings');
};

export const updateSettings = async (updates: Partial<Settings>): Promise<Settings> => {
  return apiClient.patch<Settings>('/v1/settings', updates);
};