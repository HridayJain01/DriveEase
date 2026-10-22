import { test } from 'node:test';
import assert from 'node:assert/strict';
import { enquiryFilter, pageParams, validateEnquiry, validateEnquiryUpdate, validateNote } from './enquiry.js';

test('accepts a minimal valid enquiry', () => {
  const { errors, data } = validateEnquiry({ name: ' Asha ', phone: '+91 98765 43210' });
  assert.deepEqual(errors, {});
  assert.equal(data.name, 'Asha');
  assert.equal(data.source, 'form');
  assert.equal('passengers' in data, false);
});

test('flags bad fields', () => {
  const { errors } = validateEnquiry({ name: 'A', phone: '123', email: 'nope', pickupDate: '2026-10-10', returnDate: '2026-10-09' });
  assert.deepEqual(Object.keys(errors).sort(), ['email', 'name', 'phone', 'returnDate']);
});

test('ignores non-string input', () => {
  const { errors } = validateEnquiry({ name: { $gt: '' }, phone: ['9876543210'] });
  assert.ok(errors.name && errors.phone);
});

test('accepts trip details from the Concierge and rejects bad ones', () => {
  const ok = validateEnquiry({ name: 'Asha', phone: '9876543210', passengers: '4', luggage: '0', tripType: 'family', source: 'concierge' });
  assert.deepEqual(ok.errors, {});
  assert.deepEqual([ok.data.passengers, ok.data.luggage, ok.data.tripType, ok.data.source], [4, 0, 'family', 'concierge']);
  const bad = validateEnquiry({ name: 'Asha', phone: '9876543210', passengers: '0', luggage: 'lots', tripType: 'heist', source: 'admin' });
  assert.deepEqual(Object.keys(bad.errors).sort(), ['luggage', 'passengers']);
  assert.equal(bad.data.tripType, '');
  assert.equal(bad.data.source, 'form');
});

test('staff updates allow only known statuses and valid dates', () => {
  assert.deepEqual(validateEnquiryUpdate({ status: 'quoted', followUpDate: '2026-11-01', name: 'hacked' }), { data: { status: 'quoted', followUpDate: '2026-11-01' }, errors: {} });
  assert.deepEqual(validateEnquiryUpdate({ followUpDate: '' }).data, { followUpDate: '' });
  assert.ok(validateEnquiryUpdate({ status: 'deleted' }).errors.status);
  assert.ok(validateEnquiryUpdate({ status: { $ne: 'x' } }).errors.status);
  assert.ok(validateEnquiryUpdate({ followUpDate: 'tomorrow' }).errors.followUpDate);
  assert.ok(validateNote({ text: '   ' }).error);
  assert.equal(validateNote({ text: ' Called, will confirm Friday ' }).text, 'Called, will confirm Friday');
});

test('search is literal and status filters are whitelisted', () => {
  const f = enquiryFilter({ q: 'a.*(b', status: 'quoted' });
  assert.equal(f.status, 'quoted');
  assert.ok(f.$or[0].name.test('xa.*(b'));
  assert.ok(!f.$or[0].name.test('aXXb'));
  assert.deepEqual(enquiryFilter({ status: { $ne: 1 } }), {});
  const phone = enquiryFilter({ q: '98765 432' }).$or.at(-1).phone;
  assert.ok(phone.test('+91 98765-43210'));
  const due = enquiryFilter({ status: 'due', today: '2026-10-23' });
  assert.deepEqual(due.followUpDate, { $gt: '', $lte: '2026-10-23' });
});

test('pagination is clamped', () => {
  assert.deepEqual(pageParams({}), { limit: 20, page: 1, skip: 0 });
  assert.deepEqual(pageParams({ limit: '5000', page: '3' }), { limit: 100, page: 3, skip: 200 });
  assert.deepEqual(pageParams({ limit: '-1', page: 'x' }), { limit: 1, page: 1, skip: 0 });
});
