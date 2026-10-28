import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { CardSkeletons, GoogleReviewLink, Icon, ReviewList, Seo, TripComposer, VehicleCard } from '../components.jsx';
import { formatDate, img, telLink, tripMessage, useApi, waLink } from '../lib.js';
import { calm, Count, gsap, Reveal, ScrollTrigger, useGSAP, useSplitReveal } from '../motion.jsx';
import { TRIPS } from '../concierge/match.js';
import { pageMeta } from '../seo.js';

export default function Home() {
  const { data: site } = useApi('/api/site');
  const { data: vehicles } = useApi('/api/vehicles');
  const lead = vehicles?.find((v) => v.featured) || vehicles?.[0];

  useEffect(() => { ScrollTrigger.refresh(); }, [site, vehicles]); // content above the story changed height

  return (
    <>
      <Seo {...pageMeta('/', site)} />
      <Hero site={site} vehicles={vehicles} lead={lead} />
      <ConciergeBand vehicles={vehicles} />
      {site && lead && <Story site={site} car={lead} />}
      <FleetRail site={site} vehicles={vehicles} />
      {site?.services?.length > 0 && <WaysToRent site={site} />}

      <section className="section" aria-labelledby="reviews-h">
        <div className="wrap section-head">
          <div><p className="eyebrow">Reviews</p><h2 id="reviews-h">From the people in the driver’s seat.</h2></div>
          <Link className="link-arrow" to="/contact#reviews">All reviews<Icon name="arrow" size={18} /></Link>
        </div>
        <ReviewList marquee />
        <div className="wrap review-cta"><GoogleReviewLink /></div>
      </section>

      {site?.serviceAreas?.length > 0 && <Areas site={site} />}

      {site?.faqs?.length > 0 && (
        <section className="section wrap faq-wrap" aria-labelledby="faq-h">
          <Reveal><p className="eyebrow">Good to know</p><h2 id="faq-h">Before you ask.</h2></Reveal>
          <Reveal className="faq" data-each="">
            {site.faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}<Icon name="down" size={18} /></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </Reveal>
        </section>
      )}

      {site && <CtaBand site={site} />}
    </>
  );
}

/* ---------- Hero ---------- */
function Hero({ site, vehicles, lead }) {
  const root = useRef();
  const title = useRef();
  useSplitReveal(title);
  useGSAP(() => {
    if (calm()) return;
    gsap.from('.hero-car', { scale: 1.15, duration: 2.2, ease: 'expo.out' }); // no fade: it's the largest paint
    gsap.from('.hero-rise', { y: 24, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08, delay: 0.45 });
    gsap.to('.hero-car', { yPercent: 14, scale: 1.06, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } });
  }, { scope: root, dependencies: [!!lead], revertOnUpdate: true });

  return (
    <section className="hero" ref={root}>
      <div className="hero-visual" aria-hidden="true">
        {lead && <img className="hero-car" src={img(lead.images?.[0], 1200)} srcSet={`${img(lead.images?.[0], 700)} 700w, ${img(lead.images?.[0], 1400)} 1400w`} sizes="100vw" alt="" fetchPriority="high" />}
        <span className="hero-beam" />
      </div>
      <div className="wrap hero-inner">
        <h1 className="hero-rise status"><i aria-hidden="true" />{pageMeta('/', site).h1}</h1>
        <p ref={title} className="hero-title">Tell us the trip. <em>We’ll sort the car.</em></p>
        <div className="hero-rise hero-form"><TripComposer site={site} vehicles={vehicles} /></div>
        <p className="hero-rise hero-links">
          <Link className="link-arrow hero-concierge" to="/concierge"><Icon name="spark" size={16} />Not sure which car? Ask the Concierge</Link>
          <Link className="link-arrow hero-fleet" to="/fleet">Browse all {vehicles?.length || ''} cars<Icon name="arrow" size={16} /></Link>
        </p>
        {vehicles?.length > 0 && (
          <dl className="hero-rise readouts">
            <div><dt>Cars</dt><dd><Count to={vehicles.length} pad={2} /></dd></div>
            <div><dt>Seats, max</dt><dd><Count to={Math.max(0, ...vehicles.map((v) => Number(v.seats) || 0))} pad={2} /></dd></div>
            <div><dt>Car types</dt><dd><Count to={new Set(vehicles.map((v) => v.category).filter(Boolean)).size} pad={2} /></dd></div>
          </dl>
        )}
        <a className="hero-rise scroll-cue" href="#story">Scroll to see how it works<Icon name="down" size={16} /></a>
      </div>
    </section>
  );
}

