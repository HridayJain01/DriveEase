import { readFile } from 'node:fs/promises';
import { publicData as read, Vehicle } from './db.js';
import { cityOf, pageMeta, postMeta, serviceMeta, vehicleMeta } from '../src/seo.js';

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

// What each page is, for search engines: its meta, the data it embeds, and its structured data.
async function describe(path, site, vehicles, origin) {
  const home = pageMeta('/', site);
  const crumbs = (...items) => ({
    '@type': 'BreadcrumbList',
    itemListElement: [['Home', '/'], ...items].map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${origin}${url}` })),
  });

  if (path === '/') {
    const faqs = (site.faqs || []).filter((f) => f.q && f.a);
    return { ...home, data: { '/api/reviews': await read.reviews() }, ld: faqs.length ? [{ '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }] : [] };
  }
  if (path === '/fleet') return {
    ...pageMeta(path, site),
    ld: [{ '@type': 'ItemList', name: pageMeta(path, site).h1, itemListElement: vehicles.map((v, i) => ({ '@type': 'ListItem', position: i + 1, url: `${origin}/fleet/${v.slug}`, name: v.name })) }],
  };
  if (path === '/blog') return { ...pageMeta(path, site), data: { '/api/posts': await read.posts() } };
  if (path === '/contact') return { ...pageMeta(path, site), data: { '/api/reviews': await read.reviews() } };
  if (pageMeta(path, site)) return pageMeta(path, site);

  const car = path.match(/^\/fleet\/([\w-]+)$/)?.[1];
  const v = car && await read.vehicle(car);
  if (v) return {
    ...vehicleMeta(v, site), image: v.images?.[0], data: { [`/api/vehicles/${v.slug}`]: v },
    ld: [
      crumbs(['Fleet', '/fleet'], [v.name, `/fleet/${v.slug}`]),
      {
        '@type': 'Car', name: v.name, url: `${origin}/fleet/${v.slug}`,
        description: v.description || v.summary || undefined,
        image: [...(v.images || []), ...(v.interiorImages || []), ...(v.bootImages || [])].slice(0, 6).map(previewImage).filter(Boolean),
        bodyType: v.category || undefined, vehicleSeatingCapacity: v.seats || undefined,
        fuelType: v.fuel || undefined, vehicleTransmission: v.transmission || undefined,
      },
    ],
  };

  const service = path.match(/^\/services\/([\w-]+)$/)?.[1];
  const s = service && site.services?.find((x) => x.slug === service);
  if (s) return {
    ...serviceMeta(s, site),
    ld: [
      crumbs(['Services', '/services'], [s.name, `/services/${s.slug}`]),
      { '@type': 'Service', name: s.name, serviceType: s.name, description: s.details || s.summary || undefined, url: `${origin}/services/${s.slug}`, provider: { '@id': `${origin}/#business` }, areaServed: areasOf(site) },
    ],
  };

  const slug = path.match(/^\/blog\/([\w-]+)$/)?.[1];
  const p = slug && await read.post(slug);
  if (p) return {
    ...postMeta(p, site), image: p.cover, type: 'article', data: { [`/api/posts/${p.slug}`]: p },
    ld: [
      crumbs(['Blog', '/blog'], [p.title, `/blog/${p.slug}`]),
      { '@type': 'BlogPosting', headline: p.title, description: p.excerpt, datePublished: p.publishedAt, image: previewImage(p.cover) || undefined, url: `${origin}/blog/${p.slug}`, author: { '@id': `${origin}/#business` }, publisher: { '@id': `${origin}/#business` } },
    ],
  };

  if (path === '/admin' || path.startsWith('/admin/')) return { fullTitle: `Admin | ${site.businessName}`, noindex: true };
  return { fullTitle: `Page not found | ${site.businessName}`, noindex: true, status: 404 };
}

