import {StrictMode} from 'react';
import {createRoot, hydrateRoot} from 'react-dom/client';
import App, {preloadRoute} from './App.tsx';
import './index.css';

const container = document.getElementById('root')!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

if (container.hasChildNodes()) {
  // Prerendered page: load this page's code first, then attach to the existing HTML.
  // The visitor sees the full page immediately; it becomes interactive once hydrated.
  preloadRoute(window.location.pathname)
    .catch(() => undefined)
    .then(() => hydrateRoot(container, app));
} else {
  // Dashboard and dev server start from an empty root
  createRoot(container).render(app);
}
