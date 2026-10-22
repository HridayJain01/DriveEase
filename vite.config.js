import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const api = `http://localhost:${process.env.API_PORT || 3001}`;

// The built index.html is renamed so every page request reaches the server, which fills in
// each page's meta tags (server/html.js). `npm run dev` still uses index.html as normal.
const renameShell = { name: 'rename-shell', enforce: 'post', generateBundle(_, bundle) { bundle['index.html'].fileName = 'shell.html'; } };

export default defineConfig({
  plugins: [react(), renameShell],
  server: { port: 5173, proxy: { '/api': api, '/sitemap.xml': api, '/robots.txt': api } },
});