// The city and the nearby areas listed in Site details.
const areasOf = (site) => [cityOf(site), ...(site.serviceAreas || [])].filter(Boolean).map((name) => ({ '@type': 'Place', name }));
// Social links that point at an actual profile, not just a network's home page.
const profiles = (socials = {}) => Object.values(socials).filter((u) => u && /^https:\/\/[^/]+\/[^/?#]+/.test(u));

export async function renderPage(req, res) {
  const origin = siteOrigin(req);
  const html = await loadShell();
  const path = req.path.replace(/\/+$/, '') || '/';
  let site, vehicles, page;
  try {
    [site, vehicles] = await Promise.all([read.site(), read.vehicles()]);
    page = site && await describe(path, site, vehicles, origin);
  } catch (e) {
    console.error(e); // database unreachable: still serve the app, which shows its own error states
    return res.status(503).set('Cache-Control', 'no-store').type('html').send(html);
  }
  if (!site) return res.status(503).type('html').send(html);

  const name = site.businessName;
  const title = page.fullTitle;
  const description = page.description || site.tagline;
  const url = `${origin}${path}`;
  const cover = vehicles.find((v) => v.featured)?.images?.[0] || vehicles[0]?.images?.[0];
  const image = previewImage(page.image || cover);
  const business = {
    '@type': 'AutoRental', '@id': `${origin}/#business`, name, url: `${origin}/`,
    description: site.tagline || undefined,
    telephone: site.phone, email: site.email || undefined, address: site.address || undefined,
    areaServed: areasOf(site).length ? areasOf(site) : undefined,
    hasMap: site.mapUrl || undefined,
    image: previewImage(cover) || undefined,
    sameAs: profiles(site.socials),
  };
  const ld = { '@context': 'https://schema.org', '@graph': [business, ...(page.ld || [])] };

  const head = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    page.noindex ? '<meta name="robots" content="noindex" />' : `<link rel="canonical" href="${esc(url)}" />`,
    site.googleSiteVerification && `<meta name="google-site-verification" content="${esc(site.googleSiteVerification)}" />`,
    `<meta property="og:site_name" content="${esc(name)}" />`,
    `<meta property="og:locale" content="en_IN" />`,
    `<meta property="og:type" content="${page.type || 'website'}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    image && `<meta property="og:image" content="${esc(image)}" />`,
    image && '<meta name="twitter:card" content="summary_large_image" />',
    `<script type="application/ld+json">${json(ld)}</script>`,
    `<script>window.__DATA__=${json({ '/api/site': site, '/api/vehicles': vehicles, ...page.data })}</script>`,
  ].filter(Boolean).join('\n    ');

  res.status(page.status || 200)
    .set('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=86400')
    .type('html')
    .send(html.replace(/<!--seo-->[\s\S]*?<!--\/seo-->/, head));
}

// Google may fetch the public API while rendering pages, so only the admin API is off-limits.
// (API responses themselves carry X-Robots-Tag: noindex, so they never show up in results.)
export function robots(req, res) {
  res.type('text/plain').send(`User-agent: *\nDisallow: /admin\nDisallow: /api/admin\n\nSitemap: ${siteOrigin(req)}/sitemap.xml\n`);
}

export async function sitemap(req, res) {
  const origin = siteOrigin(req);
  const [site, cars, posts] = await Promise.all([read.site(), Vehicle.find({ published: true }).select('slug updatedAt').lean(), read.posts()]);
  const day = (d) => d && new Date(d).toISOString().slice(0, 10);
  const urls = [
    ['/'], ['/fleet'], ['/services'], ['/concierge'], ['/about'], ['/blog'], ['/contact'],
    ...(site?.services || []).filter((s) => s.slug).map((s) => [`/services/${s.slug}`]),
    ...cars.map((v) => [`/fleet/${v.slug}`, day(v.updatedAt)]),
    ...posts.map((p) => [`/blog/${p.slug}`, day(p.publishedAt)]),
  ];
  res.type('application/xml').set('Cache-Control', 'public, max-age=0, s-maxage=3600').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
      urls.map(([loc, mod]) => `  <url><loc>${esc(origin + loc)}</loc>${mod ? `<lastmod>${mod}</lastmod>` : ''}</url>`).join('\n')
    }\n</urlset>\n`,
  );
}
