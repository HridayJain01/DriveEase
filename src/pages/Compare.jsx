import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ErrorState, Icon, PageHead, Photo, Rate, Seo, spec } from '../components.jsx';
import { announce, EnquireButton, SaveButton } from '../features.jsx';
import { assess, TIERS, tripLabel } from '../concierge/match.js';
import { bySlug, dailyRate, photoGroups } from '../fleet.js';
import { useApi } from '../lib.js';
import { PAGES } from '../seo.js';
import { compare, MAX_COMPARE, trip as tripStore, useStore } from '../stores.js';

// Each row: label, value for a car, and (for numbers) which way is better.
const ROWS = [
  { key: 'category', label: 'Type', value: (v) => v.category },
  { key: 'rate', label: 'Rate', value: (v) => v.rate, render: (v) => <Rate rate={v.rate} />, num: (v) => dailyRate(v.rate), best: 'min' },
  { key: 'seats', label: 'Seats', value: (v) => v.seats, num: (v) => v.seats, best: 'max' },
  { key: 'bags', label: 'Bags', value: (v) => v.bags, num: (v) => v.bags, best: 'max' },
  { key: 'transmission', label: 'Gearbox', value: (v) => v.transmission },
  { key: 'fuel', label: 'Fuel', value: (v) => v.fuel },
  { key: 'photos', label: 'Photos', value: (v) => photoGroups(v).filter((g) => g.photos.length).map((g) => g.label).join(', ') },
  { key: 'features', label: 'Included', value: (v) => (v.features || []).join('|'), render: (v) => (v.features?.length ? <ul>{v.features.map((f) => <li key={f}>{f}</li>)}</ul> : null) },
];

