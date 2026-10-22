// Fills an empty database with the sample content and creates/updates the admin login.
//   npm run seed            → seeds only empty collections, then sets the admin from .env
//   npm run seed -- --force → wipes cars, posts, reviews and site details first
import mongoose from 'mongoose';
import { Admin, connectDb, Post, Review, Settings, Vehicle } from './db.js';
import { hashPassword } from './auth.js';
import { posts, reviews, site, vehicles } from './seed-data.js';

await connectDb();
const force = process.argv.includes('--force');

for (const [Model, docs] of [[Settings, [site]], [Vehicle, vehicles], [Post, posts], [Review, reviews.map((r, i) => ({ ...r, order: i }))]]) {
  if (force) await Model.deleteMany({});
  if (await Model.countDocuments()) console.log(`• ${Model.modelName}: already has data, skipped`);
  else { await Model.create(docs); console.log(`✓ ${Model.modelName}: added ${docs.length}`); }
}

const { ADMIN_EMAIL: email, ADMIN_PASSWORD: password } = process.env;
if (email && password) {
  if (password.length < 10) throw new Error('ADMIN_PASSWORD must be at least 10 characters.');
  await Admin.findOneAndUpdate({ email: email.toLowerCase() }, { passwordHash: await hashPassword(password) }, { upsert: true });
  console.log(`✓ Admin login ready for ${email}. You can now remove ADMIN_PASSWORD from .env.`);
} else {
  console.log('• No ADMIN_EMAIL / ADMIN_PASSWORD in .env, admin login unchanged');
}

await mongoose.disconnect();
