# Drive Ease

The website for Drive Ease, a car-rental business. Visitors enquire through WhatsApp or a form. The site doesn't take bookings or payments (see PRD §1.2).

**Stack:** React (Vite) · Express · MongoDB Atlas · Cloudinary · Vercel. All of these run on free tiers.

## Run it

```bash
npm install
npm run dev        # site → http://localhost:5173, API → http://localhost:3001
npm test           # checks the enquiry validation
npm run build      # production build → dist/
```

## Layout

```
server/app.js        Express API (also the Vercel function in Phase 5)
server/seed-data.js  Sample content: replace it with client-approved content
server/enquiry.js    Validates the enquiry form (shared trust boundary)
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
| 2 | MongoDB and the admin CMS: sign-in, managing cars, posts and reviews, editable site details, and an inbox for form enquiries | Next | `MONGODB_URI` |
| 3 | Cloudinary photo uploads from the admin (straight from the browser, so no server size limits) | | Cloudinary cloud name, API key and secret |
| 4 | SEO and polish: sitemap.xml, robots.txt, per-page meta, LocalBusiness schema, code-splitting, and QA at phone, tablet and desktop sizes | | — |
| 5 | Vercel deploy, custom domain with HTTPS, admin handover guide | | Vercel access, domain |

## Before launch: content that is still sample

Everything in `server/seed-data.js` is placeholder content: phone, WhatsApp number, address, services, rates, founder details, FAQ answers, the three blog posts and **all reviews**. The reviews are labelled as placeholders. The car photos are free Unsplash images. Replace them with the client's own photos.

Open client decisions that affect the build (PRD §16): D-01 fields and public rates · D-03 form fields and where enquiries go · D-05 whether Reviews and Contact are separate pages · D-06 which page text is editable · D-07 WhatsApp number, message and catalogue link · D-11 who gets admin access.
