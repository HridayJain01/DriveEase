import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

// Serverless functions reuse warm instances, so one connection promise is shared per instance.
let connecting;
export function connectDb() {
  if (!process.env.MONGODB_URI) return Promise.reject(new Error('MONGODB_URI is not set. Copy .env.example to .env and fill it in.'));
  connecting ??= mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 }).catch((e) => { connecting = null; throw e; });
  return connecting;
}

export const slugify = (s = '') =>
  s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

const text = (max, extra = {}) => ({ type: String, trim: true, maxlength: max, default: '', ...extra });
// Only https links: these end up in href/src attributes on the public site.
const url = (extra = {}) => text(500, { match: [/^(https:\/\/\S+)?$/, 'Use a full https:// link.'], ...extra });
const opts = { timestamps: true };

function slugFrom(field) {
  return function () { this.slug = slugify(this.slug || this[field]); };
}

const vehicleSchema = new Schema({
  name: text(80, { required: true }),
  slug: text(100, { unique: true }),
  category: text(40, { required: true }),
  seats: { type: Number, min: 1, max: 60, default: 5 },
  bags: { type: Number, min: 0, max: 30, default: 2 },
  fuel: text(20),
  transmission: text(20),
  rate: text(60),
  summary: text(160),
  description: text(2000),
  features: [text(80)],
  images: [url()],
  featured: { type: Boolean, default: false },
  published: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, opts);
vehicleSchema.pre('validate', slugFrom('name'));
vehicleSchema.pre('validate', function () {
  this.features = this.features.filter(Boolean);
  this.images = this.images.filter(Boolean);
});

const postSchema = new Schema({
  title: text(140, { required: true }),
  slug: text(160, { unique: true }),
  excerpt: text(300),
  cover: url(),
  body: text(50000),
  published: { type: Boolean, default: false },
  publishedAt: { type: Date, default: Date.now },
}, opts);
postSchema.pre('validate', slugFrom('title'));

const reviewSchema = new Schema({
  name: text(80, { required: true }),
  location: text(80),
  rating: { type: Number, min: 1, max: 5, default: 5 },
  text: text(800, { required: true }),
  published: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, opts);

const settingsSchema = new Schema({
  key: { type: String, default: 'site', unique: true },
  businessName: text(80, { required: true }),
  tagline: text(200),
  city: text(60),
  phone: text(20, { required: true }),
  whatsappNumber: text(15, { required: true, match: [/^\d{8,15}$/, 'Digits only, with country code — e.g. 919876543210.'] }),
  whatsappMessage: text(300),
  whatsappCatalogueUrl: url(),
  email: text(120),
  address: text(300),
  mapUrl: url(),
  hours: text(80),
  socials: { instagram: url(), facebook: url(), youtube: url() },
  about: {
    story: text(4000),
    founderName: text(80),
    founderRole: text(80),
    founderQuote: text(400),
    founderPhoto: url(),
    promises: [new Schema({ title: text(60), text: text(240) }, { _id: false })],
  },
  services: [new Schema({ slug: text(60), name: text(60, { required: true }), summary: text(160), details: text(800) }, { _id: false })],
  faqs: [new Schema({ q: text(160, { required: true }), a: text(800) }, { _id: false })],
}, opts);
settingsSchema.pre('validate', function () {
  for (const s of this.services) s.slug = slugify(s.slug || s.name);
});

const enquirySchema = new Schema({
  name: String, phone: String, email: String, vehicle: String,
  pickupDate: String, returnDate: String, pickupLocation: String, destination: String, message: String,
  status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
}, opts);

const adminSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
}, opts);

// Failed sign-ins expire after 15 minutes (TTL index).
const loginAttemptSchema = new Schema({ ip: String, createdAt: { type: Date, default: Date.now, expires: 900 } });

export const Vehicle = models.Vehicle || model('Vehicle', vehicleSchema);
export const Post = models.Post || model('Post', postSchema);
export const Review = models.Review || model('Review', reviewSchema);
export const Settings = models.Settings || model('Settings', settingsSchema);
export const Enquiry = models.Enquiry || model('Enquiry', enquirySchema);
export const Admin = models.Admin || model('Admin', adminSchema);
export const LoginAttempt = models.LoginAttempt || model('LoginAttempt', loginAttemptSchema);
