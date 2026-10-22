import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { Layout } from './components.jsx';
import { fetchJson } from './lib.js';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Services from './pages/Services.jsx';
import Fleet from './pages/Fleet.jsx';
import Vehicle from './pages/Vehicle.jsx';
import Blog from './pages/Blog.jsx';
import Post from './pages/Post.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';
import './styles.css';

const Admin = lazy(() => import('./admin/Admin.jsx')); // separate chunk: visitors never download the admin

// Warm the cache for data almost every page needs.
['/api/site', '/api/vehicles'].forEach((u) => fetchJson(u).catch(() => {}));

const router = createBrowserRouter([
  { path: '/admin/*', element: <Suspense fallback={null}><Admin /></Suspense> },
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/about', element: <About /> },
      { path: '/services', element: <Services /> },
      { path: '/fleet', element: <Fleet /> },
      { path: '/fleet/:slug', element: <Vehicle /> },
      { path: '/blog', element: <Blog /> },
      { path: '/blog/:slug', element: <Post /> },
      { path: '/contact', element: <Contact /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
