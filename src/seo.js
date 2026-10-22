// Page titles and descriptions, shared by the browser (on navigation) and the server (for crawlers and link previews).
export const PAGES = {
  '/about': { title: 'About us', description: 'The story behind Drive Ease and the people who answer when you message.' },
  '/services': { title: 'Services', description: 'Self-drive and chauffeur-driven rentals, airport transfers, outstation trips, events and monthly rentals.' },
  '/fleet': { title: 'Our fleet', description: 'Hatchbacks, sedans, SUVs and seven-seaters — see the cars, specs and rates, then enquire on WhatsApp.' },
  '/blog': { title: 'Blog', description: 'Road-trip tips, car guides and checklists from the Drive Ease team.' },
  '/contact': { title: 'Contact & reviews', description: 'Call, WhatsApp or send an enquiry to Drive Ease — and read what other travellers say.' },
  '/concierge': { title: 'Concierge: find the right car', description: 'Answer four quick questions about your trip and the Drive Ease Concierge matches it to the right car from our fleet, explaining why.' },
  // Personal, device-specific pages: kept out of search results.
  '/compare': { title: 'Compare cars', description: 'Compare up to three Drive Ease cars side by side: seats, luggage, gearbox, fuel and rates.', noindex: true },
  '/garage': { title: 'My Garage', description: 'Cars you saved from the Drive Ease fleet.', noindex: true },
};

export const vehicleMeta = (v) => ({
  title: `${v.name} rental`,
  description: `${v.name}: ${v.category.toLowerCase()}, ${v.seats} seats, ${v.fuel.toLowerCase()} ${v.transmission.toLowerCase()}. ${v.summary}`.trim(),
});

export const postMeta = (p) => ({ title: p.title, description: p.excerpt });
