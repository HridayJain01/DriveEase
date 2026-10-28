import { useSearchParams } from 'react-router';
import { CardSkeletons, ErrorState, PageHead, Seo, VehicleCard } from '../components.jsx';
import { useApi } from '../lib.js';
import { pageMeta } from '../seo.js';

export default function Fleet() {
  const { data: site } = useApi('/api/site');
  const { data: vehicles, error } = useApi('/api/vehicles');
  const [params, setParams] = useSearchParams();
  const type = params.get('type') || '';
  if (error) return <ErrorState error={error} what="fleet" />;

  const categories = vehicles ? [...new Set(vehicles.map((v) => v.category))] : [];
  const shown = vehicles?.filter((v) => !type || v.category === type);

  return (
    <>
      <Seo {...pageMeta('/fleet', site)} />
      <PageHead h1={pageMeta('/fleet', site).h1} title="Find the car that fits the trip.">
        <p>Every car can be enquired about straight from its card — the model is added to your WhatsApp message.</p>
      </PageHead>
      <div className="wrap">
        <div className="filters" role="group" aria-label="Filter by car type">
          {['', ...categories].map((c) => (
            <button key={c || 'all'} className="chip-btn" aria-pressed={type === c} onClick={() => setParams(c ? { type: c } : {}, { replace: true, preventScrollReset: true })}>
              {c || 'All cars'}<small>{c ? vehicles.filter((v) => v.category === c).length : vehicles?.length}</small>
            </button>
          ))}
        </div>
        <h2 className="sr-only">{type ? `${type} cars` : 'All cars'}</h2>
        <div className="car-grid">
          {shown ? shown.map((v) => <VehicleCard key={v.slug} v={v} site={site} />) : <CardSkeletons n={6} />}
        </div>
        {shown?.length === 0 && <p className="muted">No {type} cars right now. <button className="link-btn" onClick={() => setParams({})}>Show all cars</button></p>}
      </div>
    </>
  );
}
