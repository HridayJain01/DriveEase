// Drive Ease Concierge: a transparent, rule-based matcher. No AI service, no hidden weighting.
// Every point a car scores comes with a sentence saying why, and anything the fleet data
// can't confirm is reported as "unverified" instead of being guessed.
import { known } from '../fleet.js';

export const TRIPS = [
  { id: 'city', label: 'City travel', hint: 'Errands, meetings, getting around town' },
  { id: 'airport', label: 'Airport transfer', hint: 'Pickups and drops with luggage' },
  { id: 'weekend', label: 'Weekend getaway', hint: 'A few days out of the city' },
  { id: 'family', label: 'Family holiday', hint: 'More people, more bags' },
  { id: 'business', label: 'Business trip', hint: 'Comfort and a smart arrival' },
  { id: 'other', label: 'Something else', hint: 'Weddings, events, long rentals…' },
];
export const tripLabel = (id) => TRIPS.find((t) => t.id === id)?.label || '';
// For sentences like "for your family holiday"; "Something else" reads as just "trip".
export const tripNoun = (id) => (id && id !== 'other' && tripLabel(id) ? tripLabel(id).toLowerCase() : 'trip');

// Gentle nudges per trip type. They only change the order, never exclude a car, and each one is
// based on what the admin entered (seats, bags, type, gearbox), never on assumptions about a model.
const TRIP_FIT = {
  city: (v) => v.category === 'Hatchback' && 'is a hatchback, easy to park in the city',
  airport: (v, a) => v.bags >= Math.max(3, (Number(a.bags) || 0) + 1) && 'has spare boot space for airport luggage',
  weekend: (v, a) => v.bags >= (Number(a.bags) || 0) + 1 && v.seats >= (Number(a.passengers) || 1) + 1 && 'has room to spare for a few days away',
  family: (v) => v.seats >= 6 && `has ${v.seats} seats, so a family can spread out`,
  business: (v) => v.transmission === 'Automatic' && v.category === 'Sedan' && 'is an automatic sedan, easy in city traffic',
};

export const blankAnswers = () => ({
  trip: '', from: '', to: '', start: '', end: '',
  passengers: 2, bags: 1, category: '', transmission: '',
});

// Which answers belong to which step. Only steps the customer actually completed are remembered,
// so a WhatsApp message never includes a default (e.g. "2 travellers") they didn't choose.
export const STEP_FIELDS = [['trip'], ['from', 'to', 'start', 'end'], ['passengers', 'bags'], ['category', 'transmission']];

// How many steps, in order, a remembered trip covers.
export const stepsDone = (t) => {
  if (!t) return 0;
  const i = STEP_FIELDS.findIndex((fields) => !fields.some((f) => f in t));
  return i === -1 ? STEP_FIELDS.length : i;
};

// The answers from the first n steps only.
export const answersUpTo = (a, n) => Object.fromEntries(STEP_FIELDS.slice(0, n).flat().filter((f) => a[f] !== undefined).map((f) => [f, a[f]]));

const int = (v) => (Number.isInteger(Number(v)) ? Number(v) : NaN);

// Validates one step of the questionnaire (or all of them). Returns { field: message }.
export function validateAnswers(a, step = 'all', today = new Date().toLocaleDateString('en-CA')) {
  const e = {};
  const all = step === 'all';
  if ((all || step === 'trip') && !TRIPS.some((t) => t.id === a.trip)) e.trip = 'Choose the kind of trip.';
  if (all || step === 'where') {
    if (String(a.from || '').trim().length < 2) e.from = 'Enter a pickup area, e.g. Airport T2.';
    if (a.start && !/^\d{4}-\d{2}-\d{2}$/.test(a.start)) e.start = 'Pick a valid date.';
    else if (a.start && a.start < today) e.start = 'Pickup can’t be in the past.';
    if (a.end && !/^\d{4}-\d{2}-\d{2}$/.test(a.end)) e.end = 'Pick a valid date.';
    else if (a.end && a.start && a.end < a.start) e.end = 'Return must be on or after pickup.';
  }
  if (all || step === 'people') {
    const p = int(a.passengers);
    const b = int(a.bags);
    if (!(p >= 1 && p <= 20)) e.passengers = 'Between 1 and 20 travellers.';
    if (!(b >= 0 && b <= 20)) e.bags = 'Between 0 and 20 bags.';
  }
  return e;
}

