import type { RewardRule } from '@/types';
import { loadAppState, updateAppState } from './storage';

export const getRewards = async (): Promise<RewardRule[]> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  const state = loadAppState();
  return state.rewardRules;
};

export const getStars = async (): Promise<number> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  const state = loadAppState();
  return state.stars;
};

export const updateStars = async (delta: number): Promise<number> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  let newStarCount = 0;

  updateAppState(state => {
    newStarCount = Math.max(0, state.stars + delta);
    return {
      ...state,
      stars: newStarCount,
    };
  });

  return newStarCount;
};

export const createReward = async (rewardData: Omit<RewardRule, 'id'>): Promise<RewardRule> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const newReward: RewardRule = {
    ...rewardData,
    id: `r${Date.now()}`,
  };

  updateAppState(state => ({
    ...state,
    rewardRules: [...state.rewardRules, newReward],
  }));

  return newReward;
};

export const updateReward = async (id: string, updates: Partial<RewardRule>): Promise<RewardRule> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  let updatedReward: RewardRule | null = null;

  updateAppState(state => {
    const rewardIndex = state.rewardRules.findIndex(reward => reward.id === id);
    if (rewardIndex === -1) {
      throw new Error(`Reward ${id} not found`);
    }

    updatedReward = { ...state.rewardRules[rewardIndex], ...updates };
    const newRewards = [...state.rewardRules];
    newRewards[rewardIndex] = updatedReward;

    return {
      ...state,
      rewardRules: newRewards,
    };
  });

  if (!updatedReward) {
    throw new Error(`Reward ${id} not found`);
  }

  return updatedReward;
};

export const deleteReward = async (id: string): Promise<{ success: boolean }> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  updateAppState(state => ({
    ...state,
    rewardRules: state.rewardRules.filter(reward => reward.id !== id),
  }));

  return { success: true };
};