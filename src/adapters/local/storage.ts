import type { AppState } from '@/types';
import { STORAGE_KEY, DEFAULT_SETTINGS, SEED_TASKS, SEED_REWARDS, SEED_ROUTINES } from '@/lib/constants';

export const loadAppState = (): AppState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const initialState: AppState = {
        routines: SEED_ROUTINES,
        tasks: SEED_TASKS,
        stars: 0,
        rewardRules: SEED_REWARDS,
        settings: DEFAULT_SETTINGS,
      };
      saveAppState(initialState);
      return initialState;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load app state:', error);
    const fallbackState: AppState = {
      routines: SEED_ROUTINES,
      tasks: SEED_TASKS,
      stars: 0,
      rewardRules: SEED_REWARDS,
      settings: DEFAULT_SETTINGS,
    };
    saveAppState(fallbackState);
    return fallbackState;
  }
};

export const saveAppState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save app state:', error);
  }
};

export const updateAppState = (updater: (state: AppState) => AppState): AppState => {
  const currentState = loadAppState();
  const newState = updater(currentState);
  saveAppState(newState);
  return newState;
};