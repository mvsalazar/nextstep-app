import type { Routine } from '@/types';
import { apiClient } from './client';

export const getRoutines = async (childId?: string): Promise<Routine[]> => {
  const qs = childId ? `?childId=${encodeURIComponent(childId)}` : '';
  return apiClient.get<Routine[]>(`/v1/routines${qs}`);
};

export const getRoutineById = async (id: string): Promise<Routine | null> => {
  try {
    return await apiClient.get<Routine>(`/v1/routines/${id}`);
  } catch (error: any) {
    if (error.code === 'NOT_FOUND') {
      return null;
    }
    throw error;
  }
};

export const createRoutine = async (routine: Omit<Routine, 'id' | 'updatedAt' | 'version'>): Promise<Routine> => {
  return apiClient.post<Routine>('/v1/routines', routine);
};

export const updateRoutine = async (id: string, updates: Partial<Routine>): Promise<Routine> => {
  return apiClient.patch<Routine>(`/v1/routines/${id}`, updates);
};

export const deleteRoutine = async (id: string): Promise<void> => {
  await apiClient.delete<{ success: boolean }>(`/v1/routines/${id}`);
};

export const reorderRoutines = async (routineIds: string[], childId?: string): Promise<void> => {
  await apiClient.post<{ success: boolean }>('/v1/routines/reorder', { routineIds, childId });
};
