import { Link, useParams } from 'react-router';
import { ErrorState, Icon, Rate, Seo, spec, VehicleCard } from '../components.jsx';
import { CompareButton, EnquireButton, Gallery, SaveButton } from '../features.jsx';
import { assess, TIERS, tripLabel } from '../concierge/match.js';
import { useApi } from '../lib.js';
import { vehicleMeta } from '../seo.js';
import { trip as tripStore, useStore } from '../stores.js';
import { enquiryFormPath } from '../whatsapp.js';

export default function Vehicle() {
  const { slug } = useParams();
  const { data: site } = useApi('/api/site');
  const { data: detail, error } = useApi(`/api/vehicles/${slug}`);
  const { data: all } = useApi('/api/vehicles');
  const trip = useStore(tripStore);
  const v = detail || all?.find((x) => x.slug === slug); // list already has every field: render instantly
  if (error && !v) return <ErrorState error={error} what="car" />;
  if (!v) return <div className="wrap vehicle-skeleton skeleton" aria-busy="true" />;

  const similar = all?.filter((x) => x.slug !== v.slug && x.category === v.category).slice(0, 3) || [];
  const fit = trip?.trip && trip?.passengers ? assess(v, trip) : null;
  const plural = (n, one, many) => (n === undefined || n === null || n === '' ? '' : `${n} ${n === 1 ? one : many}`);

  return (
    <>
      <Seo {...vehicleMeta(v)} />
      <div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb"><Link to="/fleet">Fleet</Link><span aria-hidden="true">/</span><span aria-current="page">{v.name}</span></nav>
      </div>
      <section className="wrap vehicle">
        <div className="vehicle-main">
          <Gallery v={v} />
          <div className="vehicle-info">
            <p className="eyebrow">{v.category}{v.featured && ' · Featured'}</p>
            <h1>{v.name}</h1>
            {v.description ? <p className="lede">{v.description}</p> : v.summary && <p className="lede">{v.summary}</p>}
            <h2 className="h-small">Specifications</h2>
            <dl className="spec-list">
              <div><dt><Icon name="car" size={18} />Type</dt><dd>{spec(v.category)}</dd></div>
              <div><dt><Icon name="seats" size={18} />Seats</dt><dd>{spec(plural(v.seats, 'seat', 'seats'))}</dd></div>
              <div><dt><Icon name="bags" size={18} />Luggage</dt><dd>{spec(plural(v.bags, 'large bag', 'large bags'))}</dd></div>
              <div><dt><Icon name="gears" size={18} />Gearbox</dt><dd>{spec(v.transmission)}</dd></div>
              <div><dt><Icon name="fuel" size={18} />Fuel</dt><dd>{spec(v.fuel)}</dd></div>
            </dl>
            {v.features?.length > 0 && (
              <>
                <h2 className="h-small">Included</h2>
                <ul className="features">{v.features.map((f) => <li key={f}><Icon name="check" size={18} />{f}</li>)}</ul>
              </>
            )}
          </div>
        </div>
        <aside className="vehicle-side">
          <div className="side-card">
            <h2 className="composer-title">Interested in the {v.name}?</h2>
            <div className="vehicle-rate"><Rate rate={v.rate} /><span className="muted">Final rate depends on dates and trip, and is confirmed before you book.</span></div>
            {fit && (
              <div className={`side-fit tier-${fit.tier}`}>
                <p><span className={`tier tier-${fit.tier}`}>{TIERS[fit.tier].label}</span> for your {tripLabel(trip.trip).toLowerCase()}</p>
                {fit.tier !== 'unsuitable' && fit.why && <p className="muted">{fit.why}</p>}
                {[...fit.fails, ...fit.misses, ...fit.unverified].slice(0, 3).map((t) => <p key={t} className="cnote">{t}</p>)}
              </div>
            )}
            <EnquireButton className="btn btn-amber btn-block btn-lg" cars={[v]} source="car-page">Enquire on WhatsApp</EnquireButton>
            <div className="side-row">
              <SaveButton v={v} full />
              <CompareButton v={v} full />
            </div>
            <Link className="composer-alt" to={enquiryFormPath({ cars: [v], trip, source: 'car-page' })}>Prefer a call back? Send the enquiry form</Link>
            {!fit && <Link className="link-arrow side-concierge" to="/concierge"><Icon name="spark" size={16} />Not sure it fits your trip? Ask the Concierge</Link>}
          </div>
        </aside>
      </section>
      {similar.length > 0 && (
        <section className="section wrap" aria-labelledby="similar-h">
          <h2 id="similar-h">Similar cars</h2>
          <div className="car-grid scroll-x">{similar.map((x) => <VehicleCard key={x.slug} v={x} site={site} />)}</div>
        </section>
      )}
    </>
  );
}
