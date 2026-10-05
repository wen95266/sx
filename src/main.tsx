import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA service worker for full offline support and instant loading
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(
      (reg) => {
        console.log('[PWA] Service Worker registered successfully:', reg.scope);
      },
      (err) => {
        console.warn('[PWA] Service Worker registration info:', err);
      }
    );
  });
}

createRoot(document.getElementById('root')!).render(<App />);
