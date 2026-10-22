import { ErrorState, Icon, PageHead, Seo } from '../components.jsx';
import { useApi, waLink } from '../lib.js';
import { PAGES } from '../seo.js';
import { CtaBand } from './Home.jsx';

export default function Services() {
  const { data: site, error } = useApi('/api/site');
  if (error) return <ErrorState error={error} />;

  return (
    <>
      <Seo {...PAGES['/services']} />
      <PageHead eyebrow="Services" title="One fleet, every kind of trip.">
        <p>Tell us how you’re travelling and we’ll match the car — and a driver, if you want one.</p>
      </PageHead>
      {site && (
        <>
          <section className="wrap service-list">
            {site.services.map((s) => (
              <article key={s.slug} id={s.slug} className="service">
                <h2>{s.name}</h2>
                <div>
                  <p className="service-summary">{s.summary}</p>
                  <p>{s.details}</p>
                  <a className="btn btn-amber btn-sm" href={waLink(site.whatsappNumber, `${site.whatsappMessage}\n\nService: ${s.name}`)} target="_blank" rel="noreferrer">
                    <Icon name="whatsapp" size={16} />Ask about {s.name.toLowerCase()}
                  </a>
                </div>
              </article>
            ))}
          </section>
          <CtaBand site={site} />
        </>
      )}
    </>
  );
}
