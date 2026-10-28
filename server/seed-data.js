// SAMPLE CONTENT for previews. The phone, WhatsApp number and email are the client's; every other
// name, review and policy here is a placeholder: replace it with client-approved content (PRD §13) before launch.
const unsplash = (id) => `https://images.unsplash.com/photo-${id}`;

export const site = {
  businessName: 'Drive Ease',
  tagline: 'Car rentals for airport runs, weekend getaways and everything in between.',
  city: 'Your city',
  phone: '+91 88797 90490',
  whatsappNumber: '918879790490',
  whatsappMessage: "Hi Drive Ease, I'd like to enquire about renting a car.",
  whatsappCatalogueUrl: '',
  email: 'shreyans342@gmail.com',
  address: 'Shop 4, Example Complex, Main Road, Your city 400001',
  mapUrl: 'https://maps.google.com/?q=Your+city',
  hours: 'Open daily, 7 am – 11 pm',
  socials: { instagram: 'https://instagram.com/', facebook: 'https://facebook.com/' },
  about: {
    story:
      "Drive Ease started with a simple idea: renting a car should feel as easy as borrowing one from a friend. No long forms, no surprises at pickup — just a clean car, straight answers and someone who answers when you message.\n\nToday we look after travellers heading to the airport, families on weekend getaways and teams that need a reliable car for a few days or a few months.",
    founderName: 'Founder name',
    founderRole: 'Founder, Drive Ease',
    founderQuote: 'Every booking starts with a conversation. We would rather spend two minutes understanding your trip than hand you the wrong car.',
    founderPhoto: '',
    promises: [
      { title: 'Everything in writing', text: 'Deposit, kilometre limits and pickup details are confirmed in the chat before you go.' },
      { title: 'Cleaned between trips', text: 'Every car is cleaned and checked before it goes out again.' },
      { title: 'One chat, start to finish', text: 'Enquiry, confirmation and pickup details all live in one WhatsApp thread.' },
    ],
  },
  services: [
    { slug: 'self-drive', name: 'Self-drive rentals', summary: 'Take the wheel yourself — by the day, weekend or week.', details: 'Choose a car from the fleet, share your licence and ID, and drive on your own schedule. Deposit and kilometre limits are confirmed on WhatsApp before you book.' },
    { slug: 'chauffeur', name: 'Chauffeur-driven', summary: 'Sit back while an experienced driver handles the road.', details: 'Ideal for long drives, family trips and days packed with meetings. Tell us the route and timing and we will match a car and driver.' },
    { slug: 'airport', name: 'Airport transfers', summary: 'On-time pickups and drops, with room for the luggage.', details: 'Share your flight time and number of bags. We will suggest a car with enough boot space and confirm the pickup point.' },
    { slug: 'outstation', name: 'Outstation trips', summary: 'One-way or round trips to nearby cities and getaways.', details: 'Tell us where you are headed and for how many days. We will recommend a car that suits the road and the group size.' },
    { slug: 'events', name: 'Weddings & events', summary: 'Well-kept cars for the big day and the guests around it.', details: 'From a decorated car for the couple to multiple cars for guest pickups — tell us the dates and we will plan the rest with you.' },
    { slug: 'monthly', name: 'Monthly & corporate', summary: 'Longer rentals for teams, projects and relocations.', details: 'Need a car for a few weeks or months? Ask us what is included for longer rentals.' },
  ],
  faqs: [
    { q: 'What documents do I need?', a: 'Usually a valid driving licence and a government photo ID for self-drive. We confirm the exact list on WhatsApp before your trip.' },
    { q: 'Is there a security deposit?', a: 'Deposit and kilometre limits depend on the car and trip. We share them in writing before you confirm.' },
    { q: 'Can I book a specific car?', a: 'Yes — tap Enquire on any car and the model is added to your message. We will confirm availability for your dates.' },
    { q: 'How do I pay?', a: 'Payment is arranged directly with our team after your booking is confirmed. The website does not take payments.' },
  ],
};

