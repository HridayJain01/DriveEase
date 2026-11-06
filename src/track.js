// Google Analytics, only if the host has a GA_MEASUREMENT_ID (server/html.js). It loads once the visitor
// does something or after a few seconds, so it never slows the first screen.
const gaId = () => globalThis.__GA__;
let analyticsOn = false;
function loadAnalytics() {
  if (analyticsOn || !gaId()) return;
  analyticsOn = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); }; // eslint-disable-line prefer-rest-params
  window.gtag('js', new Date());
  window.gtag('config', gaId());
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId()}`;
  document.head.append(script);
}
export function startAnalytics() {
  if (!gaId()) return;
  addEventListener('pointerdown', loadAnalytics, { once: true, passive: true });
  addEventListener('scroll', loadAnalytics, { once: true, passive: true });
  setTimeout(loadAnalytics, 5000);
}
const GA_EVENTS = { whatsapp: 'generate_lead', call: 'click_to_call', share: 'share' };

// Anonymous tap counter for the admin's Insights page (see server/events.js). It sends only the
// action, a public car slug and where on the site it happened, and counts each once per visit.
export function track(kind, car = '', source = 'general') {
  const key = `de:t:${kind}:${car}:${source}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch { /* storage blocked: count it anyway */ }
  loadAnalytics();
  window.gtag?.('event', GA_EVENTS[kind] || kind, { method: kind, car, source });
  const body = JSON.stringify({ kind, car, source });
  try {
    // sendBeacon survives the page switching to WhatsApp; text/plain needs no CORS preflight.
    if (navigator.sendBeacon?.('/api/events', new Blob([body], { type: 'text/plain' }))) return;
  } catch { /* fall through */ }
  fetch('/api/events', { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
}

// Links marked data-track="whatsapp" (plus optional data-car / data-source) are counted when tapped.
export function trackClicks(e) {
  const a = e.target.closest?.('a[data-track]');
  if (a) track(a.dataset.track, a.dataset.car || '', a.dataset.source || 'general');
}
