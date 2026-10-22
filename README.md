# Drive Ease

The website for Drive Ease, a car-rental business. Visitors enquire through WhatsApp or a form. The site doesn't take bookings or payments (see PRD §1.2).

**Stack:** React (Vite) · Express · MongoDB Atlas · Cloudinary · Vercel. All of these run on free tiers.

## Run it

```bash
npm install
cp .env.example .env   # then fill in MONGODB_URI, SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, CLOUDINARY_URL
npm run seed           # first time only: loads sample content + creates the admin login
npm run dev            # site → http://localhost:5173, admin → /admin
npm run build && npm start   # production preview → http://localhost:3001 (server-rendered meta, real 404s)
npm test               # enquiry validation + password/session checks
npm run build          # production build → dist/
```

`npm run seed` only fills **empty** collections, so it is safe to re-run. Run it again with a new `ADMIN_PASSWORD` to reset a forgotten admin password. `npm run seed -- --force` wipes cars, posts, reviews and site details and reloads the samples.

## Admin (`/admin`)

| Section | What the client can do |
|---|---|
| Enquiries | Read form enquiries, mark them New / Contacted / Closed, reply on WhatsApp or call in one tap |
| Cars | Add, edit, publish/unpublish, feature, reorder and delete cars. Upload photos (button or drag-and-drop), reorder them and pick the cover |
| Blog | Write posts in a simple editor with formatting buttons and a preview, publish/unpublish, set the date and URL |
| Reviews | Add, publish/unpublish and order reviews |
| Site details | Business info, phone, WhatsApp number and message, catalogue link, socials, About page, services, FAQs |
| Account | Change password |

**Photos** upload straight from the browser to Cloudinary (in a `driveease` folder). The server only signs each upload, so the API secret stays on the server and large files never pass through the Vercel function. Before uploading, the browser shrinks photos to at most 2400px, so a typical 4–8 MB phone photo goes up as roughly 300–600 KB. On the site, Cloudinary serves each image in WebP/AVIF at the width the screen needs.

Hidden (unpublished) items never reach the public API. Sign-in is locked for 15 minutes after 10 failed attempts from one IP.

## SEO and speed

- **Every page is served by Express** (`server/html.js`). It fills in the title, description, canonical URL, Open Graph/X tags and a 1200×630 preview image, so a car page shared on WhatsApp shows the car's photo and name. It also adds `AutoRental` structured data on every page and `BlogPosting` on articles. Unknown pages return a real 404 with `noindex`.
- **`/sitemap.xml`** lists all public pages plus every published car and post. **`/robots.txt`** blocks `/admin` and `/api/`. Submit the sitemap in Google Search Console after launch (FR-14).
- **The first load needs no API round trip.** The server embeds that page's data in the HTML, so content paints immediately, then the browser quietly refreshes it.
- **Caching:** on Vercel, page HTML is cached for 60 s and public API responses for 10 s, with stale-while-revalidate, so most visitors never wait on the database. Admin edits show up within about a minute. Built JS/CSS is cached for a year (file names change on every build).
- **Bundle size:** the main bundle is about 112 KB gzipped. The admin (10 KB) and the Markdown renderer (14 KB) load only where they're needed.
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
server/enquiry.js    Validates the enquiry form (shared trust boundary)
src/admin/           Admin panel (separate bundle, loaded only on /admin)
src/main.jsx         Routes
src/components.jsx   Shared UI: layout, cards, trip planner, enquiry form
src/pages/*.jsx      One file per page
src/styles.css       The whole design system (tokens at the top)
```

## Design direction

The design borrows from the Indian highway **milestone**: a white stone with a yellow NH cap.
- **Signature:** the hero's trip planner is a milestone ("0 km"). You pick a trip, a car and dates, and it writes the WhatsApp message as you go.
- **Type:** Overpass for headings (it descends from highway-signage lettering). Atkinson Hyperlegible Next for body text, which is built to be read at a glance. Overpass Mono for specs and rates, read like dashboard figures.
- **Colour:** asphalt `#1a1e21`, whitewash `#f3f4f1`, milestone yellow `#ffc414`, signboard green `#0a6b4e`.

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

Everything `npm run seed` loads (from `server/seed-data.js`) is placeholder content, editable in the admin: phone, WhatsApp number, address, services, rates, founder details, FAQ answers, the three blog posts and **all reviews**. The reviews are labelled as placeholders. The car photos are free Unsplash images. Replace them with the client's own photos.

Open client decisions that affect the build (PRD §16): D-01 fields and public rates · D-03 form fields and where enquiries go · D-05 whether Reviews and Contact are separate pages · D-06 which page text is editable · D-07 WhatsApp number, message and catalogue link · D-11 who gets admin access.
