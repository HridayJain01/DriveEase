import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router';
import { img, srcSet, telLink, today, tripMessage, useApi, waLink } from './lib.js';

/* ---------- Icons ---------- */
const paths = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />,
  seats: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
  bags: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>,
  fuel: <><path d="M3 22h12M4 9h10M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" /><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0V9.8a2 2 0 0 0-.6-1.4L18 5" /></>,
  gears: <><path d="M6 5v14M12 5v14M18 5v7H6" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></>,
  pin: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></>,
  clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
  car: <><path d="M19 17h2a1 1 0 0 0 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5a1.7 1.7 0 0 0-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4a1 1 0 0 0 1 1h2" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" /></>,
  check: <path d="m5 12 5 5L20 7" />,
};

export function Icon({ name, size = 20 }) {
  if (name === 'whatsapp') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.42-.08-.12-.28-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.41z" /></svg>
  );
  if (name === 'star') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" /></svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
  );
}

/* ---------- Brand ---------- */
export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Drive Ease home">
      <svg viewBox="0 0 32 40" width="26" height="32" aria-hidden="true">
        <path d="M3 17a13 13 0 0 1 26 0v20H3z" fill="#fff" stroke="#1a1e21" strokeWidth="2.5" />
        <path d="M3 17a13 13 0 0 1 26 0z" fill="var(--cap)" stroke="#1a1e21" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M10 26h12M10 31h8" stroke="#1a1e21" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span>Drive Ease</span>
    </Link>
  );
}

export function Seo({ title, description }) {
  useEffect(() => {
    document.title = title ? `${title} — Drive Ease` : 'Drive Ease — Car rentals';
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, description]);
  return null;
}

/* ---------- Layout ---------- */
const nav = [
  ['/fleet', 'Fleet'],
  ['/services', 'Services'],
  ['/about', 'About'],
  ['/blog', 'Blog'],
  ['/contact#reviews', 'Reviews'],
  ['/contact', 'Contact'],
];

export function Layout() {
  const { data: site } = useApi('/api/site');
  const [open, setOpen] = useState(false);
  const { pathname, hash } = useLocation();

  useEffect(() => setOpen(false), [pathname, hash]);
  useEffect(() => {
    if (hash) requestAnimationFrame(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }));
  }, [pathname, hash]);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className={`site-header${open ? ' is-open' : ''}`}>
        <div className="wrap header-row">
          <Logo />
          <nav className="main-nav" aria-label="Main">
            {nav.map(([to, label]) => (
              <NavLink key={label} to={to} end={to.includes('#')} className={({ isActive }) => (isActive && !to.includes('#') && !hash ? 'active' : '')}>{label}</NavLink>
            ))}
          </nav>
          <div className="header-actions">
            {site && <a className="header-phone" href={telLink(site.phone)}><Icon name="phone" size={16} />{site.phone}</a>}
            {site && <a className="btn btn-wa btn-sm" href={waLink(site.whatsappNumber, site.whatsappMessage)} target="_blank" rel="noreferrer"><Icon name="whatsapp" size={16} />WhatsApp</a>}
            <button className="menu-btn" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
              <Icon name={open ? 'close' : 'menu'} size={24} />
            </button>
          </div>
        </div>
        <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile" hidden={!open}>
          {nav.map(([to, label]) => <Link key={label} to={to}>{label}</Link>)}
          {site && <a href={telLink(site.phone)} className="mobile-phone"><Icon name="phone" size={18} />Call {site.phone}</a>}
        </nav>
      </header>
      <main id="main"><Outlet /></main>
      {site && <Footer site={site} />}
      {site && <ActionBar site={site} />}
      <ScrollRestoration getKey={(loc) => loc.pathname} />
    </>
  );
}

function Footer({ site }) {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div>
          <Logo />
          <p className="footer-tag">{site.tagline}</p>
        </div>
        <div>
          <h2 className="footer-h">Explore</h2>
          <ul>{nav.map(([to, label]) => <li key={label}><Link to={to}>{label}</Link></li>)}</ul>
        </div>
        <div>
          <h2 className="footer-h">Talk to us</h2>
          <ul>
            <li><a href={telLink(site.phone)}>{site.phone}</a></li>
            <li><a href={waLink(site.whatsappNumber, site.whatsappMessage)} target="_blank" rel="noreferrer">WhatsApp chat</a></li>
            {site.whatsappCatalogueUrl && <li><a href={site.whatsappCatalogueUrl} target="_blank" rel="noreferrer">WhatsApp catalogue</a></li>}
            <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
          </ul>
        </div>
        <div>
          <h2 className="footer-h">Find us</h2>
          <p>{site.address}</p>
          <p>{site.hours}</p>
          <p className="footer-social">
            {Object.entries(site.socials || {}).filter(([, u]) => u).map(([k, u]) => <a key={k} href={u} target="_blank" rel="noreferrer">{k[0].toUpperCase() + k.slice(1)}</a>)}
          </p>
        </div>
      </div>
      <div className="wrap footer-base">
        <span>© {new Date().getFullYear()} {site.businessName}</span>
        <span>Enquiries only — bookings are confirmed by our team.</span>
      </div>
    </footer>
  );
}

