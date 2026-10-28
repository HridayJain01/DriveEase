// Anonymous tap counter for the admin's Insights page (see server/events.js). It sends only the
// action, a public car slug and where on the site it happened, and counts each once per visit.
export function track(kind, car = '', source = 'general') {
  const key = `de:t:${kind}:${car}:${source}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch { /* storage blocked: count it anyway */ }
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
