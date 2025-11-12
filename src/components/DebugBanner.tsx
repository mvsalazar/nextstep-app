import { useEffect, useState } from 'react';
import { API_BASE_URL, STORAGE_KEY } from '@/lib/constants';
import { useSettings } from '@/hooks/useSettings';

const DEBUG_STORAGE_KEY = 'nextstep:debugBanner';

const readHiddenPreference = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    return localStorage.getItem(DEBUG_STORAGE_KEY) === 'hidden';
  } catch (error) {
    console.warn('Failed to read debug banner preference:', error);
    return false;
  }
};

const persistHiddenPreference = (value: boolean) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(DEBUG_STORAGE_KEY, value ? 'hidden' : 'visible');
  } catch (error) {
    console.warn('Failed to persist debug banner preference:', error);
  }
};

const getMirrorSettings = (): Record<string, unknown> => {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw)?.settings || {} : {};
  } catch (error) {
    console.warn('Failed to read mirrored settings:', error);
    return {};
  }
};

const readMswFlag = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return Boolean(window.__MSW_ENABLED);
};

export const DebugBanner = () => {
  const isDev = import.meta.env.DEV;
  const [hidden, setHidden] = useState<boolean>(() => readHiddenPreference());
  const [msw, setMsw] = useState<boolean>(() => readMswFlag());
  const { data: settings } = useSettings();
  const mirror = getMirrorSettings();
  const mode = settings?.storageMode || (mirror.storageMode as string) || 'local';
  const child = settings?.currentChildId ?? (mirror.currentChildId as string | undefined) ?? '—';

  useEffect(() => {
    if (!isDev) {
      return;
    }
    setMsw(readMswFlag());
    const id = window.setInterval(() => setMsw(readMswFlag()), 1500);
    return () => clearInterval(id);
  }, [isDev]);

  if (!isDev || hidden) return null;

  return (
    <div className="fixed left-2 bottom-2 z-50 text-xs px-3 py-2 rounded-md border bg-card/90 backdrop-blur">
      <div className="flex items-center gap-2">
        <span className="font-semibold">Debug</span>
        <span>API: {API_BASE_URL}</span>
        <span>MSW: {msw ? 'on' : 'off'}</span>
        <span>Mode: {mode}</span>
        <span>Child: {child || '—'}</span>
        <button
          className="ml-2 opacity-70 hover:opacity-100"
          onClick={() => {
            setHidden(true);
            persistHiddenPreference(true);
          }}
          aria-label="Hide debug info"
        >
          ×
        </button>
      </div>
    </div>
  );
};
