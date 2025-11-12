import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ChildUser } from '@/types';
import * as localUsers from '@/adapters/local/users';
import * as apiUsers from '@/adapters/api/users';
import { STORAGE_KEY } from '@/lib/constants';

const QUERY_KEY = 'children';

const getStorageMode = (): 'api' | 'local' => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.settings?.storageMode || 'local';
    }
  } catch (error) {
    console.warn('Failed to read storage mode for users:', error);
  }
  return 'local';
};

export const useChildren = () => {
  const queryClient = useQueryClient();
  const storageMode = getStorageMode();
  const adapter = storageMode === 'api' ? apiUsers : localUsers;

  const { data: children = [], isLoading, error } = useQuery({
    queryKey: [QUERY_KEY, storageMode],
    queryFn: adapter.getChildren,
    staleTime: 1000 * 60 * 5,
  });

  const createMutation = useMutation({
    mutationFn: ({ name, emoji }: { name: string; emoji?: string }) => adapter.createChild(name, emoji),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adapter.deleteChild(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { name?: string; emoji?: string } }) =>
      adapter.updateChild(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  return {
    children: children as ChildUser[],
    isLoading,
    error,
    createChild: createMutation.mutateAsync,
    deleteChild: deleteMutation.mutateAsync,
    updateChild: updateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};
