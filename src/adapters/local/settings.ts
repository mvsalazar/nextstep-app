import type { Settings } from '@/types';
import { loadAppState, updateAppState } from './storage';

export const getSettings = async (): Promise<Settings> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  const state = loadAppState();
  return state.settings;
};

export const updateSettings = async (updates: Partial<Settings>): Promise<Settings> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  let updatedSettings: Settings | null = null;

  updateAppState(state => {
    updatedSettings = { ...state.settings, ...updates };
    return {
      ...state,
      settings: updatedSettings,
    };
  });

  if (!updatedSettings) {
    throw new Error('Failed to update settings');
  }

  return updatedSettings;
};