function ActionBar({ site }) {
  return (
    <div className="action-bar">
      <a className="btn btn-ghost" href={telLink(site.phone)}><Icon name="phone" size={18} />Call</a>
      <a className="btn btn-wa" href={waLink(site.whatsappNumber, site.whatsappMessage)} target="_blank" rel="noreferrer"><Icon name="whatsapp" size={18} />WhatsApp us</a>
    </div>
  );
}

/* ---------- Media & content ---------- */
export function Photo({ src, alt, sizes = '(max-width: 700px) 100vw, 50vw', className = '', eager = false }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) return <div className={`photo-fallback ${className}`} role="img" aria-label={alt}><Icon name="car" size={40} /></div>;
  return <img className={className} src={img(src, 800)} srcSet={srcSet(src)} sizes={sizes} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setBroken(true)} />;
}

export function Specs({ v }) {
  return (
    <ul className="specs" aria-label="Key specifications">
      <li><Icon name="seats" size={16} />{v.seats} seats</li>
      <li><Icon name="bags" size={16} />{v.bags} bags</li>
      <li><Icon name="fuel" size={16} />{v.fuel}</li>
      <li><Icon name="gears" size={16} />{v.transmission}</li>
    </ul>
  );
}

export function Rate({ rate }) {
  if (!rate) return <span className="rate rate-ask">Rate on request</span>;
  const [amount, unit] = rate.split('/');
  return <span className="rate"><strong>{amount.trim()}</strong>{unit && <small>/{unit.trim()}</small>}</span>;
}

