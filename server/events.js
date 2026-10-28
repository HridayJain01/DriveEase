// Anonymous interest counters: how often visitors tap "Open WhatsApp" or share a car.
// Only a day, the action, a public car slug and where on the site it happened are kept.
// No IP address, device, cookie or message text is ever stored.
import { SOURCES } from './enquiry.js';

export const KINDS = ['whatsapp', 'share'];
export const EVENT_SOURCES = [...SOURCES, 'general'];
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Returns { data } or { error }. `car` is '' for general (not car-specific) taps.
export function validateEvent(body = {}) {
  const kind = KINDS.includes(body?.kind) ? body.kind : null;
  if (!kind) return { error: 'Unknown event.' };
  const car = typeof body.car === 'string' && body.car.length <= 100 && SLUG.test(body.car) ? body.car : '';
  if (body.car && !car) return { error: 'Unknown car.' };
  const source = EVENT_SOURCES.includes(body.source) ? body.source : 'general';
  return { data: { kind, car, source } };
}

// Counts are grouped by the business's calendar day (India).
export const businessDay = (d = new Date()) => d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

export function sinceDay(days, now = new Date()) {
  const n = Math.min(365, Math.max(1, Number.parseInt(days, 10) || 30));
  return { days: n, from: businessDay(new Date(now.getTime() - (n - 1) * 864e5)) };
}
