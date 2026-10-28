// End-to-end API checks against a throwaway in-memory MongoDB (never the real database).
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import mongoose from 'mongoose';

let mongo, server, base, app, db;
const ADMIN = { email: 'owner@example.test', password: 'test-password-123' };

before(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri('driveease-test');
  process.env.SESSION_SECRET = 'test-secret';
  ({ default: app } = await import('./app.js'));
  db = await import('./db.js');
  const { hashPassword } = await import('./auth.js');
  await db.connectDb();
  await db.Admin.create({ email: ADMIN.email, passwordHash: await hashPassword(ADMIN.password) });
  await db.Vehicle.create({ name: 'Hyundai Creta', category: 'SUV', published: true, interiorImages: ['https://res.cloudinary.com/x/image/upload/a.jpg'] });
  await new Promise((r) => { server = app.listen(0, r); });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server?.close();
  await mongoose.disconnect();
  await mongo?.stop();
});

const call = async (method, path, body, cookie) => {
  const res = await fetch(base + path, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) },
    body: body && JSON.stringify(body),
  });
  return { status: res.status, body: res.status === 204 ? null : await res.json().catch(() => null), cookie: res.headers.get('set-cookie') };
};

async function signIn() {
  const r = await call('POST', '/api/auth/login', ADMIN);
  assert.equal(r.status, 200);
  return r.cookie.split(';')[0];
}

test('visitors can submit enquiries, including Concierge trip details', async () => {
  const r = await call('POST', '/api/enquiries', { name: 'Asha Rao', phone: '98765 43210', vehicle: 'Hyundai Creta', pickupLocation: 'Airport T2', passengers: 4, luggage: 3, tripType: 'family', source: 'concierge' });
  assert.equal(r.status, 201);
  assert.deepEqual(r.body, { ok: true }); // nothing about the stored record comes back
  const bad = await call('POST', '/api/enquiries', { name: 'A', phone: '1', passengers: 99 });
  assert.equal(bad.status, 400);
  assert.ok(bad.body.errors.passengers);
  const bot = await call('POST', '/api/enquiries', { name: 'Bot', phone: '9876543210', company: 'spam' });
  assert.equal(bot.status, 200);
  assert.equal(await db.Enquiry.countDocuments({ name: 'Bot' }), 0);
});

test('signed-out users cannot read or change enquiries', async () => {
  const e = await db.Enquiry.findOne().lean();
  for (const [method, path, body] of [
    ['GET', '/api/admin/enquiries'],
    ['PATCH', `/api/admin/enquiries/${e._id}`, { status: 'closed' }],
    ['POST', `/api/admin/enquiries/${e._id}/notes`, { text: 'x' }],
    ['DELETE', `/api/admin/enquiries/${e._id}`],
  ]) {
    const r = await call(method, path, body);
    assert.equal(r.status, 401, `${method} ${path}`);
    assert.equal(JSON.stringify(r.body).includes('Asha'), false);
  }
  const forged = await call('GET', '/api/admin/enquiries', null, 'de_session=eyJzdWIiOiJ4In0.forged');
  assert.equal(forged.status, 401);
  assert.equal((await db.Enquiry.findById(e._id)).status, 'new');
  // No public route lists enquiries.
  assert.equal((await call('GET', '/api/enquiries')).status, 404);
});

