import type { Routine, ApiError } from '@/types';
import { apiClient } from './client';

const isApiError = (error: unknown): error is ApiError => {
  return typeof error === 'object' && error !== null && 'code' in error;
};

export const getRoutines = async (childId?: string): Promise<Routine[]> => {
  const qs = childId ? `?childId=${encodeURIComponent(childId)}` : '';
  return apiClient.get<Routine[]>(`/v1/routines${qs}`);
};

export const getRoutineById = async (id: string): Promise<Routine | null> => {
  try {
    return await apiClient.get<Routine>(`/v1/routines/${id}`);
  } catch (error: unknown) {
    if (isApiError(error) && error.code === 'NOT_FOUND') {
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
