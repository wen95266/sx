import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker for full offline support and instant loading
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[PWA] New version available, updated automatically.');
  },
  onOfflineReady() {
    console.log('[PWA] Thirteen Water is ready to run offline.');
  }
});

createRoot(document.getElementById('root')!).render(<App />);
