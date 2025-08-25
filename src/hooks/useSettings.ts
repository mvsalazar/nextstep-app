import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Settings } from '@/types';

// Import adapters
import * as localSettings from '@/adapters/local/settings';
import * as apiSettings from '@/adapters/api/settings';

const useStorageMode = () => {
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      // Try to get from localStorage first to determine storage mode
      try {
        const stored = localStorage.getItem('nextstep:v1');
        if (stored) {
          const appState = JSON.parse(stored);
          return appState.settings;
        }
      } catch (error) {
        console.warn('Failed to read settings from localStorage:', error);
      }
      
      // Default fallback
      return { storageMode: 'local' } as Settings;
    },
    staleTime: Infinity, // Settings rarely change
  });

  return settings?.storageMode || 'local';
};

export const useSettings = () => {
  const storageMode = useStorageMode();
  const adapter = storageMode === 'api' ? apiSettings : localSettings;

  return useQuery({
    queryKey: ['settings'],
    queryFn: adapter.getSettings,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  const storageMode = useStorageMode();
  const adapter = storageMode === 'api' ? apiSettings : localSettings;

  return useMutation({
    mutationFn: (updates: Partial<Settings>) => adapter.updateSettings(updates),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(['settings'], updatedSettings);
    },
    onError: (error) => {
      console.error('Failed to update settings:', error);
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};