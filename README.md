# Drive Ease

The website for Drive Ease, a car-rental business. Visitors enquire through WhatsApp or a form. The site doesn't take bookings or payments (see PRD §1.2).

**Stack:** React (Vite) · Express · MongoDB Atlas · Cloudinary · Vercel. All of these run on free tiers.

## Run it

```bash
npm install
cp .env.example .env   # then fill in MONGODB_URI, SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, CLOUDINARY_URL
npm run seed           # first time only: loads sample content + creates the admin login
npm run dev            # site → http://localhost:5173, admin → /admin
npm run demo           # no Atlas needed: throwaway in-memory database with the sample content (see below)
npm run build && npm start   # production preview → http://localhost:3001 (server-rendered meta, real 404s)
npm test               # matching engine, WhatsApp messages, shortlist storage, enquiry validation, auth + API tests
npm run build          # production build → dist/
```

**`npm run demo`** starts a throwaway MongoDB in memory (via the `mongodb-memory-server-core` dev dependency, which downloads a MongoDB binary the first time you run it, not on install, so deploys stay fast), loads the sample content and three sample enquiries, and runs the API on port 3002 plus Vite. Nothing is saved when it stops. Local demo admin: `admin@demo.test` / `demo-password-123` (override with `DEMO_ADMIN_EMAIL` / `DEMO_ADMIN_PASSWORD`). It never touches `.env` or Atlas.

`npm run seed` only fills **empty** collections, so it is safe to re-run. Run it again with a new `ADMIN_PASSWORD` to reset a forgotten admin password. `npm run seed -- --force` wipes cars, posts, reviews and site details and reloads the samples.

## Admin (`/admin`)

| Section | What the client can do |
|---|---|
| Enquiries | Dashboard with live counts (New, Contacted, Quote sent, Confirmed, Closed, Follow-ups due), search, status filters, pagination, internal notes, follow-up dates, reply on WhatsApp or call in one tap |
| Cars | Add, edit, publish/unpublish, feature, reorder and delete cars. Upload exterior, interior & dashboard, and boot & luggage photos (button or drag-and-drop), reorder them and pick the cover |
| Blog | Write posts in a simple editor with formatting buttons and a preview, publish/unpublish, set the date and URL |
| Reviews | Add, publish/unpublish and order reviews |
| Site details | Business info, phone, WhatsApp number and message, catalogue link, socials, About page, services, FAQs |
| Account | Change password |

**Photos** upload straight from the browser to Cloudinary (in a `driveease` folder). The server only signs each upload, so the API secret stays on the server and large files never pass through the Vercel function. Before uploading, the browser shrinks photos to at most 2400px, so a typical 4–8 MB phone photo goes up as roughly 300–600 KB. On the site, Cloudinary serves each image in WebP/AVIF at the width the screen needs.

Hidden (unpublished) items never reach the public API. Sign-in is locked for 15 minutes after 10 failed attempts from one IP.

## Customer features

| Feature | Where | How it works |
|---|---|---|
| **Concierge** | `/concierge`, home page band, hero link | Four short steps (trip type · pickup, destination, dates · travellers and bags · type and gearbox), with progress, Back, editable answers and per-step validation. The step is in the URL, so the browser's back button works. `src/concierge/match.js` scores every published car with transparent rules: seats and bags are critical (a car that lacks them is never a match), type and gearbox are preferences, and the trip type only nudges the order (and only on the car's own specs, e.g. spare boot space for an airport run). Every result lists why it fits, what it misses and what couldn't be verified (e.g. a blank spec). If nothing fits, it says so and offers the closest options and WhatsApp. Only answers from steps the customer completed are remembered and added to WhatsApp messages. |
| **Smart WhatsApp enquiry** | every Enquire button (cards, car page, Concierge, Compare, My Garage) | `src/whatsapp.js` builds the message from the car(s) and the trip details the customer actually gave. A review sheet lets them edit and copy it before opening `wa.me` with the number from Site details. It states plainly that nothing is sent or booked yet. If no usable number is configured, the sheet offers the enquiry form, phone and email instead. The sheet also links to the enquiry form with the same details pre-filled: that form is the only way an enquiry reaches the dashboard. |
| **Compare** | `/compare`, compare toggles, floating tray | Up to 3 cars, no duplicates. Rows for type, seats, bags, gearbox, fuel, photos and features, with differences marked, the most seats and bags highlighted and an "only differences" switch. If the visitor used the Concierge, a row shows how each car suits their trip. Stacks into narrow columns on phones. |
| **Car page preview** | `/fleet/:slug` | Gallery grouped into Exterior, Interior & dashboard, and Boot & luggage, with thumbnails, arrows, keyboard arrows, and a full-screen viewer (Esc closes, focus returns). Missing photo groups and specs say so instead of guessing. |
| **My Garage** | `/garage`, heart on every car, count in the top bar | Saved in this browser's localStorage (no account). Remove, compare, enquire about all, share via the phone's share sheet / copy, or send to a friend on WhatsApp. A shared link (`/garage?cars=slug,slug`) carries only public car slugs; it opens as a read-only shortlist the recipient can save. Cars that are no longer listed are flagged with a remove option. |

