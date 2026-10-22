import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assess, blankAnswers, recommend, validateAnswers } from './match.js';
import { dailyRate } from '../fleet.js';
import { vehicles } from '../../server/seed-data.js';

const ask = (over) => ({ ...blankAnswers(), trip: 'family', from: 'Airport', ...over });

test('daily rate is only parsed from a clear per-day price', () => {
  assert.equal(dailyRate('₹2,400 / day'), 2400);
  assert.equal(dailyRate('Rs 1800 per day'), 1800);
  assert.equal(dailyRate(''), null);
  assert.equal(dailyRate('from ₹2,000 / day'), null);
  assert.equal(dailyRate('₹9,000 / weekend'), null);
  assert.equal(dailyRate(undefined), null);
});

test('never recommends a car that lacks the seats or bag space', () => {
  const { top, more } = recommend(vehicles, ask({ passengers: 7, bags: 3 }));
  const names = [...top, ...more].map((r) => r.vehicle.name);
  assert.ok(names.length > 0);
  for (const r of [...top, ...more]) {
    assert.ok(r.vehicle.seats >= 7, `${r.vehicle.name} has too few seats`);
    assert.ok(r.vehicle.bags >= 3, `${r.vehicle.name} has too little boot space`);
  }
  assert.ok(names.includes('Toyota Innova Crysta'));
});

test('a car missing a critical requirement is never a strong match', () => {
  const r = assess({ name: 'Tiny', category: 'Hatchback', seats: 4, bags: 1, rate: '₹1,000 / day' }, ask({ passengers: 5, bags: 1 }));
  assert.equal(r.tier, 'unsuitable');
  assert.match(r.fails[0], /Seats 4; you need 5/);
});

test('preferences that are not met make a partial match, with the reason', () => {
  const r = assess({ name: 'X', category: 'SUV', seats: 5, bags: 3, transmission: 'Manual', rate: '₹2,400 / day' }, ask({ passengers: 2, bags: 1, transmission: 'Automatic' }));
  assert.equal(r.tier, 'partial');
  assert.match(r.misses.join(' '), /manual, not automatic/);
});

test('budget is checked only against a verified daily rate', () => {
  const answers = ask({ passengers: 2, bags: 1, budget: 3000 });
  const fortuner = assess(vehicles.find((v) => v.slug === 'toyota-fortuner'), answers); // rate is blank
  assert.equal(fortuner.tier, 'good');
  assert.match(fortuner.unverified.join(' '), /No rate is listed/);
  const verna = assess(vehicles.find((v) => v.slug === 'hyundai-verna'), answers);
  assert.equal(verna.tier, 'great');
  assert.match(verna.why, /within your ₹3,000 budget/);
  const thar = assess(vehicles.find((v) => v.slug === 'mahindra-thar'), answers);
  assert.match(thar.misses.join(' '), /above your ₹3,000 budget/);
});

test('missing specs are reported as unverified, not guessed', () => {
  const r = assess({ name: 'Mystery', category: 'Sedan', seats: 5, bags: '', transmission: '' }, ask({ passengers: 2, bags: 2, transmission: 'Automatic' }));
  assert.equal(r.tier, 'check');
  assert.equal(r.unverified.length, 2);
});

test('when nothing fits, the closest alternatives are offered and nothing is a match', () => {
  const res = recommend(vehicles, ask({ passengers: 12, bags: 2 }));
  assert.equal(res.top.length, 0);
  assert.ok(res.alternatives.length > 0 && res.alternatives.every((r) => r.tier === 'unsuitable'));
});

test('an empty fleet returns no recommendations without throwing', () => {
  const res = recommend([], ask());
  assert.deepEqual([res.top.length, res.alternatives.length], [0, 0]);
});

test('explanations name the trip and the reasons', () => {
  const r = assess(vehicles.find((v) => v.slug === 'toyota-innova-crysta'), ask({ passengers: 6, bags: 4, category: 'MUV' }));
  assert.equal(r.tier, 'great');
  assert.match(r.why, /^This MUV may suit your family holiday because it seats 7 \(you need 6\)/);
});

test('validates each step', () => {
  assert.deepEqual(Object.keys(validateAnswers(blankAnswers(), 'trip')), ['trip']);
  assert.ok(validateAnswers({ from: 'A' }, 'where').from);
  assert.ok(validateAnswers({ from: 'Airport', start: '2026-01-01' }, 'where', '2026-05-01').start);
  assert.ok(validateAnswers({ from: 'Airport', start: '2026-06-02', end: '2026-06-01' }, 'where', '2026-05-01').end);
  assert.deepEqual(validateAnswers({ from: 'Airport', start: '2026-06-01', end: '2026-06-01' }, 'where', '2026-05-01'), {});
  assert.ok(validateAnswers({ passengers: 0, bags: 1 }, 'people').passengers);
  assert.ok(validateAnswers({ passengers: 2, bags: 1.5 }, 'people').bags);
  assert.deepEqual(validateAnswers(ask({ passengers: 2, bags: 1 }), 'all'), {});
});
