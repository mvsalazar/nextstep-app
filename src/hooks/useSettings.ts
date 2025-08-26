import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Settings } from '@/types';
import { TODAY, STORAGE_KEY } from '@/lib/constants';

// Import adapters
import * as localSettings from '@/adapters/local/settings';
import * as apiSettings from '@/adapters/api/settings';

const getStorageMode = (): 'api' | 'local' => {
  // Directly read from localStorage to determine storage mode
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const appState = JSON.parse(stored);
      return appState.settings?.storageMode || 'local';
    }
  } catch (error) {
    console.warn('Failed to read storage mode from localStorage:', error);
  }
  
  return 'local'; // Default fallback
};

export const useSettings = () => {
  const storageMode = getStorageMode();
  const adapter = storageMode === 'api' ? apiSettings : localSettings;

  return useQuery({
    queryKey: ['settings', storageMode], // Include storageMode in query key
    queryFn: adapter.getSettings,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  const storageMode = getStorageMode();
  const adapter = storageMode === 'api' ? apiSettings : localSettings;

  return useMutation({
    mutationFn: (updates: Partial<Settings>) => adapter.updateSettings(updates),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(['settings', storageMode], updatedSettings);
      // Also invalidate all settings queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error) => {
      console.error('Failed to update settings:', error);
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};

export const useCurrentDate = () => {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  
  const currentDate = settings?.currentDate || TODAY;
  
  const setCurrentDate = (date: string) => {
    updateSettings.mutate({ currentDate: date });
  };
  
  return {
    currentDate,
    setCurrentDate,
    isUpdating: updateSettings.isPending,
  };
};