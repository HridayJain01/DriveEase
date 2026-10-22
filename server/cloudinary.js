import { createHash } from 'node:crypto';

// CLOUDINARY_URL is the "API environment variable" on the Cloudinary dashboard: cloudinary://KEY:SECRET@CLOUD
export function cloudinaryConfig(url = process.env.CLOUDINARY_URL) {
  if (!url) return null;
  const u = new URL(url);
  return { cloud: u.hostname, key: decodeURIComponent(u.username), secret: decodeURIComponent(u.password) };
}

// Cloudinary's signature: params sorted by name, joined as a=1&b=2, secret appended, SHA-1.
export const signParams = (params, secret) =>
  createHash('sha1').update(Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&') + secret).digest('hex');
