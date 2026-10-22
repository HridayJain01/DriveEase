import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanSlugs, cleanTrip, createListStore } from './stores.js';

const fakeStorage = () => {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), m };
};

test('saved cars persist to storage and restore on a fresh load', () => {
  const storage = fakeStorage();
  const a = createListStore('de:garage', 50, storage);
  a.add('hyundai-creta');
  a.add('toyota-innova-crysta');
  assert.equal(storage.m.get('de:garage'), '["hyundai-creta","toyota-innova-crysta"]');
  const b = createListStore('de:garage', 50, storage); // same device, new visit
  assert.deepEqual(b.get(), ['hyundai-creta', 'toyota-innova-crysta']);
  b.remove('hyundai-creta');
  assert.deepEqual(createListStore('de:garage', 50, storage).get(), ['toyota-innova-crysta']);
});

test('prevents duplicates and enforces the compare limit', () => {
  const s = createListStore('de:compare', 3, fakeStorage());
  assert.equal(s.add('a').error, undefined);
  assert.equal(s.add('a').error, 'already');
  s.add('b'); s.add('c');
  assert.equal(s.add('d').error, 'full');
  assert.deepEqual(s.get(), ['a', 'b', 'c']);
  assert.deepEqual(s.toggle('b'), { removed: true });
  assert.deepEqual(s.get(), ['a', 'c']);
});

test('corrupt or hostile storage and shared links are cleaned', () => {
  const storage = fakeStorage();
  storage.setItem('de:garage', '{not json');
  assert.deepEqual(createListStore('de:garage', 50, storage).get(), []);
  storage.setItem('de:garage', JSON.stringify(['ok-car', { $gt: 1 }, '<script>', 'OK-CAR', '../etc', 42]));
  assert.deepEqual(createListStore('de:garage', 50, storage).get(), ['ok-car']);
  assert.deepEqual(cleanSlugs('a-b,c,,a-b, d ', 2), ['a-b', 'c']);
});

test('works when storage is unavailable', () => {
  const broken = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
  const s = createListStore('de:garage', 50, broken);
  s.add('x');
  assert.deepEqual(s.get(), ['x']); // kept in memory for this visit
});

test('trip answers keep only known fields', () => {
  assert.deepEqual(cleanTrip({ from: 'Airport', passengers: 3, password: 'x' }), { from: 'Airport', passengers: 3 });
  assert.equal(cleanTrip('nope'), null);
});
