import { Link } from 'react-router';
import { Seo } from '../components.jsx';

export default function NotFound() {
  return (
    <section className="wrap empty">
      <Seo title="Page not found" />
      <p className="big-404" aria-hidden="true">404</p>
      <h1>This road doesn’t go anywhere.</h1>
      <p>The page you’re looking for has moved or never existed.</p>
      <Link className="btn btn-amber" to="/fleet">Browse the fleet</Link>
    </section>
  );
}
