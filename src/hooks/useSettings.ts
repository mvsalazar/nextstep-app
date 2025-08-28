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
    onSuccess: (updatedSettings, variables) => {
      // Keep a local mirror of key settings so features that consult localStorage remain in sync
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const appState = stored ? JSON.parse(stored) : {};
        appState.settings = appState.settings || {};
        if (variables) {
          if ('storageMode' in variables && variables.storageMode) {
            appState.settings.storageMode = variables.storageMode;
          }
          if ('currentChildId' in variables) {
            appState.settings.currentChildId = variables.currentChildId ?? null;
          }
          if ('currentDate' in variables && variables.currentDate) {
            appState.settings.currentDate = variables.currentDate;
          }
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
      } catch (e) {
        console.warn('Failed to persist settings locally:', e);
      }
      queryClient.setQueryData(['settings', storageMode], updatedSettings);
      // Also invalidate all settings queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      // If storage mode changed, refresh data-dependent queries so UI flips cleanly
      if (variables && 'storageMode' in variables && variables.storageMode) {
        const keys = ['tasks', 'routines', 'rewards', 'stars', 'children'];
        keys.forEach((k) => queryClient.invalidateQueries({ queryKey: [k] }));
      }
      // If child/date changed, refresh tasks/stars/routines accordingly
      if (variables && ('currentChildId' in variables || 'currentDate' in variables)) {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['stars'] });
        queryClient.invalidateQueries({ queryKey: ['routines'] });
      }
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
