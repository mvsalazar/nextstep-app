import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task } from '@/types';
import { useSettings } from './useSettings';

// Import adapters
import * as localTasks from '@/adapters/local/tasks';
import * as apiTasks from '@/adapters/api/tasks';

export const useTasks = (routineId?: string, date?: string) => {
  const { data: settings } = useSettings();
  const storageMode = settings?.storageMode || 'local';
  const adapter = storageMode === 'api' ? apiTasks : localTasks;
  const childId = settings?.currentChildId || 'default-child';

  return useQuery({
    queryKey: ['tasks', storageMode, childId, routineId, date],
    queryFn: () => adapter.getTasks(routineId, date, childId),
    enabled: storageMode !== 'api' ? Boolean(date) : Boolean(date && childId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { data: settings } = useSettings();
  const storageMode = settings?.storageMode || 'local';
  const adapter = storageMode === 'api' ? apiTasks : localTasks;

  return useMutation({
    mutationFn: (taskData: Omit<Task, 'id' | 'updatedAt' | 'version'>) => 
      adapter.createTask(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      console.error('Failed to create task:', error);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const { data: settings } = useSettings();
  const storageMode = settings?.storageMode || 'local';
  const adapter = storageMode === 'api' ? apiTasks : localTasks;

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
      adapter.updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      console.error('Failed to update task:', error);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const { data: settings } = useSettings();
  const storageMode = settings?.storageMode || 'local';
  const adapter = storageMode === 'api' ? apiTasks : localTasks;

  return useMutation({
    mutationFn: (id: string) => adapter.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      console.error('Failed to delete task:', error);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useReorderTasks = () => {
  const queryClient = useQueryClient();
  const { data: settings } = useSettings();
  const storageMode = settings?.storageMode || 'local';
  const adapter = storageMode === 'api' ? apiTasks : localTasks;

  return useMutation({
    mutationFn: ({ routineId, taskIds }: { routineId: string; taskIds: string[] }) =>
      adapter.reorderTasks(routineId, taskIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      console.error('Failed to reorder tasks:', error);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

// Computed values
export const useTaskProgress = (routineId?: string, date?: string) => {
  const { data: tasks = [] } = useTasks(routineId, date);
  
  const completedCount = tasks.filter(task => task.done).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  
  return {
    completedCount,
    totalCount,
    progress: Math.round(progress),
  };
};

export const useNextTask = (routineId?: string, date?: string) => {
  const { data: tasks = [] } = useTasks(routineId, date);
  return tasks.find(task => !task.done) || null;
};
