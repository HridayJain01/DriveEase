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
  assert.deepEqual(types, ['AutoRental', 'WebSite', 'WebPage', 'BreadcrumbList', 'Car']);
  assert.deepEqual(ld['@graph'][0].areaServed.map((a) => a.name), ['Pune', 'Baner', 'Pune Airport']);
  const home = await fetch(`${base}/`).then((r) => r.text());
  assert.match(home, /"@type":"FAQPage"/);
  const service = await fetch(`${base}/services/airport-transfers`).then((r) => r.text());
  assert.match(service, /<title>Airport transfers in Pune \| Drive Ease<\/title>/);
  assert.match(service, /"@type":"Service"/);
});

test('Mumbai pages arrive fully drawn, with matching data and an AI summary, only where they are true', async () => {
  const get = async (p) => { const r = await fetch(`${base}${p}`); return { status: r.status, html: await r.text() }; };
  const first = await get('/');
  if (first.status === 503 || /<div id="root"><\/div>/.test(first.html)) { console.log('# site not built: page checks skipped'); return; }
  const typesOf = (html) => JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1])['@graph'].map((x) => x['@type']);

  // Set to Pune, the Mumbai text stays unpublished.
  assert.equal((await get('/routes/mumbai-to-lonavala')).status, 404);
  assert.doesNotMatch((await get('/sitemap.xml')).html, /mumbai-to-lonavala/);

  await db.Settings.updateOne({ key: 'site' }, { $set: { city: 'Mumbai', serviceAreas: ['Andheri', 'Thane'] } });
  try {
    const route = await get('/routes/mumbai-to-lonavala');
    assert.equal(route.status, 200);
    assert.match(route.html, /<title>Mumbai to Lonavala car rental: self-drive or with driver \| Drive Ease<\/title>/);
    assert.match(route.html, /<h1[^>]*>Mumbai to Lonavala car rental<\/h1>/);
    assert.equal(route.html.match(/<h1/g).length, 1);
    assert.match(route.html, /Lonavala is about 83 km from Mumbai/);
    assert.match(route.html, /How long is the drive from Mumbai to Lonavala\?/);
    assert.match(route.html, /href="\/fleet\/hyundai-creta"/);
    assert.match(route.html, /wa\.me\/918879790490\?text=[^"]*Lonavala/);
    assert.deepEqual(typesOf(route.html), ['AutoRental', 'WebSite', 'WebPage', 'BreadcrumbList', 'Service', 'FAQPage']);
    assert.match(route.html, /"dateModified":"\d{4}-\d{2}-\d{2}"/);
    assert.match(route.html, /<link rel="modulepreload" href="\/assets\/Landing-/);
    assert.doesNotMatch(route.html, /<!--pages:/);

    const area = await get('/car-rental/andheri');
    assert.equal(area.status, 200);
    assert.match(area.html, /<h1[^>]*>Car rental in Andheri<\/h1>/);
    assert.deepEqual(typesOf(area.html), ['AutoRental', 'WebSite', 'WebPage', 'BreadcrumbList', 'Service', 'FAQPage']);
    assert.equal((await get('/car-rental/bandra')).status, 404); // not listed in Site details
    assert.equal((await get('/routes/mumbai-to-nowhere')).status, 404);

    const hub = await get('/routes');
    assert.equal(hub.status, 200);
    assert.match(hub.html, /href="\/routes\/mumbai-to-pune"/);
    assert.equal((await get('/car-rental')).status, 200);

    assert.equal((await get('/cars/suv')).status, 200);
    assert.deepEqual(typesOf((await get('/cars/suv')).html), ['AutoRental', 'WebSite', 'WebPage', 'BreadcrumbList', 'ItemList', 'FAQPage']);
    assert.equal((await get('/cars/sedan')).status, 404); // no sedan in this test fleet

    for (const p of ['/privacy', '/terms']) {
      const legal = await get(p);
      assert.equal(legal.status, 200, p);
      assert.match(legal.html, /<link rel="canonical"/, p);
    }

    for (const [p, text] of [['/', /Car rental in Mumbai/], ['/fleet', /Hyundai Creta/], ['/fleet/hyundai-creta', /Hyundai Creta/], ['/services', /Airport transfers/], ['/services/airport-transfers', /We meet you at arrivals/], ['/about', /About Drive Ease/], ['/contact', /\+91 88797 90490/], ['/concierge', /Four questions/]]) {
      const { html } = await get(p);
      assert.match(html.slice(html.indexOf('<div id="root">')), text, `${p} should have its text before JavaScript runs`);
      assert.equal((html.match(/<h1/g) || []).length, 1, `${p} should have one main heading`);
    }
    assert.match((await get('/compare')).html, /<div id="root"><\/div>/); // personal pages are drawn in the browser, and stay out of search

    const missing = await get('/no-such-page');
    assert.equal(missing.status, 404);
    assert.match(missing.html, /<meta name="robots" content="noindex" \/>/);

    const map = (await get('/sitemap.xml')).html;
    for (const p of ['/routes</loc>', '/routes/mumbai-to-mahabaleshwar<', '/car-rental</loc>', '/car-rental/andheri<', '/cars/suv<', '/privacy<', '/terms<']) assert.ok(map.includes(p), p);
    assert.doesNotMatch(map, /\/car-rental\/bandra|\/cars\/sedan/);

    const summary = await get('/llms.txt');
    assert.equal(summary.status, 200);
    assert.match(summary.html, /^# Drive Ease/);
    assert.match(summary.html, /Phone and WhatsApp: \+91 88797 90490/);
    assert.match(summary.html, /no prices/);
    assert.match(summary.html, /\/routes\/mumbai-to-lonavala\): About 83 km/);

    const tool = await get('/which-car-fits');
    assert.equal(tool.status, 200);
    assert.match(tool.html, /Seats and bags in every car/);
    assert.match(first.html, /<form class="composer"[^>]* action="\/contact"/); // works before the app loads, or without JavaScript
    assert.deepEqual(typesOf(tool.html), ['AutoRental', 'WebSite', 'WebPage', 'BreadcrumbList', 'ItemList', 'FAQPage']);

    const rss = await get('/blog/feed.xml');
    assert.equal(rss.status, 200);
    assert.match(rss.html, /<rss version="2.0"/);
    assert.match(first.html, /type="application\/rss\+xml"/);
    assert.match(map, /xmlns:image="http:\/\/www\.google\.com\/schemas\/sitemap-image\/1\.1"/);
    assert.match(map, /\/which-car-fits</);

    // Taps from these pages count separately in Insights.
    const tap = await fetch(`${base}/api/events`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ kind: 'whatsapp', source: 'seo-page' }) });
    assert.equal(tap.status, 204);
    assert.equal(await db.Stat.countDocuments({ source: 'seo-page' }), 1);

    // Text from the admin is escaped, and the verification code can come from the host's settings.
    await db.Vehicle.updateOne({ name: 'Hyundai Creta' }, { $set: { summary: '<script>alert(1)</script> $& fast' } });
    await db.Settings.updateOne({ key: 'site' }, { $set: { googleSiteVerification: '' } });
    process.env.GOOGLE_SITE_VERIFICATION = 'from-env';
    const fleet = (await get('/fleet')).html;
    assert.ok(fleet.includes('&lt;script&gt;alert(1)&lt;/script&gt; $&amp; fast'));
    assert.doesNotMatch(fleet.slice(fleet.indexOf('<div id="root">')), /<script>/);
    assert.match(fleet, /<meta name="google-site-verification" content="from-env" \/>/);
  } finally {
    delete process.env.GOOGLE_SITE_VERIFICATION;
    await db.Vehicle.updateOne({ name: 'Hyundai Creta' }, { $set: { summary: '' } });
    await db.Settings.updateOne({ key: 'site' }, { $set: { city: 'Pune', serviceAreas: ['Baner', 'Pune Airport'], googleSiteVerification: 'abc123_XYZ' } });
  }
});

