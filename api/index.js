// Vercel serverless entry. Static files in dist/ are served by Vercel's CDN first;
// every other request (pages, /api, sitemap, robots) is rewritten here (see vercel.json).
import app from '../server/app.js';

export default app;
