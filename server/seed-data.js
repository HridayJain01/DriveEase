// Starting content. The city, phone, WhatsApp number and email are the client's. The service and FAQ text,
// cars and photos are drafts for the client to approve (PRD §13). Reviews are placeholders and stay unpublished.
const unsplash = (id) => `https://images.unsplash.com/photo-${id}`;

export const site = {
  businessName: 'Drive Ease',
  tagline: 'Car rentals in Mumbai for airport runs, weekend getaways and everything in between.',
  city: 'Mumbai',
  // Parts of Mumbai with a landing page. A first list for the client to confirm: remove any they don't serve.
  serviceAreas: ['Mumbai Airport', 'Andheri', 'Bandra', 'Dadar', 'Powai', 'Borivali', 'South Mumbai'],
  phone: '+91 88797 90490',
  whatsappNumber: '918879790490',
  whatsappMessage: "Hi Drive Ease, I'd like to enquire about renting a car.",
  whatsappCatalogueUrl: '',
  email: 'shreyans342@gmail.com',
  address: '', // add the real one in Site details: Google needs it to match the Business Profile
  mapUrl: '',
  hours: 'Open daily, 7 am – 11 pm',
  socials: {},
  about: {
    story:
      "Drive Ease started with a simple idea: renting a car should feel as easy as borrowing one from a friend. No long forms, no surprises at pickup — just a clean car, straight answers and someone who answers when you message.\n\nToday we look after travellers in Mumbai heading to the airport, families on weekend getaways and teams that need a reliable car for a few days or a few months.",
    founderName: '',
    founderRole: '',
    founderQuote: '',
    founderPhoto: '',
    promises: [
      { title: 'Everything in writing', text: 'Deposit, kilometre limits and pickup details are confirmed in the chat before you go.' },
      { title: 'Cleaned between trips', text: 'Every car is cleaned and checked before it goes out again.' },
      { title: 'One chat, start to finish', text: 'Enquiry, confirmation and pickup details all live in one WhatsApp thread.' },
    ],
  },
  services: [
    { slug: 'self-drive', name: 'Self-drive rentals', summary: "Take the wheel yourself in Mumbai, by the day, weekend or week.", details: "Rent a car in Mumbai and drive it on your own schedule. Pick a hatchback for squeezing through city traffic and tight parking, a sedan for a comfortable commute, or an SUV or seven-seater when more people are coming along.\n\nGetting started is simple. Choose a car from the fleet, message us on WhatsApp with your dates and pickup point, and share your driving licence and ID. We confirm availability, the deposit and any kilometre limits in the chat before you commit, so nothing comes as a surprise at pickup.\n\nSelf-drive suits a day of errands across the city, a visiting family who need to get around, or a weekend when you would rather leave on your own time. Not sure which car fits? The Concierge asks four quick questions and suggests the right one." },
    { slug: 'chauffeur', name: 'Chauffeur-driven', summary: "Sit back in Mumbai traffic while an experienced driver handles the road.", details: "Hire a car with a driver in Mumbai when you would rather not drive yourself. It makes sense for a long day of meetings, for elderly parents visiting relatives across the city, or for any trip where finding parking is the last thing you want to think about.\n\nTell us your route, your timing and how many people are travelling. We match you with a suitable car and driver and confirm everything on WhatsApp, including availability and what is included, before you commit.\n\nA chauffeur-driven car also works well for longer drives out of the city, where you can rest on the way and arrive fresh. Share your plan with us and we will suggest what fits." },
    { slug: 'airport', name: 'Airport transfers', summary: "Mumbai airport pickups and drops, with room for the luggage.", details: "Book a car for your Mumbai airport pickup or drop at Chhatrapati Shivaji Maharaj International Airport. Flying through Navi Mumbai International Airport instead? Tell us and we will confirm what we can do. Share your flight time, terminal, your pickup or drop address, and how many people and bags are travelling.\n\nLuggage is what usually goes wrong on an airport run, so we look at your bags as well as your headcount. A family with big suitcases may need a seven-seater or an SUV even if everyone would fit in a smaller car. We suggest a car with enough boot space and confirm the pickup point on WhatsApp.\n\nLeaving early or landing late? Tell us when you message and we will confirm what is possible for your timing." },
    { slug: 'outstation', name: 'Outstation trips', summary: "One-way or round trips from Mumbai to nearby cities and getaways.", details: "Planning a drive out of Mumbai? Popular trips include Lonavala, Pune, Nashik, Alibaug and Mahabaleshwar. Tell us where you are headed, for how many days and how many people are coming, and we will recommend a car that suits the road and the group.\n\nGhat roads and long highway stretches feel very different in a small hatchback than in an SUV or a seven-seater, especially with a full boot. We help you choose on comfort and luggage space, not just the number of seats.\n\nYou can drive yourself or ask for a driver. Deposit, kilometre limits and what is included are all confirmed in writing on WhatsApp before you leave." },
    { slug: 'events', name: 'Weddings & events', summary: "Well-kept cars in Mumbai for the big day and the guests around it.", details: "Hire cars for weddings and family functions in Mumbai, from a car for the couple to several cars for guest pickups between the venue, hotels and the airport.\n\nEvents run on tight timings, so it helps to plan early. Share your dates, venues and the number of guests who need a ride, and we will work out how many cars you need and of what type. Everything is confirmed with you on WhatsApp, so one person can keep track of it all in a single chat.\n\nCorporate events and group outings work the same way. Tell us the plan and we will suggest what fits." },
    { slug: 'monthly', name: 'Monthly & corporate', summary: "Longer car rentals in Mumbai for teams, projects and relocations.", details: "Need a car in Mumbai for a few weeks or months? A longer rental suits people who have just moved to the city, teams working on a project here, and companies with visiting staff.\n\nTell us how long you need the car, how much you expect to drive and whether you want a driver. We will suggest a suitable car and explain what is included for longer rentals, all in writing on WhatsApp.\n\nIf your needs change partway through, message us in the same chat and we will see what can be arranged." },
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
    slug: 'weekend-drives-from-mumbai',
    title: 'Five weekend drives from Mumbai and the car for each',
    excerpt: 'Lonavala, Alibaug, Nashik, Pune and Mahabaleshwar: how far each one is, how long it takes and which car suits the road.',
    cover: unsplash('1596829568009-bc436aac1b63'),
    publishedAt: '2026-11-05', published: true,
    body: `The five most popular weekend drives from Mumbai are Lonavala, Alibaug, Nashik, Pune and Mahabaleshwar. They run from about 2 hours to about 7 hours by car, and each one suits a slightly different car.

All distances and times here are approximate, and they depend on traffic and where in Mumbai you start.

| Drive | Distance and time | A car that suits it |
| --- | --- | --- |
| [Lonavala](/routes/mumbai-to-lonavala) | About 83 km, 2 hours | Any well-kept car. An SUV for side roads in the monsoon |
| [Pune](/routes/mumbai-to-pune) | About 150 km, 3 hours | A sedan, with or without a driver |
| [Alibaug](/routes/mumbai-to-alibaug) | About 100 km, 2.5 to 3.5 hours | A hatchback or compact SUV for narrow lanes |
| [Nashik](/routes/mumbai-to-nashik) | About 170 km, 3.5 to 4 hours | A seven-seater or SUV for family trips |
| [Mahabaleshwar](/routes/mumbai-to-mahabaleshwar) | About 260 km, 5 to 7 hours | An SUV or seven-seater. Consider a driver |

## Lonavala: the short one

If you only have a day, go to Lonavala. It is close enough to go and come back, as long as you leave early and start home before evening traffic builds. It is at its greenest in the monsoon, but fog can settle on the ghat, so take it slowly.

## Alibaug: the beach one

You can drive around through Atal Setu and Pen, or take your car across on the Ro-Ro ferry from Bhaucha Dhakka to Mandwa. From South Mumbai, the ferry is often the more relaxed choice if a sailing fits your plans. Check timings with the operator first, since they change with the season and the sea.

## Nashik: the family one

This is a favourite for temple trips to Trimbakeshwar and Panchavati, as well as for the vineyards. Traffic around Thane and Bhiwandi is usually the slowest part, so an early start helps. If elders are coming, choose a car that is easy to get in and out of.

## Pune: the practical one

Most people on this road have somewhere to be. It is an easy Expressway drive, which is why a sedan suits it well. If you have a day of meetings at the other end, a driver lets you work on the way and saves you looking for parking.

## Mahabaleshwar: the long one

Don't try to do this in a day. Plan at least one night, and try to reach Pasarni Ghat in daylight. It is best in winter and early summer, because heavy rain from June to September slows down a lot of the town.

## Before any of them

- **Leave early.** Getting out of Mumbai usually takes more time than any ghat.
- **Sort out FASTag.** The Expressway and Atal Setu are toll roads, so ask about it when you enquire.
- **Download offline maps.** Network can drop in the ghats.
- **Count your bags as well as your people.** A full car with big suitcases needs more than just enough seats.

Not sure which to choose? Tell us your plan on WhatsApp, or let the [Concierge](/concierge) suggest a car in four quick questions.`,
  },
  {
    slug: 'mumbai-airport-pickup-checklist',
    title: 'Mumbai airport pickup: a checklist before you fly',
    excerpt: 'Which airport, which terminal, your bags and where to meet: what to confirm so that your pickup goes smoothly.',
    cover: unsplash('1638803540181-7dc1c37a6952'),
    publishedAt: '2026-11-05', published: true,
    body: `Before a Mumbai airport pickup, confirm four things: which airport, which terminal, when you land and how many bags you have. Most pickup problems start with one of these.

## 1. Check which airport you are using

Mumbai now has two airports. Chhatrapati Shivaji Maharaj International Airport is in the city, and Navi Mumbai International Airport began commercial flights in December 2025. They are far apart, so a pickup planned for the wrong one can cost you hours. Your ticket will say which you are using.

## 2. Check your terminal on the day

Terminals at the Mumbai airport have been changing. As of November 2026, Terminal 1 is being rebuilt in phases, and reports differ on exactly how that affects each flight. Some flights have moved to Terminal 2 or to Navi Mumbai. Don't rely on the terminal you used last time. Check your airline's app on the day you travel, and share what it says.

## 3. Share your flight number and timing

Send your flight number along with your landing time. Allow for the walk, immigration if you are arriving from abroad, and the wait for bags. International arrivals usually take longer than domestic ones.

## 4. Count the bags, not only the people

This is where most airport runs go wrong. Four adults may fit in a hatchback, but their four big suitcases won't. If your group has more than two full-size suitcases, consider a sedan, an SUV or a [seven-seater](/cars/7-seater).

## 5. Agree where to meet

Airport pickup areas are busy and can change, so agree on the meeting point before you fly and keep your phone charged. Having one WhatsApp chat with all the details means you won't need to look for them while you are standing at the kerb with your bags.

## 6. Driving yourself afterwards?

Keep your licence and ID within easy reach. Our [guide to the documents you need](/blog/documents-to-keep-ready-before-renting-a-car) covers the rest.

Ready to plan it? See [Mumbai Airport car rental](/car-rental/mumbai-airport), or send us your flight on WhatsApp and we will confirm the car and the meeting point.`,
  },
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
  { name: 'Sample reviewer', location: 'Airport transfer', rating: 5, text: 'Placeholder review — replace with a genuine, client-approved testimonial. The car was spotless and the pickup was right on time.', published: false },
  { name: 'Sample reviewer', location: 'Weekend trip', rating: 5, text: 'Placeholder review — replace with a genuine testimonial. Messaged on WhatsApp in the morning and had an SUV by the afternoon.', published: false },
  { name: 'Sample reviewer', location: 'Family outstation', rating: 5, text: 'Placeholder review — replace with a genuine testimonial. The Innova had plenty of room for seven of us and all the bags.', published: false },
  { name: 'Sample reviewer', location: 'Wedding cars', rating: 4, text: 'Placeholder review — replace with a genuine testimonial. Three cars for guest pickups, all coordinated over one chat.', published: false },
];
