import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Routine } from '@/types';
import { STORAGE_KEY } from '@/lib/constants';
import { useSettings } from './useSettings';

// Local adapters
import * as localRoutines from '@/adapters/local/routines';
// API adapters  
import * as apiRoutines from '@/adapters/api/routines';

const QUERY_KEY = 'routines';

export const useRoutines = () => {
  const queryClient = useQueryClient();
  const { data: settings } = useSettings();
  // Helper to read local values without API
  const getLocal = (key: string) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return undefined;
      const parsed = JSON.parse(raw);
      return parsed.settings?.[key];
    } catch {}
    return undefined;
  };
  const storageMode = (getLocal('storageMode') || 'local') as 'api' | 'local';
  // In API mode, prefer API settings for child; in Local mode, use local mirror
  const childId = storageMode === 'api'
    ? (settings?.currentChildId as string | undefined)
    : (getLocal('currentChildId') as string | undefined);
  
  const adapter = storageMode === 'api' ? apiRoutines : localRoutines;

  const {
    data: routines = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [QUERY_KEY, storageMode, childId],
    queryFn: () => adapter.getRoutines(childId),
    enabled: storageMode !== 'api' || Boolean(childId),
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
    mutationFn: (routineIds: string[]) => adapter.reorderRoutines(routineIds, childId),
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
