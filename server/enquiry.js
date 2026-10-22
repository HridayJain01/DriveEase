// Validates a public enquiry. Returns { data, errors } — errors is keyed by field.
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
// Numbers arrive as strings from forms and query strings; blank means "not given".
const count = (v) => (v === '' || v === undefined || v === null ? null : Number(v));

export const STATUSES = ['new', 'contacted', 'quoted', 'confirmed', 'closed'];
export const TRIP_TYPES = ['city', 'airport', 'weekend', 'family', 'business', 'other'];
export const SOURCES = ['form', 'concierge', 'garage', 'compare', 'car-page'];

export function validateEnquiry(body = {}) {
  const data = {
    name: str(body.name, 80),
    phone: str(body.phone, 20),
    email: str(body.email, 120).toLowerCase(),
    vehicle: str(body.vehicle, 200),
    pickupDate: str(body.pickupDate, 10),
    returnDate: str(body.returnDate, 10),
    pickupLocation: str(body.pickupLocation, 120),
    destination: str(body.destination, 120),
    message: str(body.message, 1000),
    tripType: TRIP_TYPES.includes(body.tripType) ? body.tripType : '',
    source: SOURCES.includes(body.source) ? body.source : 'form',
  };
  const errors = {};
  if (data.name.length < 2) errors.name = 'Enter your name.';
  if (!/^\+?[\d\s-]{10,16}$/.test(data.phone)) errors.phone = 'Enter a valid phone number, e.g. 98765 43210.';
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Enter a valid email or leave it blank.';
  if (data.pickupDate && !isDate(data.pickupDate)) errors.pickupDate = 'Pick a valid date.';
  if (data.returnDate && !isDate(data.returnDate)) errors.returnDate = 'Pick a valid date.';
  if (!errors.pickupDate && !errors.returnDate && data.pickupDate && data.returnDate && data.returnDate < data.pickupDate)
    errors.returnDate = 'Return date must be on or after the pickup date.';

  const passengers = count(body.passengers);
  if (passengers !== null) {
    if (Number.isInteger(passengers) && passengers >= 1 && passengers <= 60) data.passengers = passengers;
    else errors.passengers = 'Enter between 1 and 60 travellers.';
  }
  const luggage = count(body.luggage);
  if (luggage !== null) {
    if (Number.isInteger(luggage) && luggage >= 0 && luggage <= 30) data.luggage = luggage;
    else errors.luggage = 'Enter between 0 and 30 bags.';
  }
  return { data, errors };
}

// Validates a staff update to an enquiry. Only these fields can change; anything else is ignored.
export function validateEnquiryUpdate(body = {}) {
  const data = {};
  const errors = {};
  if (body.status !== undefined) {
    if (STATUSES.includes(body.status)) data.status = body.status;
    else errors.status = 'Unknown status.';
  }
  if (body.followUpDate !== undefined) {
    const d = typeof body.followUpDate === 'string' ? body.followUpDate.trim() : null;
    if (d === '' || (d && isDate(d))) data.followUpDate = d;
    else errors.followUpDate = 'Pick a valid date or clear it.';
  }
  return { data, errors };
}

export function validateNote(body = {}) {
  const text = str(body?.text, 1000);
  return text ? { text } : { error: 'Write a note first.' };
}

// Builds a MongoDB filter from the dashboard's search box and status tab. The search text is
// escaped, so it's always matched literally and can't inject regex or query operators.
export const dueFilter = (today) => ({ followUpDate: { $gt: '', $lte: today }, status: { $nin: ['confirmed', 'closed'] } });

export function enquiryFilter({ status, q, today } = {}) {
  let filter = {};
  if (typeof status === 'string' && STATUSES.includes(status)) filter.status = status;
  if (status === 'due' && typeof today === 'string' && isDate(today)) filter = dueFilter(today);
  const text = typeof q === 'string' ? q.trim().slice(0, 80) : '';
  if (text) {
    const rx = new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const digits = text.replace(/\D/g, '');
    filter.$or = ['name', 'email', 'vehicle', 'pickupLocation', 'destination', 'message'].map((f) => ({ [f]: rx }));
    // Phone numbers are stored as typed ("98765 43210"), so match on the digits in any spacing.
    if (digits.length >= 3) filter.$or.push({ phone: new RegExp(digits.split('').join('\\D*')) });
  }
  return filter;
}

export function pageParams(query = {}) {
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20));
  const page = Math.min(1000, Math.max(1, Number.parseInt(query.page, 10) || 1));
  return { limit, page, skip: (page - 1) * limit };
}
