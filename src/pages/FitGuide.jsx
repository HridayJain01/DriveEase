import { useState } from 'react';
import { Link } from 'react-router';
import { CtaBand, ErrorState, Icon, PageHead, Seo, spec, VehicleCard } from '../components.jsx';
import { carsThatFit } from '../concierge/match.js';
import { useApi, waLink } from '../lib.js';
import { pageMeta } from '../seo.js';
import { FIT_FAQS } from '../seo-content.js';

function Counter({ name, label, unit, value, min, max, onChange }) {
  return (
    <div className="stepper" role="group" aria-labelledby={`${name}-label`}>
      <span id={`${name}-label`} className="stepper-label">{label}</span>
      <div className="stepper-row">
        <button type="button" className="icon-btn" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Fewer ${unit}`}><Icon name="minus" size={18} /></button>
        <output className="fit-count" aria-live="polite">{value}</output>
        <button type="button" className="icon-btn" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`More ${unit}`}><Icon name="plus" size={18} /></button>
      </div>
    </div>
  );
}

// A small free tool: how many people and big bags, and which cars take them. It works from each car's listed seats and bags.
export default function FitGuide() {
  const { data: site, error } = useApi('/api/site');
  const { data: vehicles, error: carsError } = useApi('/api/vehicles');
  const [people, setPeople] = useState(4);
  const [bags, setBags] = useState(2);
  if (error || carsError) return <ErrorState error={error || carsError} what="page" />;
  if (!site || !vehicles) return <div className="wrap vehicle-skeleton skeleton" aria-busy="true" />;

  const meta = pageMeta('/which-car-fits', site);
  const fits = carsThatFit(vehicles, people, bags);
  const group = `${people} ${people === 1 ? 'person' : 'people'} and ${bags} big ${bags === 1 ? 'bag' : 'bags'}`;
  const ask = `${site.whatsappMessage}\n\nGroup: ${group}`;
  const table = [...vehicles].sort((a, b) => Number(a.seats) - Number(b.seats) || Number(a.bags) - Number(b.bags));

  return (
    <>
      <Seo {...meta} />
      <div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb"><Link to="/fleet">Fleet</Link><span aria-hidden="true">/</span><span aria-current="page">Which car fits?</span></nav>
      </div>
      <PageHead h1={meta.h1} title="Will everyone and everything fit?">
        <p>Count people first, then big suitcases. Bags are what usually go wrong: a car can have enough seats and still not take your luggage.</p>
      </PageHead>
      <section className="wrap">
        <div className="fit-tool">
          <div className="fit-inputs">
            <Counter name="people" label="Travellers, including the driver" unit="travellers" value={people} min={1} max={12} onChange={setPeople} />
            <Counter name="bags" label="Big bags or suitcases" unit="bags" value={bags} min={0} max={10} onChange={setBags} />
          </div>
          <p className="fit-answer" role="status">
            {fits.length ? `${fits.length} of our ${vehicles.length} cars can take ${group}.` : `No single car takes ${group}. Ask us about two cars.`}
          </p>
          <a className="btn btn-amber btn-block" data-track="whatsapp" data-source="seo-page" href={waLink(site.whatsappNumber, ask)} target="_blank" rel="noreferrer"><Icon name="whatsapp" />Ask us on WhatsApp</a>
        </div>
        {fits.length > 0 && <div className="car-grid">{fits.slice(0, 3).map((v) => <VehicleCard key={v.slug} v={v} site={site} />)}</div>}
      </section>

      <section className="section wrap-narrow prose" aria-labelledby="fit-table-h">
        <h2 id="fit-table-h">Seats and bags in every car</h2>
        <div className="fit-table">
          <table>
            <thead><tr><th scope="col">Car</th><th scope="col">Type</th><th scope="col">Seats</th><th scope="col">Big bags</th></tr></thead>
            <tbody>{table.map((v) => <tr key={v.slug}><td><Link to={`/fleet/${v.slug}`}>{v.name}</Link></td><td>{v.category}</td><td>{spec(v.seats)}</td><td>{spec(v.bags)}</td></tr>)}</tbody>
          </table>
        </div>
        <p className="landing-note">A guide only: real space depends on the shape of your bags. Tell us what you’re bringing and we’ll confirm.</p>
        <h2>Questions people ask</h2>
        {FIT_FAQS.map((f) => <div key={f.q}><h3>{f.q}</h3><p>{f.a}</p></div>)}
      </section>
      <CtaBand site={site} />
    </>
  );
}
