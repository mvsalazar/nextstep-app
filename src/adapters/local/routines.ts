import type { Routine } from '@/types';
import { updateAppState, loadAppState } from './storage';

export const getRoutines = async (_childId?: string): Promise<Routine[]> => {
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network delay
  const state = loadAppState();
  const currentChildId = state.settings.currentChildId;
  const byChild = currentChildId
    ? state.routines.filter(r => r.childId === currentChildId)
    : state.routines;
  return byChild.filter(r => r.active).sort((a, b) => a.order - b.order);
};

export const getRoutineById = async (id: string): Promise<Routine | null> => {
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network delay
  const state = loadAppState();
  return state.routines.find(r => r.id === id) || null;
};

export const createRoutine = async (routine: Omit<Routine, 'id' | 'updatedAt' | 'version'>): Promise<Routine> => {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
  const newRoutine: Routine = {
    ...routine,
    ownerId: loadAppState().parentUser.id,
    childId: loadAppState().settings.currentChildId || undefined,
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

export const updateRoutine = async (id: string, updates: Partial<Routine>): Promise<Routine> => {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
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

export const deleteRoutine = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
  updateAppState(state => ({
    ...state,
    routines: state.routines.filter(r => r.id !== id),
    tasks: state.tasks.filter(t => t.routineId !== id),
    settings: state.settings.currentRoutineId === id 
      ? { ...state.settings, currentRoutineId: state.routines.find(r => r.id !== id && r.active)?.id }
      : state.settings,
  }));
};

export const reorderRoutines = async (routineIds: string[], _childId?: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
  updateAppState(state => ({
    ...state,
    routines: state.routines.map(routine => {
      const newOrder = routineIds.indexOf(routine.id);
      return newOrder >= 0 ? { ...routine, order: newOrder + 1 } : routine;
    }),
  }));
};
