import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Routine, Settings } from '@/types';
import { STORAGE_KEY } from '@/lib/constants';

// Local adapters
import * as localRoutines from '@/adapters/local/routines';
// API adapters  
import * as apiRoutines from '@/adapters/api/routines';

const QUERY_KEY = 'routines';

export const useRoutines = () => {
  const queryClient = useQueryClient();
  
  // Direct storage mode detection to avoid settings API calls
  const getStorageMode = (): 'api' | 'local' => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.settings?.storageMode || 'local';
      }
    } catch (error) {
      console.warn('Failed to read storage mode from localStorage:', error);
    }
    return 'local';
  };
  
  const storageMode = getStorageMode();
  
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
  // Direct storage mode detection to avoid settings API calls
  const getStorageMode = (): 'api' | 'local' => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.settings?.storageMode || 'local';
      }
    } catch (error) {
      console.warn('Failed to read storage mode from localStorage:', error);
    }
    return 'local';
  };
  
  const storageMode = getStorageMode();
  const adapter = storageMode === 'api' ? apiRoutines : localRoutines;

  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => adapter.getRoutineById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};