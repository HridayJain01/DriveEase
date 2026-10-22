import { readFile } from 'node:fs/promises';
import { publicData as read } from './db.js';
import { PAGES, postMeta, vehicleMeta } from '../src/seo.js';

// Serves the React app's HTML with each page's title, description, canonical URL, link-preview
// image and structured data filled in — for search engines and WhatsApp/Facebook previews, which
// don't run JavaScript. It also embeds the page's data so the first paint needs no API round trip.

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const json = (data) => JSON.stringify(data).replace(/</g, '\\u003c');

// The public address comes only from configuration, never from request headers: a forged Host header
// must not end up in cached canonical links, the sitemap, or where the page shell is loaded from.
const configuredOrigin = () => {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL; // set by Vercel itself
  return (process.env.SITE_URL || (vercel ? `https://${vercel}` : '')).replace(/\/+$/, '');
};

export function siteOrigin(req) {
  const origin = configuredOrigin();
  if (origin) return origin;
  if (process.env.NODE_ENV === 'production') throw new Error('Set SITE_URL to the site’s public address, e.g. https://www.example.in');
  return `http://${req.headers.host}`; // local development only
}

// 1200×630 JPEG is what WhatsApp, Facebook and X expect for a large preview.
function previewImage(url) {
  if (!url) return '';
  if (url.includes('images.unsplash.com')) return `${url}?w=1200&h=630&fit=crop&q=70&fm=jpg`;
  if (url.includes('res.cloudinary.com')) return url.replace('/upload/', '/upload/c_fill,w_1200,h_630,q_auto,f_jpg/');
  return url;
}

// The built app shell (vite build writes dist/shell.html). If it isn't bundled with the serverless
// function, fetch it from the site's configured address (never a request-supplied one).
let shell;
function loadShell() {
  shell ??= readFile(new URL('../dist/shell.html', import.meta.url), 'utf8')
    .catch(() => {
      const origin = configuredOrigin();
      if (!origin) throw new Error('dist/shell.html is missing. Run npm run build.');
      return fetch(`${origin}/shell.html`).then((r) => (r.ok ? r.text() : Promise.reject(new Error(`shell.html returned ${r.status}`))));
    })
    .catch((e) => { shell = null; throw e; });
  return shell;
}

async function describe(path) {
  if (path === '/') return { data: { '/api/reviews': await read.reviews() } };
  if (path === '/blog') return { ...PAGES[path], data: { '/api/posts': await read.posts() } };
  if (path === '/contact') return { ...PAGES[path], data: { '/api/reviews': await read.reviews() } };
  if (PAGES[path]) return PAGES[path];

  const car = path.match(/^\/fleet\/([\w-]+)$/)?.[1];
  const v = car && await read.vehicle(car);
  if (v) return { ...vehicleMeta(v), image: v.images?.[0], data: { [`/api/vehicles/${v.slug}`]: v } };

  const slug = path.match(/^\/blog\/([\w-]+)$/)?.[1];
  const p = slug && await read.post(slug);
  if (p) return {
    ...postMeta(p), image: p.cover, type: 'article', data: { [`/api/posts/${p.slug}`]: p },
    ld: { '@type': 'BlogPosting', headline: p.title, description: p.excerpt, datePublished: p.publishedAt, image: previewImage(p.cover) || undefined },
  };

  if (path === '/admin' || path.startsWith('/admin/')) return { title: 'Admin', noindex: true };
  return { title: 'Page not found', noindex: true, status: 404 };
}

export async function renderPage(req, res) {
  const origin = siteOrigin(req);
  const html = await loadShell();
  const path = req.path.replace(/\/+$/, '') || '/';
  let site, vehicles, page;
  try {
    [site, vehicles, page] = await Promise.all([read.site(), read.vehicles(), describe(path)]);
  } catch (e) {
    console.error(e); // database unreachable: still serve the app, which shows its own error states
    return res.status(503).set('Cache-Control', 'no-store').type('html').send(html);
  }
  if (!site) return res.status(503).type('html').send(html);

  const name = site.businessName;
  const title = page.title ? `${page.title} — ${name}` : `${name} — Car rentals${site.city ? ` in ${site.city}` : ''}`;
  const description = page.description || site.tagline;
  const url = `${origin}${path}`;
  const cover = vehicles.find((v) => v.featured)?.images?.[0] || vehicles[0]?.images?.[0];
  const image = previewImage(page.image || cover);
  const business = {
    '@context': 'https://schema.org', '@type': 'AutoRental', name, url: `${origin}/`,
    telephone: site.phone, email: site.email || undefined, address: site.address || undefined,
    areaServed: site.city || undefined, image: previewImage(cover) || undefined,
    sameAs: Object.values(site.socials || {}).filter(Boolean),
  };

  const head = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    page.noindex ? '<meta name="robots" content="noindex" />' : `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:site_name" content="${esc(name)}" />`,
    `<meta property="og:type" content="${page.type || 'website'}" />`,
    `<meta property="og:title" content="${esc(page.title || title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    image && `<meta property="og:image" content="${esc(image)}" />`,
    image && '<meta name="twitter:card" content="summary_large_image" />',
    `<script type="application/ld+json">${json(page.ld ? [business, { '@context': 'https://schema.org', ...page.ld }] : business)}</script>`,
    `<script>window.__DATA__=${json({ '/api/site': site, '/api/vehicles': vehicles, ...page.data })}</script>`,
  ].filter(Boolean).join('\n    ');

  res.status(page.status || 200)
    .set('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=86400')
    .type('html')
    .send(html.replace(/<!--seo-->[\s\S]*?<!--\/seo-->/, head));
}

export function robots(req, res) {
  res.type('text/plain').send(`User-agent: *\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${siteOrigin(req)}/sitemap.xml\n`);
}

export async function sitemap(req, res) {
  const origin = siteOrigin(req);
  const [vehicles, posts] = await Promise.all([read.vehicles(), read.posts()]);
  const day = (d) => d && new Date(d).toISOString().slice(0, 10);
  const urls = [
    ['/'], ['/fleet'], ['/services'], ['/about'], ['/blog'], ['/contact'],
    ...vehicles.map((v) => [`/fleet/${v.slug}`]),
    ...posts.map((p) => [`/blog/${p.slug}`, day(p.publishedAt)]),
  ];
  res.type('application/xml').set('Cache-Control', 'public, max-age=0, s-maxage=3600').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
      urls.map(([loc, mod]) => `  <url><loc>${esc(origin + loc)}</loc>${mod ? `<lastmod>${mod}</lastmod>` : ''}</url>`).join('\n')
    }\n</urlset>\n`,
  );
}
