import { Link, useParams } from 'react-router';
import { CardSkeletons, ErrorState, Icon, PageHead, Seo, VehicleCard } from '../components.jsx';
import { WhatsAppQr } from '../features.jsx';
import { blankAnswers, recommend } from '../concierge/match.js';
import { useApi, waLink } from '../lib.js';
import { serviceMeta } from '../seo.js';
import { CtaBand } from './Home.jsx';

// Which Concierge trip a service is closest to, so its page can suggest suitable cars.
const tripFor = (slug) => (/airport/.test(slug) ? 'airport' : /outstation|trip|tour/.test(slug) ? 'weekend' : /wedding|event|family/.test(slug) ? 'family' : /corporate|business/.test(slug) ? 'business' : '');

// One landing page per service (e.g. /services/airport), so each can rank for its own searches.
export default function Service() {
  const { slug } = useParams();
  const { data: site, error } = useApi('/api/site');
  const { data: vehicles } = useApi('/api/vehicles');
  if (error) return <ErrorState error={error} what="page" />;
  if (!site) return <div className="wrap vehicle-skeleton skeleton" aria-busy="true" />;
  const s = site.services?.find((x) => x.slug === slug);
  if (!s) return <ErrorState error={{ message: 'not-found' }} what="service" />;

  const trip = tripFor(s.slug);
  const cars = !vehicles ? null : trip
    ? recommend(vehicles, { ...blankAnswers(), trip, passengers: 2, bags: trip === 'airport' ? 2 : 1 }).top.map((r) => r.vehicle)
    : [...vehicles].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 3);
  const others = site.services.filter((x) => x.slug !== s.slug);
  const meta = serviceMeta(s, site);
  const ask = `${site.whatsappMessage}\n\nService: ${s.name}`;

  return (
    <>
      <Seo {...meta} />
      <div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb"><Link to="/services">Services</Link><span aria-hidden="true">/</span><span aria-current="page">{s.name}</span></nav>
      </div>
      <PageHead h1={meta.title} title={s.summary || s.name}>
        <p>Tell us your dates, pickup and how many are travelling. We reply on WhatsApp with the cars that fit.</p>
      </PageHead>
      <section className="wrap service-page">
        <div className="prose">
          {(s.details || '').split('\n\n').filter(Boolean).map((p) => <p key={p}>{p}</p>)}
        </div>
        <aside className="side-card service-side">
          <h2 className="composer-title">Ask about {s.name.toLowerCase()}</h2>
          <a className="btn btn-amber btn-block btn-lg" data-track="whatsapp" href={waLink(site.whatsappNumber, ask)} target="_blank" rel="noreferrer"><Icon name="whatsapp" />Enquire on WhatsApp</a>
          {trip && <Link className="btn btn-glass btn-block" to={`/concierge?trip=${trip}`}><Icon name="spark" size={18} />Find the right car</Link>}
          <WhatsAppQr site={site} text={ask} />
        </aside>
      </section>

      <section className="section wrap" aria-labelledby="svc-cars-h">
        <div className="section-head">
          <h2 id="svc-cars-h">Cars for {s.name.toLowerCase()}</h2>
          <Link className="link-arrow" to="/fleet">All cars<Icon name="arrow" size={18} /></Link>
        </div>
        <div className="car-grid">{cars ? cars.map((v) => <VehicleCard key={v.slug} v={v} site={site} />) : <CardSkeletons n={3} />}</div>
      </section>

      {others.length > 0 && (
        <section className="section wrap" aria-labelledby="svc-more-h">
          <h2 id="svc-more-h" className="h-small">Other ways to rent</h2>
          <ul className="area-list">{others.map((x) => <li key={x.slug}><Link to={`/services/${x.slug}`}>{x.name}</Link></li>)}</ul>
        </section>
      )}
      <CtaBand site={site} />
    </>
  );
}
