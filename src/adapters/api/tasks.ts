import type { Task } from '@/types';
import { apiClient } from './client';

export const getTasks = async (routineId?: string): Promise<Task[]> => {
  const url = routineId ? `/v1/tasks?routineId=${routineId}` : '/v1/tasks';
  return apiClient.get<Task[]>(url);
};

export const createTask = async (taskData: Omit<Task, 'id' | 'updatedAt' | 'version'>): Promise<Task> => {
  return apiClient.post<Task>('/v1/tasks', taskData);
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
  return apiClient.patch<Task>(`/v1/tasks/${id}`, updates);
};

export const deleteTask = async (id: string): Promise<{ success: boolean }> => {
  return apiClient.delete<{ success: boolean }>(`/v1/tasks/${id}`);
};

export const reorderTasks = async (routineId: string, taskIds: string[]): Promise<void> => {
  return apiClient.post<void>('/v1/tasks/reorder', { routineId, taskIds });
};