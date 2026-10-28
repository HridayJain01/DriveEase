import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router';
import { img, srcSet, telLink, today, tripMessage, useApi, waLink } from './lib.js';
import { Reveal, ScrollTrigger } from './motion.jsx';
import { Icon } from './icons.jsx';
import { Announcer, CompareButton, CompareTray, EnquireButton, EnquiryDialog, SaveButton } from './features.jsx';
import { garage, useStore } from './stores.js';
import { whatsappUrl } from './whatsapp.js';
import { track, trackClicks } from './track.js';

export { Icon };

/* ---------- Brand ---------- */
export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Drive Ease home">
      <span className="logo-mark" aria-hidden="true" />
      <span>Drive<b>Ease</b></span>
    </Link>
  );
}

// Keeps the tab title and description in step with the page while browsing. Crawlers get the same
// values from the server (src/seo.js is shared), so this only matters for in-app navigation.
export function Seo({ title, fullTitle, description }) {
  useEffect(() => {
    document.title = fullTitle || (title ? `${title} | Drive Ease` : 'Car rental | Drive Ease');
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, fullTitle, description]);
  return null;
}

/* ---------- Layout ---------- */
const nav = [
  ['/concierge', 'Concierge'],
  ['/fleet', 'Fleet'],
  ['/services', 'Services'],
  ['/about', 'About'],
  ['/blog', 'Journal'],
  ['/contact', 'Contact'],
];