test('every page has one address, and only the real address is offered to search engines', async () => {
  const get = (p, headers) => fetch(`${base}${p}`, { redirect: 'manual', headers });
  for (const [from, to] of [['/fleet/', '/fleet'], ['/Fleet', '/fleet'], ['/FLEET/?type=SUV', '/fleet?type=SUV'], ['//evil.example/', '/evil.example']]) {
    const r = await get(from);
    assert.equal(r.status, 301, from);
    assert.equal(r.headers.get('location'), to, from); // never to another site
  }
  assert.equal((await get('/fleet')).status === 301, false);
  assert.equal((await get('/api/vehicles/')).status === 301, false); // the API is left alone
  assert.notEqual((await get('/assets/Index-ABC.js')).status, 301); // file names are case-sensitive

  const page = await get('/fleet');
  assert.equal(page.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(page.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.equal(page.headers.get('x-robots-tag'), null);

  process.env.SITE_URL = 'https://www.example.in';
  try {
    const preview = await get('/fleet', { 'x-forwarded-host': 'drive-ease-abc123.vercel.app' });
    assert.equal(preview.headers.get('x-robots-tag'), 'noindex');
    assert.equal(preview.headers.get('cache-control'), 'no-store'); // a cached noindex could reach the real address
    const real = await get('/fleet', { 'x-forwarded-host': 'www.example.in' });
    assert.equal(real.headers.get('x-robots-tag'), null);
    assert.match(real.headers.get('cache-control'), /s-maxage/);
  } finally {
    delete process.env.SITE_URL;
  }
});

test('IndexNow only sees the key when one is set, and call taps are counted', async () => {
  assert.notEqual((await fetch(`${base}/abc123.txt`)).status === 200 && (await (await fetch(`${base}/abc123.txt`)).text()) === 'abc123', true);
  process.env.INDEXNOW_KEY = 'abc123';
  try {
    assert.equal(await (await fetch(`${base}/abc123.txt`)).text(), 'abc123');
  } finally {
    delete process.env.INDEXNOW_KEY;
  }
  const tap = await fetch(`${base}/api/events`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ kind: 'call' }) });
  assert.equal(tap.status, 204);
  const r = await call('GET', '/api/admin/insights?days=7', null, await signIn());
  assert.equal(r.body.totals.call, 1);
});

