import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const COOKIE = 'de_session';
const WEEK = 7 * 24 * 60 * 60 * 1000;

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, 64);
  return `scrypt$${salt.toString('base64url')}$${key.toString('base64url')}`;
}

export async function verifyPassword(password, stored = '') {
  const [, salt, hash] = stored.split('$');
  if (!salt || !hash) return false;
  const key = await scryptAsync(password, Buffer.from(salt, 'base64url'), 64);
  const expected = Buffer.from(hash, 'base64url');
  return key.length === expected.length && timingSafeEqual(key, expected);
}

let devSecret;
function secret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === 'production') throw new Error('SESSION_SECRET must be set in production.');
  if (!devSecret) {
    devSecret = randomBytes(32).toString('hex');
    console.warn('SESSION_SECRET not set: using a temporary one, so admin sessions reset when the server restarts.');
  }
  return devSecret;
}

const sign = (body) => createHmac('sha256', secret()).update(body).digest('base64url');

export function signToken(payload, ttl = WEEK) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + ttl })).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function verifyToken(token) {
  const [body, sig] = String(token || '').split('.');
  if (!body || !sig) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(body));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    return payload.exp > Date.now() ? payload : null;
  } catch { return null; }
}

export const readSession = (req) => verifyToken(req.headers.cookie?.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`))?.[1]);

const cookieOpts = () => ({ httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/' });
export const setSession = (res, adminId) => res.cookie(COOKIE, signToken({ sub: String(adminId) }), { ...cookieOpts(), maxAge: WEEK });
export const clearSession = (res) => res.clearCookie(COOKIE, cookieOpts());
