// Visitor-side state that survives page loads: My Garage (saved cars), the compare list and the
// Concierge trip. Only public car slugs and the visitor's own trip answers are stored, and only
// in this browser. Nothing here is sent to the server.
import { useSyncExternalStore } from 'react';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Cleans an untrusted list of slugs (from storage or a shared link): strings only, valid slug
// shape, no duplicates, capped length.
export function cleanSlugs(input, max = 50) {
  const list = Array.isArray(input) ? input : typeof input === 'string' ? input.split(',') : [];
  return [...new Set(list.filter((s) => typeof s === 'string').map((s) => s.trim().toLowerCase()).filter((s) => s.length <= 100 && SLUG.test(s)))].slice(0, max);
}

// Returns { list, error } — error is set when the change was refused.
export function addSlug(list, slug, max) {
  if (list.includes(slug)) return { list, error: 'already' };
  if (list.length >= max) return { list, error: 'full' };
  return { list: [...list, slug] };
}
export const removeSlug = (list, slug) => list.filter((s) => s !== slug);

const memory = new Map();
const safeStorage = (kind) => {
  try { const s = globalThis[kind]; s.setItem('__de', '1'); s.removeItem('__de'); return s; } // private mode can throw
  catch { return { getItem: (k) => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, v), removeItem: (k) => memory.delete(k) }; }
};

export function createStore(key, { storage, parse, initial }) {
  let cache;
  const subs = new Set();
  const store = () => (typeof storage === 'function' ? storage() : storage);
  const read = () => {
    if (cache === undefined) {
      try { cache = parse(JSON.parse(store().getItem(key))); } catch { cache = initial; }
    }
    return cache;
  };
  const write = (value) => {
    cache = value;
    try { store().setItem(key, JSON.stringify(value)); } catch { /* full or blocked: keep it in memory */ }
    subs.forEach((f) => f());
  };
  const subscribe = (f) => {
    subs.add(f);
    const onStorage = (e) => { if (e.key === key) { cache = undefined; f(); } }; // another tab changed it
    globalThis.addEventListener?.('storage', onStorage);
    return () => { subs.delete(f); globalThis.removeEventListener?.('storage', onStorage); };
  };
  return { get: read, set: write, subscribe };
}

export function createListStore(key, max, storage) {
  const s = createStore(key, { storage, parse: (v) => cleanSlugs(v, max), initial: [] });
  const add = (slug) => { const r = addSlug(s.get(), slug, max); if (!r.error) s.set(r.list); return r; };
  const remove = (slug) => s.set(removeSlug(s.get(), slug));
  return {
    ...s, max, add, remove,
    toggle: (slug) => (s.get().includes(slug) ? (remove(slug), { removed: true }) : add(slug)),
    replace: (slugs) => s.set(cleanSlugs(slugs, max)),
    clear: () => s.set([]),
  };
}

export const MAX_COMPARE = 3;
export const garage = createListStore('de:garage', 50, () => safeStorage('localStorage'));
export const compare = createListStore('de:compare', MAX_COMPARE, () => safeStorage('localStorage'));

// The Concierge answers, kept for this browser session so car pages and WhatsApp messages can reuse them.
const TRIP_KEYS = ['trip', 'from', 'to', 'start', 'end', 'passengers', 'bags', 'category', 'transmission'];
export const cleanTrip = (t) => (t && typeof t === 'object' ? Object.fromEntries(TRIP_KEYS.filter((k) => t[k] !== undefined).map((k) => [k, typeof t[k] === 'number' ? t[k] : String(t[k]).slice(0, 120)])) : null);
export const trip = createStore('de:trip', { storage: () => safeStorage('sessionStorage'), parse: cleanTrip, initial: null });

export const useStore = (s) => useSyncExternalStore(s.subscribe, s.get, s.get);
