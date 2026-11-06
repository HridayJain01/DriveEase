// Tells Bing and the other IndexNow search engines about the site's pages, so they check them straight away.
// Run after publishing new pages, once the site is on its final address:
//   npm run indexnow -- https://www.example.in
// Needs INDEXNOW_KEY set both here and on the live site. Google doesn't use IndexNow: it uses the sitemap.
const site = (process.argv[2] || process.env.SITE_URL || '').replace(/\/+$/, '');
const key = process.env.INDEXNOW_KEY;
if (!site || !key) {
  console.error('Usage: INDEXNOW_KEY=... npm run indexnow -- https://www.example.in');
  process.exit(1);
}

const map = await fetch(`${site}/sitemap.xml`).then((r) => r.text());
const urlList = [...map.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!urlList.length) {
  console.error('No pages found in the sitemap.');
  process.exit(1);
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(site).host, key, keyLocation: `${site}/${key}.txt`, urlList }),
});
console.log(`Sent ${urlList.length} pages. IndexNow answered ${res.status}.`);
if (!res.ok) process.exit(1);