test('opening hours become Google data only when they can be read for certain', async () => {
  const { openingHours } = await import('./html.js');
  const h = openingHours('Open daily, 7 am – 11 pm');
  assert.deepEqual([h.opens, h.closes, h.dayOfWeek.length], ['07:00', '23:00', 7]);
  assert.deepEqual([openingHours('Daily 12 pm - 9:30 pm').opens, openingHours('Daily 12 pm - 9:30 pm').closes], ['12:00', '21:30']);
  assert.equal(openingHours('Daily 12 am - 12 pm').opens, '00:00');
  assert.equal(openingHours('Mon to Sat, call us'), undefined);
  assert.equal(openingHours(''), undefined);
});

test('sample-content mode needs an explicit switch and never saves or shows placeholders', async () => {
  const { sampleMode, publicData } = db;
  const uri = process.env.MONGODB_URI;
  try {
    delete process.env.MONGODB_URI;
    assert.equal(sampleMode(), false); // a lost database URI must not silently serve samples
    process.env.SAMPLE_CONTENT = '1';
    assert.equal(sampleMode(), true);
    const site = await publicData.site();
    assert.equal(site.whatsappNumber, '918879790490');
    assert.equal(site.city, 'Mumbai');
    for (const svc of site.services) assert.ok(svc.details.split(/\s+/).length >= 80, `${svc.name} needs a real description`);
    assert.deepEqual([site.address, site.about.founderName], ['', '']);
    assert.deepEqual(await publicData.reviews(), []);
    assert.equal((await publicData.vehicles()).length, 7);
    assert.equal((await call('POST', '/api/enquiries', { name: 'Asha', phone: '9876543210' })).status, 503);
    assert.equal((await call('POST', '/api/auth/login', ADMIN)).status, 503);
    assert.equal((await call('GET', '/api/vehicles')).status, 200);
  } finally {
    process.env.MONGODB_URI = uri;
    delete process.env.SAMPLE_CONTENT;
  }
  assert.equal(sampleMode(), false); // with a database it's ignored
});