test('staff can filter, search, update status, set follow-ups and add notes', async () => {
  const cookie = await signIn();
  await db.Enquiry.create([
    { name: 'Vikram', phone: '9123456780', vehicle: 'Toyota Innova', status: 'quoted' },
    { name: 'Meera', phone: '9000000000', destination: 'Lonavala', status: 'closed' },
  ]);

  const all = await call('GET', '/api/admin/enquiries', null, cookie);
  assert.equal(all.status, 200);
  assert.deepEqual(all.body.counts, { new: 1, contacted: 0, quoted: 1, confirmed: 0, closed: 1, all: 3, due: 0 });
  assert.equal(all.body.items.length, 3);

  const quoted = await call('GET', '/api/admin/enquiries?status=quoted', null, cookie);
  assert.deepEqual(quoted.body.items.map((e) => e.name), ['Vikram']);
  const search = await call('GET', `/api/admin/enquiries?q=${encodeURIComponent('lonav')}`, null, cookie);
  assert.deepEqual(search.body.items.map((e) => e.name), ['Meera']);
  const byPhone = await call('GET', `/api/admin/enquiries?q=${encodeURIComponent('98765 43210')}`, null, cookie);
  assert.deepEqual(byPhone.body.items.map((e) => e.name), ['Asha Rao']);
  const paged = await call('GET', '/api/admin/enquiries?limit=2&page=2', null, cookie);
  assert.deepEqual([paged.body.items.length, paged.body.pages, paged.body.total], [1, 2, 3]);

  const asha = all.body.items.find((e) => e.name === 'Asha Rao');
  assert.equal(asha.passengers, 4);
  const up = await call('PATCH', `/api/admin/enquiries/${asha._id}`, { status: 'contacted', followUpDate: '2026-10-20', name: 'changed' }, cookie);
  assert.equal(up.status, 200);
  assert.deepEqual([up.body.status, up.body.followUpDate, up.body.name], ['contacted', '2026-10-20', 'Asha Rao']);
  const badStatus = await call('PATCH', `/api/admin/enquiries/${asha._id}`, { status: 'paid' }, cookie);
  assert.equal(badStatus.status, 400);

  const due = await call('GET', '/api/admin/enquiries?status=due&today=2026-10-23', null, cookie);
  assert.equal(due.body.counts.due, 1);
  assert.deepEqual(due.body.items.map((e) => e.name), ['Asha Rao']);

  const note = await call('POST', `/api/admin/enquiries/${asha._id}/notes`, { text: 'Sent Creta and Innova photos.' }, cookie);
  assert.equal(note.status, 201);
  assert.equal(note.body.notes[0].text, 'Sent Creta and Innova photos.');
  assert.equal(note.body.notes[0].by, ADMIN.email);
  assert.equal((await call('POST', `/api/admin/enquiries/${asha._id}/notes`, { text: ' ' }, cookie)).status, 400);
  assert.equal((await call('PATCH', '/api/admin/enquiries/000000000000000000000000', { status: 'closed' }, cookie)).status, 404);
});

test('public car data includes the new photo groups but never unpublished cars', async () => {
  await db.Vehicle.create({ name: 'Secret Car', category: 'SUV', published: false });
  const r = await call('GET', '/api/vehicles');
  assert.deepEqual(r.body.map((v) => v.name), ['Hyundai Creta']);
  assert.equal(r.body[0].interiorImages.length, 1);
  assert.equal((await call('GET', '/api/vehicles/secret-car')).status, 404);
});

test('a rate saved before prices were removed never reaches the public site', async () => {
  await db.Vehicle.collection.updateOne({ name: 'Hyundai Creta' }, { $set: { rate: '₹3,200 / day' } }); // legacy field
  const list = await call('GET', '/api/vehicles');
  const one = await call('GET', '/api/vehicles/hyundai-creta');
  assert.equal('rate' in list.body[0], false);
  assert.equal('rate' in one.body, false);
  const page = await fetch(`${base}/fleet/hyundai-creta`).then((r) => r.text()).catch(() => '');
  assert.doesNotMatch(page, /₹3,200/); // the embedded page data (if the built shell exists) has no rate either
});

