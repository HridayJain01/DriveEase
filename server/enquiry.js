// Validates a public enquiry. Returns { data, errors } — errors is keyed by field.
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

export function validateEnquiry(body = {}) {
  const data = {
    name: str(body.name, 80),
    phone: str(body.phone, 20),
    email: str(body.email, 120).toLowerCase(),
    vehicle: str(body.vehicle, 80),
    pickupDate: str(body.pickupDate, 10),
    returnDate: str(body.returnDate, 10),
    pickupLocation: str(body.pickupLocation, 120),
    destination: str(body.destination, 120),
    message: str(body.message, 1000),
  };
  const errors = {};
  if (data.name.length < 2) errors.name = 'Enter your name.';
  if (!/^\+?[\d\s-]{10,16}$/.test(data.phone)) errors.phone = 'Enter a valid phone number, e.g. 98765 43210.';
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'Enter a valid email or leave it blank.';
  if (data.pickupDate && !isDate(data.pickupDate)) errors.pickupDate = 'Pick a valid date.';
  if (data.returnDate && !isDate(data.returnDate)) errors.returnDate = 'Pick a valid date.';
  if (!errors.pickupDate && !errors.returnDate && data.pickupDate && data.returnDate && data.returnDate < data.pickupDate)
    errors.returnDate = 'Return date must be on or after the pickup date.';
  return { data, errors };
}
