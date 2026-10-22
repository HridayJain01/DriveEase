import { useEffect, useState } from 'react';

// Tiny fetch cache: every page that asks for the same URL shares one request,
// and revisits render instantly from memory.
const settled = new Map();
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

export const waLink = (number, text) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
export const telLink = (phone) => `tel:${phone.replace(/[^\d+]/g, '')}`;

// Resizes Unsplash/Cloudinary images on their CDNs so we never ship a 4000px photo to a phone.
export function img(url, w) {
  if (!url) return '';
  if (url.includes('images.unsplash.com')) return `${url}?w=${w}&q=70&auto=format&fit=crop`;
  if (url.includes('res.cloudinary.com')) return url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${w}/`);
  return url;
}
export const srcSet = (url, widths = [480, 800, 1200]) => widths.map((w) => `${img(url, w)} ${w}w`).join(', ');

export const formatDate = (iso, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', opts) : '';

export function tripMessage(base, t) {
  const lines = [
    t.trip && `Trip: ${t.trip}`,
    t.car && `Car: ${t.car}`,
    t.from && `Pickup: ${t.from}`,
    t.to && `Destination: ${t.to}`,
    (t.start || t.end) && `Dates: ${[t.start, t.end].filter(Boolean).map((d) => formatDate(d, { day: 'numeric', month: 'short' })).join(' → ')}`,
  ].filter(Boolean);
  return lines.length ? `${base}\n\n${lines.join('\n')}\n\nPlease share availability and rates.` : base;
}

export const today = () => new Date().toLocaleDateString('en-CA'); // yyyy-mm-dd in local time
