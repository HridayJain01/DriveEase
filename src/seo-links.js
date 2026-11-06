import { cityOf } from './seo.js';

// The list of landing pages, small enough for the main bundle (footer and home page links).
// Their full text is in seo-content.js, which only loads when one of the pages opens.

export const CONTENT_UPDATED = '2026-11-05'; // change this when the text in seo-content.js changes

const ROUTES = [
  { slug: 'mumbai-to-lonavala', place: 'Lonavala' },
  { slug: 'mumbai-to-pune', place: 'Pune' },
  { slug: 'mumbai-to-nashik', place: 'Nashik' },
  { slug: 'mumbai-to-shirdi', place: 'Shirdi' },
  { slug: 'mumbai-to-alibaug', place: 'Alibaug' },
  { slug: 'mumbai-to-mahabaleshwar', place: 'Mahabaleshwar' },
  { slug: 'mumbai-to-goa', place: 'Goa' },
];

const AREAS = [
  { slug: 'mumbai-airport', name: 'Mumbai Airport' },
  { slug: 'andheri', name: 'Andheri' },
  { slug: 'bandra', name: 'Bandra' },
  { slug: 'dadar', name: 'Dadar' },
  { slug: 'powai', name: 'Powai' },
  { slug: 'borivali', name: 'Borivali' },
  { slug: 'south-mumbai', name: 'South Mumbai' },
];

const CAR_TYPES = [
  { slug: 'hatchback', name: 'Hatchbacks', match: (v) => /hatch/i.test(v.category) },
  { slug: 'sedan', name: 'Sedans', match: (v) => /sedan/i.test(v.category) },
  { slug: 'suv', name: 'SUVs', match: (v) => /suv/i.test(v.category) },
  { slug: '7-seater', name: '7-seaters', match: (v) => v.seats >= 7 },
  { slug: 'automatic', name: 'Automatic cars', match: (v) => /auto/i.test(v.transmission) },
];

// All of this text is about Mumbai, so a site set to another city doesn't publish it.
const inMumbai = (site) => /^mumbai$/i.test(cityOf(site));

export const routeLinks = (site) => (inMumbai(site) ? ROUTES : []);
// An area gets a page once it's listed in Site details and has text written for it.
export const areaLinks = (site) => (inMumbai(site) ? AREAS.filter((a) => site.serviceAreas?.includes(a.name)) : []);
// A car type only gets a page while the fleet has a car of that type.
export const typeLinks = (site, vehicles) => (inMumbai(site) ? CAR_TYPES.filter((t) => vehicles?.some(t.match)) : []);
export const carsOfType = (slug, vehicles = []) => vehicles.filter(CAR_TYPES.find((t) => t.slug === slug)?.match || (() => false));