export default function Compare() {
  const { data: site } = useApi('/api/site');
  const { data: vehicles, error } = useApi('/api/vehicles');
  const list = useStore(compare);
  const trip = useStore(tripStore);
  const [params, setParams] = useSearchParams();
  const [diffOnly, setDiffOnly] = useState(false);

  // A shared link (?cars=a,b) replaces the list once, then the URL tidies itself.
  useEffect(() => {
    if (params.has('cars')) { compare.replace(params.get('cars')); setParams({}, { replace: true }); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <ErrorState error={error} what="comparison" />;
  const { found: cars, missing } = vehicles ? bySlug(vehicles, list) : { found: [], missing: [] };
  const others = vehicles?.filter((v) => !list.includes(v.slug)) || [];
  const hasTrip = trip?.trip && trip?.passengers;
  const spare = cars.length < MAX_COMPARE;

  const differs = (row) => new Set(cars.map((v) => String(row.value(v) ?? ''))).size > 1;
  const bestOf = (row) => {
    if (!row.best || cars.length < 2) return null;
    const nums = cars.map((v) => row.num(v)).filter((n) => typeof n === 'number');
    if (nums.length < 2 || new Set(nums).size < 2) return null;
    return row.best === 'max' ? Math.max(...nums) : Math.min(...nums);
  };
  const rows = ROWS.filter((r) => !diffOnly || differs(r));

  function add(e) {
    const slug = e.target.value;
    if (!slug) return;
    if (compare.add(slug).error === 'full') announce(`You can compare up to ${MAX_COMPARE} cars.`);
    e.target.value = '';
  }

  return (
    <>
      <Seo {...PAGES['/compare']} />
      <PageHead eyebrow="Compare cars" title="Side by side.">
        <p>Compare up to {MAX_COMPARE} cars. Rates and specs are as listed by our team; availability and the final rate are confirmed when you enquire.</p>
      </PageHead>
      <section className="wrap compare">
        {!vehicles && <div className="compare-skel skeleton" aria-busy="true" aria-label="Loading cars" />}

        {vehicles && missing.length > 0 && (
          <p className="notice" role="status">
            {missing.length === 1 ? 'One car you picked is' : `${missing.length} cars you picked are`} no longer listed.{' '}
            <button type="button" className="link-btn" onClick={() => missing.forEach(compare.remove)}>Remove {missing.length === 1 ? 'it' : 'them'}</button>
          </p>
        )}

        {vehicles && cars.length === 0 && (
          <div className="empty-card">
            <span className="empty-icon"><Icon name="compare" size={28} /></span>
            <h2>Nothing to compare yet</h2>
            <p>Tap <strong>Compare</strong> on up to {MAX_COMPARE} cars, or let the Concierge pick the best fits for your trip.</p>
            <div className="hero-actions">
              <Link className="btn btn-amber" to="/concierge"><Icon name="spark" size={18} />Ask the Concierge</Link>
              <Link className="btn btn-glass" to="/fleet">Browse the fleet<Icon name="arrow" size={18} /></Link>
            </div>
            {others.length > 0 && <AddCar others={others} onAdd={add} />}
          </div>
        )}

        {cars.length > 0 && (
          <>
            <div className="compare-tools">
              <label className="check"><input type="checkbox" checked={diffOnly} onChange={(e) => setDiffOnly(e.target.checked)} disabled={cars.length < 2} /><span>Only show differences</span></label>
              <button type="button" className="link-btn" onClick={compare.clear}>Clear all</button>
            </div>
            <div className="ctable" role="table" aria-label="Car comparison" style={{ '--n': cars.length + (spare ? 1 : 0) }}>
              <div className="crow chead" role="row">
                <span className="clabel" role="columnheader"><span className="sr-only">Detail</span></span>
                {cars.map((v) => (
                  <div key={v.slug} className="ccell" role="columnheader">
                    <div className="ccar-media">
                      <Photo src={v.images?.[0]} alt={v.name} sizes="(max-width: 700px) 33vw, 300px" />
                      <SaveButton v={v} />
                    </div>
                    <Link className="ccar-name" to={`/fleet/${v.slug}`}>{v.name}</Link>
                    <button type="button" className="link-btn ccar-remove" onClick={() => compare.remove(v.slug)} aria-label={`Remove the ${v.name} from compare`}>Remove</button>
                  </div>
                ))}
                {spare && (
                  <div className="ccell cadd" role="columnheader">
                    {others.length ? <AddCar others={others} onAdd={add} compact /> : <p className="muted">That’s every car in the fleet.</p>}
                  </div>
                )}
              </div>

              {hasTrip && (
                <div className="crow" role="row">
                  <span className="clabel" role="rowheader">For your {tripLabel(trip.trip).toLowerCase()}</span>
                  {cars.map((v) => {
                    const r = assess(v, trip);
                    return (
                      <div key={v.slug} className="ccell" role="cell">
                        <span className={`tier tier-${r.tier}`}>{TIERS[r.tier].label}</span>
                        {[...r.fails, ...r.misses].slice(0, 2).map((t) => <small key={t} className="cnote">{t}</small>)}
                      </div>
                    );
                  })}
                  {spare && <span className="ccell" role="cell" />}
                </div>
              )}

              {rows.map((row) => {
                const best = bestOf(row);
                const diff = cars.length > 1 && differs(row);
                return (
                  <div key={row.key} className={`crow${diff ? ' is-diff' : ''}`} role="row">
                    <span className="clabel" role="rowheader">{row.label}{diff && <i className="cdiff" title="Differs between these cars"><span className="sr-only"> (differs)</span></i>}</span>
                    {cars.map((v) => {
                      const isBest = best !== null && row.num?.(v) === best;
                      return (
                        <div key={v.slug} className={`ccell${isBest ? ' is-best' : ''}`} role="cell">
                          {row.render ? (row.render(v) ?? spec('')) : spec(row.value(v))}
                          {isBest && <span className="best-tag">{row.best === 'max' ? 'Most' : 'Lowest'}</span>}
                        </div>
                      );
                    })}
                    {spare && <span className="ccell" role="cell" />}
                  </div>
                );
              })}

              <div className="crow cfoot" role="row">
                <span className="clabel" role="rowheader"><span className="sr-only">Actions</span></span>
                {cars.map((v) => (
                  <div key={v.slug} className="ccell" role="cell">
                    <EnquireButton cars={[v]} source="compare" label={`Enquire about the ${v.name}`} />
                    <Link className="link-arrow" to={`/fleet/${v.slug}`}>Details<Icon name="arrow" size={14} /></Link>
                  </div>
                ))}
                {spare && <span className="ccell" role="cell" />}
              </div>
            </div>
            {cars.length === 1 && <p className="muted compare-hint">Add another car to see the differences.</p>}
            {cars.length > 1 && site && (
              <div className="cq-actions">
                <EnquireButton className="btn btn-amber" cars={cars} context="comparing" source="compare">Ask about these {cars.length} on WhatsApp</EnquireButton>
                {!hasTrip && <Link className="btn btn-glass" to="/concierge"><Icon name="spark" size={18} />Check which suits my trip</Link>}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}

function AddCar({ others, onAdd, compact }) {
  return (
    <label className={`field cadd-field${compact ? ' is-compact' : ''}`}>
      <span>{compact ? 'Add a car' : 'Or pick a car to start'}</span>
      <select defaultValue="" onChange={onAdd}>
        <option value="">Choose a car…</option>
        {others.map((v) => <option key={v.slug} value={v.slug}>{v.name}{v.category ? ` · ${v.category}` : ''}</option>)}
      </select>
    </label>
  );
}
