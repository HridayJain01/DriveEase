import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ErrorState, Icon, Photo, Rate, Seo, Specs, TripComposer, VehicleCard } from '../components.jsx';
import { img, useApi } from '../lib.js';

export default function Vehicle() {
  const { slug } = useParams();
  const { data: site } = useApi('/api/site');
  const { data: detail, error } = useApi(`/api/vehicles/${slug}`);
  const { data: all } = useApi('/api/vehicles');
  const v = detail || all?.find((x) => x.slug === slug); // list already has every field: render instantly
  const [active, setActive] = useState(0);
  if (error) return <ErrorState error={error} what="car" />;
  if (!v) return <div className="wrap vehicle-skeleton skeleton" aria-busy="true" />;

  const images = v.images?.length ? v.images : [''];
  const similar = all?.filter((x) => x.slug !== v.slug && x.category === v.category).slice(0, 3) || [];

  return (
    <>
      <Seo title={`${v.name} rental`} description={`${v.name} — ${v.category.toLowerCase()}, ${v.seats} seats, ${v.fuel.toLowerCase()} ${v.transmission.toLowerCase()}. ${v.summary}`} />
      <div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb"><Link to="/fleet">Fleet</Link><span aria-hidden="true">/</span><span aria-current="page">{v.name}</span></nav>
      </div>
      <section className="wrap vehicle">
        <div className="vehicle-main">
          <div className="gallery">
            <Photo key={images[active]} src={images[active]} alt={`${v.name} — photo ${active + 1} of ${images.length}`} className="gallery-main" sizes="(max-width: 900px) 100vw, 60vw" eager />
            {images.length > 1 && (
              <div className="thumbs">
                {images.map((src, i) => (
                  <button key={src} aria-label={`Show photo ${i + 1}`} aria-pressed={i === active} onClick={() => setActive(i)}>
                    <img src={img(src, 200)} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="vehicle-info">
            <p className="eyebrow">{v.category}{v.featured && ' · Featured'}</p>
            <h1>{v.name}</h1>
            <p className="lede">{v.description}</p>
            <Specs v={v} />
            <div className="vehicle-rate"><Rate rate={v.rate} /><span className="muted">Final rate depends on dates and trip — confirmed before you book.</span></div>
            {v.features?.length > 0 && (
              <>
                <h2 className="h-small">Included</h2>
                <ul className="features">{v.features.map((f) => <li key={f}><Icon name="check" size={18} />{f}</li>)}</ul>
              </>
            )}
          </div>
        </div>
        <aside className="vehicle-side">
          <TripComposer site={site} fixedCar={v.name} title="Enquire about this car" />
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
