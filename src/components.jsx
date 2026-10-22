import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router';
import { img, srcSet, telLink, today, tripMessage, useApi, waLink } from './lib.js';
import { Reveal, ScrollTrigger } from './motion.jsx';

/* ---------- Icons ---------- */
const paths = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />,
  seats: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
  bags: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>,
  fuel: <><path d="M3 22h12M4 9h10M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" /><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 4 0V9.8a2 2 0 0 0-.6-1.4L18 5" /></>,
  gears: <path d="M6 5v14M12 5v14M18 5v7H6" />,
  menu: <path d="M4 8h16M4 16h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></>,
  pin: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></>,
  clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
  car: <><path d="M19 17h2a1 1 0 0 0 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5a1.7 1.7 0 0 0-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4a1 1 0 0 0 1 1h2" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" /></>,
  check: <path d="m5 12 5 5L20 7" />,
  down: <path d="M12 5v14M6 13l6 6 6-6" />,
  key: <><circle cx="7.5" cy="15.5" r="4.5" /><path d="m10.7 12.3 9.3-9.3M17 6l3 3M14 9l2 2" /></>,
};

export function Icon({ name, size = 20 }) {
  if (name === 'whatsapp') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.42-.08-.12-.28-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.41z" /></svg>
  );
  if (name === 'star') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" /></svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
  );
}

/* ---------- Brand ---------- */
export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Drive Ease home">
      <span className="logo-mark" aria-hidden="true" />
      <span>Drive<b>Ease</b></span>
    </Link>
  );
}

export function Seo({ title, fullTitle, description }) {
  useEffect(() => {
    document.title = fullTitle || (title ? `${title} — Drive Ease` : 'Drive Ease — Car rentals');
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, fullTitle, description]);
  return null;
}

/* ---------- Layout ---------- */
const nav = [
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
          {site && (
            <a className="pill-wa" href={waLink(site.whatsappNumber, site.whatsappMessage)} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">
              <Icon name="whatsapp" size={18} /><span>Enquire</span>
            </a>
          )}
          <button className="menu-btn" aria-expanded={open} aria-controls="menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
            <Icon name={open ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </header>
      <nav id="menu" className="menu-sheet" aria-label="Menu" hidden={!open}>
        {[['/', 'Home'], ...nav].map(([to, label], i) => (
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
      <ScrollRestoration />
    </>
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
            <ul>{nav.map(([to, label]) => <li key={to}><Link to={to}>{label}</Link></li>)}<li><Link to="/contact#reviews">Reviews</Link></li></ul>
          </div>
          <div>
            <h2 className="label">Talk to us</h2>
            <ul>
              <li><a href={telLink(site.phone)}>{site.phone}</a></li>
              <li><a href={waLink(site.whatsappNumber, site.whatsappMessage)} target="_blank" rel="noreferrer">WhatsApp</a></li>
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
      <a className="dock-wa" href={waLink(site.whatsappNumber, site.whatsappMessage)} target="_blank" rel="noreferrer"><Icon name="whatsapp" size={18} />WhatsApp us</a>
    </aside>
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
    <dl className="specs">
      <div><dt>Seats</dt><dd>{v.seats}</dd></div>
      <div><dt>Bags</dt><dd>{v.bags}</dd></div>
      <div><dt>Fuel</dt><dd>{v.fuel}</dd></div>
      <div><dt>Gearbox</dt><dd>{v.transmission === 'Automatic' ? 'Auto' : v.transmission}</dd></div>
    </dl>
  );
}

export function Rate({ rate }) {
  if (!rate) return <span className="rate rate-ask">Rate on request</span>;
  const [amount, unit] = rate.split('/');
  return <span className="rate"><strong>{amount.trim()}</strong>{unit && <small>/ {unit.trim()}</small>}</span>;
}

export function VehicleCard({ v, site }) {
  return (
    <article className="car-card">
      <div className="car-media">
        <Photo src={v.images?.[0]} alt={`${v.name}, ${v.category.toLowerCase()}`} sizes="(max-width: 700px) 86vw, 400px" />
        <span className="car-tag">{v.category}</span>
        {v.featured && <span className="car-badge">Featured</span>}
      </div>
      <div className="car-body">
        <h3><Link to={`/fleet/${v.slug}`} className="stretch">{v.name}</Link></h3>
        <p className="car-summary">{v.summary}</p>
        <Specs v={v} />
        <div className="car-foot">
          <Rate rate={v.rate} />
          {site && (
            <a className="btn btn-amber btn-sm lift" href={waLink(site.whatsappNumber, `${site.whatsappMessage}\n\nCar: ${v.name}`)} target="_blank" rel="noreferrer" aria-label={`Enquire about the ${v.name} on WhatsApp`}>
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

export function PageHead({ eyebrow, title, children }) {
  return (
    <header className="page-head wrap">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
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

  function send(e) {
    e.preventDefault();
    if (site) window.open(waLink(site.whatsappNumber, message), '_blank', 'noopener');
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
      {site && <a className="btn btn-amber" href={waLink(site.whatsappNumber, site.whatsappMessage)} target="_blank" rel="noreferrer"><Icon name="whatsapp" />Need it sooner? WhatsApp us</a>}
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
      <button className="btn btn-amber btn-block" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send enquiry'}</button>
      <p className="fine">We only use these details to reply to your enquiry.</p>
    </form>
  );
}
