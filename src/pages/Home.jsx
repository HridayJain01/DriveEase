import { Link } from 'react-router';
import { CardSkeletons, Icon, ReviewList, Seo, TripComposer, VehicleCard } from '../components.jsx';
import { telLink, useApi, waLink } from '../lib.js';

const STEPS = [
  ['Pick a car — or just the trip', 'Browse the fleet, or tell us where you’re going and how many are travelling.'],
  ['Confirm on WhatsApp', 'We reply with availability, the rate and the documents to keep ready.'],
  ['Collect the keys and go', 'Pickup time and place are agreed in the same chat. No apps, no accounts.'],
];

export default function Home() {
  const { data: site } = useApi('/api/site');
  const { data: vehicles } = useApi('/api/vehicles');
  const highlights = vehicles && [...vehicles.filter((v) => v.featured), ...vehicles.filter((v) => !v.featured)].slice(0, 3);

  return (
    <>
      <Seo description={site?.tagline} />
      <section className="hero wrap">
        <div className="hero-copy">
          <p className="eyebrow">Car rentals{site?.city ? ` · ${site.city}` : ''}</p>
          <h1 className="hero-title"><span>Tell us the trip.</span> <span>We’ll sort the car.</span></h1>
          <p className="lede">{site?.tagline}</p>
          <div className="hero-actions">
            <Link className="btn btn-dark" to="/fleet">Browse the fleet<Icon name="arrow" size={18} /></Link>
            {site && <a className="btn btn-ghost" href={telLink(site.phone)}><Icon name="phone" size={18} />{site.phone}</a>}
          </div>
          {vehicles && (
            <ul className="hero-facts">
              <li><strong>{vehicles.length}</strong> cars in the fleet</li>
              <li><strong>{Math.max(...vehicles.map((v) => v.seats))}</strong> seats in our largest</li>
              {site?.hours && <li>{site.hours}</li>}
            </ul>
          )}
        </div>
        <TripComposer site={site} vehicles={vehicles} />
      </section>

      <section className="section wrap" aria-labelledby="fleet-h">
        <div className="section-head">
          <div>
            <p className="eyebrow">The fleet</p>
            <h2 id="fleet-h">Pick your ride</h2>
          </div>
          <Link className="link-arrow" to="/fleet">See all {vehicles ? vehicles.length : ''} cars<Icon name="arrow" size={18} /></Link>
        </div>
        <div className="car-grid scroll-x">
          {highlights ? highlights.map((v) => <VehicleCard key={v.slug} v={v} site={site} />) : <CardSkeletons />}
        </div>
      </section>

      <section className="section road" aria-labelledby="how-h">
        <div className="wrap">
          <p className="eyebrow">How it works</p>
          <h2 id="how-h">From message to keys in three stops</h2>
          <ol className="steps">
            {STEPS.map(([title, text], i) => (
              <li key={title}>
                <span className="stone" aria-hidden="true"><small>km</small>{i + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {site && (
        <section className="section wrap" aria-labelledby="services-h">
          <div className="section-head">
            <div>
              <p className="eyebrow">Services</p>
              <h2 id="services-h">However you’re travelling</h2>
            </div>
            <Link className="link-arrow" to="/services">All services<Icon name="arrow" size={18} /></Link>
          </div>
          <ul className="service-rows">
            {site.services.map((s) => (
              <li key={s.slug}>
                <h3>{s.name}</h3>
                <p>{s.summary}</p>
                <a href={waLink(site.whatsappNumber, `${site.whatsappMessage}\n\nService: ${s.name}`)} target="_blank" rel="noreferrer" aria-label={`Ask about ${s.name} on WhatsApp`}>
                  Ask<Icon name="arrow" size={16} />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="section wrap" aria-labelledby="reviews-h">
        <div className="section-head">
          <div>
            <p className="eyebrow">Reviews</p>
            <h2 id="reviews-h">What travellers say</h2>
          </div>
          <Link className="link-arrow" to="/contact#reviews">All reviews<Icon name="arrow" size={18} /></Link>
        </div>
        <ReviewList limit={3} />
      </section>

      {site?.faqs?.length > 0 && (
        <section className="section wrap faq-wrap" aria-labelledby="faq-h">
          <div>
            <p className="eyebrow">Good to know</p>
            <h2 id="faq-h">Questions, answered</h2>
          </div>
          <div className="faq">
            {site.faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {site && <CtaBand site={site} />}
    </>
  );
}

export function CtaBand({ site }) {
  return (
    <section className="cta-band">
      <div className="wrap cta-inner">
        <h2>Where to next?</h2>
        <p>Send your dates and destination — we’ll reply with cars that fit.</p>
        <div className="hero-actions">
          <a className="btn btn-wa" href={waLink(site.whatsappNumber, site.whatsappMessage)} target="_blank" rel="noreferrer"><Icon name="whatsapp" />WhatsApp us</a>
          <a className="btn btn-outline-light" href={telLink(site.phone)}><Icon name="phone" size={18} />Call {site.phone}</a>
        </div>
      </div>
    </section>
  );
}
