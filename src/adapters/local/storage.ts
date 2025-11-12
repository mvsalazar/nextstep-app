import type { AppState, Task, Routine } from '@/types';
import { STORAGE_KEY, DEFAULT_SETTINGS, SEED_TASKS, SEED_REWARDS, SEED_ROUTINES, SEED_DAILY_ROUTINES, SEED_PARENT, SEED_CHILDREN } from '@/lib/constants';

export const loadAppState = (): AppState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const initialState: AppState = {
        parentUser: SEED_PARENT,
        children: SEED_CHILDREN,
        routines: SEED_ROUTINES,
        dailyRoutines: SEED_DAILY_ROUTINES,
        tasks: [...SEED_TASKS], // Start with templates and daily tasks will be generated
        starsByChild: { [SEED_CHILDREN[0].id]: 0 },
        rewardRules: SEED_REWARDS,
        settings: DEFAULT_SETTINGS,
      };
      saveAppState(initialState);
      return initialState;
    }
    
    const parsedState = JSON.parse(stored);
    
    // Migration: ensure settings has userRole field
    if (!parsedState.settings.userRole) {
      parsedState.settings = {
        ...DEFAULT_SETTINGS,
        ...parsedState.settings,
        userRole: DEFAULT_SETTINGS.userRole,
      };
      saveAppState(parsedState);
    }

    // Migration: add users structure
    if (!('parentUser' in parsedState) || !('children' in parsedState)) {
      parsedState.parentUser = SEED_PARENT;
      parsedState.children = SEED_CHILDREN;
      // Set current child if missing
      parsedState.settings.currentChildId = parsedState.settings.currentChildId || SEED_CHILDREN[0].id;
    }

    // Migration: convert global stars to per-child
    if (!parsedState.starsByChild) {
      const currentChild = parsedState.settings.currentChildId || SEED_CHILDREN[0].id;
      const starsValue = typeof parsedState.stars === 'number' ? parsedState.stars : 0;
      parsedState.starsByChild = { [currentChild]: starsValue };
      delete parsedState.stars;
    }

    // Migration: ensure tasks/routines have ownerId/childId
    const ownerId = parsedState.parentUser?.id || SEED_PARENT.id;
    const defaultChildId = parsedState.settings.currentChildId || SEED_CHILDREN[0].id;
    if (Array.isArray(parsedState.tasks)) {
      parsedState.tasks = parsedState.tasks.map((t: Task) => ({
        ownerId: t.ownerId || ownerId,
        childId: t.childId || defaultChildId,
        ...t,
      }));
    }
    if (Array.isArray(parsedState.routines)) {
      parsedState.routines = parsedState.routines.map((r: Routine) => ({
        ownerId: r.ownerId || ownerId,
        childId: r.childId || defaultChildId,
        ...r,
      }));
    }
    
    return parsedState;
  } catch (error) {
    console.error('Failed to load app state:', error);
    const fallbackState: AppState = {
      parentUser: SEED_PARENT,
      children: SEED_CHILDREN,
      routines: SEED_ROUTINES,
      dailyRoutines: SEED_DAILY_ROUTINES,
      tasks: [...SEED_TASKS],
      starsByChild: { [SEED_CHILDREN[0].id]: 0 },
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
