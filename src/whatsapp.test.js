import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildEnquiryMessage, enquiryFormPath, waNumber, whatsappUrl } from './whatsapp.js';

test('normalises the configured number and refuses unusable ones', () => {
  assert.equal(waNumber('919876543210'), '919876543210');
  assert.equal(waNumber('98765 43210'), '919876543210');
  assert.equal(waNumber('+91 98765-43210'), '919876543210');
  assert.equal(waNumber(''), '');
  assert.equal(waNumber(undefined), '');
  assert.equal(waNumber('123'), '');
  assert.equal(whatsappUrl('', 'hi'), '');
});

test('encodes the message for wa.me', () => {
  const url = whatsappUrl('919876543210', 'Hi & hello\nCar: Creta #1?');
  assert.equal(url, 'https://wa.me/919876543210?text=Hi%20%26%20hello%0ACar%3A%20Creta%20%231%3F');
  assert.equal(decodeURIComponent(new URL(url).searchParams.get('text')), 'Hi & hello\nCar: Creta #1?');
});

test('includes the car and only the trip details the customer gave', () => {
  const msg = buildEnquiryMessage({
    greeting: 'Hi Drive Ease',
    cars: [{ name: 'Hyundai Creta', slug: 'hyundai-creta' }],
    trip: { trip: 'family', from: 'Airport T2', to: 'Lonavala', start: '2026-11-02', end: '2026-11-04', passengers: 4, bags: 3 },
    origin: 'https://driveease.in',
  });
  assert.match(msg, /^Hi Drive Ease/);
  assert.match(msg, /Car: Hyundai Creta\nhttps:\/\/driveease\.in\/fleet\/hyundai-creta/);
  assert.match(msg, /Trip: Family holiday/);
  assert.match(msg, /Pickup: Airport T2\nDestination: Lonavala/);
  assert.match(msg, /Dates: Mon, 2 Nov 2026 → Wed, 4 Nov 2026/);
  assert.match(msg, /Passengers: 4\nLuggage: 3 bags/);
  assert.doesNotMatch(msg, /₹|rate|budget/i);

  const bare = buildEnquiryMessage({ greeting: 'Hi', cars: [{ name: 'Swift' }] });
  assert.equal(bare, 'Hi\n\nCar: Swift\n\nPlease let me know if it’s available.');
  assert.doesNotMatch(bare, /Pickup|Dates|Passengers|undefined/);
});

test('lists several cars for comparisons and shortlists', () => {
  const msg = buildEnquiryMessage({ greeting: 'Hi', cars: [{ name: 'A' }, { name: 'B' }], context: 'comparing' });
  assert.match(msg, /I’m comparing these cars:\n1\. A\n2\. B/);
  assert.match(msg, /which of these are available/);
  assert.match(buildEnquiryMessage({ greeting: 'Hi', cars: [] }), /Could you suggest a car for this trip\?$/);
});

test('works for visitors who never used the Concierge (no trip saved)', () => {
  // Used to throw, which crashed the page as soon as Enquire was tapped.
  assert.equal(buildEnquiryMessage({ greeting: 'Hi', cars: [{ name: 'Swift' }], trip: null }), 'Hi\n\nCar: Swift\n\nPlease let me know if it’s available.');
});

test('falls back to a neutral greeting', () => {
  assert.match(buildEnquiryMessage({}), /^Hi, I’d like to enquire/);
});

test('the enquiry form link carries the same details', () => {
  const path = enquiryFormPath({ cars: [{ name: 'Creta' }], trip: { from: 'Airport', passengers: 3, bags: 0, trip: 'airport' } });
  const q = new URL(path, 'https://x').searchParams;
  assert.equal(q.get('vehicle'), 'Creta');
  assert.equal(q.get('pickupLocation'), 'Airport');
  assert.equal(q.get('passengers'), '3');
  assert.equal(q.get('luggage'), '0');
  assert.equal(q.get('tripType'), 'airport');
  assert.equal(enquiryFormPath(), '/contact#enquiry');
});