/* ---------- Areas we serve (local search) ---------- */
function Areas({ site }) {
  return (
    <section className="section wrap areas" aria-labelledby="areas-h">
      <p className="eyebrow">Where we drive</p>
      <h2 id="areas-h">Car rental across {site.city && !/^your city$/i.test(site.city) ? site.city : 'the city'} and nearby.</h2>
      <ul className="area-list">
        {site.serviceAreas.map((a) => <li key={a}><Icon name="pin" size={16} />{a}</li>)}
      </ul>
      <p className="muted">Pickup somewhere else? <a data-track="whatsapp" href={waLink(site.whatsappNumber, `${site.whatsappMessage}\n\nPickup area: `)} target="_blank" rel="noreferrer">Ask us on WhatsApp</a>.</p>
    </section>
  );
}

/* ---------- Concierge: the signature feature ---------- */
function ConciergeBand({ vehicles }) {
  return (
    <section className="section wrap concierge-band" aria-labelledby="concierge-h">
      <Reveal className="concierge-copy">
        <p className="eyebrow">Drive Ease Concierge</p>
        <h2 id="concierge-h">Four questions. <em>The right car.</em></h2>
        <p className="lede">Tell us the trip, who’s coming and how much luggage. The Concierge checks every car{vehicles?.length ? ` in our fleet of ${vehicles.length}` : ''} and explains which fit and why. Then compare, save or ask us on WhatsApp.</p>
        <ol className="concierge-steps">
          <li><b>01</b>Your trip</li>
          <li><b>02</b>Matched cars, with reasons</li>
          <li><b>03</b>Compare or save</li>
          <li><b>04</b>Enquire on WhatsApp</li>
        </ol>
      </Reveal>
      <Reveal className="concierge-start">
        <p className="label">Start with your trip</p>
        <div className="concierge-trips">
          {TRIPS.map((t) => (
            <Link key={t.id} to={`/concierge?trip=${t.id}`}><strong>{t.label}</strong><small>{t.hint}</small></Link>
          ))}
        </div>
        <Link className="btn btn-amber btn-block btn-lg" to="/concierge"><Icon name="spark" size={18} />Start the Concierge</Link>
      </Reveal>
    </section>
  );
}

/* ---------- The story: the whole business model, told on a phone ---------- */
const CHAPTERS = [
  { label: 'Pick', title: 'Pick the car.', text: 'Browse the fleet and tap Enquire on the one you like, or just tell us the trip.' },
  { label: 'Message', title: 'Message us on WhatsApp.', text: 'Your pickup, drop-off and car are typed in for you. One tap to send.' },
  { label: 'Confirm', title: 'We confirm in the chat.', text: 'Availability and the documents to keep ready, in writing, before you commit.' },
  { label: 'Drive', title: 'Collect the keys. Drive.', text: 'Pickup time and place are agreed in the same thread. No app, no account, no payment online.' },
];

const inDays = (n) => new Date(Date.now() + n * 864e5).toLocaleDateString('en-CA');

