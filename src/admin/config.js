import { formatDate } from '../lib.js';

// What each admin section edits. Field types are rendered by Fields.jsx.
export const collections = {
  vehicles: {
    label: 'Cars', singular: 'car', api: '/api/admin/vehicles',
    title: (d) => d.name || 'Untitled car',
    sub: (d) => [d.category, d.seats && `${d.seats} seats`, d.transmission].filter(Boolean).join(' · '),
    thumb: (d) => d.images?.[0],
    view: (d) => `/fleet/${d.slug}`,
    blank: { name: '', category: '', seats: 5, bags: 2, fuel: 'Petrol', transmission: 'Manual', summary: '', description: '', features: [], images: [], interiorImages: [], bootImages: [], featured: false, published: false, order: 0, slug: '' },
    main: [
      { name: 'name', label: 'Car name', required: true, max: 80, placeholder: 'e.g. Hyundai Creta' },
      { name: 'images', label: 'Exterior photos', type: 'images', hint: 'The first photo is the cover on the fleet page. Use real photos of this car.' },
      { name: 'interiorImages', label: 'Interior & dashboard photos', type: 'images', hint: 'Seats, dashboard and cabin. Shown in their own tab on the car’s page.' },
      { name: 'bootImages', label: 'Boot & luggage photos', type: 'images', hint: 'The boot, ideally with bags in it, so customers can judge the space.' },
      { row: [
        { name: 'category', label: 'Type', required: true, max: 40, list: ['Hatchback', 'Sedan', 'SUV', 'MUV'], hint: 'Pick one or type your own.' },
        { name: 'seats', label: 'Seats', type: 'number', min: 1, max: 60 },
        { name: 'bags', label: 'Bags', type: 'number', min: 0, max: 30, hint: 'Large suitcases the boot takes. The Concierge uses this.' },
      ] },
      { row: [
        { name: 'fuel', label: 'Fuel', type: 'select', options: ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'] },
        { name: 'transmission', label: 'Gearbox', type: 'select', options: ['Manual', 'Automatic'] },
      ] },
      { name: 'summary', label: 'One-line summary', max: 160, hint: 'Shown on the car’s card.' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 4, max: 2000 },
      { name: 'features', label: 'Included features', type: 'lines', hint: 'One per line.' },
    ],
    side: [
      { name: 'published', label: 'Published', type: 'toggle', hint: 'Show this car on the website.' },
      { name: 'featured', label: 'Featured', type: 'toggle', hint: 'Adds a badge and shows it first on the home page.' },
      { name: 'order', label: 'Display order', type: 'number', hint: 'Lower numbers show first.' },
      { name: 'slug', label: 'Web address', prefix: '/fleet/', max: 100, hint: 'Made from the name if left empty.' },
    ],
  },
  posts: {
    label: 'Blog', singular: 'post', api: '/api/admin/posts',
    title: (d) => d.title || 'Untitled post',
    sub: (d) => formatDate(d.publishedAt),
    thumb: (d) => d.cover,
    view: (d) => `/blog/${d.slug}`,
    blank: { title: '', excerpt: '', cover: '', body: '', published: false, publishedAt: new Date().toISOString(), slug: '' },
    main: [
      { name: 'title', label: 'Title', required: true, max: 140 },
      { name: 'excerpt', label: 'Summary', type: 'textarea', rows: 2, max: 300, hint: 'Shown on the blog page and in search results.' },
      { name: 'cover', label: 'Cover photo', type: 'image' },
      { name: 'body', label: 'Article', type: 'markdown' },
    ],
    side: [
      { name: 'published', label: 'Published', type: 'toggle', hint: 'Show this post on the website.' },
      { name: 'publishedAt', label: 'Date', type: 'date' },
      { name: 'slug', label: 'Web address', prefix: '/blog/', max: 160, hint: 'Made from the title if left empty.' },
    ],
  },
  reviews: {
    label: 'Reviews', singular: 'review', api: '/api/admin/reviews',
    title: (d) => d.name || 'Unnamed reviewer',
    sub: (d) => `${'★'.repeat(d.rating || 0)}${d.location ? ` · ${d.location}` : ''}`,
    blank: { name: '', location: '', rating: 5, text: '', published: false, order: 0 },
    main: [
      { row: [
        { name: 'name', label: 'Reviewer’s name', required: true, max: 80 },
        { name: 'location', label: 'Trip or place', max: 80, placeholder: 'e.g. Airport transfer' },
      ] },
      { name: 'rating', label: 'Rating', type: 'select', options: [5, 4, 3, 2, 1].map((n) => ({ value: n, label: `${'★'.repeat(n)} (${n})` })), number: true },
      { name: 'text', label: 'Review', type: 'textarea', rows: 5, required: true, max: 800, hint: 'Only publish genuine reviews you have permission to use.' },
    ],
    side: [
      { name: 'published', label: 'Published', type: 'toggle', hint: 'Show this review on the website.' },
      { name: 'order', label: 'Display order', type: 'number', hint: 'Lower numbers show first.' },
    ],
  },
};

export const settingsFields = [
  { section: 'Business', fields: [
    { name: 'businessName', label: 'Business name', required: true, max: 80 },
    { name: 'tagline', label: 'Tagline', max: 200, hint: 'Shown under the home page headline and in the footer.' },
    { name: 'city', label: 'City', max: 60, hint: 'Used in page titles and headings for Google, e.g. “Car rental in Pune”. Write just the city name.' },
    { name: 'serviceAreas', label: 'Areas you serve', type: 'lines', hint: 'One per line, e.g. nearby areas, the airport and towns you often drive to. Shown on the home page and told to Google.' },
  ] },
  { section: 'Contact', fields: [
    { row: [
      { name: 'phone', label: 'Phone', required: true, max: 20 },
      { name: 'email', label: 'Email', type: 'email', max: 120 },
    ] },
    { name: 'address', label: 'Address', type: 'textarea', rows: 2, max: 300 },
    { name: 'mapUrl', label: 'Google Maps link', type: 'url' },
    { name: 'hours', label: 'Opening hours', max: 80, placeholder: 'Open daily, 7 am – 11 pm' },
  ] },
  { section: 'WhatsApp', fields: [
    { name: 'whatsappNumber', label: 'WhatsApp number', required: true, max: 15, pattern: '\\d{8,15}', hint: 'Digits only, with country code — e.g. 918879790490.' },
    { name: 'whatsappMessage', label: 'Pre-filled message', type: 'textarea', rows: 2, max: 300, hint: 'Typed for visitors when they tap a WhatsApp button.' },
    { name: 'whatsappCatalogueUrl', label: 'WhatsApp catalogue link', type: 'url', hint: 'Optional. Shown in the footer and on the contact page.' },
  ] },
  { section: 'Google', fields: [
    { name: 'googleReviewUrl', label: 'Google review link', type: 'url', hint: 'From your Google Business Profile: “Ask for reviews” → copy the link (it looks like https://g.page/r/…). Adds “Review us on Google” buttons to the website and an “Ask for a Google review” button to confirmed and closed enquiries.' },
    { name: 'googleSiteVerification', label: 'Google Search Console code', max: 100, hint: 'Search Console → Add property → HTML tag. Paste only the code inside content="…". Proves to Google that you own the site.' },
  ] },
  { section: 'Social links', fields: [
    { name: 'socials', type: 'group', fields: [
      { name: 'instagram', label: 'Instagram', type: 'url' },
      { name: 'facebook', label: 'Facebook', type: 'url' },
      { name: 'youtube', label: 'YouTube', type: 'url' },
    ] },
  ] },
  { section: 'About page', fields: [
    { name: 'about', type: 'group', fields: [
      { name: 'story', label: 'Our story', type: 'textarea', rows: 8, max: 4000, hint: 'Leave a blank line between paragraphs.' },
      { row: [
        { name: 'founderName', label: 'Founder’s name', max: 80 },
        { name: 'founderRole', label: 'Founder’s title', max: 80 },
      ] },
      { name: 'founderQuote', label: 'Founder’s quote', type: 'textarea', rows: 2, max: 400 },
      { name: 'founderPhoto', label: 'Founder’s photo', type: 'image' },
      { name: 'promises', label: 'What customers can expect', type: 'list', item: 'point', blank: { title: '', text: '' }, fields: [
        { name: 'title', label: 'Heading', max: 60 },
        { name: 'text', label: 'Text', type: 'textarea', rows: 2, max: 240 },
      ] },
    ] },
  ] },
  { section: 'Services', fields: [
    { name: 'services', type: 'list', item: 'service', blank: { name: '', summary: '', details: '' }, fields: [
      { name: 'name', label: 'Service name', required: true, max: 60 },
      { name: 'summary', label: 'One-line summary', max: 160 },
      { name: 'details', label: 'Details', type: 'textarea', rows: 6, max: 3000, hint: 'Each service gets its own page on Google. Write 150–300 words: what’s included, typical trips, areas covered. Leave a blank line between paragraphs.' },
    ] },
  ] },
  { section: 'FAQs', hint: 'Only include answers the business has confirmed.', fields: [
    { name: 'faqs', type: 'list', item: 'question', blank: { q: '', a: '' }, fields: [
      { name: 'q', label: 'Question', required: true, max: 160 },
      { name: 'a', label: 'Answer', type: 'textarea', rows: 3, max: 800 },
    ] },
  ] },
];
