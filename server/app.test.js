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

  const note = await call('POST', `/api/admin/enquiries/${asha._id}/notes`, { text: 'Sent Creta and Innova rates.' }, cookie);
  assert.equal(note.status, 201);
  assert.equal(note.body.notes[0].text, 'Sent Creta and Innova rates.');
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
