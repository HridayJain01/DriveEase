import { ErrorState, PageHead, Photo, Seo } from '../components.jsx';
import { useApi } from '../lib.js';
import { pageMeta } from '../seo.js';
import { CtaBand } from './Home.jsx';

export default function About() {
  const { data: site, error } = useApi('/api/site');
  if (error) return <ErrorState error={error} />;
  const a = site?.about;

  return (
    <>
      <Seo {...pageMeta('/about', site)} />
      <PageHead h1={pageMeta('/about', site).h1} title="Renting a car should feel like borrowing one from a friend." />
      {a && (
        <>
          <section className="wrap about-grid">
            <div className="prose">{a.story.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}</div>
            <figure className="founder">
              {a.founderPhoto
                ? <Photo src={a.founderPhoto} alt={a.founderName} className="founder-photo" sizes="320px" />
                : <div className="founder-initials" aria-hidden="true">{a.founderName.split(' ').map((w) => w[0]).join('').slice(0, 2)}</div>}
              <blockquote>“{a.founderQuote}”</blockquote>
              <figcaption><strong>{a.founderName}</strong><span>{a.founderRole}</span></figcaption>
            </figure>
          </section>
          {a.promises?.length > 0 && (
            <section className="section wrap" aria-labelledby="promise-h">
              <p className="eyebrow">What you can expect</p>
              <h2 id="promise-h">Our side of the deal</h2>
              <ul className="promises">
                {a.promises.map((p) => <li key={p.title}><h3>{p.title}</h3><p>{p.text}</p></li>)}
              </ul>
            </section>
          )}
          <CtaBand site={site} />
        </>
      )}
    </>
  );
}
