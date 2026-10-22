import express from 'express';
import app from './app.js';

// Local server. After `npm run build` it also serves the built site, so `npm start` previews production.
const server = express();
server.use('/assets', express.static('dist/assets', { immutable: true, maxAge: '1y' }));
server.use(express.static('dist', { index: false }));
server.use(app);

const port = process.env.API_PORT || 3001;
server.listen(port, (err) => { // Express 5 passes listen errors (e.g. port already in use) here
  if (err) throw err;
  console.log(`API ready on http://localhost:${port}`);
});
