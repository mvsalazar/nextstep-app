import type { RewardRule } from '@/types';
import { loadAppState, updateAppState } from './storage';

export const getRewards = async (): Promise<RewardRule[]> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  const state = loadAppState();
  return state.rewardRules;
};

export const getStars = async (childId?: string): Promise<number> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  const state = loadAppState();
  const activeChildId = childId || state.settings.currentChildId || state.children[0]?.id;
  return activeChildId ? (state.starsByChild?.[activeChildId] || 0) : 0;
};

export const updateStars = async (delta: number, childId?: string): Promise<number> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  let newStarCount = 0;

  updateAppState(state => {
    const activeChildId = childId || state.settings.currentChildId || state.children[0]?.id;
    const starsByChild = { ...(state.starsByChild || {}) };
    if (activeChildId) {
      const prev = starsByChild[activeChildId] || 0;
      newStarCount = Math.max(0, prev + delta);
      starsByChild[activeChildId] = newStarCount;
    }
    return {
      ...state,
      starsByChild,
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