export const vehicles = [
  {
    slug: 'maruti-suzuki-swift', name: 'Maruti Suzuki Swift', category: 'Hatchback',
    seats: 5, bags: 2, fuel: 'Petrol', transmission: 'Manual',
    featured: false, published: true, order: 1,
    images: [unsplash('1663852408695-f57f4d75a536'), unsplash('1663852397535-18292e115327')],
    summary: 'Easy to park, light on fuel — the city all-rounder.',
    description: 'A nimble hatchback for city errands, airport runs and short trips for up to four adults. Compact enough for tight lanes, comfortable enough for a few hours on the highway.',
    features: ['Air conditioning', 'Bluetooth audio', 'Rear parking sensors', 'Dual airbags'],
  },
  {
    slug: 'hyundai-verna', name: 'Hyundai Verna', category: 'Sedan',
    seats: 5, bags: 3, fuel: 'Petrol', transmission: 'Automatic',
    featured: false, published: true, order: 2,
    images: [unsplash('1633359064754-804ba55e733f')],
    summary: 'A smooth automatic sedan with a generous boot.',
    description: 'Comfortable for business travel and family trips alike, with a quiet cabin and room for three suitcases.',
    features: ['Automatic gearbox', 'Touchscreen with Android Auto / CarPlay', 'Cruise control', 'Rear AC vents'],
  },
  {
    slug: 'maruti-suzuki-brezza', name: 'Maruti Suzuki Brezza', category: 'SUV',
    seats: 5, bags: 3, fuel: 'Petrol', transmission: 'Manual',
    featured: false, published: true, order: 3,
    images: [unsplash('1642345810417-eecf7dda339b')],
    summary: 'Compact SUV height without the big-SUV bulk.',
    description: 'Higher seating and good ground clearance for broken roads, with the easy handling of a smaller car.',
    features: ['High ground clearance', 'Touchscreen infotainment', 'Rear camera', 'Cruise control'],
  },
  {
    slug: 'hyundai-creta', name: 'Hyundai Creta', category: 'SUV',
    seats: 5, bags: 3, fuel: 'Diesel', transmission: 'Automatic',
    featured: true, published: true, order: 4,
    images: [unsplash('1748214547184-d994bfe53322'), unsplash('1748214547306-360d11024747')],
    summary: 'The comfortable SUV for long weekends.',
    description: 'A refined diesel automatic that eats highway kilometres without fuss. Spacious for five with a boot that takes a family’s weekend bags.',
    features: ['Panoramic sunroof', 'Ventilated front seats', 'Automatic climate control', '6 airbags'],
  },
  {
    slug: 'toyota-innova-crysta', name: 'Toyota Innova Crysta', category: 'MUV',
    seats: 7, bags: 4, fuel: 'Diesel', transmission: 'Manual',
    featured: true, published: true, order: 5,
    images: [unsplash('1748215210939-ad8b6c8c086d'), unsplash('1748215210950-536c6621629a')],
    summary: 'Seven seats, real luggage space, all-day comfort.',
    description: 'The go-to for family trips, airport pickups with lots of luggage and group travel. Captain seats in the middle row keep long drives comfortable.',
    features: ['7 seats with captain chairs', 'Roof AC vents for every row', 'Large boot with third row folded', 'Chauffeur available'],
  },
  {
    slug: 'mahindra-thar', name: 'Mahindra Thar', category: 'SUV',
    seats: 4, bags: 1, fuel: 'Diesel', transmission: 'Manual',
    featured: true, published: true, order: 6,
    images: [unsplash('1785330865151-f2120b37469c'), unsplash('1710225358761-4f5891df657d'), unsplash('1723306975792-f5a053a59dd3')],
    summary: 'For hill roads, beach runs and weekends that need a story.',
    description: 'A proper 4x4 for the drive itself. Best for two to four people travelling light.',
    features: ['4x4 with low-range', 'Convertible hard top', 'Touchscreen infotainment', 'All-terrain tyres'],
  },
  {
    slug: 'toyota-fortuner', name: 'Toyota Fortuner', category: 'SUV',
    seats: 7, bags: 3, fuel: 'Diesel', transmission: 'Automatic',
    featured: false, published: true, order: 7,
    images: [unsplash('1664783856972-ac9922d7b2d3')],
    summary: 'Full-size, seven-seat presence for occasions and long hauls.',
    description: 'A commanding seven-seater for weddings, VIP pickups and long highway journeys.',
    features: ['7 seats', 'Automatic gearbox', 'Leather upholstery', 'Chauffeur available'],
  },
];

