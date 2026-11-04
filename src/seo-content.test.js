import { test } from 'node:test';
import assert from 'node:assert/strict';
import { landingMeta } from './seo.js';
import { AREAS, CAR_TYPES, LEGAL, ROUTES } from './seo-content.js';
import { areaLinks, carsOfType, routeLinks, typeLinks } from './seo-links.js';

const site = { businessName: 'Drive Ease', city: 'Mumbai', phone: '+91 88797 90490', email: 'hello@example.test', serviceAreas: AREAS.map((a) => a.name) };
const fleet = [
  { slug: 'small', category: 'Hatchback', seats: 5, transmission: 'Manual' },
  { slug: 'big', category: 'MUV', seats: 7, transmission: 'Automatic' },
];
const pages = [...ROUTES, ...AREAS, ...CAR_TYPES];
const words = (p) => [p.answer, ...p.paras, ...p.faqs.flatMap((f) => [f.q, f.a])].join(' ').split(/\s+/).length;

test('every link in the footer has a page of text behind it', () => {
  assert.deepEqual(routeLinks(site).map((r) => r.slug), ROUTES.map((r) => r.slug));
  assert.deepEqual(areaLinks(site).map((a) => [a.slug, a.name]), AREAS.map((a) => [a.slug, a.name]));
  const all = [{ category: 'Hatchback' }, { category: 'Sedan' }, { category: 'SUV' }, { seats: 7 }, { transmission: 'Automatic' }];
  assert.deepEqual(typeLinks(site, all).map((t) => t.slug), CAR_TYPES.map((t) => t.slug));
});

test('titles and descriptions fit in a Google result, and no two pages share one', () => {
  for (const p of pages) {
    const m = landingMeta(p, site);
    assert.ok(m.fullTitle.length <= 70, `"${m.fullTitle}" is ${m.fullTitle.length} characters`);
    assert.ok(m.description.length >= 90 && m.description.length <= 165, `${p.slug} description is ${m.description.length} characters`);
  }
  assert.equal(new Set(pages.map((p) => p.title)).size, pages.length);
  assert.equal(new Set(pages.map((p) => p.description)).size, pages.length);
  assert.equal(new Set(pages.map((p) => p.h1)).size, pages.length);
});

test('each page says something of its own: enough text, and no paragraph or question reused', () => {
  for (const p of pages) {
    assert.ok(words(p) >= 150, `${p.slug} has only ${words(p)} words`);
    assert.ok(p.answer.split(/\s+/).length <= 65, `${p.slug} should answer the question in a short first paragraph`);
    assert.ok(p.faqs.length >= 2, `${p.slug} needs questions people really ask`);
  }
  const blocks = pages.flatMap((p) => [p.answer, ...p.paras, ...p.faqs.map((f) => f.a)]);
  assert.equal(new Set(blocks).size, blocks.length);
});

test('nothing promises a price, a discount or that a car is free', () => {
  const copy = JSON.stringify(pages) + Object.values(LEGAL).map((d) => JSON.stringify(d.sections(site))).join('');
  assert.doesNotMatch(copy, /₹|\bRs\.?\s?\d|\bper (day|km)\b|\/day|\/km|\bdiscount|\bcheapest\b|\bguaranteed?\b|\bfree cancellation\b|\bverified\b/i);
});

test('route pages say that distances are estimates, using ranges or "about"', () => {
  for (const r of ROUTES) {
    assert.match(r.distance, /^About /, r.slug);
    assert.match(r.time, /^About /, r.slug);
    assert.ok(r.answer.includes('Mumbai') && r.answer.includes(r.place), r.slug);
  }
});

test('the text only goes live where it is true', () => {
  const pune = { ...site, city: 'Pune' };
  assert.deepEqual(routeLinks(pune), []);
  assert.deepEqual(areaLinks(pune), []);
  assert.deepEqual(typeLinks(pune, fleet), []);
  assert.deepEqual(areaLinks({ ...site, serviceAreas: ['Andheri', 'Thane'] }).map((a) => a.slug), ['andheri']); // Thane has no text yet
  assert.deepEqual(areaLinks({ ...site, serviceAreas: undefined }), []);
  assert.deepEqual(typeLinks(site, fleet).map((t) => t.slug), ['hatchback', '7-seater', 'automatic']); // no sedan or SUV in this fleet
  assert.deepEqual(typeLinks(site, undefined), []);
  assert.deepEqual(carsOfType('7-seater', fleet).map((v) => v.slug), ['big']);
  assert.deepEqual(carsOfType('unknown', fleet), []);
});

test('legal pages describe the real site: enquiries, no payments, how to get in touch', () => {
  const privacy = JSON.stringify(LEGAL['/privacy'].sections(site));
  assert.match(privacy, /no name, phone number, IP address/);
  assert.match(privacy, /\+91 88797 90490/);
  assert.match(privacy, /hello@example\.test/);
  assert.match(JSON.stringify(LEGAL['/terms'].sections(site)), /not a booking/);
  const noEmail = JSON.stringify(LEGAL['/privacy'].sections({ ...site, email: '' }));
  assert.doesNotMatch(noEmail, /undefined| or \./);
});
