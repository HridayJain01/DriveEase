import app from './app.js';

const port = process.env.API_PORT || 3001;
app.listen(port, () => console.log(`API ready on http://localhost:${port}`));