const article = (word) => (/^[aeiou]/i.test(word) ? 'an' : 'a');

// Scores one car against the answers. Returns the reasons behind every judgement.
export function assess(v, a) {
  const ok = [];       // requirements and preferences this car meets
  const misses = [];   // stated preferences it doesn't meet
  const fails = [];    // critical requirements it doesn't meet
  const unverified = []; // things the fleet data can't confirm
  let score = 0;

  // Critical: seats and bags.
  const need = Number(a.passengers) || 1;
  if (!known(v.seats)) unverified.push('Seat count isn’t listed for this car.');
  else if (v.seats < need) fails.push(`Seats ${v.seats}; you need ${need}.`);
  else {
    ok.push(`seats ${v.seats} (you need ${need})`);
    score += 40 - Math.min(10, (v.seats - need) * 2); // a snug fit beats a much bigger car
  }
  const bags = Number(a.bags) || 0;
  if (bags > 0) {
    if (!known(v.bags)) unverified.push('Luggage capacity isn’t listed for this car.');
    else if (v.bags < bags) fails.push(`Takes ${v.bags} ${v.bags === 1 ? 'bag' : 'bags'}; you have ${bags}.`);
    else { ok.push(`takes ${v.bags} ${v.bags === 1 ? 'bag' : 'bags'} (you have ${bags})`); score += 30 - Math.min(8, (v.bags - bags) * 2); }
  } else score += 30;

  // Preferences.
  if (a.category) {
    if (v.category === a.category) { ok.push(`is the ${a.category} you asked for`); score += 20; }
    else misses.push(`It’s ${article(v.category || 'a')} ${v.category || 'car of another type'}, not ${article(a.category)} ${a.category}.`);
  }
  if (a.transmission) {
    if (!known(v.transmission)) unverified.push('Gearbox type isn’t listed for this car.');
    else if (v.transmission === a.transmission) { ok.push(a.transmission === 'Automatic' ? 'is an automatic' : 'has a manual gearbox'); score += 15; }
    else misses.push(`It’s ${v.transmission.toLowerCase()}, not ${a.transmission.toLowerCase()}.`);
  }

  const fit = TRIP_FIT[a.trip]?.(v, a);
  if (fit) { ok.push(fit); score += 10; }

  const tier = fails.length ? 'unsuitable'
    : unverified.some((u) => /Seat|Luggage/.test(u)) ? 'check'
      : misses.length ? 'partial'
        : unverified.length ? 'good' : 'great';

  return { vehicle: v, tier, score, ok, misses, fails, unverified, why: explain(v, a, ok) };
}

export const TIERS = {
  great: { label: 'Strong match', rank: 0 },
  good: { label: 'Good match', rank: 1 },
  partial: { label: 'Partial match', rank: 2 },
  check: { label: 'Check with us', rank: 3 },
  unsuitable: { label: 'Doesn’t fit', rank: 4 },
};

function explain(v, a, ok) {
  if (!ok.length) return '';
  const list = ok.length > 1 ? `${ok.slice(0, -1).join(', ')} and ${ok.at(-1)}` : ok[0];
  const what = v.category ? `This ${v.category}` : 'This car';
  return `${what} may suit your ${tripNoun(a.trip)} because it ${list}.`;
}

// Ranks the whole fleet. `matches` meet every critical requirement (or need a check);
// `alternatives` are the closest cars that don't, offered only when nothing fits well.
export function recommend(vehicles = [], a) {
  const all = vehicles.map((v) => assess(v, a))
    .sort((x, y) => TIERS[x.tier].rank - TIERS[y.tier].rank || y.score - x.score || (x.vehicle.order ?? 0) - (y.vehicle.order ?? 0));
  const matches = all.filter((r) => r.tier !== 'unsuitable');
  const strong = matches.filter((r) => r.tier === 'great' || r.tier === 'good');
  const alternatives = strong.length ? [] : all.filter((r) => r.tier === 'unsuitable').sort((x, y) => x.fails.length - y.fails.length).slice(0, 3);
  return { top: matches.slice(0, 3), more: matches.slice(3), alternatives, total: vehicles.length };
}
