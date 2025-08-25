import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Routine } from '@/types';
import { useSettings } from './useSettings';

// Local adapters
import * as localRoutines from '@/adapters/local/routines';
// API adapters  
import * as apiRoutines from '@/adapters/api/routines';

const QUERY_KEY = 'routines';

export const useRoutines = () => {
  const queryClient = useQueryClient();
  const { data: settings } = useSettings();
  const storageMode = settings?.storageMode || 'local';
  
  const adapter = storageMode === 'api' ? apiRoutines : localRoutines;

  const {
    data: routines = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: adapter.getRoutines,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: (routine: Omit<Routine, 'id' | 'updatedAt' | 'version'>) =>
      adapter.createRoutine(routine),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Failed to create routine:', error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Routine> }) =>
      adapter.updateRoutine(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Failed to update routine:', error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adapter.deleteRoutine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Failed to delete routine:', error);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: adapter.reorderRoutines,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error) => {
      console.error('Failed to reorder routines:', error);
    },
  });

  return {
    routines,
    isLoading,
    error,
    createRoutine: createMutation.mutate,
    updateRoutine: updateMutation.mutate,
    deleteRoutine: deleteMutation.mutate,
    reorderRoutines: reorderMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isReordering: reorderMutation.isPending,
  };
};

export const useRoutine = (id: string) => {
  const { data: settings } = useSettings();
  const storageMode = settings?.storageMode || 'local';
  const adapter = storageMode === 'api' ? apiRoutines : localRoutines;

  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => adapter.getRoutineById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};