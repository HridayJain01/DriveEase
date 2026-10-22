import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { CardSkeletons, ErrorState, Icon, PageHead, Seo, VehicleCard } from '../components.jsx';
import { announce, EnquireButton } from '../features.jsx';
import { bySlug } from '../fleet.js';
import { useApi } from '../lib.js';
import { PAGES } from '../seo.js';
import { cleanSlugs, compare, garage, MAX_COMPARE, useStore } from '../stores.js';

// My Garage: cars this visitor saved on this device. A shared link (/garage?cars=a,b) shows
// someone else's shortlist. It holds public car slugs only, never anything about the visitor.
export default function Garage() {
  const { data: site } = useApi('/api/site');
  const { data: vehicles, error } = useApi('/api/vehicles');
  const mine = useStore(garage);
  const [params] = useSearchParams();
  const shared = params.has('cars') ? cleanSlugs(params.get('cars')) : null;
  const slugs = shared || mine;
  const navigate = useNavigate();

  if (error) return <ErrorState error={error} what="garage" />;
  const { found: cars, missing } = vehicles ? bySlug(vehicles, slugs) : { found: [], missing: [] };

  function compareThese() {
    compare.replace(cars.slice(0, MAX_COMPARE).map((v) => v.slug));
    navigate('/compare');
  }
  function saveShared() {
    let added = 0;
    for (const v of cars) if (!garage.add(v.slug).error) added += 1;
    announce(added ? `Added ${added} ${added === 1 ? 'car' : 'cars'} to My Garage.` : 'They’re already in My Garage.');
    navigate('/garage', { replace: true });
  }

  return (
    <>
      <Seo {...PAGES['/garage']} />
      <PageHead eyebrow={shared ? 'Shared shortlist' : 'My Garage'} title={shared ? 'A shortlist, shared with you.' : 'Cars you’ve saved.'}>
        <p>{shared
          ? 'Someone picked these cars from the Drive Ease fleet. Save them to your own garage, compare them or ask us about them.'
          : 'Saved on this device only, no account needed. Compare them, share the list or ask us about them on WhatsApp.'}</p>
      </PageHead>
      <section className="wrap garage">
        {vehicles && missing.length > 0 && (
          <p className="notice" role="status">
            {missing.length === 1 ? `One ${shared ? 'car in this shortlist' : 'saved car'} is` : `${missing.length} ${shared ? 'cars in this shortlist' : 'saved cars'} are`} no longer listed on our website.{' '}
            {!shared && <button type="button" className="link-btn" onClick={() => missing.forEach(garage.remove)}>Remove {missing.length === 1 ? 'it' : 'them'}</button>}
          </p>
        )}

        {vehicles && cars.length > 0 && (
          <div className="garage-bar">
            <p className="garage-count"><b>{cars.length}</b> {cars.length === 1 ? 'car' : 'cars'}</p>
            <div className="garage-actions">
              {shared && <button type="button" className="btn btn-amber btn-sm" onClick={saveShared}><Icon name="heart" size={16} />Save to My Garage</button>}
              {cars.length > 1 && <button type="button" className="btn btn-glass btn-sm" onClick={compareThese}><Icon name="compare" size={16} />Compare{cars.length > MAX_COMPARE ? ` first ${MAX_COMPARE}` : ''}</button>}
              {site && <EnquireButton className={`btn btn-sm ${shared ? 'btn-glass' : 'btn-amber'}`} cars={cars} context="shortlist" source="garage">{cars.length > 1 ? 'Ask about all' : 'Enquire'}</EnquireButton>}
              {!shared && <Share cars={cars} />}
            </div>
          </div>
        )}

        <div className="car-grid">
          {!vehicles ? <CardSkeletons n={3} /> : cars.map((v) => <VehicleCard key={v.slug} v={v} site={site} />)}
        </div>

        {vehicles && cars.length === 0 && (
          <div className="empty-card">
            <span className="empty-icon"><Icon name="heart" size={28} /></span>
            <h2>{shared ? 'These cars aren’t listed any more' : 'Your garage is empty'}</h2>
            <p>Tap the <Icon name="heart" size={15} /> on any car to keep it here while you decide. Not sure where to start? The Concierge will suggest cars for your trip.</p>
            <div className="hero-actions">
              <Link className="btn btn-amber" to="/concierge"><Icon name="spark" size={18} />Ask the Concierge</Link>
              <Link className="btn btn-glass" to="/fleet">Explore the fleet<Icon name="arrow" size={18} /></Link>
            </div>
          </div>
        )}

        {!shared && cars.length > 0 && (
          <p className="garage-foot"><button type="button" className="link-btn" onClick={() => confirm('Remove every car from My Garage?') && garage.clear()}>Clear My Garage</button></p>
        )}
      </section>
    </>
  );
}

// The shared link carries only car slugs. Shared via the phone's share sheet, WhatsApp or copied.
function Share({ cars }) {
  const [copied, setCopied] = useState(false);
  const url = `${location.origin}/garage?cars=${cars.map((v) => v.slug).join(',')}`;
  const text = `My Drive Ease shortlist:\n${cars.map((v, i) => `${i + 1}. ${v.name}${v.rate ? ` (${v.rate})` : ''}`).join('\n')}\n\n${url}`;

  async function share() {
    if (navigator.share) {
      try { await navigator.share({ title: 'My Drive Ease shortlist', text, url }); return; }
      catch (e) { if (e.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(text); setCopied(true); announce('Shortlist copied. Paste it anywhere to share.'); }
    catch { announce('Couldn’t copy automatically. Use the WhatsApp option instead.'); }
  }

  return (
    <>
      <button type="button" className="btn btn-glass btn-sm" onClick={share}><Icon name={copied ? 'check' : 'share'} size={16} />{copied ? 'Copied' : 'Share'}</button>
      {/* No number: WhatsApp asks who to send it to (a friend or family member, not the business). */}
      <a className="btn btn-glass btn-sm" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer"><Icon name="whatsapp" size={16} />Send to a friend</a>
    </>
  );
}
