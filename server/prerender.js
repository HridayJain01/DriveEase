import { marked } from 'marked';
import { cityOf } from '../src/seo.js';
import { areaLinks, routeLinks, typeLinks } from '../src/seo-links.js';
import { suggestedCars, tripForService } from '../src/concierge/match.js';

// Plain HTML of each page's text, placed in the page React later takes over. Google runs JavaScript,
// but many other readers (Bing at first, AI search tools, simple crawlers) only read this raw HTML.
// People with JavaScript never see it: index.html hides .ssr until React replaces it.

export const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const a = (href, label) => `<a href="${esc(href)}">${esc(label)}</a>`;
const list = (items) => (items.length ? `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>` : '');
const paras = (text = '') => text.split('\n\n').filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join('');
const section = (heading, html) => (html ? `<h2>${esc(heading)}</h2>${html}` : '');
const carFacts = (v) => [v.category, v.seats && `${v.seats} seats`, v.bags !== undefined && `${v.bags} bags`, v.fuel, v.transmission].filter(Boolean).join(', ');
const carItem = (v) => `${a(`/fleet/${v.slug}`, v.name)}: ${esc(carFacts(v))}. ${esc(v.summary || '')}`;
const faqs = (items = []) => section('Questions people ask', items.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join(''));
const whatsapp = (site, text) => `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(text)}`;
const ask = (site, text = site.whatsappMessage) => `<p>${a(whatsapp(site, text), 'Enquire on WhatsApp')} or call ${esc(site.phone)}.</p>`;
const routeList = (site) => list(routeLinks(site).map((r) => a(`/routes/${r.slug}`, `Mumbai to ${r.place}`)));
const areaList = (site) => list(areaLinks(site).map((x) => a(`/car-rental/${x.slug}`, x.name)));

const pageWith = (h1, body) => `<h1>${esc(h1)}</h1>${body}`;
const isoDay = (d) => { const t = new Date(d); return Number.isNaN(t.getTime()) ? '' : t.toISOString().slice(0, 10); };

