import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { Layout, RouteError } from './components.jsx';
import { fetchJson } from './lib.js';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Services from './pages/Services.jsx';
import Fleet from './pages/Fleet.jsx';
import Vehicle from './pages/Vehicle.jsx';
import Blog from './pages/Blog.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';
import './styles.css';

const Admin = lazy(() => import('./admin/Admin.jsx')); // separate chunk: visitors never download the admin
const Post = lazy(() => import('./pages/Post.jsx')); // keeps the Markdown renderer out of the main bundle
const Concierge = lazy(() => import('./pages/Concierge.jsx'));
const Compare = lazy(() => import('./pages/Compare.jsx'));
const Garage = lazy(() => import('./pages/Garage.jsx'));
const Service = lazy(() => import('./pages/Service.jsx'));
const page = (el) => <Suspense fallback={<div className="wrap skeleton" style={{ height: '60vh', marginTop: 120 }} aria-busy="true" />}>{el}</Suspense>;

// Warm the cache for data almost every page needs.
['/api/site', '/api/vehicles'].forEach((u) => fetchJson(u).catch(() => {}));

const router = createBrowserRouter([
  { path: '/admin/*', element: <Suspense fallback={null}><Admin /></Suspense>, errorElement: <RouteError /> },
  {
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/about', element: <About /> },
      { path: '/services', element: <Services /> },
      { path: '/services/:slug', element: page(<Service />) },
      { path: '/fleet', element: <Fleet /> },
      { path: '/fleet/:slug', element: <Vehicle /> },
      { path: '/blog', element: <Blog /> },
      { path: '/blog/:slug', element: <Suspense fallback={<div className="wrap skeleton" style={{ height: '60vh', marginTop: 40 }} />}><Post /></Suspense> },
      { path: '/contact', element: <Contact /> },
      { path: '/concierge', element: page(<Concierge />) },
      { path: '/compare', element: page(<Compare />) },
      { path: '/garage', element: page(<Garage />) },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
