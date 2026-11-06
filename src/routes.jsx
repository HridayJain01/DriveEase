import { lazy, Suspense } from 'react';
import { matchRoutes } from 'react-router';
import { Layout, RouteError } from './components.jsx';

// Every page is its own download. The one being opened loads before React starts, so React can take
// over the server's HTML straight away, with no loading placeholder in between.
function page(chunk, load) {
  let Loaded;
  const Lazy = lazy(load);
  const Page = (props) => (Loaded ? <Loaded {...props} /> : <Lazy {...props} />);
  Page.chunk = chunk;
  Page.preload = () => load().then((m) => { Loaded = m.default; });
  return Page;
}

const Home = page('Home', () => import('./pages/Home.jsx'));
const About = page('About', () => import('./pages/About.jsx'));
const Services = page('Services', () => import('./pages/Services.jsx'));
const Service = page('Service', () => import('./pages/Service.jsx'));
const Fleet = page('Fleet', () => import('./pages/Fleet.jsx'));
const Vehicle = page('Vehicle', () => import('./pages/Vehicle.jsx'));
const Blog = page('Blog', () => import('./pages/Blog.jsx'));
const Post = page('Post', () => import('./pages/Post.jsx'));
const Contact = page('Contact', () => import('./pages/Contact.jsx'));
const Concierge = page('Concierge', () => import('./pages/Concierge.jsx'));
const Compare = page('Compare', () => import('./pages/Compare.jsx'));
const Garage = page('Garage', () => import('./pages/Garage.jsx'));
const Landing = page('Landing', () => import('./pages/Landing.jsx'));
const NotFound = page('NotFound', () => import('./pages/NotFound.jsx'));
const FitGuide = page('FitGuide', () => import('./pages/FitGuide.jsx'));
const Admin = page('Admin', () => import('./admin/Admin.jsx')); // visitors never download the admin

const route = (path, Page, props) => ({ path, element: <Page {...props} />, handle: Page });

export const routes = [
  { path: '/admin/*', element: <Suspense fallback={null}><Admin /></Suspense>, handle: Admin, errorElement: <RouteError /> },
  {
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      route('/', Home),
      route('/about', About),
      route('/services', Services),
      route('/services/:slug', Service),
      route('/routes', Landing, { kind: 'routes' }),
      route('/routes/:slug', Landing, { kind: 'route' }),
      route('/car-rental', Landing, { kind: 'areas' }),
      route('/car-rental/:slug', Landing, { kind: 'area' }),
      route('/cars/:slug', Landing, { kind: 'type' }),
      route('/privacy', Landing, { kind: '/privacy' }),
      route('/terms', Landing, { kind: '/terms' }),
      route('/which-car-fits', FitGuide),
      route('/fleet', Fleet),
      route('/fleet/:slug', Vehicle),
      route('/blog', Blog),
      route('/blog/:slug', Post),
      route('/contact', Contact),
      route('/concierge', Concierge),
      route('/compare', Compare),
      route('/garage', Garage),
      route('*', NotFound),
    ],
  },
];

const pagesFor = (path) => (matchRoutes(routes, path) || []).map((m) => m.route.handle).filter(Boolean);
export const preloadRoute = (path) => Promise.all(pagesFor(path).map((p) => p.preload()));
export const chunkOf = (path) => pagesFor(path)[0]?.chunk;