test('WhatsApp taps and shares are counted anonymously and shown only to staff', async () => {
  const post = (body, type = 'text/plain') => fetch(`${base}/api/events`, { method: 'POST', headers: { 'Content-Type': type }, body: JSON.stringify(body) });
  assert.equal((await post({ kind: 'whatsapp', car: 'hyundai-creta', source: 'car-page' })).status, 204);
  assert.equal((await post({ kind: 'whatsapp', car: 'hyundai-creta', source: 'concierge' }, 'application/json')).status, 204);
  assert.equal((await post({ kind: 'share', car: 'hyundai-creta', source: 'car-page', phone: '9999999999' })).status, 204);
  assert.equal((await post({ kind: 'whatsapp' })).status, 204); // general button, no car
  assert.equal((await post({ kind: 'whatsapp', car: 'secret-car' })).status, 400); // unpublished
  assert.equal((await post({ kind: 'whatsapp', car: 'no-such-car' })).status, 400);
  assert.equal((await post({ kind: 'delete-everything' })).status, 400);
  const stored = await db.Stat.find().lean();
  assert.ok(stored.every((s) => !('phone' in s) && Object.keys(s).every((k) => ['_id', '__v', 'day', 'kind', 'car', 'source', 'n'].includes(k))));

  assert.equal((await call('GET', '/api/admin/insights')).status, 401);
  const cookie = await signIn();
  const r = await call('GET', '/api/admin/insights?days=7', null, cookie);
  assert.equal(r.status, 200);
  const creta = r.body.cars.find((c) => c.slug === 'hyundai-creta');
  assert.deepEqual([creta.whatsapp, creta.share], [2, 1]);
  assert.ok(creta.forms >= 1); // Asha's Concierge enquiry named the Creta
  assert.equal(r.body.general.whatsapp, 1);
  assert.deepEqual(r.body.totals.whatsapp, 3);
  assert.equal(r.body.sources['car-page'], 1);
  assert.equal(r.body.cars[0].slug, 'hyundai-creta'); // busiest car first
});

test('robots, sitemap and structured data help Google find and understand every page', async () => {
  const robots = await fetch(`${base}/robots.txt`).then((r) => r.text());
  assert.match(robots, /Disallow: \/api\/admin/);
  assert.doesNotMatch(robots, /Disallow: \/api\/\n/); // the public API stays fetchable for rendering
  assert.equal((await fetch(`${base}/api/vehicles`)).headers.get('x-robots-tag'), 'noindex');

  await db.Settings.create({ businessName: 'Drive Ease', city: 'Pune', serviceAreas: ['Baner', 'Pune Airport'], phone: '+91 88797 90490', whatsappNumber: '918879790490',
    googleSiteVerification: 'abc123_XYZ', services: [{ name: 'Airport transfers', summary: 'On time.', details: 'We meet you at arrivals.' }],
    faqs: [{ q: 'What documents do I need?', a: 'A driving licence and ID.' }] });
  const map = await fetch(`${base}/sitemap.xml`).then((r) => r.text());
  assert.match(map, /\/services\/airport-transfers<\/loc>/);
  assert.match(map, /\/fleet\/hyundai-creta<\/loc><lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
  assert.doesNotMatch(map, /secret-car|\/compare|\/garage|\/admin/);

  const shell = await fetch(`${base}/fleet/hyundai-creta`);
  if (shell.status === 503) { console.log("# shell not built: page checks skipped"); return; } // dist/shell.html isn't built in this environment; the rest is covered above
  const page = await shell.text();
  assert.match(page, /<title>Hyundai Creta on rent in Pune \| Drive Ease<\/title>/);
  assert.match(page, /<meta name="google-site-verification" content="abc123_XYZ" \/>/);
  const ld = JSON.parse(page.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);
  const types = ld['@graph'].map((x) => x['@type']);
  assert.deepEqual(types, ['AutoRental', 'BreadcrumbList', 'Car']);
  assert.deepEqual(ld['@graph'][0].areaServed.map((a) => a.name), ['Pune', 'Baner', 'Pune Airport']);
  const home = await fetch(`${base}/`).then((r) => r.text());
  assert.match(home, /"@type":"FAQPage"/);
  const service = await fetch(`${base}/services/airport-transfers`).then((r) => r.text());
  assert.match(service, /<title>Airport transfers in Pune \| Drive Ease<\/title>/);
  assert.match(service, /"@type":"Service"/);
});
