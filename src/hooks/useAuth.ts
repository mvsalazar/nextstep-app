import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { STORAGE_KEY } from '@/lib/constants';

const getStorageMode = (): 'api' | 'local' => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.settings?.storageMode || 'local';
    }
  } catch (error) {
    console.warn('Failed to determine storage mode:', error);
  }
  return 'local';
};

export const useAuth = () => {
  const storageMode = getStorageMode();
  const auth = useAuthStore();

  // Initialize auth once on mount
  useEffect(() => {
    if (storageMode === 'api') {
      auth.initialize();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageMode]);

  const isAuthenticated = storageMode === 'local' || Boolean(auth.token && auth.user);

  return {
    ...auth,
    storageMode,
    isAuthenticated,
  };
};