| **QR code for computers** | WhatsApp review sheet, Contact page | On a large screen with a mouse, a QR code of the same WhatsApp link is shown, so a visitor on a laptop can scan it and continue on their phone. The QR library (`uqr`, 10 KB, no dependencies) loads only when a QR is shown. |
| **Send to family** | car pages, Concierge results, My Garage | Phones open the share sheet; computers open WhatsApp's "choose a chat" screen. The message has the car, its seats, bags, fuel and gearbox, and a link whose preview shows the car's photo. |
| **Insights** (admin) | `/admin/insights` | Anonymous counts per car of WhatsApp taps, "send to family" shares and enquiry forms, for 7, 30 or 90 days, plus where chats start. `POST /api/events` stores only a day, the action, a public car slug and the place on the site, never an IP, device, cookie or message. Each car and action is counted once per visit. |
| **Google reviews** | footer, review sections, admin enquiries | Set the Google review link in Site details. The site then shows "Review us on Google", and confirmed or closed enquiries get an "Ask for a Google review" button that opens WhatsApp to the customer with a thank-you and the link. |

The Concierge trip answers are kept in `sessionStorage` for the visit, so car pages, Compare and WhatsApp messages can reuse them. Nothing from these features is sent to the server unless the visitor submits the enquiry form.

## SEO and speed

- **Local search copy** (`src/seo.js`, shared by browser and server): every title, description and h1 is built from the **City** in Site details, e.g. "Car rental in Pune: self-drive & with driver", "Cars for rent in Pune", "Hyundai Creta on rent in Pune", "Airport transfers in Pune". The sample "Your city" is never used. Each page has exactly one h1 (a small keyword heading above the big slogan, which keeps its look).
- **One page per service** (`/services/:slug`): its own title, h1, the admin's long description, cars picked by the Concierge rules, links to the other services, and a WhatsApp button. These target searches like "airport transfer in <city>".
- **Areas we serve**: a list in Site details, shown on the home page and sent to Google as `areaServed`.
- **Every page is served by Express** (`server/html.js`). It fills in the title, description, canonical URL, Open Graph/X tags (locale `en_IN`) and a 1200×630 preview image, so a car page shared on WhatsApp shows the car's photo and name. Structured data is one `@graph`: `AutoRental` (phone, email, address, areas served, map, social profiles) on every page, plus `FAQPage` (home), `ItemList` (fleet), `BreadcrumbList` + `Car` (car pages), `BreadcrumbList` + `Service` (service pages) and `BreadcrumbList` + `BlogPosting` (articles). Unknown pages return a real 404 with `noindex`.
- **Search Console:** paste the HTML-tag code in Site details → Google; the server adds the `google-site-verification` meta tag.
- **`/sitemap.xml`** lists all public pages, every service page, every published car (with its last-updated date) and post. **`/robots.txt`** blocks `/admin` and `/api/admin` only, so Google can fetch the public API while rendering; API responses carry `X-Robots-Tag: noindex` so they never appear in results. Submit the sitemap in Google Search Console after launch (FR-14).
- **The first load needs no API round trip.** The server embeds that page's data in the HTML, so content paints immediately, then the browser quietly refreshes it.
- **Caching:** on Vercel, page HTML is cached for 60 s and public API responses for 10 s, with stale-while-revalidate, so most visitors never wait on the database. Admin edits show up within about a minute. Built JS/CSS is cached for a year (file names change on every build).
- **Bundle size:** the main bundle is about 170 KB gzipped. The Concierge (5 KB), Compare (3 KB), My Garage (2 KB), admin (11 KB) and Markdown renderer (14 KB) load only where they're needed.
- **Accessibility:** axe-core reports no WCAG 2 A/AA or best-practice violations on any public or admin page. The site has keyboard focus styles, a skip link, honours reduced motion, and has no horizontal overflow at 375 px, 768 px or 1440 px.

## Layout

