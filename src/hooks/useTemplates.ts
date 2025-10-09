import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task } from '@/types';
import { useSettings } from './useSettings';
import * as localTasks from '@/adapters/local/tasks';
import * as apiTasks from '@/adapters/api/tasks';

const QUERY_KEY = 'templates';

export const useTemplates = (routineId?: string) => {
  const queryClient = useQueryClient();
  const { data: settings } = useSettings();
  const storageMode = settings?.storageMode || 'local';
  const adapter = storageMode === 'api' ? apiTasks : localTasks;

  const { data: templates = [], isLoading, error } = useQuery({
    queryKey: [QUERY_KEY, storageMode, routineId],
    queryFn: () => adapter.getTemplates(routineId),
    enabled: Boolean(routineId),
    staleTime: 1000 * 60 * 5,
  });

  const createMutation = useMutation({
    mutationFn: (tpl: Omit<Task, 'id' | 'updatedAt' | 'version'>) => (adapter as any).createTemplate(tpl),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) => (apiTasks as any).updateTemplate?.(id, updates) || (localTasks as any).updateTask?.(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => (apiTasks as any).deleteTemplate?.(id) || (localTasks as any).deleteTask?.(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  return {
    templates: templates as Task[],
    isLoading,
    error,
    createTemplate: createMutation.mutateAsync,
    updateTemplate: updateMutation.mutateAsync,
    deleteTemplate: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
