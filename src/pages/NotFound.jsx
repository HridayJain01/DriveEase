import { Link } from 'react-router';
import { Seo } from '../components.jsx';

export default function NotFound() {
  return (
    <section className="wrap empty">
      <Seo title="Page not found" />
      <div className="stone stone-lg" aria-hidden="true"><small>km</small>404</div>
      <h1>This road doesn’t go anywhere.</h1>
      <p>The page you’re looking for has moved or never existed.</p>
      <Link className="btn btn-dark" to="/fleet">Browse the fleet</Link>
    </section>
  );
}
