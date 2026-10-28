import { test } from 'node:test';
import assert from 'node:assert/strict';
import { answersUpTo, assess, blankAnswers, recommend, stepsDone, tripNoun, validateAnswers } from './match.js';
import { vehicles } from '../../server/seed-data.js';

const ask = (over) => ({ ...blankAnswers(), trip: 'family', from: 'Airport', ...over });

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
  const r = assess({ name: 'Tiny', category: 'Hatchback', seats: 4, bags: 1 }, ask({ passengers: 5, bags: 1 }));
  assert.equal(r.tier, 'unsuitable');
  assert.match(r.fails[0], /Seats 4; you need 5/);
});

test('preferences that are not met make a partial match, with the reason', () => {
  const r = assess({ name: 'X', category: 'SUV', seats: 5, bags: 3, transmission: 'Manual' }, ask({ passengers: 2, bags: 1, transmission: 'Automatic' }));
  assert.equal(r.tier, 'partial');
  assert.match(r.misses.join(' '), /manual, not automatic/);
});

test('prices play no part in matching', () => {
  const answers = ask({ passengers: 2, bags: 1 });
  for (const v of vehicles) {
    const r = assess({ ...v, rate: '₹9,99,999 / day' }, answers);
    assert.doesNotMatch([r.why, ...r.misses, ...r.unverified].join(' '), /₹|rate|budget/i);
  }
});

test('trip reasons come from the car\'s specs, not its type', () => {
  const thar = assess(vehicles.find((v) => v.slug === 'mahindra-thar'), ask({ trip: 'airport', passengers: 2, bags: 1 }));
  assert.doesNotMatch(thar.why, /boot space/); // an SUV with room for one bag
  assert.match(thar.why, /takes 1 bag \(you have 1\)/);
  const innova = assess(vehicles.find((v) => v.slug === 'toyota-innova-crysta'), ask({ trip: 'airport', passengers: 2, bags: 2 }));
  assert.match(innova.why, /spare boot space for airport luggage/);
  assert.equal(tripNoun('other'), 'trip');
  assert.equal(tripNoun('family'), 'family holiday');
});

test('only answers from completed steps are remembered', () => {
  const a = { ...blankAnswers(), trip: 'airport', from: 'T2' };
  assert.deepEqual(answersUpTo(a, 0), {});
  assert.deepEqual(answersUpTo(a, 1), { trip: 'airport' });
  assert.deepEqual(Object.keys(answersUpTo(a, 2)).sort(), ['end', 'from', 'start', 'to', 'trip']);
  assert.equal('passengers' in answersUpTo(a, 2), false); // the default "2 travellers" isn't kept
  assert.equal(stepsDone(null), 0);
  assert.equal(stepsDone(answersUpTo(a, 2)), 2);
  assert.equal(stepsDone(answersUpTo(a, 4)), 4);
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
  assert.match(r.why, /has 7 seats, so a family can spread out/);
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
