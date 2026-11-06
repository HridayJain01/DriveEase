import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router';
import { seedData } from './lib.js';
import { chunkOf, preloadRoute, routes } from './routes.jsx';

// Draws a page to HTML on the server (built by `npm run build`, used by server/html.js). Visitors get
// text straight away, and readers that don't run JavaScript get exactly what everyone else sees.
process.env.TZ = 'Asia/Kolkata'; // dates should match what visitors in India see
const handler = createStaticHandler(routes);

export async function render(url, data) {
  const { pathname } = new URL(url);
  await preloadRoute(pathname);
  const context = await handler.query(new Request(url));
  if (context instanceof Response) return { html: '' }; // only a redirect would do this, and no route has one
  const router = createStaticRouter(handler.dataRoutes, context);
  seedData(data); // directly before the synchronous render, so two requests can't mix their data
  const html = renderToString(<StrictMode><StaticRouterProvider router={router} context={context} hydrate={false} /></StrictMode>);
  return { html, chunk: chunkOf(pathname) };
}
