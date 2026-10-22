// Shared controls for the shortlist features: save to My Garage, compare, the WhatsApp
// review sheet, the compare tray and the car photo gallery.
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Icon } from './icons.jsx';
import { img, srcSet, telLink } from './lib.js';
import { photoGroups } from './fleet.js';
import { compare, garage, MAX_COMPARE, trip as tripStore, useStore } from './stores.js';
import { buildEnquiryMessage, enquiryFormPath, whatsappUrl } from './whatsapp.js';

/* ---------- Status messages (visible + read by screen readers) ---------- */
export const announce = (text, link) => dispatchEvent(new CustomEvent('de:announce', { detail: { text, link, id: Math.random() } }));

export function Announcer() {
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    let t;
    const on = (e) => { setMsg(e.detail); clearTimeout(t); t = setTimeout(() => setMsg(null), 3200); };
    addEventListener('de:announce', on);
    return () => { removeEventListener('de:announce', on); clearTimeout(t); };
  }, []);
  return (
    <div className="announcer" role="status" aria-live="polite">
      {msg && <p key={msg.id}>{msg.text}{msg.link && <Link to={msg.link.to}>{msg.link.label}</Link>}</p>}
    </div>
  );
}

/* ---------- Save / compare toggles ---------- */
export function SaveButton({ v, full = false, className = '' }) {
  const saved = useStore(garage).includes(v.slug);
  function toggle() {
    garage.toggle(v.slug);
    announce(saved ? `Removed the ${v.name} from My Garage.` : `Saved the ${v.name} to My Garage.`, !saved && { to: '/garage', label: 'View garage' });
  }
  return (
    <button type="button" className={`save-btn${saved ? ' is-on' : ''}${full ? ' btn btn-glass btn-sm' : ''} ${className}`} aria-pressed={saved} aria-label={full ? undefined : `Save the ${v.name}`} title={saved ? 'Saved in My Garage' : 'Save to My Garage'} onClick={toggle}>
      <Icon name="heart" size={full ? 16 : 18} filled={saved} />{full && (saved ? 'Saved' : 'Save')}
    </button>
  );
}

export function CompareButton({ v, full = false, className = '' }) {
  const list = useStore(compare);
  const on = list.includes(v.slug);
  function toggle() {
    const r = compare.toggle(v.slug);
    if (r.error === 'full') return announce(`You can compare up to ${MAX_COMPARE} cars. Remove one first.`, { to: '/compare', label: 'Open compare' });
    announce(on ? `Removed the ${v.name} from compare.` : `Added the ${v.name} to compare (${list.length + 1} of ${MAX_COMPARE}).`, !on && { to: '/compare', label: 'Compare now' });
  }
  return (
    <button type="button" className={`compare-btn${on ? ' is-on' : ''}${full ? ' btn btn-glass btn-sm' : ''} ${className}`} aria-pressed={on} aria-label={full ? undefined : `Compare the ${v.name}`} title={on ? 'In your compare list' : 'Add to compare'} onClick={toggle}>
      <Icon name={on ? 'check' : 'compare'} size={16} />{full && (on ? 'Comparing' : 'Compare')}
    </button>
  );
}

/* ---------- Smart WhatsApp enquiry ---------- */
// Opens the review sheet. cars: [{ name, slug }]; context: 'comparing' | 'shortlist'; source: where it came from.
export const openEnquiry = (detail) => dispatchEvent(new CustomEvent('de:enquire', { detail }));

export function EnquireButton({ cars, context, source, className = 'btn btn-amber btn-sm', children = 'Enquire', label }) {
  return (
    <button type="button" className={className} aria-label={label} onClick={() => openEnquiry({ cars: cars.map(({ name, slug }) => ({ name, slug })), context, source })}>
      <Icon name="whatsapp" size={16} />{children}
    </button>
  );
}