```
server/app.js        Express API: public, auth and admin routes (also the Vercel function in Phase 5)
server/db.js         MongoDB connection + models (validation lives here)
server/auth.js       Password hashing (scrypt) and signed session cookies
server/cloudinary.js Signs browser-to-Cloudinary uploads
server/html.js       Server-rendered page meta, sitemap.xml, robots.txt
src/seo.js           Page titles/descriptions shared by browser and server
server/seed.js       `npm run seed`: sample content and the admin login
server/seed-data.js  Sample content: replace it with client-approved content
server/enquiry.js    Validates enquiries and staff updates; builds the dashboard's search filter
server/events.js     Validates the anonymous WhatsApp-tap / share counter
server/app.test.js   API tests against an in-memory MongoDB (auth, enquiries, dashboard)
scripts/demo.js      `npm run demo`: local demo without Atlas
src/admin/           Admin panel (separate bundle, loaded only on /admin)
src/main.jsx         Routes
src/components.jsx   Shared UI: layout, cards, trip planner, enquiry form
src/features.jsx     Save/compare toggles, WhatsApp review sheet, compare tray, car gallery
src/concierge/       Concierge matching rules (pure functions, tested)
src/whatsapp.js      WhatsApp message + link builder (tested)
src/stores.js        My Garage, compare list and trip answers in browser storage (tested)
src/fleet.js         Fleet helpers: photo groups, known/unknown specs
src/track.js         Sends the anonymous tap counter (sendBeacon)
src/pages/*.jsx      One file per page
src/styles.css       The whole design system (tokens at the top)
```

## Design direction

Light and warm, with dark photo bands. The client found the earlier all-dark look too dark.
- **Colour:** warm off-white page `#f6f4ef`, white cards, ink `#161a20`, one headlight-amber accent `#ffb224` for buttons. Amber text uses a darker `#985700` (large headings `#d18400`) so it stays readable on light backgrounds. The photo hero, the footer and the full-screen photo viewer keep a dark palette. All colours are tokens at the top of `src/styles.css`.
- **Type:** Archivo (expanded) for headings, Geist for body text, Geist Mono for specs and labels.
- **Signature:** the hero's quick enquiry card and the Concierge, both of which write the WhatsApp message for the customer.
- **No prices:** the client doesn't want rates on the website. Cars show specs and photos; pricing is discussed on WhatsApp.

## Phases

| # | Phase | Status | Needs from you |
|---|-------|--------|----------------|
| 1 | Design system and every public page (Home, About, Services, Fleet and car pages, Blog, Contact and Reviews), trip planner, enquiry form, WhatsApp handoff, using sample data | ✅ Done | — |
| 2 | MongoDB and the admin CMS: sign-in, managing cars, posts and reviews, editable site details, and an inbox for form enquiries | ✅ Done | `MONGODB_URI` |
| 3 | Cloudinary photo uploads from the admin (straight from the browser, so no server size limits) | ✅ Built (needs a real key to confirm) | Cloudinary cloud name, API key and secret |
| 4 | SEO and polish: sitemap.xml, robots.txt, per-page meta, LocalBusiness schema, code-splitting, and QA at phone, tablet and desktop sizes | ✅ Done | — |
| 5 | Vercel deploy, custom domain with HTTPS, admin handover guide | In progress: waiting on Atlas | Vercel access, domain |

## Deploying (Vercel)

The project is linked to the Vercel project **drive-ease** (`.vercel/`). `vercel.json` sends every request that isn't a static file to the Express function (`api/index.js`). Built JS/CSS is served from Vercel's CDN.

**Environment variables** (Vercel → Project → Settings → Environment Variables, Production):

| Variable | Value |
|---|---|
| `MONGODB_URI` | Atlas connection string, including `/driveease` before the `?` |
| `SESSION_SECRET` | ✅ already set (random) |
| `CLOUDINARY_URL` | from the Cloudinary dashboard (optional, enables photo uploads) |
| `SITE_URL` | the custom domain once connected, e.g. `https://www.example.in`. Until then Vercel's own production URL is used automatically |

**Atlas:** under Network Access, allow `0.0.0.0/0`. Vercel has no fixed IPs, and the connection string's password still protects the database. Seed the Atlas database once from your machine with `npm run seed` (with `MONGODB_URI` in `.env` pointing at Atlas).

**Deploy:** `npx vercel --prod`. Or connect the GitHub repo in Vercel → Settings → Git so every push to `main` deploys.

**Custom domain (FR-15):** Vercel → Project → Settings → Domains → add the domain, then create the DNS records it shows at the registrar. HTTPS is issued automatically. Then set `SITE_URL` and redeploy.

**After launch (FR-14):** add the domain in Google Search Console and submit `https://DOMAIN/sitemap.xml`.

**Client handover (FR-16):** [HANDOVER.md](HANDOVER.md) is the admin guide for the client.

## Before launch: content that is still sample

Everything `npm run seed` loads (from `server/seed-data.js`) is placeholder content apart from the client's phone and WhatsApp number (+91 88797 90490) and email (shreyans342@gmail.com). All of it is editable in the admin: address, services, founder details, FAQ answers, the three blog posts and **all reviews**. The reviews are labelled as placeholders. The car photos are free Unsplash images, not the actual cars. Replace them with the client's own photos (exterior, interior & dashboard, boot) before launch, since the car pages and the Concierge present them as the car on offer.

Open client decisions that affect the build (PRD §16): D-01 car fields (decided: no public rates) · D-03 form fields and where enquiries go · D-05 whether Reviews and Contact are separate pages · D-06 which page text is editable · D-07 WhatsApp number, message and catalogue link · D-11 who gets admin access.
