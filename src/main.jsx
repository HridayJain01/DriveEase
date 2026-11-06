import { startTransition, StrictMode, useEffect } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import './styles.css';
import { handOverEarlyActions } from './early.js';
import { preloadRoute, routes } from './routes.jsx';

const router = createBrowserRouter(routes);
// The app shell is live: from now on buttons work directly. The page content normally hands over a moment later
// (Layout in components.jsx); the timer covers screens without it, such as the admin or an error page.
function Live() {
  useEffect(() => {
    window.__live = true;
    const t = setTimeout(handOverEarlyActions, 6000);
    return () => clearTimeout(t);
  }, []);
  return null;
}
const app = <StrictMode><RouterProvider router={router} /><Live /></StrictMode>;
const root = document.getElementById('root');

// Most pages arrive already drawn by the server, so React takes over that HTML instead of redrawing it.
// Personal pages (My Garage, Compare, admin) and `npm run dev` arrive empty and are drawn here.
// It waits for the first paint, and a transition splits the work into small slices, so a slow phone stays responsive.
const start = () => {
  if (root.hasChildNodes()) startTransition(() => { hydrateRoot(root, app); });
  else createRoot(root).render(app);
};
preloadRoute(location.pathname).catch(() => {}).finally(() => {
  if (document.hidden) start();
  else requestAnimationFrame(() => setTimeout(start));
});