export function Layout() {
  const { data: site } = useApi('/api/site');
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname, hash } = useLocation();

  useEffect(() => setOpen(false), [pathname, hash]);
  useEffect(() => { // counts taps on WhatsApp links for the admin's Insights page (anonymous)
    document.addEventListener('click', trackClicks);
    return () => document.removeEventListener('click', trackClicks);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [open]);
  useEffect(() => {
    const on = () => setScrolled(scrollY > 12);
    on(); addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, []);
  useEffect(() => {
    if (hash) requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }));
    const t = setTimeout(() => ScrollTrigger.refresh(), 400); // new page, new layout: re-measure scroll animations
    return () => clearTimeout(t);
  }, [pathname, hash]);

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className={`topbar${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
        <div className="topbar-pill">
          <Logo />
          <nav className="main-nav" aria-label="Main">
            {nav.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}
          </nav>
          <GarageLink />
          {site && (
            <a className="pill-wa" data-track="whatsapp" href={waLink(site.whatsappNumber, site.whatsappMessage)} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">
              <Icon name="whatsapp" size={18} /><span>Enquire</span>
            </a>
          )}
          <button className="menu-btn" aria-expanded={open} aria-controls="menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
            <Icon name={open ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </header>
      <nav id="menu" className="menu-sheet" aria-label="Menu" hidden={!open}>
        {[['/', 'Home'], ...nav, ['/garage', 'My Garage']].map(([to, label], i) => (
          <Link key={to} to={to} style={{ '--i': i }}><small>0{i + 1}</small>{label}</Link>
        ))}
        {site && (
          <div className="menu-foot">
            <a href={telLink(site.phone)}><Icon name="phone" size={16} />{site.phone}</a>
            <span>{site.hours}</span>
          </div>
        )}
      </nav>
      <main id="main"><Outlet /></main>
      {site && <Footer site={site} />}
      {site && <Dock site={site} />}
      <CompareTray />
      <EnquiryDialog site={site} />
      <Announcer />
      <ScrollRestoration />
    </>
  );
}

function GarageLink() {
  const n = useStore(garage).length;
  return (
    <NavLink to="/garage" className="pill-garage" aria-label={`My Garage, ${n} saved ${n === 1 ? 'car' : 'cars'}`} title="My Garage">
      <Icon name="heart" size={18} filled={n > 0} />{n > 0 && <b aria-hidden="true">{n}</b>}
    </NavLink>
  );
}

function Footer({ site }) {
  return (
    <footer className="footer">
      <div className="wrap">
        <p className="footer-big" aria-hidden="true">Drive<b>Ease</b></p>
        <div className="footer-grid">
          <div>
            <h2 className="label">Explore</h2>
            <ul>{nav.map(([to, label]) => <li key={to}><Link to={to}>{label}</Link></li>)}<li><Link to="/compare">Compare cars</Link></li><li><Link to="/garage">My Garage</Link></li><li><Link to="/contact#reviews">Reviews</Link></li></ul>
          </div>
          <div>
            <h2 className="label">Talk to us</h2>
            <ul>
              <li><a href={telLink(site.phone)}>{site.phone}</a></li>
              <li><a data-track="whatsapp" href={waLink(site.whatsappNumber, site.whatsappMessage)} target="_blank" rel="noreferrer">WhatsApp</a></li>
              {site.googleReviewUrl && <li><a href={site.googleReviewUrl} target="_blank" rel="noreferrer">Review us on Google</a></li>}
              {site.whatsappCatalogueUrl && <li><a href={site.whatsappCatalogueUrl} target="_blank" rel="noreferrer">WhatsApp catalogue</a></li>}
              {site.email && <li><a href={`mailto:${site.email}`}>{site.email}</a></li>}
            </ul>
          </div>
          <div>
            <h2 className="label">Find us</h2>
            <p>{site.address}</p>
            <p className="mono">{site.hours}</p>
            <p className="footer-social">
              {Object.entries(site.socials || {}).filter(([, u]) => u).map(([k, u]) => <a key={k} href={u} target="_blank" rel="noreferrer">{k[0].toUpperCase() + k.slice(1)}</a>)}
            </p>
          </div>
        </div>
        <div className="footer-base">
          <span>© {new Date().getFullYear()} {site.businessName}</span>
          <span>Enquiries only. Bookings are confirmed by our team.</span>
        </div>
      </div>
    </footer>
  );
}

// Phone: a floating dock with Call + WhatsApp. Desktop: a single WhatsApp button.
function Dock({ site }) {
  return (
    <aside className="dock" aria-label="Quick contact">
      <a className="dock-call" href={telLink(site.phone)} aria-label={`Call ${site.phone}`}><Icon name="phone" size={18} /><span>Call</span></a>
      <a className="dock-wa" data-track="whatsapp" href={waLink(site.whatsappNumber, site.whatsappMessage)} target="_blank" rel="noreferrer"><Icon name="whatsapp" size={18} />WhatsApp us</a>
    </aside>
  );
}

/* ---------- Media & content ---------- */
export function Photo({ src, alt, sizes = '(max-width: 700px) 100vw, 50vw', className = '', eager = false }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) return <div className={`photo-fallback ${className}`} role="img" aria-label={alt}><Icon name="car" size={40} /></div>;
  return <img className={className} src={img(src, 800)} srcSet={srcSet(src)} sizes={sizes} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setBroken(true)} />;
}

// A spec the admin hasn't filled in shows as a dash ("not listed" to screen readers), never a guess.
export const spec = (value) => (value === undefined || value === null || value === '' ? <span title="Not listed"><span aria-hidden="true">—</span><span className="sr-only">Not listed</span></span> : value);

export function Specs({ v }) {
  return (
    <dl className="specs">
      <div><dt>Seats</dt><dd>{spec(v.seats)}</dd></div>
      <div><dt>Bags</dt><dd>{spec(v.bags)}</dd></div>
      <div><dt>Fuel</dt><dd>{spec(v.fuel)}</dd></div>
      <div><dt>Gearbox</dt><dd>{spec(v.transmission === 'Automatic' ? 'Auto' : v.transmission)}</dd></div>
    </dl>
  );
}

export function VehicleCard({ v, site, children }) {
  return (
    <article className="car-card">
      <div className="car-media">
        <Photo src={v.images?.[0]} alt={`${v.name}, ${(v.category || 'car').toLowerCase()}`} sizes="(max-width: 700px) 86vw, 400px" />
        {v.category && <span className="car-tag">{v.category}</span>}
        {v.featured && <span className="car-badge">Featured</span>}
        <SaveButton v={v} className="lift" />
      </div>
      <div className="car-body">
        <h3><Link to={`/fleet/${v.slug}`} className="stretch">{v.name}</Link></h3>
        {v.summary && <p className="car-summary">{v.summary}</p>}
        {children}
        <Specs v={v} />
        <div className="car-foot">
          <Link className="link-arrow car-more lift" to={`/fleet/${v.slug}`} tabIndex={-1} aria-hidden="true">View car<Icon name="arrow" size={16} /></Link>
          <span className="car-actions lift">
            <CompareButton v={v} />
            <EnquireButton cars={[v]} source="car-page" label={`Enquire about the ${v.name}`} />
          </span>
        </div>
      </div>
    </article>
  );
}

export function CardSkeletons({ n = 3 }) {
  return Array.from({ length: n }, (_, i) => <div key={i} className="car-card skeleton" aria-hidden="true" />);
}

export function Stars({ n }) {
  return <span className="stars" role="img" aria-label={`${n} out of 5 stars`}>{Array.from({ length: 5 }, (_, i) => <span key={i} className={i < n ? 'on' : ''}><Icon name="star" size={14} /></span>)}</span>;
}

function Review({ r }) {
  return (
    <figure className="review">
      <Stars n={r.rating} />
      <blockquote>“{r.text}”</blockquote>
      <figcaption><span className="avatar" aria-hidden="true">{r.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span><span><strong>{r.name}</strong>{r.location && <small>{r.location}</small>}</span></figcaption>
    </figure>
  );
}

// marquee: an endless, pausable strip (home page). Otherwise a plain grid.
// "Review us on Google": shown only once the link is set in Site details.
export function GoogleReviewLink({ className = 'btn btn-glass btn-sm' }) {
  const { data: site } = useApi('/api/site');
  if (!site?.googleReviewUrl) return null;
  return (
    <a className={className} href={site.googleReviewUrl} target="_blank" rel="noreferrer">
      <Icon name="star" size={16} />Travelled with us? Review us on Google
    </a>
  );
}

export function ReviewList({ limit, marquee }) {
  const { data } = useApi('/api/reviews');
  if (!data) return <div className="reviews"><div className="review skeleton" /><div className="review skeleton" /></div>;
  if (!data.length) return <p className="muted">Reviews will appear here once they are added.</p>;
  const list = data.slice(0, limit);
  if (!marquee) return <Reveal className="reviews" data-each="">{list.map((r, i) => <Review key={i} r={r} />)}</Reveal>;
  return (
    <div className="marquee" tabIndex={0} aria-label="Customer reviews">
      <div className="marquee-track">
        {[...list, ...list].map((r, i) => <div key={i} aria-hidden={i >= list.length || undefined}><Review r={r} /></div>)}
      </div>
    </div>
  );
}

// h1: the page's search heading (e.g. "Cars for rent in Pune"), shown small above the big title,
// which then becomes a styled paragraph. Without it, the big title is the h1.
export function PageHead({ eyebrow, h1, title, children }) {
  return (
    <header className="page-head wrap">
      {h1 ? <h1 className="eyebrow">{h1}</h1> : eyebrow && <p className="eyebrow">{eyebrow}</p>}
      {h1 ? <p className="page-title">{title}</p> : <h1>{title}</h1>}
      {children && <div className="lede">{children}</div>}
    </header>
  );
}

export function RouteError() {
  return (
    <div className="wrap empty">
      <h1>Something went wrong on this page</h1>
      <p>Refresh to try again. If it keeps happening, message us on WhatsApp.</p>
      <button className="btn btn-amber" onClick={() => location.reload()}>Refresh the page</button>
    </div>
  );
}

export function ErrorState({ error, what = 'page' }) {
  const missing = error?.message === 'not-found';
  return (
    <div className="wrap empty">
      <h1>{missing ? `This ${what} isn’t here` : `We couldn’t load this ${what}`}</h1>
      <p>{missing ? 'It may have been moved or unpublished.' : 'Check your connection and refresh the page.'}</p>
      <Link className="btn btn-amber" to="/">Go to the home page</Link>
    </div>
  );
}

/* ---------- Quick enquiry: pickup, drop, car → WhatsApp ---------- */
export function TripComposer({ site, vehicles, fixedCar, title = 'Get a quote on WhatsApp' }) {
  const [t, setT] = useState({ from: '', to: '', car: fixedCar || '' });
  const set = (k) => (e) => setT((s) => ({ ...s, [k]: e.target.value }));
  const message = site ? tripMessage(site.whatsappMessage, t) : '';
  const formLink = `/contact?${new URLSearchParams(Object.entries({ vehicle: t.car, pickupLocation: t.from, destination: t.to }).filter(([, v]) => v))}#enquiry`;

  const navigate = useNavigate();
  function send(e) {
    e.preventDefault();
    const url = site && whatsappUrl(site.whatsappNumber, message);
    if (!url) return navigate(formLink); // no WhatsApp number configured: use the form
    track('whatsapp', vehicles?.find((v) => v.name === t.car)?.slug || '', 'general');
    window.open(url, '_blank', 'noopener');
  }

  return (
    <form className="composer" onSubmit={send} aria-labelledby="composer-title">
      <h2 id="composer-title" className="composer-title">{title}</h2>
      <label className="field field-icon"><span>Pickup</span><Icon name="pin" size={18} /><input value={t.from} onChange={set('from')} placeholder="e.g. Airport T2" maxLength={120} required /></label>
      <label className="field field-icon"><span>Drop-off</span><Icon name="pin" size={18} /><input value={t.to} onChange={set('to')} placeholder="e.g. Lonavala" maxLength={120} /></label>
      {!fixedCar && (
        <label className="field field-icon"><span>Car</span><Icon name="car" size={18} />
          <select value={t.car} onChange={set('car')}>
            <option value="">Any car — suggest one</option>
            {vehicles?.map((v) => <option key={v.slug} value={v.name}>{v.name} · {v.category}</option>)}
          </select>
        </label>
      )}
      <button className="btn btn-amber btn-block btn-lg"><Icon name="whatsapp" />Enquire now</button>
      <Link className="composer-alt" to={formLink}>Prefer a callback? Send the enquiry form</Link>
    </form>
  );
}

