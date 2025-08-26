import type { Task } from '@/types';
import { apiClient } from './client';

// Template management endpoints
export const getTemplates = async (routineId?: string): Promise<Task[]> => {
  const params = new URLSearchParams();
  if (routineId) params.append('routineId', routineId);
  
  const queryString = params.toString();
  const url = queryString ? `/v1/templates?${queryString}` : '/v1/templates';
  return apiClient.get<Task[]>(url);
};

export const createTemplate = async (templateData: Omit<Task, 'id' | 'updatedAt' | 'version'>): Promise<Task> => {
  return apiClient.post<Task>('/v1/templates', { ...templateData, isTemplate: true });
};

export const getTasks = async (routineId?: string, date?: string): Promise<Task[]> => {
  const params = new URLSearchParams();
  if (routineId) params.append('routineId', routineId);
  if (date) params.append('date', date);
  
  const queryString = params.toString();
  const url = queryString ? `/v1/tasks?${queryString}` : '/v1/tasks';
  
  // For API mode, the backend should handle template generation
  // Frontend just requests tasks for a date, backend generates from templates if needed
  return apiClient.get<Task[]>(url);
};

// Endpoint to generate daily tasks from templates for a specific date
export const generateDailyTasks = async (date: string, routineIds?: string[]): Promise<Task[]> => {
  const body = { date, routineIds };
  return apiClient.post<Task[]>('/v1/tasks/generate-daily', body);
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