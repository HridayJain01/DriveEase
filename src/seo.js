// SEO copy for every page, shared by the browser (on navigation) and the server (for crawlers and
// link previews). Titles aim for ~60 characters and descriptions ~150, and both name the city set
// in Site details, so each page targets local searches such as "car rental in Pune".

// The city from Site details, unless it's still the sample placeholder.
export const cityOf = (site) => {
  const c = String(site?.city || '').trim();
  return c && !/^your city$/i.test(c) ? c : '';
};
const brandOf = (site) => site?.businessName || 'Drive Ease';
const inCity = (site) => (cityOf(site) ? ` in ${cityOf(site)}` : '');
const withBrand = (title, site) => `${title} | ${brandOf(site)}`;
const clip = (s, n = 160) => (s.length > n ? `${s.slice(0, n - 1).replace(/\s+\S*$/, '')}…` : s);

export function pageMeta(path, site) {
  const c = inCity(site);
  const b = brandOf(site);
  const pages = {
    '/': {
      fullTitle: `Car rental${c}: self-drive & with driver | ${b}`,
      h1: `Car rental${c}`,
      description: `Rent a clean, well-kept car${c} for airport transfers, outstation trips and weekend getaways, self-drive or with a driver. Enquire on WhatsApp in one tap.`,
    },
    '/fleet': {
      title: `Cars for rent${c}: hatchbacks, SUVs & 7-seaters`,
      h1: `Cars for rent${c}`,
      description: `Every car we rent${c}: hatchbacks, sedans, SUVs and 7-seaters, with seats, luggage space and photos. Enquire about any car on WhatsApp.`,
    },
    '/services': {
      title: `Car rental services${c}`,
      h1: `Car rental services${c}`,
      description: `Self-drive and chauffeur-driven car rental${c}: airport transfers, outstation trips, weddings and monthly rentals. Tell us your trip on WhatsApp.`,
    },
    '/about': {
      title: `About ${b}: car rental${c}`,
      h1: `About ${b}`,
      description: `The story behind ${b}, the car rental${c} where a real person answers when you message, and what you can expect from us.`,
    },
    '/blog': {
      title: 'Road-trip tips & car rental guides',
      description: `Road-trip ideas, car rental checklists and guides to choosing the right car, from the ${b} team${c}.`,
    },
    '/contact': {
      title: `Contact us: car rental${c}`,
      h1: `Contact ${b}`,
      description: clip(`Call or WhatsApp ${b}${site?.phone ? ` on ${site.phone}` : ''} for car rental${c}. Send an enquiry and read what other travellers say.`),
    },
    '/concierge': {
      title: 'Find the right rental car for your trip',
      description: `Answer four quick questions and our Concierge matches your trip to the right car from our fleet${c}, and explains why. No sign-up.`,
    },
    '/routes': {
      title: `Outstation car rental${cityOf(site) ? ` from ${cityOf(site)}` : ''}: popular routes`,
      h1: `Outstation car rental${cityOf(site) ? ` from ${cityOf(site)}` : ''}`,
      description: `Popular drives from ${cityOf(site) || 'the city'} with distance and drive time, plus advice on which rental car suits each road. Self-drive or with a driver.`,
    },
    '/car-rental': {
      title: `Car rental by area${c}`,
      h1: `Car rental by area${c}`,
      description: `The parts of ${cityOf(site) || 'the city'} we cover, with what suits each one: from airport pickups to a day of meetings. Self-drive or with a driver.`,
    },
    '/which-car-fits': {
      title: 'Which rental car fits your group and bags?',
      h1: 'Which car fits your group and bags?',
      description: `Enter how many people and big bags you have, and see which ${b} cars fit, with seats and boot space for every car${c}. Free, with no sign-up.`,
    },
    // Personal, device-specific pages: kept out of search results.
    '/compare': { title: 'Compare cars', description: `Compare up to three ${b} cars side by side: seats, luggage, gearbox and fuel.`, noindex: true },
    '/garage': { title: 'My Garage', description: `Cars you saved from the ${b} fleet.`, noindex: true },
  };
  const m = pages[path];
  return m && { ...m, fullTitle: m.fullTitle || withBrand(m.title, site) };
}

// Any spec the admin left blank is simply left out (it used to crash the page on a blank fuel or gearbox).
export const vehicleMeta = (v, site) => {
  const specs = [v.category, v.seats && `${v.seats} seats`, v.bags !== undefined && v.bags !== '' && `${v.bags} bags`, [v.fuel, v.transmission].filter(Boolean).join(' ')]
    .filter(Boolean).map((s) => String(s).toLowerCase()).join(', ');
  const title = `${v.name} on rent${inCity(site)}`;
  return {
    title,
    fullTitle: withBrand(title, site),
    description: clip([specs ? `Rent the ${v.name}${inCity(site)}: ${specs}.` : `Rent the ${v.name}${inCity(site)}.`, v.summary, 'Enquire on WhatsApp.'].filter(Boolean).join(' ')),
  };
};

export const serviceMeta = (s, site) => {
  const title = `${s.name}${inCity(site)}`;
  return { title, fullTitle: withBrand(title, site), description: clip([`${s.name}${inCity(site)} with ${brandOf(site)}.`, s.summary, 'Tell us your trip on WhatsApp.'].filter(Boolean).join(' ')) };
};

export const postMeta = (p, site) => ({ title: p.title, fullTitle: withBrand(p.title, site), description: p.excerpt });

// Route, area, car type and legal pages keep their title and description with their text (seo-content.js).
export const landingMeta = (page, site) => ({
  title: page.title,
  fullTitle: withBrand(page.title, site),
  description: typeof page.description === 'function' ? page.description(site) : page.description,
});
