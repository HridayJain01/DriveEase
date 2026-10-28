import { test } from 'node:test';
import assert from 'node:assert/strict';
import { businessDay, sinceDay, validateEvent } from './events.js';

test('accepts only the known actions, a slug and a known place', () => {
  assert.deepEqual(validateEvent({ kind: 'whatsapp', car: 'hyundai-creta', source: 'concierge' }).data, { kind: 'whatsapp', car: 'hyundai-creta', source: 'concierge' });
  assert.deepEqual(validateEvent({ kind: 'share' }).data, { kind: 'share', car: '', source: 'general' });
  assert.equal(validateEvent({ kind: 'whatsapp', source: 'evil' }).data.source, 'general');
  assert.ok(validateEvent({ kind: 'purchase' }).error);
  assert.ok(validateEvent({ kind: { $ne: 1 } }).error);
  assert.ok(validateEvent({ kind: 'whatsapp', car: '<script>' }).error);
  assert.ok(validateEvent(null).error);
});

test('never keeps anything personal, whatever is sent', () => {
  const { data } = validateEvent({ kind: 'whatsapp', car: 'swift', source: 'general', phone: '9876543210', name: 'Asha', text: 'hello' });
  assert.deepEqual(Object.keys(data).sort(), ['car', 'kind', 'source']);
});

test('days are counted in India time and ranges are clamped', () => {
  assert.equal(businessDay(new Date('2026-10-28T20:00:00Z')), '2026-10-29'); // 1:30 am IST
  const now = new Date('2026-10-29T06:00:00Z');
  assert.deepEqual(sinceDay('7', now), { days: 7, from: '2026-10-23' });
  assert.equal(sinceDay('9999', now).days, 365);
  assert.equal(sinceDay('x', now).days, 30);
});
