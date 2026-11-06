import { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { marked } from 'marked';
import { CtaBand, ErrorState, Icon, Photo, Seo } from '../components.jsx';
import { formatDate, useApi } from '../lib.js';
import { postMeta } from '../seo.js';

export default function Post() {
  const { slug } = useParams();
  const { data: site } = useApi('/api/site');
  const { data: p, error } = useApi(`/api/posts/${slug}`);
  const { data: posts } = useApi('/api/posts');
  // Post bodies are written by signed-in admins only, so rendering their Markdown as HTML is trusted.
  const html = useMemo(() => (p ? marked.parse(p.body) : ''), [p]);
  if (error) return <ErrorState error={error} what="article" />;
  if (!p) return <div className="wrap article skeleton" aria-busy="true" style={{ height: '60vh' }} />;

  const minutes = Math.max(1, Math.round(p.body.split(/\s+/).length / 200));
  const more = (posts || []).filter((x) => x.slug !== p.slug).slice(0, 3);
  return (
    <>
      <Seo {...postMeta(p, site)} />
      <article className="article">
        <header className="wrap-narrow article-head">
          <nav className="crumbs" aria-label="Breadcrumb"><Link to="/blog">Blog</Link></nav>
          <h1>{p.title}</h1>
          <p className="article-meta"><time dateTime={p.publishedAt}>{formatDate(p.publishedAt)}</time> · {minutes} min read · By the {site?.businessName || 'Drive Ease'} team</p>
        </header>
        {p.cover && <div className="wrap article-cover"><Photo src={p.cover} alt="" sizes="(max-width: 1200px) 100vw, 1200px" eager /></div>}
        <div className="wrap-narrow prose" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
      {more.length > 0 && (
        <nav className="wrap-narrow read-next" aria-label="More articles">
          <h2 className="h-small">Read next</h2>
          <ul>{more.map((x) => <li key={x.slug}><Link className="link-arrow wraps" to={`/blog/${x.slug}`}>{x.title}<Icon name="arrow" size={16} /></Link></li>)}</ul>
        </nav>
      )}
      {site && <CtaBand site={site} />}
    </>
  );
}
