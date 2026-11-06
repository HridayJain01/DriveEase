import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const api = `http://localhost:${process.env.API_PORT || 3001}`;

// The built index.html is renamed so every page request reaches the server, which fills in each
// page's meta tags and HTML (server/html.js). `npm run dev` still uses index.html as normal.
// It also records which files each page needs, so the server can tell the browser to fetch them early.
const shell = {
  name: 'page-shell',
  enforce: 'post',
  generateBundle(_, bundle) {
    const html = bundle['index.html'];
    if (!html) return; // the server build has no HTML
    const chunks = Object.values(bundle).filter((c) => c.type === 'chunk');
    const byFile = new Map(chunks.map((c) => [c.fileName, c]));
    const needs = (c, seen = new Set()) => {
      if (c.isEntry || seen.has(c.fileName)) return seen;
      seen.add(c.fileName);
      c.imports.forEach((f) => byFile.has(f) && needs(byFile.get(f), seen));
      return seen;
    };
    const pages = Object.fromEntries(chunks.filter((c) => c.isDynamicEntry && /^[A-Z]/.test(c.name)).map((c) => [c.name, [...needs(c)]]));
    html.source = String(html.source).replace('</head>', `<!--pages:${JSON.stringify(pages)}-->\n  </head>`);
    html.fileName = 'shell.html';
  },
};

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), shell],
  build: { copyPublicDir: !isSsrBuild },
  // host: true also listens on the local network, so phones on the same Wi-Fi can open the dev site.
  server: { port: 5173, host: true, proxy: { '/api': api, '/sitemap.xml': api, '/robots.txt': api, '/llms.txt': api, '/blog/feed.xml': api } },
}));