export const posts = [
  {
    slug: 'choosing-the-right-car-for-a-family-road-trip',
    title: 'Choosing the right car for a family road trip',
    excerpt: 'Seats are only half the story. Here is how to match the car to your group, your bags and the road ahead.',
    cover: unsplash('1596829568009-bc436aac1b63'),
    publishedAt: '2026-10-14', published: true,
    body: `Picking a car for a family trip usually starts with a headcount. That is a good start — but the bags, the road and the length of the drive matter just as much.

## Count bags, not just people

A five-seater fits five people, but rarely five people *and* their luggage. As a rule of thumb:

- **Hatchback** — two adults and two cabin bags.
- **Sedan or compact SUV** — four adults, two large suitcases.
- **MUV like the Innova Crysta** — six or seven people with luggage for a long weekend.

## Think about the road

Hill roads and village stretches are easier with ground clearance. If your route has broken patches, an SUV makes the drive calmer for everyone.

## Long drive? Prioritise comfort

For anything over four hours, rear AC vents, a supportive back seat and an automatic gearbox make a noticeable difference by the end of the day.

Not sure which fits? Send us your route and group size on WhatsApp and we will suggest two or three options.`,
  },
  {
    slug: 'documents-to-keep-ready-before-renting-a-car',
    title: 'Documents to keep ready before renting a car',
    excerpt: 'A short checklist so pickup takes minutes, not an hour.',
    cover: unsplash('1706076997331-d9cdfb7cf485'),
    publishedAt: '2026-10-07', published: true,
    body: `The quickest pickups happen when the paperwork is sorted before you arrive. Here is what to keep handy.

## For self-drive rentals

- A valid driving licence (original).
- A government photo ID.
- Address proof, if asked.

## For chauffeur-driven trips

Usually just a contact number and the pickup details — but share any special requests (child seat, extra luggage) in advance.

## Before you drive off

Walk around the car, note any existing scratches and check the fuel level. A two-minute check saves a lot of back-and-forth later.

*The exact documents can vary by trip. We always confirm the list on WhatsApp before your booking.*`,
  },
  {
    slug: 'a-packing-list-for-your-next-weekend-drive',
    title: 'A packing list for your next weekend drive',
    excerpt: 'Chargers, snacks and the one thing everyone forgets.',
    cover: unsplash('1638803540181-7dc1c37a6952'),
    publishedAt: '2026-09-29', published: true,
    body: `A good weekend drive needs surprisingly little — as long as it is the right little.

## In the cabin

- Phone chargers and a car adapter.
- Water bottles and a few snacks.
- Sunglasses and a light jacket.

## In the boot

- A small first-aid kit.
- A torch.
- A reusable bag for rubbish.

## The one thing everyone forgets

Offline maps. Download your route before you leave — network can drop on ghats and highways.`,
  },
];

export const reviews = [
  { name: 'Sample reviewer', location: 'Airport transfer', rating: 5, text: 'Placeholder review — replace with a genuine, client-approved testimonial. The car was spotless and the pickup was right on time.', published: true },
  { name: 'Sample reviewer', location: 'Weekend trip', rating: 5, text: 'Placeholder review — replace with a genuine testimonial. Messaged on WhatsApp in the morning and had an SUV by the afternoon.', published: true },
  { name: 'Sample reviewer', location: 'Family outstation', rating: 5, text: 'Placeholder review — replace with a genuine testimonial. The Innova had plenty of room for seven of us and all the bags.', published: true },
  { name: 'Sample reviewer', location: 'Wedding cars', rating: 4, text: 'Placeholder review — replace with a genuine testimonial. Three cars for guest pickups, all coordinated over one chat.', published: true },
];
