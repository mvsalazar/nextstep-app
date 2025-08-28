import { useEffect, useState } from 'react';
import { API_BASE_URL, STORAGE_KEY } from '@/lib/constants';
import { useSettings } from '@/hooks/useSettings';

export const DebugBanner = () => {
  if (!import.meta.env.DEV) return null;

  const [hidden, setHidden] = useState<boolean>(() => {
    try { return localStorage.getItem('nextstep:debugBanner') === 'hidden'; } catch { return false; }
  });
  const [msw, setMsw] = useState<boolean>(false);
  const { data: settings } = useSettings();
  const mirror = (() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')?.settings || {}; } catch { return {}; }
  })();
  const mode = settings?.storageMode || mirror.storageMode || 'local';
  const child = settings?.currentChildId ?? mirror.currentChildId ?? '—';

  useEffect(() => {
    setMsw(Boolean((window as any).__MSW_ENABLED));
    const id = setInterval(() => setMsw(Boolean((window as any).__MSW_ENABLED)), 1500);
    return () => clearInterval(id);
  }, []);

  if (hidden) return null;

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
          onClick={() => { try { localStorage.setItem('nextstep:debugBanner', 'hidden'); } catch {}; setHidden(true); }}
          aria-label="Hide debug info"
        >
          ×
        </button>
      </div>
    </div>
  );
};

