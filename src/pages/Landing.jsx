import { Link, useParams } from 'react-router';
import { CtaBand, ErrorState, Icon, PageHead, Seo, VehicleCard } from '../components.jsx';
import { WhatsAppQr } from '../features.jsx';
import { suggestedCars } from '../concierge/match.js';
import { formatDate, useApi, waLink } from '../lib.js';
import { landingMeta, pageMeta } from '../seo.js';
import { AREAS, CAR_TYPES, LEGAL, ROUTES } from '../seo-content.js';
import { areaLinks, carsOfType, CONTENT_UPDATED, routeLinks, typeLinks } from '../seo-links.js';

// Pages that answer one search each: a route from Mumbai, a part of Mumbai, or a type of car.
// The server sends the same text in plain HTML (server/prerender.js) and the matching structured data.

const Chips = ({ title, id, links }) => links.length > 0 && (
  <section className="section wrap" aria-labelledby={id}>
    <h2 id={id} className="h-small">{title}</h2>
    <ul className="area-list">{links.map(([to, label]) => <li key={to}><Link to={to}>{label}</Link></li>)}</ul>
  </section>
);

function Faqs({ items }) {
  return (
    <section className="section wrap faq-wrap" aria-labelledby="landing-faq-h">
      <div><p className="eyebrow">Good to know</p><h2 id="landing-faq-h">Questions people ask.</h2></div>
      <div className="faq">
        {items.map((f) => (
          <details key={f.q}>
            <summary>{f.q}<Icon name="down" size={18} /></summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

// The shared layout: direct answer first, an enquiry card alongside, then cars, questions and next steps.
function LandingPage({ site, page, crumbs, askAbout, cta, trip, facts, list, carsTitle, cars, children }) {
  const ask = `${site.whatsappMessage}\n\n${askAbout}`;
  return (
    <>
      <Seo {...landingMeta(page, site)} />
      <div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb">
          {crumbs.map(([to, label]) => <span key={to} className="crumb"><Link to={to}>{label}</Link><span aria-hidden="true"> / </span></span>)}
          <span aria-current="page">{page.crumb || page.name || page.h1}</span>
        </nav>
      </div>
      <PageHead h1={page.h1} title={page.slogan} />
      <section className="wrap service-page">
        <div className="prose">
          <p className="answer">{page.answer}</p>
          {page.paras.map((p) => <p key={p}>{p}</p>)}
          {list && <><h2>{list.title}</h2><ul>{list.items.map((t) => <li key={t}>{t}</li>)}</ul></>}
          <p className="landing-note">Last updated {formatDate(CONTENT_UPDATED, { month: 'long', year: 'numeric' })}.</p>
        </div>
        <aside className="side-card service-side">
          {facts}
          <h2 className="composer-title">{cta}</h2>
          <a className="btn btn-amber btn-block btn-lg" data-track="whatsapp" data-source="seo-page" href={waLink(site.whatsappNumber, ask)} target="_blank" rel="noreferrer"><Icon name="whatsapp" />Enquire on WhatsApp</a>
          <Link className="btn btn-glass btn-block" to={trip ? `/concierge?trip=${trip}` : '/concierge'}><Icon name="spark" size={18} />Find the right car</Link>
          <WhatsAppQr site={site} text={ask} />
        </aside>
      </section>
      {cars?.length > 0 && (
        <section className="section wrap" aria-labelledby="landing-cars-h">
          <div className="section-head">
            <h2 id="landing-cars-h">{carsTitle}</h2>
            <Link className="link-arrow" to="/fleet">All cars<Icon name="arrow" size={18} /></Link>
          </div>
          <div className="car-grid">{cars.map((v) => <VehicleCard key={v.slug} v={v} site={site} />)}</div>
        </section>
      )}
      <Faqs items={page.faqs} />
      {children}
      <CtaBand site={site} />
    </>
  );
}

function RoutePage({ site, vehicles, r }) {
  const { data: posts } = useApi('/api/posts');
  const guide = posts?.find((p) => p.slug === 'weekend-drives-from-mumbai');
  return (
    <LandingPage
      site={site} page={{ ...r, crumb: `Mumbai to ${r.place}` }} crumbs={[['/routes', 'Routes']]}
      askAbout={`Trip: Mumbai to ${r.place}`} cta={`Ask about a car to ${r.place}`} trip={r.trip}
      list={{ title: 'Good to know', items: r.tips }}
      carsTitle={`Cars for Mumbai to ${r.place}`} cars={suggestedCars(vehicles, r.trip)}
      facts={(
        <>
        <dl className="route-facts">
          <div><dt>Distance</dt><dd>{r.distance}</dd></div>
          <div><dt>Drive time</dt><dd>{r.time}</dd></div>
          <div><dt>Usual road</dt><dd>{r.road}</dd></div>
        </dl>
        <p className="landing-note">Approximate. Depends on traffic and where you start.</p>
        </>
      )}
    >
      <Chips title="More drives from Mumbai" id="more-routes-h" links={routeLinks(site).filter((x) => x.slug !== r.slug).map((x) => [`/routes/${x.slug}`, `Mumbai to ${x.place}`])} />
      {guide && <p className="wrap"><Link className="link-arrow wraps" to={`/blog/${guide.slug}`}>{guide.title}<Icon name="arrow" size={16} /></Link></p>}
    </LandingPage>
  );
}

function AreaPage({ site, vehicles, x }) {
  return (
    <LandingPage
      site={site} page={x} crumbs={[['/car-rental', 'Areas']]}
      askAbout={`Pickup area: ${x.name}`} cta={`Ask about a car in ${x.name}`} trip={x.trip}
      list={{ title: 'Good for', items: x.goodFor }}
      carsTitle="Cars to consider" cars={suggestedCars(vehicles, x.trip)}
    >
      <Chips title="Other areas" id="more-areas-h" links={areaLinks(site).filter((a) => a.slug !== x.slug).map((a) => [`/car-rental/${a.slug}`, a.name])} />
      <Chips title="Popular drives from Mumbai" id="routes-h" links={routeLinks(site).map((r) => [`/routes/${r.slug}`, `Mumbai to ${r.place}`])} />
    </LandingPage>
  );
}

function CarTypePage({ site, vehicles, t }) {
  return (
    <LandingPage
      site={site} page={t} crumbs={[['/fleet', 'Fleet']]}
      askAbout={`Car type: ${t.name}`} cta={`Ask about ${t.name.toLowerCase()}`} trip={t.trip}
      carsTitle={`Our ${t.name.toLowerCase()}`} cars={carsOfType(t.slug, vehicles)}
    >
      <Chips title="Other car types" id="more-types-h" links={typeLinks(site, vehicles).filter((x) => x.slug !== t.slug).map((x) => [`/cars/${x.slug}`, x.name])} />
      <Chips title="Popular drives from Mumbai" id="routes-h" links={routeLinks(site).map((r) => [`/routes/${r.slug}`, `Mumbai to ${r.place}`])} />
    </LandingPage>
  );
}

function Hub({ site, path, crumb, title, cards, children }) {
  const meta = pageMeta(path, site);
  return (
    <>
      <Seo {...meta} />
      <div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">{crumb}</span></nav>
      </div>
      <PageHead h1={meta.h1} title={title}><p>{meta.description}</p></PageHead>
      <section className="wrap hub-grid">
        {cards.map(([to, heading, note, facts]) => (
          <Link key={to} className="hub-card" to={to}>
            <h2>{heading}</h2>
            {facts && <span className="mono">{facts}</span>}
            <p>{note}</p>
          </Link>
        ))}
      </section>
      {children}
      <CtaBand site={site} />
    </>
  );
}

function Legal({ site, doc }) {
  return (
    <>
      <Seo {...landingMeta(doc, site)} />
      <article className="wrap-narrow legal">
        <h1>{doc.title}</h1>
        <p className="landing-note">Last updated: {doc.updated}</p>
        <div className="prose">
          {doc.sections(site).map((s) => (
            <section key={s.h}>
              <h2>{s.h}</h2>
              {s.p.map((p) => <p key={p}>{p}</p>)}
            </section>
          ))}
        </div>
      </article>
    </>
  );
}

export default function Landing({ kind }) {
  const { slug } = useParams();
  const { data: site, error } = useApi('/api/site');
  const { data: vehicles, error: carsError } = useApi('/api/vehicles');
  if (error || carsError) return <ErrorState error={error || carsError} what="page" />;
  if (!site || !vehicles) return <div className="wrap vehicle-skeleton skeleton" aria-busy="true" />;

  const missing = <ErrorState error={{ message: 'not-found' }} what="page" />;
  if (LEGAL[kind]) return <Legal site={site} doc={LEGAL[kind]} />;
  if (kind === 'routes') {
    const routes = routeLinks(site).map((l) => ROUTES.find((r) => r.slug === l.slug));
    return routes.length ? (
      <Hub site={site} path="/routes" crumb="Routes" title="Where are you driving?" cards={routes.map((r) => [`/routes/${r.slug}`, r.h1, r.slogan, `${r.distance} · ${r.time}`])}>
        <section className="wrap-narrow prose route-table" aria-labelledby="routes-table-h">
          <h2 id="routes-table-h">Popular drives from Mumbai at a glance</h2>
          <table>
            <thead><tr><th scope="col">Drive</th><th scope="col">Distance and time</th><th scope="col">A car that suits it</th></tr></thead>
            <tbody>{routes.map((r) => <tr key={r.slug}><td><Link to={`/routes/${r.slug}`}>{r.place}</Link></td><td>{r.distance}. {r.time}.</td><td>{r.suits}</td></tr>)}</tbody>
          </table>
          <p className="landing-note">Approximate, and depends on traffic and where you start. Last updated {formatDate(CONTENT_UPDATED, { month: 'long', year: 'numeric' })}.</p>
        </section>
      </Hub>
    ) : missing;
  }
  if (kind === 'areas') {
    const areas = areaLinks(site).map((l) => AREAS.find((a) => a.slug === l.slug));
    return areas.length ? <Hub site={site} path="/car-rental" crumb="Areas" title="Where should we meet you?" cards={areas.map((a) => [`/car-rental/${a.slug}`, a.h1, a.slogan])} /> : missing;
  }
  if (kind === 'route') {
    const r = routeLinks(site).some((l) => l.slug === slug) && ROUTES.find((x) => x.slug === slug);
    return r ? <RoutePage key={slug} site={site} vehicles={vehicles} r={r} /> : missing;
  }
  if (kind === 'area') {
    const x = areaLinks(site).some((l) => l.slug === slug) && AREAS.find((a) => a.slug === slug);
    return x ? <AreaPage key={slug} site={site} vehicles={vehicles} x={x} /> : missing;
  }
  const t = typeLinks(site, vehicles).some((l) => l.slug === slug) && CAR_TYPES.find((c) => c.slug === slug);
  return t ? <CarTypePage key={slug} site={site} vehicles={vehicles} t={t} /> : missing;
}