function Story({ site, car }) {
  const root = useRef();
  const trigger = useRef();
  const [step, setStep] = useState(0);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      trigger.current = ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: () => `+=${innerHeight * 3}`,
        pin: '.story-stage',
        onUpdate: (self) => {
          setStep(Math.min(3, Math.floor(self.progress * 4)));
          gsap.set('.story-bar i', { scaleX: self.progress });
        },
      });
      return () => { trigger.current = null; };
    });
  }, { scope: root });

  function go(i) {
    const st = trigger.current;
    if (!st) return setStep(i);
    scrollTo({ top: st.start + (st.end - st.start) * ((i + 0.5) / 4), behavior: calm() ? 'auto' : 'smooth' });
  }

  const message = tripMessage(site.whatsappMessage, { car: car.name, from: 'Airport T2', to: 'Lonavala' });
  const c = CHAPTERS[step];

  return (
    <section className="story" id="story" ref={root} aria-label="How renting works">
      <div className="story-stage">
        <div className="wrap story-grid">
          <div className="story-copy">
            <p className="eyebrow"><span className="mono">0{step + 1} / 04</span> How it works</p>
            <div className="story-text" key={step}>
              <h2>{c.title}</h2>
              <p>{c.text}</p>
            </div>
          </div>

          <div className="phone" aria-hidden="true">
            <div className="phone-notch" />
            {step === 0 ? (
              <div className="screen screen-fleet" key="fleet">
                <p className="screen-label">Our fleet</p>
                <div className="mini-card">
                  <img src={img(car.images?.[0], 500)} alt="" />
                  <div>
                    <strong>{car.name}</strong>
                    <span>{car.category} · {car.seats} seats · {car.fuel}</span>
                  </div>
                  <span className="mini-cta"><Icon name="whatsapp" size={14} />Enquire</span>
                </div>
                <div className="mini-ghost" />
              </div>
            ) : (
              <div className="screen screen-chat" key="chat">
                <div className="chat-head">
                  <span className="chat-avatar">DE</span>
                  <span><strong>{site.businessName}</strong><small>Replies in this chat</small></span>
                </div>
                <div className="chat-body">
                  <p className="msg out">{message}<time>10:02</time></p>
                  {step >= 2 && (
                    <p className="msg in">
                      ✓ The {car.name} is available for your dates.{'\n'}Please keep your licence and ID ready.<time>10:06</time>
                    </p>
                  )}
                  {step >= 3 && (
                    <div className="msg in msg-card">
                      <span className="msg-key"><Icon name="key" size={18} /></span>
                      <span><strong>Pickup confirmed</strong>{formatDate(inDays(3), { weekday: 'short', day: 'numeric', month: 'short' })} · 9:00 am<small>{site.address}</small></span>
                    </div>
                  )}
                  {step === 1 && <p className="typing"><i /><i /><i /></p>}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="story-pill" role="group" aria-label="Steps">
          {CHAPTERS.map((ch, i) => (
            <button key={ch.label} aria-current={i === step ? 'step' : undefined} className={i < step ? 'done' : ''} onClick={() => go(i)}>
              <span aria-hidden="true" />{ch.label}
            </button>
          ))}
          <span className="story-bar" aria-hidden="true"><i /></span>
        </div>
      </div>
    </section>
  );
}

/* ---------- Fleet rail ---------- */
function FleetRail({ site, vehicles }) {
  const [type, setType] = useState('');
  const types = vehicles ? [...new Set(vehicles.map((v) => v.category))] : [];
  const shown = vehicles?.filter((v) => !type || v.category === type);
  return (
    <section className="section" aria-labelledby="fleet-h">
      <div className="wrap section-head">
        <Reveal><p className="eyebrow">The fleet</p><h2 id="fleet-h">Pick your ride.</h2></Reveal>
        <Link className="link-arrow" to="/fleet">All {vehicles?.length || ''} cars<Icon name="arrow" size={18} /></Link>
      </div>
      <div className="wrap tabs" role="group" aria-label="Filter by car type">
        {['', ...types].map((c) => (
          <button key={c || 'all'} aria-pressed={type === c} onClick={() => setType(c)}>{c || 'All'}</button>
        ))}
      </div>
      <div className="rail" key={type}>
        {shown ? shown.map((v) => <VehicleCard key={v.slug} v={v} site={site} />) : <CardSkeletons />}
      </div>
    </section>
  );
}

/* ---------- Ways to rent (services) ---------- */
function WaysToRent({ site }) {
  const [i, setI] = useState(0);
  const s = site.services[i] || site.services[0];
  return (
    <section className="section wrap ways" aria-labelledby="ways-h">
      <Reveal><p className="eyebrow">Ways to rent</p><h2 id="ways-h">One fleet. Every kind of trip.</h2></Reveal>
      <div className="tabs ways-tabs" role="tablist" aria-label="Services">
        {site.services.map((x, j) => (
          <button key={x.slug} role="tab" aria-selected={j === i} aria-controls="way-panel" onClick={() => setI(j)}>{x.name}</button>
        ))}
      </div>
      <div className="way" id="way-panel" role="tabpanel" key={s.slug}>
        <span className="way-index mono">{String(i + 1).padStart(2, '0')} / {String(site.services.length).padStart(2, '0')}</span>
        <h3>{s.name}</h3>
        <p className="way-summary">{s.summary}</p>
        <p>{s.details?.split('\n\n')[0]}</p>
        <Link className="link-arrow way-more" to={`/services/${s.slug}`}>More about {s.name.toLowerCase()}<Icon name="arrow" size={16} /></Link>
        <a className="btn btn-amber" data-track="whatsapp" href={waLink(site.whatsappNumber, `${site.whatsappMessage}\n\nService: ${s.name}`)} target="_blank" rel="noreferrer">
          <Icon name="whatsapp" />Ask about {s.name.toLowerCase()}
        </a>
      </div>
    </section>
  );
}

export function CtaBand({ site }) {
  return (
    <section className="cta">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow">Ready when you are</p>
          <h2>Where to <em>next?</em></h2>
          <p className="lede">Send your dates and destination. We’ll reply with the cars that fit.</p>
          <div className="hero-actions">
            <a className="btn btn-amber" data-track="whatsapp" href={waLink(site.whatsappNumber, site.whatsappMessage)} target="_blank" rel="noreferrer"><Icon name="whatsapp" />WhatsApp us</a>
            <a className="btn btn-glass" href={telLink(site.phone)}><Icon name="phone" size={18} />Call {site.phone}</a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

