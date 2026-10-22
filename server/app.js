import express from 'express';
import { Admin, connectDb, Enquiry, LoginAttempt, Post, publicData as read, Review, Settings, Vehicle } from './db.js';
import { renderPage, robots, sitemap } from './html.js';
import { clearSession, hashPassword, readSession, setSession, verifyPassword } from './auth.js';
import { validateEnquiry } from './enquiry.js';
import { cloudinaryConfig, signParams } from './cloudinary.js';

const app = express();
app.use(express.json({ limit: '200kb' }));
app.use(async (req, res, next) => { await connectDb(); next(); });

/* ---------- Public ---------- */
// Visitors' browsers revalidate every time; Vercel's CDN may serve a copy up to 10 s old while it refreshes.
const shared = (res) => res.set('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=300');
const found = (res, doc, what) => (doc ? shared(res).json(doc) : res.status(404).json({ error: `${what} not found` }));

app.get('/api/site', async (req, res) => {
  const site = await read.site();
  site ? shared(res).json(site) : res.status(503).json({ error: 'Site details are not set up yet. Run npm run seed.' });
});
app.get('/api/vehicles', async (req, res) => shared(res).json(await read.vehicles()));
app.get('/api/vehicles/:slug', async (req, res) => found(res, await read.vehicle(req.params.slug), 'Vehicle'));
app.get('/api/posts', async (req, res) => shared(res).json(await read.posts()));
app.get('/api/posts/:slug', async (req, res) => found(res, await read.post(req.params.slug), 'Post'));
app.get('/api/reviews', async (req, res) => shared(res).json(await read.reviews()));

app.post('/api/enquiries', async (req, res) => {
  if (req.body?.company) return res.json({ ok: true }); // honeypot: bots fill hidden fields
  const { data, errors } = validateEnquiry(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ errors });
  await Enquiry.create(data);
  res.status(201).json({ ok: true });
});

/* ---------- Auth ---------- */
const clientIp = (req) => req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
let dummyHash; // compared against when the email is unknown, so timing doesn't reveal which emails exist

app.post('/api/auth/login', async (req, res) => {
  const ip = clientIp(req);
  if (await LoginAttempt.countDocuments({ ip }) >= 10)
    return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
  const admin = await Admin.findOne({ email: String(req.body?.email || '').toLowerCase().trim() });
  dummyHash ??= await hashPassword('not-a-real-password');
  const ok = await verifyPassword(String(req.body?.password || ''), admin?.passwordHash || dummyHash);
  if (!admin || !ok) {
    await LoginAttempt.create({ ip });
    return res.status(401).json({ error: 'That email and password don’t match.' });
  }
  setSession(res, admin._id);
  res.json({ email: admin.email });
});

app.post('/api/auth/logout', (req, res) => { clearSession(res); res.sendStatus(204); });

async function requireAdmin(req, res, next) {
  const session = readSession(req);
  const admin = session && await Admin.findById(session.sub).catch(() => null);
  if (!admin) return res.status(401).json({ error: 'Sign in to continue.' });
  req.admin = admin;
  next();
}

app.get('/api/auth/me', requireAdmin, (req, res) => res.json({ email: req.admin.email }));

app.post('/api/auth/password', requireAdmin, async (req, res) => {
  const { current = '', next: nextPassword = '' } = req.body || {};
  if (!(await verifyPassword(String(current), req.admin.passwordHash)))
    return res.status(400).json({ errors: { current: 'Current password is incorrect.' } });
  if (String(nextPassword).length < 10)
    return res.status(400).json({ errors: { next: 'Use at least 10 characters.' } });
  req.admin.passwordHash = await hashPassword(String(nextPassword));
  await req.admin.save();
  res.json({ ok: true });
});

/* ---------- Admin ---------- */
const admin = express.Router();
admin.use(requireAdmin);
const editable = ({ _id, __v, key, createdAt, updatedAt, ...rest }) => rest;

function crud(Model, sort) {
  const r = express.Router();
  r.get('/', async (req, res) => res.json(await Model.find().sort(sort).lean()));
  r.post('/', async (req, res) => res.status(201).json(await Model.create(editable(req.body || {}))));
  r.get('/:id', async (req, res) => {
    const doc = await Model.findById(req.params.id).lean();
    doc ? res.json(doc) : res.status(404).json({ error: 'Not found' });
  });
  r.put('/:id', async (req, res) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    doc.set(editable(req.body || {}));
    res.json(await doc.save());
  });
  r.delete('/:id', async (req, res) => { await Model.findByIdAndDelete(req.params.id); res.sendStatus(204); });
  return r;
}

admin.use('/vehicles', crud(Vehicle, { order: 1, createdAt: 1 }));
admin.use('/posts', crud(Post, { publishedAt: -1 }));
admin.use('/reviews', crud(Review, { order: 1, createdAt: -1 }));

admin.get('/settings', async (req, res) => res.json(await Settings.findOne({ key: 'site' }).lean()));
admin.put('/settings', async (req, res) => {
  const doc = (await Settings.findOne({ key: 'site' })) || new Settings();
  doc.set(editable(req.body || {}));
  res.json(await doc.save());
});

admin.get('/enquiries', async (req, res) => res.json(await Enquiry.find().sort({ createdAt: -1 }).limit(500).lean()));
admin.patch('/enquiries/:id', async (req, res) => {
  const doc = await Enquiry.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  doc.status = req.body?.status;
  res.json(await doc.save());
});
admin.delete('/enquiries/:id', async (req, res) => { await Enquiry.findByIdAndDelete(req.params.id); res.sendStatus(204); });

// Photos upload straight from the browser to Cloudinary; the server only signs the request,
// so the API secret never leaves the server and big files never hit our function's size limit.
admin.post('/uploads/sign', (req, res) => {
  const cfg = cloudinaryConfig();
  if (!cfg) return res.status(503).json({ error: 'Photo uploads aren’t set up yet. Paste an image link instead, or add CLOUDINARY_URL to the server settings.' });
  const params = { folder: 'driveease', timestamp: Math.round(Date.now() / 1000) };
  res.json({ cloudName: cfg.cloud, apiKey: cfg.key, ...params, signature: signParams(params, cfg.secret) });
});

app.use('/api/admin', admin);
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

/* ---------- Pages ---------- */
app.get('/robots.txt', robots);
app.get('/sitemap.xml', sitemap);
app.get('/{*path}', renderPage);

/* ---------- Errors ---------- */
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError')
    return res.status(400).json({ errors: Object.fromEntries(Object.entries(err.errors).map(([k, e]) => [k, e.message])) });
  if (err.name === 'CastError') return res.status(404).json({ error: 'Not found' });
  if (err.code === 11000) return res.status(400).json({ errors: { slug: 'That web address is already used by another item. Change the name or slug.' } });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on our side. Try again in a moment.' });
});

export default app;
