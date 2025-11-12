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
  const createTemplateFn = storageMode === 'api' ? apiTasks.createTemplate : localTasks.createTemplate;
  const updateTemplateFn = storageMode === 'api'
    ? (args: { id: string; updates: Partial<Task> }) => apiTasks.updateTemplate(args.id, args.updates)
    : (args: { id: string; updates: Partial<Task> }) => localTasks.updateTask(args.id, args.updates);
  const deleteTemplateFn = storageMode === 'api'
    ? (id: string) => apiTasks.deleteTemplate(id)
    : (id: string) => localTasks.deleteTask(id);

  const { data: templates = [], isLoading, error } = useQuery({
    queryKey: [QUERY_KEY, storageMode, routineId],
    queryFn: () => adapter.getTemplates(routineId),
    enabled: Boolean(routineId),
    staleTime: 1000 * 60 * 5,
  });

  const createMutation = useMutation({
    mutationFn: (tpl: Omit<Task, 'id' | 'updatedAt' | 'version'>) => createTemplateFn(tpl),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) => updateTemplateFn({ id, updates }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTemplateFn(id),
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
