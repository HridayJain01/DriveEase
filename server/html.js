import { readFile } from 'node:fs/promises';
import { publicData as read } from './db.js';
import { esc, frame, textOf } from './prerender.js';
import { cityOf, landingMeta, pageMeta, postMeta, serviceMeta, vehicleMeta } from '../src/seo.js';
import { AREAS, CAR_TYPES, LEGAL, ROUTES } from '../src/seo-content.js';
import { areaLinks, carsOfType, CONTENT_UPDATED, routeLinks, typeLinks } from '../src/seo-links.js';

// Serves the React app's HTML with each page's title, description, canonical URL, link-preview
// image, structured data and text filled in — for search engines and WhatsApp/Facebook previews,
// which don't all run JavaScript. It also embeds the page's data so the first paint needs no API round trip.

const json = (data) => JSON.stringify(data).replace(/</g, '\\u003c');

// The public address comes only from configuration, never from request headers: a forged Host header
// must not end up in cached canonical links, the sitemap, or where the page shell is loaded from.
const configuredOrigin = () => {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL; // set by Vercel itself
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

const faqLd = (faqs = []) => ({ '@type': 'FAQPage', mainEntity: faqs.filter((f) => f.q && f.a).map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
const listLd = (name, items) => ({ '@type': 'ItemList', name, itemListElement: items.map(([label, url], i) => ({ '@type': 'ListItem', position: i + 1, url, name: label })) });

// What each page is, for search engines: its meta, the data it embeds, its structured data and its text.
async function describe(path, site, vehicles, origin) {
  const home = pageMeta('/', site);
  const crumbs = (...items) => ({
    '@type': 'BreadcrumbList',
    itemListElement: [['Home', '/'], ...items].map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${origin}${url}` })),
  });
  const provider = { '@id': `${origin}/#business` };
  const carList = (name, cars) => listLd(name, cars.map((v) => [v.name, `${origin}/fleet/${v.slug}`]));

  if (path === '/') {
    const faqs = (site.faqs || []).filter((f) => f.q && f.a);
    return {
      ...home, data: { '/api/reviews': await read.reviews() }, text: textOf.home(site, vehicles, home),
      ld: [{ '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: site.businessName, inLanguage: 'en-IN', publisher: provider }, ...(faqs.length ? [faqLd(faqs)] : [])],
    };
  }
  const meta = pageMeta(path, site);
  if (path === '/fleet') return { ...meta, ld: [carList(meta.h1, vehicles)], text: textOf.fleet(site, vehicles, meta) };
  if (path === '/services') return { ...meta, text: textOf.services(site, meta) };
  if (path === '/about') return { ...meta, text: textOf.about(site, meta) };
  if (path === '/blog') { const posts = await read.posts(); return { ...meta, data: { '/api/posts': posts }, text: textOf.blog(posts, meta) }; }
  if (path === '/contact') return { ...meta, data: { '/api/reviews': await read.reviews() }, text: textOf.contact(site, meta) };
  if (path === '/concierge') return { ...meta, text: textOf.concierge(meta) };

  const routes = routeLinks(site).map((l) => ROUTES.find((r) => r.slug === l.slug));
  const areas = areaLinks(site).map((l) => AREAS.find((x) => x.slug === l.slug));
  if (path === '/routes' && routes.length) return {
    ...meta, text: textOf.routes(site, routes, meta),
    ld: [crumbs(['Routes', '/routes']), listLd(meta.h1, routes.map((r) => [r.h1, `${origin}/routes/${r.slug}`]))],
  };
  if (path === '/car-rental' && areas.length) return {
    ...meta, text: textOf.areas(site, areas, meta),
    ld: [crumbs(['Areas', '/car-rental']), listLd(meta.h1, areas.map((x) => [x.h1, `${origin}/car-rental/${x.slug}`]))],
  };
  if (meta && path !== '/routes' && path !== '/car-rental') return meta; // personal pages, kept out of results

  const r = routes.find((x) => path === `/routes/${x.slug}`);
  if (r) {
    const posts = await read.posts();
    return {
      ...landingMeta(r, site), data: { '/api/posts': posts }, text: textOf.route(site, vehicles, r, posts),
      ld: [
        crumbs(['Routes', '/routes'], [r.h1, path]),
        { '@type': 'Service', name: r.h1, serviceType: 'Car rental', description: r.answer, url: `${origin}${path}`, provider, areaServed: [{ '@type': 'City', name: 'Mumbai' }, { '@type': 'Place', name: r.place }] },
        faqLd(r.faqs),
      ],
    };
  }

  const area = areas.find((x) => path === `/car-rental/${x.slug}`);
  if (area) return {
    ...landingMeta(area, site), text: textOf.area(site, vehicles, area),
    ld: [
      crumbs(['Areas', '/car-rental'], [area.name, path]),
      { '@type': 'Service', name: area.h1, serviceType: 'Car rental', description: area.answer, url: `${origin}${path}`, provider, areaServed: { '@type': 'Place', name: area.name, containedInPlace: { '@type': 'City', name: 'Mumbai' } } },
      faqLd(area.faqs),
    ],
  };

  const type = typeLinks(site, vehicles).find((t) => path === `/cars/${t.slug}`);
  if (type) {
    const t = CAR_TYPES.find((x) => x.slug === type.slug);
    const cars = carsOfType(t.slug, vehicles);
    return {
      ...landingMeta(t, site), image: cars[0]?.images?.[0], text: textOf.carType(site, vehicles, t, cars),
      ld: [crumbs(['Fleet', '/fleet'], [t.name, path]), carList(t.h1, cars), faqLd(t.faqs)],
    };
  }

  if (LEGAL[path]) return { ...landingMeta(LEGAL[path], site), ld: [crumbs([LEGAL[path].title, path])], text: textOf.legal(site, LEGAL[path]) };

  const car = path.match(/^\/fleet\/([\w-]+)$/)?.[1];
  const v = car && await read.vehicle(car);
  if (v) return {
    ...vehicleMeta(v, site), image: v.images?.[0], data: { [`/api/vehicles/${v.slug}`]: v }, text: textOf.car(site, v),
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
  if (s) {
    const sMeta = serviceMeta(s, site);
    return {
      ...sMeta, text: textOf.service(site, vehicles, s, sMeta),
      ld: [
        crumbs(['Services', '/services'], [s.name, `/services/${s.slug}`]),
        { '@type': 'Service', name: s.name, serviceType: s.name, description: s.details || s.summary || undefined, url: `${origin}/services/${s.slug}`, provider, areaServed: areasOf(site) },
      ],
    };
  }

  const slug = path.match(/^\/blog\/([\w-]+)$/)?.[1];
  const p = slug && await read.post(slug);
  if (p) return {
    ...postMeta(p, site), image: p.cover, type: 'article', data: { [`/api/posts/${p.slug}`]: p }, text: textOf.post(p),
    ld: [
      crumbs(['Blog', '/blog'], [p.title, `/blog/${p.slug}`]),
      { '@type': 'BlogPosting', headline: p.title, description: p.excerpt, datePublished: p.publishedAt, image: previewImage(p.cover) || undefined, url: `${origin}/blog/${p.slug}`, author: provider, publisher: provider },
    ],
  };

  if (path === '/admin' || path.startsWith('/admin/')) return { fullTitle: `Admin | ${site.businessName}`, noindex: true };
  return { fullTitle: `Page not found | ${site.businessName}`, noindex: true, status: 404, text: '<h1>Page not found</h1>' };
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
  const city = cityOf(site);
  const business = {
    '@type': 'AutoRental', '@id': `${origin}/#business`, name, url: `${origin}/`,
    description: site.tagline || undefined,
    telephone: site.phone, email: site.email || undefined,
    address: site.address || city ? { '@type': 'PostalAddress', streetAddress: site.address || undefined, addressLocality: city || undefined, addressCountry: 'IN' } : undefined,
    areaServed: areasOf(site).length ? areasOf(site) : undefined,
    contactPoint: { '@type': 'ContactPoint', telephone: site.phone, contactType: 'customer service' },
    hasMap: site.mapUrl || undefined,
    logo: `${origin}/icon-512.png`,
    image: previewImage(cover) || undefined,
    sameAs: profiles(site.socials),
  };
  const ld = { '@context': 'https://schema.org', '@graph': [business, ...(page.ld || [])] };
  // Search Console's code, from Site details or (with no database yet) from the host's settings.
  const verification = site.googleSiteVerification || process.env.GOOGLE_SITE_VERIFICATION;

  const head = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    page.noindex ? '<meta name="robots" content="noindex" />' : `<link rel="canonical" href="${esc(url)}" />`,
    verification && `<meta name="google-site-verification" content="${esc(verification)}" />`,
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
  const body = page.text ? frame(page.text, site, vehicles) : '';

  res.status(page.status || 200)
    .set('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=86400')
    .type('html')
    .send(html.replace(/<!--seo-->[\s\S]*?<!--\/seo-->/, () => head).replace('<div id="root"></div>', () => `<div id="root">${body}</div>`));
}

// Google may fetch the public API while rendering pages, so only the admin API is off-limits.
// (API responses themselves carry X-Robots-Tag: noindex, so they never show up in results.)
// AI search tools are welcome too: being readable is how the business gets mentioned in their answers.
export function robots(req, res) {
  res.type('text/plain').send(`User-agent: *\nDisallow: /admin\nDisallow: /api/admin\n\nSitemap: ${siteOrigin(req)}/sitemap.xml\n`);
}

export async function sitemap(req, res) {
  const origin = siteOrigin(req);
  const [site, vehicles, cars, posts] = await Promise.all([read.site(), read.vehicles(), read.carDates(), read.posts()]);
  const day = (d) => d && new Date(d).toISOString().slice(0, 10);
  const routes = routeLinks(site);
  const areas = areaLinks(site);
  const urls = [
    ['/'], ['/fleet'], ['/services'], ['/concierge'], ['/about'], ['/blog'], ['/contact'],
    ...(site?.services || []).filter((s) => s.slug).map((s) => [`/services/${s.slug}`]),
    ...(routes.length ? [['/routes', CONTENT_UPDATED]] : []),
    ...routes.map((r) => [`/routes/${r.slug}`, CONTENT_UPDATED]),
    ...(areas.length ? [['/car-rental', CONTENT_UPDATED]] : []),
    ...areas.map((a) => [`/car-rental/${a.slug}`, CONTENT_UPDATED]),
    ...typeLinks(site, vehicles).map((t) => [`/cars/${t.slug}`, CONTENT_UPDATED]),
    ...cars.map((v) => [`/fleet/${v.slug}`, day(v.updatedAt)]),
    ...posts.map((p) => [`/blog/${p.slug}`, day(p.publishedAt)]),
    ['/privacy', CONTENT_UPDATED], ['/terms', CONTENT_UPDATED],
  ];
  res.type('application/xml').set('Cache-Control', 'public, max-age=0, s-maxage=3600').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
      urls.map(([loc, mod]) => `  <url><loc>${esc(origin + loc)}</loc>${mod ? `<lastmod>${mod}</lastmod>` : ''}</url>`).join('\n')
    }\n</urlset>\n`,
  );
}

// A plain summary for AI search tools (the llms.txt convention): who the business is, and where to read more.
export async function llms(req, res) {
  const origin = siteOrigin(req);
  const [site, vehicles, posts] = await Promise.all([read.site(), read.vehicles(), read.posts()]);
  if (!site) return res.status(503).type('text/plain').send('Not set up yet.\n');
  const links = (title, items) => (items.length ? `\n## ${title}\n\n${items.map(([label, url, note]) => `- [${label}](${origin}${url})${note ? `: ${note}` : ''}`).join('\n')}\n` : '');
  const routes = routeLinks(site).map((l) => ROUTES.find((r) => r.slug === l.slug));
  const areas = areaLinks(site).map((l) => AREAS.find((x) => x.slug === l.slug));
  const types = typeLinks(site, vehicles).map((l) => CAR_TYPES.find((t) => t.slug === l.slug));
  const facts = [
    `Phone and WhatsApp: ${site.phone}`,
    site.email && `Email: ${site.email}`,
    site.hours && `Hours: ${site.hours}`,
    cityOf(site) && `City: ${cityOf(site)}`,
    site.serviceAreas?.length && `Areas: ${site.serviceAreas.join(', ')}`,
  ].filter(Boolean).map((f) => `- ${f}`).join('\n');
  res.type('text/plain').set('Cache-Control', 'public, max-age=0, s-maxage=3600').send([
    `# ${site.businessName}\n\n> ${site.tagline}\n\nEnquiries go to WhatsApp, where the team confirms the car, availability, cost and conditions. The website shows no prices and takes no bookings or payments, so please do not quote prices or availability from it.\n\n${facts}\n`,
    links('Services', (site.services || []).map((s) => [s.name, `/services/${s.slug}`, s.summary])),
    links('Popular routes', routes.map((r) => [r.h1, `/routes/${r.slug}`, `${r.distance}, ${r.time.toLowerCase()}`])),
    links('Areas', areas.map((a) => [a.h1, `/car-rental/${a.slug}`])),
    links('Car types', types.map((t) => [t.h1, `/cars/${t.slug}`])),
    links('Cars', vehicles.map((v) => [v.name, `/fleet/${v.slug}`, v.summary])),
    links('Articles', posts.map((p) => [p.title, `/blog/${p.slug}`, p.excerpt])),
    links('About', [['About', '/about'], ['Contact', '/contact'], ['Privacy policy', '/privacy'], ['Website terms', '/terms']]),
  ].join(''));
}
