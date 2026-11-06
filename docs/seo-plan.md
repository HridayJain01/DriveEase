# Drive Ease SEO plan (Mumbai)

Which page answers which search, and what to do next. There are no search volume numbers here because those need a paid tool. Google Search Console gives the real numbers free once the site is verified, and Google Trends can compare two phrases.

## Which page targets which search

Each search phrase has one page, so our own pages don't compete with each other.

| Page | Main search | Also covers |
| --- | --- | --- |
| `/` | car rental in Mumbai | rent a car Mumbai, car hire Mumbai |
| `/fleet` | cars for rent in Mumbai | rental cars Mumbai |
| `/services/self-drive` | self-drive car rental in Mumbai | self drive cars Mumbai |
| `/services/chauffeur` | car with driver in Mumbai | chauffeur driven car Mumbai |
| `/services/airport` | airport transfer in Mumbai | airport car service Mumbai |
| `/services/outstation` | outstation car rental from Mumbai | outstation cars Mumbai |
| `/services/events` | wedding car rental in Mumbai | cars for events Mumbai |
| `/services/monthly` | monthly car rental in Mumbai | corporate car rental Mumbai |
| `/routes/mumbai-to-lonavala` | Mumbai to Lonavala car rental | Mumbai to Lonavala by car, distance |
| `/routes/mumbai-to-pune` | Mumbai to Pune car rental | Mumbai to Pune one way car |
| `/routes/mumbai-to-nashik` | Mumbai to Nashik car rental | Mumbai to Trimbakeshwar by car |
| `/routes/mumbai-to-shirdi` | Mumbai to Shirdi car rental | Mumbai to Shirdi by car, distance |
| `/routes/mumbai-to-alibaug` | Mumbai to Alibaug car rental | Alibaug by road or ferry |
| `/routes/mumbai-to-mahabaleshwar` | Mumbai to Mahabaleshwar car rental | Mahabaleshwar by car from Mumbai |
| `/routes/mumbai-to-goa` | Mumbai to Goa car rental | Mumbai to Goa by road, NH48 or NH66 |
| `/car-rental/mumbai-airport` | car rental at Mumbai Airport | Mumbai Airport pickup car |
| `/car-rental/andheri`, `/bandra`, `/dadar`, `/powai`, `/borivali`, `/south-mumbai` | car rental in (area) | car on rent in (area) |
| `/cars/hatchback`, `/sedan`, `/suv`, `/7-seater`, `/automatic` | (type) on rent in Mumbai | which type suits a trip |
| `/blog/weekend-drives-from-mumbai` | weekend drives from Mumbai | road trips near Mumbai |
| `/blog/mumbai-airport-pickup-checklist` | Mumbai airport pickup | which Mumbai airport or terminal |
| `/blog/what-decides-car-rental-cost-in-mumbai` | car rental cost in Mumbai | what affects rental cost, with no prices quoted |
| `/blog/self-drive-or-with-driver` | self-drive or with driver | which is better for a Mumbai trip |
| `/which-car-fits` | which car fits my group and bags | how many suitcases fit in a sedan or 7-seater |

## How the pages connect

```
Home
├── Fleet ── each car ── car type pages
├── Services ── each service
│   └── Outstation trips ── routes
├── Routes (/routes) ── each route ── other routes, suitable cars, weekend drives article
├── Areas (/car-rental) ── each area ── other areas, routes
├── Journal ── each article ── linked route and car type pages
├── Concierge, About, Contact
└── Privacy, Terms (footer)
```

The footer links to every route, area and car type, so every page is at most two clicks from the home page.

## Writing rules for these pages

- Answer the search in the first paragraph, in under 65 words.
- Each page must say something true that the others don't. Swapping a place name is not a new page, and Google treats that kind of page as spam.
- No prices, discounts or promises that a car is free. Those are settled on WhatsApp.
- Label distances and times as approximate, and re-check them every few months.
- Only reviews and ratings from real customers, and none in Google's data unless they are shown on the page.

## What to write next

Add these one at a time, only where you can say something useful:

1. Driving the Mumbai–Pune Expressway in the monsoon.
2. Thane or Navi Mumbai as area pages, only if the business really serves them.
3. A page about hiring several cars for a wedding, using real examples once you have them.
4. More routes, such as Igatpuri, Kolhapur or Matheran, if people ask about them on WhatsApp.
5. A short Hindi page, if customers ask in Hindi and the client can check the wording.

The best ideas come from questions customers already ask on WhatsApp, and from the searches shown in Search Console.

## How to measure it, free

| Tool | What it tells you | How often |
| --- | --- | --- |
| Google Search Console | Which searches show the site, clicks, indexing errors | Monthly |
| Admin → Insights | WhatsApp taps and calls per car and per part of the site, including "Route, area & car type pages". Needs the database | Monthly |
| Google Analytics (optional) | Which pages and searches lead to WhatsApp taps and calls. Works without the database | Monthly |
| Google Business Profile | Calls, map views and direction requests | Monthly |
| PageSpeed Insights | Speed on phones | After big changes |
| Asking ChatGPT, Perplexity and Google "car rental in Mumbai" questions | Whether AI answers mention Drive Ease | Every few months |

See [launch-kit.md](launch-kit.md) for the Google Business Profile, listings, reviews and links.

## Text the client needs to confirm

- The seven areas in `server/seed-data.js` and Site details. Remove any the business doesn't serve: its page disappears with it.
- The service descriptions, FAQs and route advice. All are drafts.
- The privacy policy and terms, ideally with a lawyer. They describe how the site works, but they are not legal advice.
