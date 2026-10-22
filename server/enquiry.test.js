import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateEnquiry } from './enquiry.js';

test('accepts a minimal valid enquiry', () => {
  const { errors, data } = validateEnquiry({ name: ' Asha ', phone: '+91 98765 43210' });
  assert.deepEqual(errors, {});
  assert.equal(data.name, 'Asha');
});

test('flags bad fields', () => {
  const { errors } = validateEnquiry({ name: 'A', phone: '123', email: 'nope', pickupDate: '2026-10-10', returnDate: '2026-10-09' });
  assert.deepEqual(Object.keys(errors).sort(), ['email', 'name', 'phone', 'returnDate']);
});

test('ignores non-string input', () => {
  const { errors } = validateEnquiry({ name: { $gt: '' }, phone: ['9876543210'] });
  assert.ok(errors.name && errors.phone);
});
