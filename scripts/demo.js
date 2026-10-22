// `npm run demo`: runs the whole site locally without MongoDB Atlas. It starts a throwaway
// in-memory database, loads the sample content plus a few sample enquiries, then starts the
// API (port 3002) and Vite (port 5173, or the next free one). Nothing is kept when it stops.
// Demo admin (local only): admin@demo.test / demo-password-123, or set DEMO_ADMIN_EMAIL / DEMO_ADMIN_PASSWORD.
import { spawn } from 'node:child_process';
import { MongoMemoryServer } from 'mongodb-memory-server-core';

const mongo = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongo.getUri('driveease-demo');
process.env.SESSION_SECRET ||= 'local-demo-only';
process.env.API_PORT ||= '3002'; // its own port, so it can run beside a normal `npm run dev`

const { Admin, connectDb, Enquiry, Post, Review, Settings, Vehicle } = await import('../server/db.js');
const { hashPassword } = await import('../server/auth.js');
const { posts, reviews, site, vehicles } = await import('../server/seed-data.js');

await connectDb();
await Settings.create(site);
await Vehicle.create(vehicles);
await Post.create(posts);
await Review.create(reviews.map((r, i) => ({ ...r, order: i })));
await Admin.create({
  email: process.env.DEMO_ADMIN_EMAIL || 'admin@demo.test',
  passwordHash: await hashPassword(process.env.DEMO_ADMIN_PASSWORD || 'demo-password-123'),
});
const day = (n) => new Date(Date.now() + n * 864e5).toLocaleDateString('en-CA');
await Enquiry.create([
  { name: 'Sample: Asha Rao', phone: '90000 00001', vehicle: 'Toyota Innova Crysta', pickupLocation: 'Airport T2', destination: 'Lonavala', pickupDate: day(5), returnDate: day(7), passengers: 6, luggage: 4, tripType: 'family', source: 'concierge' },
  { name: 'Sample: Vikram Shah', phone: '90000 00002', vehicle: 'Hyundai Verna', pickupLocation: 'City centre', tripType: 'business', status: 'quoted', followUpDate: day(0), notes: [{ text: 'Sent the weekday rate.', by: 'admin@demo.test' }] },
  { name: 'Sample: Meera Iyer', phone: '90000 00003', email: 'meera@example.test', message: 'Need a car for a wedding weekend.', status: 'contacted' },
]);
console.log('Demo database ready with sample content.');

await import('../server/dev.js'); // API
const vite = spawn('npx vite', { stdio: 'inherit', shell: true });
const stop = async () => { vite.kill(); await mongo.stop(); process.exit(0); };
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