/* ---------- Enquiry form ---------- */
const FIELDS = ['name', 'phone', 'email', 'vehicle', 'pickupDate', 'returnDate', 'pickupLocation', 'destination', 'passengers', 'luggage', 'message', 'tripType', 'source'];

export function EnquiryForm({ site, initial = {} }) {
  const { data: vehicles } = useApi('/api/vehicles');
  const [values, setValues] = useState(() => Object.fromEntries(FIELDS.map((f) => [f, initial[f] || ''])));
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | failed

  const set = (k) => (e) => { setValues((v) => ({ ...v, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })); };

  async function submit(e) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, company: e.target.company.value }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) return setStatus('sent');
      if (body.errors) { setErrors(body.errors); setStatus('idle'); return; }
      setStatus('failed');
    } catch { setStatus('failed'); }
  }

  if (status === 'sent') return (
    <div className="form-done" role="status" ref={(el) => el?.scrollIntoView({ block: 'center', behavior: 'smooth' })}>
      <span className="done-icon"><Icon name="check" size={28} /></span>
      <h3>Enquiry sent</h3>
      <p>Thanks, {values.name.split(' ')[0]}. We’ll get back to you on {values.phone}.</p>
      {site && <a className="btn btn-amber" data-track="whatsapp" href={waLink(site.whatsappNumber, site.whatsappMessage)} target="_blank" rel="noreferrer"><Icon name="whatsapp" />Need it sooner? WhatsApp us</a>}
    </div>
  );

  const field = (name, label, props = {}) => (
    <label className={`field${errors[name] ? ' has-error' : ''}`}>
      <span>{label}{props.required && <em aria-hidden="true"> *</em>}</span>
      <input name={name} value={values[name]} onChange={set(name)} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-err` : undefined} {...props} />
      {errors[name] && <small id={`${name}-err`} className="field-error">{errors[name]}</small>}
    </label>
  );

  return (
    <form className="enquiry-form" onSubmit={submit}>
      <div className="field-row">
        {field('name', 'Your name', { required: true, autoComplete: 'name', minLength: 2, maxLength: 80 })}
        {field('phone', 'Phone', { required: true, type: 'tel', autoComplete: 'tel', inputMode: 'tel', pattern: '\\+?[\\d\\s\\-]{10,16}', placeholder: '98765 43210' })}
      </div>
      {field('email', 'Email (optional)', { type: 'email', autoComplete: 'email', maxLength: 120 })}
      <label className="field">
        <span>Car you’re interested in</span>
        <select name="vehicle" value={values.vehicle} onChange={set('vehicle')}>
          <option value="">Not sure yet — suggest one</option>
          {values.vehicle && vehicles && !vehicles.some((v) => v.name === values.vehicle) && <option value={values.vehicle}>{values.vehicle}</option>}
          {vehicles?.map((v) => <option key={v.slug} value={v.name}>{v.name} · {v.category}</option>)}
        </select>
      </label>
      <div className="field-row">
        {field('pickupDate', 'Pickup date', { type: 'date', min: today() })}
        {field('returnDate', 'Return date', { type: 'date', min: values.pickupDate || today() })}
      </div>
      <div className="field-row">
        {field('pickupLocation', 'Pickup location', { maxLength: 120 })}
        {field('destination', 'Destination', { maxLength: 120 })}
      </div>
      <div className="field-row">
        {field('passengers', 'Travellers', { type: 'number', inputMode: 'numeric', min: 1, max: 60, placeholder: 'e.g. 4' })}
        {field('luggage', 'Bags', { type: 'number', inputMode: 'numeric', min: 0, max: 30, placeholder: 'e.g. 2' })}
      </div>
      <label className="field">
        <span>Anything else?</span>
        <textarea name="message" rows="3" value={values.message} onChange={set('message')} maxLength={1000} placeholder="Timing, child seat, chauffeur…" />
      </label>
      <input className="hp" name="company" tabIndex="-1" autoComplete="off" aria-hidden="true" />
      {status === 'failed' && <p className="form-alert" role="alert">Your enquiry didn’t go through. Check your connection and try again{site ? ', or message us on WhatsApp' : ''}.</p>}
      <button className="btn btn-amber btn-block" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send enquiry'}</button>
      <p className="fine">We only use these details to reply to your enquiry.</p>
    </form>
  );
}