export function EnquiryDialog({ site }) {
  const ref = useRef();
  const [req, setReq] = useState(null);
  const trip = useStore(tripStore);
  const [withTrip, setWithTrip] = useState(true);
  const [text, setText] = useState('');
  const [opened, setOpened] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const on = (e) => { setReq(e.detail); setWithTrip(true); setOpened(false); setCopied(false); };
    addEventListener('de:enquire', on);
    return () => removeEventListener('de:enquire', on);
  }, []);
  useEffect(() => {
    if (req) setText(buildEnquiryMessage({ greeting: site?.whatsappMessage, cars: req.cars, trip: withTrip ? trip : null, origin: location.origin, context: req.context }));
  }, [req, withTrip, trip, site]);
  useEffect(() => { if (req && !ref.current.open) ref.current.showModal(); }, [req]);

  const close = () => ref.current?.close();
  const url = whatsappUrl(site?.whatsappNumber, text);
  const hasTrip = trip && Object.values(trip).some(Boolean);
  const formPath = req ? enquiryFormPath({ cars: req.cars, trip: withTrip ? trip : null, source: req.source }) : '/contact#enquiry';

  async function copy() {
    try { await navigator.clipboard.writeText(text); setCopied(true); } catch { setCopied(false); announce('Couldn’t copy. Select the message and copy it instead.'); }
  }

  return (
    <dialog ref={ref} className="sheet" aria-labelledby="enq-title" onClose={() => setReq(null)} onClick={(e) => e.target === ref.current && close()}>
      {req && (
        <div className="sheet-inner">
          <header className="sheet-head">
            <h2 id="enq-title">{url ? 'Review your WhatsApp message' : 'Enquire about this'}</h2>
            <button type="button" className="icon-btn" onClick={close} aria-label="Close"><Icon name="close" size={18} /></button>
          </header>
          {req.cars?.length > 0 && <p className="sheet-cars">{req.cars.map((c) => <span key={c.slug || c.name}>{c.name}</span>)}</p>}

          {url ? (
            opened ? (
              <div className="sheet-done" role="status">
                <span className="done-icon"><Icon name="whatsapp" size={26} /></span>
                <h3>WhatsApp is open</h3>
                <p>Your message is ready in WhatsApp. Tap <strong>send</strong> there to reach us. Nothing has been sent yet, and nothing is booked until our team confirms availability and the rate with you.</p>
                <button type="button" className="btn btn-glass" onClick={close}>Done</button>
              </div>
            ) : (
              <>
                {hasTrip && (
                  <label className="check">
                    <input type="checkbox" checked={withTrip} onChange={(e) => setWithTrip(e.target.checked)} />
                    <span>Include my trip details from the Concierge</span>
                  </label>
                )}
                <label className="field">
                  <span>Message (you can edit it)</span>
                  <textarea rows={9} value={text} onChange={(e) => setText(e.target.value)} maxLength={1500} />
                </label>
                <p className="sheet-note"><Icon name="info" size={16} />This opens WhatsApp with the message typed in. It isn’t sent until you tap send, and it isn’t a booking: we’ll reply with availability and the rate.</p>
                <div className="sheet-actions">
                  <a className="btn btn-amber btn-block" href={url} target="_blank" rel="noopener noreferrer" onClick={() => setOpened(true)}><Icon name="whatsapp" />Open WhatsApp</a>
                  <button type="button" className="btn btn-glass" onClick={copy}><Icon name="copy" size={16} />{copied ? 'Copied' : 'Copy'}</button>
                </div>
                <Link className="composer-alt" to={formPath} onClick={close}>Prefer a call back? Send these details as an enquiry form</Link>
              </>
            )
          ) : (
            <div className="sheet-missing">
              <p className="form-alert" role="alert">WhatsApp enquiries aren’t set up on this website yet. Please use one of these instead.</p>
              <Link className="btn btn-amber btn-block" to={formPath} onClick={close}>Send an enquiry form</Link>
              {site?.phone && <a className="btn btn-glass btn-block" href={telLink(site.phone)}><Icon name="phone" size={18} />Call {site.phone}</a>}
              {site?.email && <a className="btn btn-glass btn-block" href={`mailto:${site.email}?subject=${encodeURIComponent('Car rental enquiry')}&body=${encodeURIComponent(text)}`}><Icon name="mail" size={18} />Email us</a>}
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}

/* ---------- Compare tray ---------- */
export function CompareTray() {
  const list = useStore(compare);
  const { pathname } = useLocation();
  const show = list.length > 0 && pathname !== '/compare';
  useEffect(() => { document.documentElement.classList.toggle('has-tray', show); }, [show]);
  if (!show) return null;
  return (
    <aside className="tray" aria-label="Compare list">
      <span className="tray-count"><Icon name="compare" size={16} /><b>{list.length}</b>/{MAX_COMPARE}<span className="sr-only"> cars selected to compare</span></span>
      <Link className="btn btn-amber btn-sm" to="/compare">{list.length > 1 ? 'Compare now' : 'Add one more to compare'}</Link>
      <button type="button" className="icon-btn" onClick={compare.clear} aria-label="Clear the compare list"><Icon name="close" size={16} /></button>
    </aside>
  );
}

/* ---------- Car photo gallery with full-screen viewer ---------- */
function Picture({ src, alt, sizes, eager }) {
  const [broken, setBroken] = useState(false);
  if (broken) return <span className="photo-fallback gallery-main" role="img" aria-label={`${alt} (couldn’t load)`}><Icon name="car" size={40} /></span>;
  return <img className="gallery-main" src={img(src, 1000)} srcSet={srcSet(src, [600, 1000, 1600])} sizes={sizes} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setBroken(true)} />;
}

export function Gallery({ v }) {
  const groups = photoGroups(v);
  const photos = groups.flatMap((g) => g.photos.map((src, i) => ({ src, group: g, i, n: g.photos.length })));
  const [at, setAt] = useState(0);
  const [zoomed, setZoomed] = useState(false); // the full-size image only downloads once the viewer opens
  const box = useRef();
  const thumbs = useRef();
  useEffect(() => setAt(0), [v.slug]);
  useEffect(() => { thumbs.current?.children[at]?.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }, [at]);

  const present = groups.filter((g) => g.photos.length);
  const absent = groups.filter((g) => !g.photos.length);
  const missingNote = absent.length > 0 && (
    <p className="gallery-missing"><Icon name="info" size={16} />{absent.map((g) => g.label).join(' and ')} photos haven’t been added yet. Ask us and we’ll share real photos of this car.</p>
  );

  if (!photos.length) return (
    <div className="gallery">
      <div className="photo-fallback gallery-main gallery-empty" role="img" aria-label={`No photos of the ${v.name} yet`}><Icon name="car" size={44} /><span>Photos coming soon</span></div>
      {missingNote}
    </div>
  );

  const p = photos[Math.min(at, photos.length - 1)];
  const go = (d) => setAt((i) => (i + d + photos.length) % photos.length);
  const alt = (q) => `${v.name}, ${q.group.label.toLowerCase()} photo ${q.i + 1} of ${q.n}`;
  const onKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  };

  return ( // arrow keys work on the gallery and inside the full-screen viewer (its events bubble up here)
    <section className="gallery" aria-label={`Photos of the ${v.name}`} onKeyDown={onKey}>
      {present.length > 1 && (
        <div className="tabs gallery-tabs" role="group" aria-label="Photo type">
          {present.map((g) => (
            <button key={g.key} type="button" aria-pressed={p.group.key === g.key} onClick={() => setAt(photos.findIndex((x) => x.group.key === g.key))}>{g.label}<small>{g.photos.length}</small></button>
          ))}
        </div>
      )}
      <div className="gallery-stage">
        <button type="button" className="gallery-open" onClick={() => { setZoomed(true); box.current.showModal(); }} aria-label={`Open ${alt(p)} full screen`}>
          <Picture key={p.src} src={p.src} alt={alt(p)} sizes="(max-width: 960px) 100vw, 60vw" eager={at === 0} />
          <span className="gallery-expand" aria-hidden="true"><Icon name="expand" size={16} /></span>
        </button>
        {photos.length > 1 && (
          <>
            <button type="button" className="gallery-nav is-prev" onClick={() => go(-1)} aria-label="Previous photo"><Icon name="left" /></button>
            <button type="button" className="gallery-nav is-next" onClick={() => go(1)} aria-label="Next photo"><Icon name="right" /></button>
          </>
        )}
        <span className="gallery-count" aria-live="polite">{at + 1} / {photos.length}<span aria-hidden="true"> · {p.group.label}</span></span>
      </div>
      {photos.length > 1 && (
        <div className="thumbs" ref={thumbs}>
          {photos.map((q, i) => (
            <button key={`${q.group.key}-${q.src}`} type="button" aria-label={`Show ${alt(q)}`} aria-pressed={i === at} onClick={() => setAt(i)}>
              <img src={img(q.src, 200)} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      {missingNote}

      <dialog ref={box} className="lightbox" aria-label={`${v.name} photos, full screen`} onClose={() => setZoomed(false)} onClick={(e) => e.target === box.current && box.current.close()}>
        {zoomed && (
          <figure>
            <img key={p.src} src={img(p.src, 1800)} alt={alt(p)} />
            <figcaption>{alt(p)}</figcaption>
          </figure>
        )}
        <button type="button" className="icon-btn lightbox-close" onClick={() => box.current.close()} aria-label="Close full-screen photos"><Icon name="close" /></button>
        {photos.length > 1 && (
          <>
            <button type="button" className="gallery-nav is-prev" onClick={() => go(-1)} aria-label="Previous photo"><Icon name="left" /></button>
            <button type="button" className="gallery-nav is-next" onClick={() => go(1)} aria-label="Next photo"><Icon name="right" /></button>
          </>
        )}
      </dialog>
    </section>
  );
}
