import type { RewardRule } from '@/types';
import { apiClient } from './client';

export const getRewards = async (): Promise<RewardRule[]> => {
  return apiClient.get<RewardRule[]>('/v1/rewards');
};

export const getStars = async (): Promise<number> => {
  const response = await apiClient.get<{ stars: number }>('/v1/stars');
  return response.stars;
};

export const updateStars = async (delta: number): Promise<number> => {
  const response = await apiClient.patch<{ stars: number }>('/v1/stars', { delta });
  return response.stars;
};

export const createReward = async (rewardData: Omit<RewardRule, 'id'>): Promise<RewardRule> => {
  return apiClient.post<RewardRule>('/v1/rewards', rewardData);
};

export const updateReward = async (id: string, updates: Partial<RewardRule>): Promise<RewardRule> => {
  return apiClient.patch<RewardRule>(`/v1/rewards/${id}`, updates);
};

export const deleteReward = async (id: string): Promise<{ success: boolean }> => {
  return apiClient.delete<{ success: boolean }>(`/v1/rewards/${id}`);
};