export const textOf = {
  home: (site, vehicles, meta) => pageWith(meta.h1, [
    `<p>${esc(site.tagline)}</p>`,
    ask(site),
    section('Our services', list((site.services || []).map((s) => `${a(`/services/${s.slug}`, s.name)}: ${esc(s.summary)}`))),
    section('Our cars', list(vehicles.map(carItem))),
    section('Areas we cover', areaList(site)),
    section('Popular drives', routeList(site)),
    faqs(site.faqs),
  ].join('')),

  fleet: (site, vehicles, meta) => pageWith(meta.h1, `<p>${esc(meta.description)}</p>${list(vehicles.map(carItem))}${section('Browse by type', list(typeLinks(site, vehicles).map((t) => a(`/cars/${t.slug}`, t.name))))}`),

  car: (site, v) => pageWith(v.name, [
    `<p>${esc(carFacts(v))}</p>`, paras(v.description || v.summary),
    section('Features', list((v.features || []).map(esc))),
    ask(site, `${site.whatsappMessage}\n\nCar: ${v.name}`),
  ].join('')),

  services: (site, meta) => pageWith(meta.h1, list((site.services || []).map((s) => `${a(`/services/${s.slug}`, s.name)}: ${esc(s.summary)}`))),

  service: (site, vehicles, s, meta) => pageWith(meta.title, [
    `<p>${esc(s.summary)}</p>`, paras(s.details), ask(site, `${site.whatsappMessage}\n\nService: ${s.name}`),
    section(`Cars for ${s.name.toLowerCase()}`, list(suggestedCars(vehicles, tripForService(s.slug)).map(carItem))),
    s.slug === 'outstation' ? section('Popular routes', routeList(site)) : '',
  ].join('')),

  about: (site, meta) => pageWith(meta.h1, [
    paras(site.about?.story),
    section('What you can expect', (site.about?.promises || []).map((p) => `<h3>${esc(p.title)}</h3><p>${esc(p.text)}</p>`).join('')),
  ].join('')),

  blog: (posts, meta) => pageWith(meta.title, `<p>${esc(meta.description)}</p>${list(posts.map((p) => `${a(`/blog/${p.slug}`, p.title)}: ${esc(p.excerpt)}`))}`),

  // Post bodies are written by signed-in admins only, so their Markdown is trusted (as in Post.jsx).
  post: (p) => `<article><h1>${esc(p.title)}</h1><p><time datetime="${isoDay(p.publishedAt)}">${isoDay(p.publishedAt)}</time></p>${marked.parse(p.body || '')}</article>`,

  contact: (site, meta) => pageWith(meta.h1, list([
    `Phone and WhatsApp: ${esc(site.phone)}`,
    site.email && `Email: ${esc(site.email)}`,
    site.hours && `Hours: ${esc(site.hours)}`,
    site.address && `Address: ${esc(site.address)}`,
    a(whatsapp(site, site.whatsappMessage), 'Enquire on WhatsApp'),
  ].filter(Boolean))),

  concierge: (meta) => pageWith(meta.title, `<p>${esc(meta.description)}</p>`),

  routes: (site, routes, meta) => pageWith(meta.h1, `<p>${esc(meta.description)}</p>${list(routes.map((r) => `${a(`/routes/${r.slug}`, r.h1)}: ${esc(r.distance)}, ${esc(r.time.toLowerCase())}. ${esc(r.slogan)}`))}`),

  route: (site, vehicles, r, posts) => pageWith(r.h1, [
    `<p>${esc(r.answer)}</p>`,
    list([`Distance: ${esc(r.distance)}`, `Drive time: ${esc(r.time)}`, `Usual road: ${esc(r.road)}`]),
    '<p>Distances and times are approximate and depend on traffic and where you start.</p>',
    r.paras.map((p) => `<p>${esc(p)}</p>`).join(''),
    section('Good to know', list(r.tips.map(esc))),
    ask(site, `${site.whatsappMessage}\n\nTrip: Mumbai to ${r.place}`),
    section(`Cars for Mumbai to ${r.place}`, list(suggestedCars(vehicles, r.trip).map(carItem))),
    faqs(r.faqs),
    section('More drives from Mumbai', routeList(site)),
    section('Read more', list(posts.filter((p) => p.slug === 'weekend-drives-from-mumbai').map((p) => a(`/blog/${p.slug}`, p.title)))),
  ].join('')),

  areas: (site, areas, meta) => pageWith(meta.h1, `<p>${esc(meta.description)}</p>${list(areas.map((x) => `${a(`/car-rental/${x.slug}`, x.h1)}: ${esc(x.slogan)}`))}`),

  area: (site, vehicles, x) => pageWith(x.h1, [
    `<p>${esc(x.answer)}</p>`, x.paras.map((p) => `<p>${esc(p)}</p>`).join(''),
    section('Good for', list(x.goodFor.map(esc))),
    ask(site, `${site.whatsappMessage}\n\nPickup area: ${x.name}`),
    section('Cars to consider', list(suggestedCars(vehicles, x.trip).map(carItem))),
    faqs(x.faqs),
    section('Other areas', areaList(site)),
    section('Popular drives', routeList(site)),
  ].join('')),

  carType: (site, vehicles, t, cars) => pageWith(t.h1, [
    `<p>${esc(t.answer)}</p>`, t.paras.map((p) => `<p>${esc(p)}</p>`).join(''),
    section(`Our ${t.name.toLowerCase()}`, list(cars.map(carItem))),
    ask(site, `${site.whatsappMessage}\n\nCar type: ${t.name}`),
    faqs(t.faqs),
    section('Other car types', list(typeLinks(site, vehicles).filter((x) => x.slug !== t.slug).map((x) => a(`/cars/${x.slug}`, x.name)))),
  ].join('')),

  legal: (site, doc) => pageWith(doc.title, `<p>Last updated: ${esc(doc.updated)}</p>${doc.sections(site).map((s) => section(s.h, s.p.map((p) => `<p>${esc(p)}</p>`).join(''))).join('')}`),
};

// Every page gets the same way around the site, as links, so simple crawlers can follow them.
export function frame(body, site, vehicles) {
  const nav = [['/', 'Home'], ['/fleet', 'Fleet'], ['/services', 'Services'], ['/routes', 'Routes'], ['/car-rental', 'Areas'], ['/concierge', 'Concierge'], ['/about', 'About'], ['/blog', 'Journal'], ['/contact', 'Contact']]
    .filter(([to]) => (to === '/routes' ? routeLinks(site).length : to === '/car-rental' ? areaLinks(site).length : true));
  return `<div class="ssr"><nav aria-label="Main">${nav.map(([to, label]) => a(to, label)).join(' ')}</nav><main>${body}</main><footer>${[
    section('Car types', list(typeLinks(site, vehicles).map((t) => a(`/cars/${t.slug}`, t.name)))),
    section('Contact', `<p>${esc([site.businessName, cityOf(site)].filter(Boolean).join(', '))}. Phone and WhatsApp: ${esc(site.phone)}${site.email ? `. Email: ${esc(site.email)}` : ''}.</p>`),
    `<p>${a('/privacy', 'Privacy')} ${a('/terms', 'Terms')}</p>`,
  ].join('')}</footer></div>`;
}
