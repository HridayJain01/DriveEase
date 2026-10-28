// Smart WhatsApp enquiry: builds the pre-filled message and the click-to-chat link.
// Opening WhatsApp only drafts a message. Nothing is sent, saved or booked until the
// customer taps send there and the team replies, so the UI must never claim otherwise.
import { tripLabel } from './concierge/match.js';

// wa.me needs the country code; a bare 10-digit Indian mobile number gets 91 added.
// Returns '' when no usable number is configured, so callers can show a fallback.
export function waNumber(number) {
  const digits = String(number || '').replace(/\D/g, '');
  const full = digits.length === 10 ? `91${digits}` : digits;
  return /^\d{8,15}$/.test(full) ? full : '';
}

export function whatsappUrl(number, text = '') {
  const n = waNumber(number);
  if (!n) return '';
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

const day = (iso) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return '';
  const d = new Date(`${iso}T00:00:00`);
  const part = (o) => d.toLocaleDateString('en-IN', o);
  return `${part({ weekday: 'short' })}, ${d.getDate()} ${part({ month: 'short' })} ${d.getFullYear()}`; // same text in every browser
};

// Trip lines appear only for details the customer actually gave.
export function tripLines(t) {
  t ||= {}; // null when the visitor never used the Concierge
  const lines = [];
  if (t.trip) lines.push(`Trip: ${tripLabel(t.trip) || t.trip}`);
  if (t.from) lines.push(`Pickup: ${t.from}`);
  if (t.to) lines.push(`Destination: ${t.to}`);
  if (t.start && t.end) lines.push(`Dates: ${day(t.start)} → ${day(t.end)}`);
  else if (t.start) lines.push(`Pickup date: ${day(t.start)}`);
  if (Number(t.passengers) > 0) lines.push(`Passengers: ${Number(t.passengers)}`);
  if (t.bags !== undefined && t.bags !== '' && Number(t.bags) >= 0 && t.passengers) lines.push(`Luggage: ${Number(t.bags)} ${Number(t.bags) === 1 ? 'bag' : 'bags'}`);
  if (t.transmission) lines.push(`Gearbox: ${t.transmission}`);
  return lines;
}

/**
 * @param {object} o
 * @param {string} [o.greeting]  the business's configured opening line
 * @param {{name: string, slug?: string}[]} [o.cars]  cars the customer is asking about
 * @param {object} [o.trip]  details the customer supplied (Concierge answers)
 * @param {string} [o.origin]  site address, to add links to each car
 * @param {string} [o.context]  e.g. "comparing", "shortlist"
 */
export function buildEnquiryMessage({ greeting, cars = [], trip, origin, context } = {}) {
  const parts = [greeting?.trim() || 'Hi, I’d like to enquire about renting a car.'];
  if (cars.length === 1) parts.push(`Car: ${cars[0].name}${origin && cars[0].slug ? `\n${origin}/fleet/${cars[0].slug}` : ''}`);
  else if (cars.length > 1) {
    const head = context === 'comparing' ? 'I’m comparing these cars:' : 'Cars I’m interested in:';
    parts.push([head, ...cars.map((c, i) => `${i + 1}. ${c.name}${origin && c.slug ? ` — ${origin}/fleet/${c.slug}` : ''}`)].join('\n'));
  }
  const lines = tripLines(trip);
  if (lines.length) parts.push(lines.join('\n'));
  parts.push(cars.length > 1 ? 'Could you tell me which of these are available?' : cars.length ? 'Please let me know if it’s available.' : 'Could you suggest a car for this trip?');
  return parts.join('\n\n');
}

// The website enquiry form, pre-filled with the same details (the only way an enquiry reaches the dashboard).
export function enquiryFormPath({ cars = [], trip, source } = {}) {
  trip ||= {};
  const params = {
    source,
    vehicle: cars.map((c) => c.name).join(', '),
    pickupLocation: trip.from, destination: trip.to, pickupDate: trip.start, returnDate: trip.end,
    passengers: Number(trip.passengers) > 0 ? String(trip.passengers) : '',
    luggage: trip.passengers && trip.bags !== undefined && trip.bags !== '' ? String(trip.bags) : '',
    tripType: trip.trip,
  };
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
  return `/contact${q.size ? `?${q}` : ''}#enquiry`;
}
