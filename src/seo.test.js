import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cityOf, pageMeta, serviceMeta, vehicleMeta } from './seo.js';

const site = { businessName: 'Drive Ease', city: 'Pune', phone: '+91 88797 90490' };
const placeholder = { businessName: 'Drive Ease', city: 'Your city' };

test('titles and headings target "car rental in <city>"', () => {
  assert.equal(pageMeta('/', site).fullTitle, 'Car rental in Pune: self-drive & with driver | Drive Ease');
  assert.equal(pageMeta('/', site).h1, 'Car rental in Pune');
  assert.equal(pageMeta('/fleet', site).fullTitle, 'Cars for rent in Pune: hatchbacks, SUVs & 7-seaters | Drive Ease');
  assert.match(pageMeta('/contact', site).description, /\+91 88797 90490/);
  assert.equal(pageMeta('/compare', site).noindex, true);
  assert.equal(pageMeta('/nope', site), undefined);
});

test('the sample "Your city" never reaches Google', () => {
  assert.equal(cityOf(placeholder), '');
  assert.equal(pageMeta('/', placeholder).h1, 'Car rental');
  for (const path of ['/', '/fleet', '/services', '/about', '/contact', '/blog', '/concierge']) {
    const m = pageMeta(path, placeholder);
    assert.doesNotMatch(`${m.fullTitle} ${m.description}`, /your city|undefined/i, path);
  }
});

test('titles stay within what Google shows and descriptions are useful', () => {
  for (const path of ['/', '/fleet', '/services', '/about', '/contact', '/blog', '/concierge']) {
    const m = pageMeta(path, site);
    assert.ok(m.fullTitle.length <= 70, `${path} title is ${m.fullTitle.length} chars`);
    assert.ok(m.description.length >= 70 && m.description.length <= 165, `${path} description is ${m.description.length} chars`);
  }
});

test('car and service pages name the car or service and the city, and survive blank specs', () => {
  const full = vehicleMeta({ name: 'Hyundai Creta', category: 'SUV', seats: 5, bags: 3, fuel: 'Diesel', transmission: 'Automatic', summary: 'Comfortable.' }, site);
  assert.equal(full.fullTitle, 'Hyundai Creta on rent in Pune | Drive Ease');
  assert.equal(full.description, 'Rent the Hyundai Creta in Pune: suv, 5 seats, 3 bags, diesel automatic. Comfortable. Enquire on WhatsApp.');
  const bare = vehicleMeta({ name: 'Mystery', category: '', fuel: '', transmission: '', summary: '' }, placeholder); // used to throw
  assert.equal(bare.description, 'Rent the Mystery. Enquire on WhatsApp.');
  assert.equal(serviceMeta({ name: 'Airport transfers', summary: 'On time.' }, site).fullTitle, 'Airport transfers in Pune | Drive Ease');
  assert.ok(vehicleMeta({ name: 'X', summary: 'y'.repeat(400) }, site).description.length <= 160);
});
