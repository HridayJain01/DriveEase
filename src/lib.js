import { useEffect, useState } from 'react';
import { whatsappUrl } from './whatsapp.js';

// Tiny fetch cache: every page that asks for the same URL shares one request,
// and revisits render instantly from memory.
const settled = new Map(Object.entries(globalThis.__DATA__ || {})); // embedded by the server on first load
const inflight = new Map();

export function fetchJson(url) {
  if (!inflight.has(url)) {
    inflight.set(url, fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status === 404 ? 'not-found' : 'failed'))))
      .then((data) => (settled.set(url, data), data))
      .catch((e) => { inflight.delete(url); throw e; }));
  }
  return inflight.get(url);
}

// Called after admin edits so the public pages refetch fresh content.
export function clearCache() { settled.clear(); inflight.clear(); }

export function useApi(url) {
  const [state, setState] = useState(() => ({ data: settled.get(url) }));
  useEffect(() => {
    let live = true;
    setState({ data: settled.get(url) });
    fetchJson(url).then((data) => live && setState({ data }), (error) => live && setState({ error }));
    return () => { live = false; };
  }, [url]);
  return state;
}

// General "chat with us" links. If no usable WhatsApp number is configured they fall back to the enquiry form.
export const waLink = (number, text) => whatsappUrl(number, text) || '/contact#enquiry';
export const telLink = (phone) => `tel:${phone.replace(/[^\d+]/g, '')}`;

// Resizes Unsplash/Cloudinary images on their CDNs so we never ship a 4000px photo to a phone.
export function img(url, w) {
  if (!url) return '';
  if (url.includes('images.unsplash.com')) return `${url}?w=${w}&q=70&auto=format&fit=crop`;
  if (url.includes('res.cloudinary.com')) return url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${w}/`);
  return url;
}
export const srcSet = (url, widths = [480, 800, 1200]) => widths.map((w) => `${img(url, w)} ${w}w`).join(', ');

// A bare yyyy-mm-dd (trip and follow-up dates) is a calendar day, so it's read in local time;
// `new Date('2026-11-02')` would be UTC midnight and show the previous day west of UTC.
export const formatDate = (iso, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  iso ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00:00` : iso).toLocaleDateString('en-IN', opts) : '';

export function tripMessage(base, t) {
  const lines = [
    t.trip && `Trip: ${t.trip}`,
    t.car && `Car: ${t.car}`,
    t.from && `Pickup: ${t.from}`,
    t.to && `Drop-off: ${t.to}`,
    (t.start || t.end) && `Dates: ${[t.start, t.end].filter(Boolean).map((d) => formatDate(d, { day: 'numeric', month: 'short' })).join(' → ')}`,
  ].filter(Boolean);
  return lines.length ? `${base}\n\n${lines.join('\n')}\n\nPlease share availability and rates.` : base;
}

export const today = () => new Date().toLocaleDateString('en-CA'); // yyyy-mm-dd in local time
