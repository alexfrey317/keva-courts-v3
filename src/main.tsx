import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Service worker registration
if ('serviceWorker' in navigator) {
  const params = new URLSearchParams(location.search);
  if (params.has('reset')) {
    navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
    caches.keys().then((ks) => ks.forEach((k) => caches.delete(k)));
    const url = new URL(location.href);
    url.searchParams.delete('reset');
    location.replace(url.toString());
  } else {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}
