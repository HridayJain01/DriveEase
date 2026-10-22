import { Link } from 'react-router';
import { ErrorState, PageHead, Photo, Seo } from '../components.jsx';
import { formatDate, useApi } from '../lib.js';
import { PAGES } from '../seo.js';

export default function Blog() {
  const { data: posts, error } = useApi('/api/posts');
  if (error) return <ErrorState error={error} what="blog" />;
  const [lead, ...rest] = posts || [];

  return (
    <>
      <Seo {...PAGES['/blog']} />
      <PageHead eyebrow="Blog" title="Notes from the road." />
      <section className="wrap">
        {!posts && <div className="post-lead skeleton" aria-busy="true" />}
        {posts?.length === 0 && <p className="muted">No articles yet — check back soon.</p>}
        {lead && (
          <article className="post-lead">
            <Photo src={lead.cover} alt="" sizes="(max-width: 900px) 100vw, 60vw" eager />
            <div>
              <time dateTime={lead.publishedAt}>{formatDate(lead.publishedAt)}</time>
              <h2><Link to={`/blog/${lead.slug}`} className="stretch">{lead.title}</Link></h2>
              <p>{lead.excerpt}</p>
              <span className="link-arrow" aria-hidden="true">Read article</span>
            </div>
          </article>
        )}
        {rest.length > 0 && (
          <div className="post-grid">
            {rest.map((p) => (
              <article key={p.slug} className="post-card">
                <Photo src={p.cover} alt="" sizes="(max-width: 700px) 100vw, 400px" />
                <time dateTime={p.publishedAt}>{formatDate(p.publishedAt)}</time>
                <h3><Link to={`/blog/${p.slug}`} className="stretch">{p.title}</Link></h3>
                <p>{p.excerpt}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
