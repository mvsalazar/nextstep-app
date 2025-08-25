import type { Routine } from '@/types';
import { updateAppState, loadAppState } from './storage';

export const getRoutines = (): Routine[] => {
  const state = loadAppState();
  return state.routines.filter(r => r.active).sort((a, b) => a.order - b.order);
};

export const getRoutineById = (id: string): Routine | null => {
  const state = loadAppState();
  return state.routines.find(r => r.id === id) || null;
};

export const createRoutine = (routine: Omit<Routine, 'id' | 'updatedAt' | 'version'>): Routine => {
  const newRoutine: Routine = {
    ...routine,
    id: `r${Date.now()}`,
    updatedAt: new Date().toISOString(),
    version: 1,
  };

  updateAppState(state => ({
    ...state,
    routines: [...state.routines, newRoutine],
  }));

  return newRoutine;
};

export const updateRoutine = (id: string, updates: Partial<Routine>): Routine => {
  let updatedRoutine: Routine | null = null;

  updateAppState(state => ({
    ...state,
    routines: state.routines.map(routine => {
      if (routine.id === id) {
        updatedRoutine = {
          ...routine,
          ...updates,
          updatedAt: new Date().toISOString(),
          version: (routine.version || 0) + 1,
        };
        return updatedRoutine;
      }
      return routine;
    }),
  }));

  if (!updatedRoutine) {
    throw new Error(`Routine with id ${id} not found`);
  }

  return updatedRoutine;
};

export const deleteRoutine = (id: string): void => {
  updateAppState(state => ({
    ...state,
    routines: state.routines.filter(r => r.id !== id),
    tasks: state.tasks.filter(t => t.routineId !== id),
    settings: state.settings.currentRoutineId === id 
      ? { ...state.settings, currentRoutineId: state.routines.find(r => r.id !== id && r.active)?.id }
      : state.settings,
  }));
};

export const reorderRoutines = (routineIds: string[]): void => {
  updateAppState(state => ({
    ...state,
    routines: state.routines.map(routine => {
      const newOrder = routineIds.indexOf(routine.id);
      return newOrder >= 0 ? { ...routine, order: newOrder + 1 } : routine;
    }),
  }));
};