export function VehicleCard({ v, site }) {
  return (
    <article className="car-card">
      <div className="car-media">
        <Photo src={v.images?.[0]} alt={`${v.name}, ${v.category.toLowerCase()}`} sizes="(max-width: 700px) 90vw, 400px" />
        <span className="tag">{v.category}</span>
        {v.featured && <span className="badge">Featured</span>}
      </div>
      <div className="car-body">
        <h3><Link to={`/fleet/${v.slug}`} className="stretch">{v.name}</Link></h3>
        <p className="car-summary">{v.summary}</p>
        <Specs v={v} />
        <div className="car-foot">
          <Rate rate={v.rate} />
          {site && (
            <a className="btn btn-wa btn-sm lift" href={waLink(site.whatsappNumber, `${site.whatsappMessage}\n\nCar: ${v.name}`)} target="_blank" rel="noreferrer">
              <Icon name="whatsapp" size={16} />Enquire
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function CardSkeletons({ n = 3 }) {
  return Array.from({ length: n }, (_, i) => <div key={i} className="car-card skeleton" aria-hidden="true" />);
}

export function Stars({ n }) {
  return <span className="stars" aria-label={`${n} out of 5 stars`}>{Array.from({ length: 5 }, (_, i) => <span key={i} className={i < n ? 'on' : ''}><Icon name="star" size={16} /></span>)}</span>;
}

export function ReviewList({ limit }) {
  const { data } = useApi('/api/reviews');
  if (!data) return <div className="reviews"><div className="review skeleton" /><div className="review skeleton" /><div className="review skeleton" /></div>;
  if (!data.length) return <p className="muted">Reviews will appear here once they are added.</p>;
  return (
    <div className="reviews">
      {data.slice(0, limit).map((r, i) => (
        <figure className="review" key={i}>
          <Stars n={r.rating} />
          <blockquote>{r.text}</blockquote>
          <figcaption><strong>{r.name}</strong>{r.location && <span> · {r.location}</span>}</figcaption>
        </figure>
      ))}
    </div>
  );
}

export function PageHead({ eyebrow, title, children }) {
  return (
    <header className="page-head wrap">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {children && <div className="lede">{children}</div>}
    </header>
  );
}

export function ErrorState({ error, what = 'page' }) {
  const missing = error?.message === 'not-found';
  return (
    <div className="wrap empty">
      <h1>{missing ? `This ${what} isn’t here` : `We couldn’t load this ${what}`}</h1>
      <p>{missing ? 'It may have been moved or unpublished.' : 'Check your connection and refresh the page.'}</p>
      <Link className="btn btn-dark" to="/">Go to the home page</Link>
    </div>
  );
}

/* ---------- Trip composer: the milestone card ---------- */
const TRIPS = ['Airport', 'Outstation', 'Within city', 'Event'];
const DRIVE = ['Self-drive', 'With driver'];

function Chips({ label, options, value, onChange }) {
  return (
    <fieldset className="chips">
      <legend>{label}</legend>
      {options.map((o) => (
        <label key={o} className="chip">
          <input type="radio" name={label} value={o} checked={value === o} onChange={() => onChange(o)} onClick={() => value === o && onChange('')} />
          <span>{o}</span>
        </label>
      ))}
    </fieldset>
  );
}

export function TripComposer({ site, vehicles, fixedCar, title = 'Plan your trip' }) {
  const [t, setT] = useState({ trip: '', drive: '', car: fixedCar || '', from: '', to: '', start: '', end: '' });
  const set = (k) => (v) => setT((s) => ({ ...s, [k]: v?.target ? v.target.value : v }));
  const cars = useMemo(() => [...new Set((vehicles || []).map((v) => v.category))], [vehicles]);
  const message = site ? tripMessage(site.whatsappMessage, { ...t, trip: [t.trip, t.drive].filter(Boolean).join(', ') }) : '';
  const formLink = `/contact?${new URLSearchParams(Object.entries({ vehicle: fixedCar || '', pickupLocation: t.from, destination: t.to, pickupDate: t.start, returnDate: t.end }).filter(([, v]) => v))}#enquiry`;

  return (
    <section className="milestone" aria-labelledby="composer-title">
      <div className="milestone-cap">
        <span className="km">0 km</span>
        <h2 id="composer-title">{title}</h2>
      </div>
      <div className="milestone-body">
        <Chips label="Trip" options={TRIPS} value={t.trip} onChange={set('trip')} />
        <Chips label="Driving" options={DRIVE} value={t.drive} onChange={set('drive')} />
        {!fixedCar && cars.length > 0 && <Chips label="Car" options={cars} value={t.car} onChange={set('car')} />}
        <div className="field-row">
          <label className="field"><span>Pickup from</span><input value={t.from} onChange={set('from')} placeholder="e.g. Airport T2" maxLength={120} /></label>
          <label className="field"><span>Going to</span><input value={t.to} onChange={set('to')} placeholder="e.g. Lonavala" maxLength={120} /></label>
        </div>
        <div className="field-row">
          <label className="field"><span>From date</span><input type="date" value={t.start} min={today()} onChange={set('start')} /></label>
          <label className="field"><span>To date</span><input type="date" value={t.end} min={t.start || today()} onChange={set('end')} /></label>
        </div>
        <div className="preview" aria-live="polite">
          <span className="preview-to">Message to {site?.businessName || 'Drive Ease'}</span>
          <p>{message}</p>
        </div>
        <a className="btn btn-wa btn-block" href={site ? waLink(site.whatsappNumber, message) : undefined} target="_blank" rel="noreferrer">
          <Icon name="whatsapp" />Send on WhatsApp
        </a>
        <Link className="composer-alt" to={formLink}>Prefer email? Send an enquiry form instead</Link>
      </div>
    </section>
  );
}

/* ---------- Enquiry form ---------- */
const FIELDS = ['name', 'phone', 'email', 'vehicle', 'pickupDate', 'returnDate', 'pickupLocation', 'destination', 'message'];

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
      {site && <a className="btn btn-wa" href={waLink(site.whatsappNumber, site.whatsappMessage)} target="_blank" rel="noreferrer"><Icon name="whatsapp" />Need it sooner? WhatsApp us</a>}
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
      <label className="field">
        <span>Anything else?</span>
        <textarea name="message" rows="3" value={values.message} onChange={set('message')} maxLength={1000} placeholder="Number of travellers, luggage, timing…" />
      </label>
      <input className="hp" name="company" tabIndex="-1" autoComplete="off" aria-hidden="true" />
      {status === 'failed' && <p className="form-alert" role="alert">Your enquiry didn’t go through. Check your connection and try again{site ? ', or message us on WhatsApp' : ''}.</p>}
      <button className="btn btn-dark btn-block" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send enquiry'}</button>
      <p className="fine">We only use these details to reply to your enquiry.</p>
    </form>
  );
}
