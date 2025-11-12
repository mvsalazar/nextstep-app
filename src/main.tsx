import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

async function startMocks() {
  const useMsw = import.meta.env.VITE_USE_MSW !== 'false';
  if (import.meta.env.DEV && useMsw) {
    try {
      const { worker } = await import('./mocks/browser');
      window.__MSW_ENABLED = true;
      worker.start({ onUnhandledRequest: 'bypass' });
      console.info('[MSW] Mock Service Worker starting…');
    } catch (e) {
      window.__MSW_ENABLED = false;
      console.warn('[MSW] Failed to start, proceeding without mocks', e);
    }
  } else {
    window.__MSW_ENABLED = false;
  }
}

console.log('Starting NextStep app...')

const rootElement = document.getElementById('root')

if (rootElement) {
  // Don't block initial render on MSW startup
  startMocks();
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} else {
  console.error('Root element not found!')
}
