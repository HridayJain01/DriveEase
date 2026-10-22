import { useEffect, useRef, useState } from 'react';
import { Icon } from '../components.jsx';
import { formatDate, telLink, today, useApi, waLink } from '../lib.js';
import { tripLabel } from '../concierge/match.js';
import { api, toast } from './api.js';

/* ---------- Enquiry dashboard ---------- */
export const STATUSES = [['new', 'New'], ['contacted', 'Contacted'], ['quoted', 'Quote sent'], ['confirmed', 'Confirmed'], ['closed', 'Closed']];
const statusLabel = Object.fromEntries(STATUSES);
const SOURCES = { form: 'Enquiry form', concierge: 'Concierge', garage: 'My Garage', compare: 'Compare', 'car-page': 'Car page' };

const ago = (iso) => {
  const mins = Math.round((Date.now() - new Date(iso)) / 60000);
  const rtf = new Intl.RelativeTimeFormat('en-IN', { numeric: 'auto' });
  if (mins < 60) return rtf.format(-mins, 'minute');
  if (mins < 1440) return rtf.format(-Math.round(mins / 60), 'hour');
  return rtf.format(-Math.round(mins / 1440), 'day');
};

export default function Enquiries() {
  const { data: site } = useApi('/api/site');
  const [filter, setFilter] = useState('new');
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ loading: true });
  const seq = useRef(0);

  useEffect(() => { const t = setTimeout(() => { setQuery(q.trim()); setPage(1); }, 300); return () => clearTimeout(t); }, [q]);

  async function load() {
    const n = ++seq.current; // ignore answers to older requests
    setState((s) => ({ ...s, loading: true, error: null }));
    const params = new URLSearchParams({ page, limit: 20, today: today() });
    if (filter !== 'all') params.set('status', filter);
    if (query) params.set('q', query);
    try {
      const data = await api('GET', `/api/admin/enquiries?${params}`);
      if (n === seq.current) setState({ data });
    } catch (error) { if (n === seq.current) setState((s) => ({ ...s, loading: false, error })); }
  }
  useEffect(() => { load(); }, [filter, query, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data, error, loading } = state;
  const counts = data?.counts;
  const pick = (f) => { setFilter(f); setPage(1); };

  function replace(saved) {
    setState((s) => ({ ...s, data: { ...s.data, items: s.data.items.map((x) => (x._id === saved._id ? saved : x)) } }));
  }
  async function update(e, patch, message) {
    try { replace(await api('PATCH', `/api/admin/enquiries/${e._id}`, patch)); toast(message); load(); }
    catch (err) { toast(err.message, 'bad'); }
  }
  async function remove(e) {
    if (!confirm(`Delete the enquiry from ${e.name}? This can’t be undone.`)) return;
    try { await api('DELETE', `/api/admin/enquiries/${e._id}`); toast('Enquiry deleted'); load(); }
    catch (err) { toast(err.message, 'bad'); }
  }

  const stats = [...STATUSES, ['due', 'Follow-ups due'], ['all', 'All']];
  const emptyText = query ? `No enquiries match “${query}”${filter !== 'all' ? ` in ${filter === 'due' ? 'follow-ups due' : statusLabel[filter]}` : ''}.`
    : filter === 'new' ? 'No new enquiries. Form submissions from the website will appear here.'
      : filter === 'due' ? 'No follow-ups due today. Set a follow-up date on an enquiry to see it here.'
        : 'Nothing here yet.';

  return (
    <>
      <header className="a-head"><h1>Enquiries</h1><p>Enquiries customers sent through the website. WhatsApp chats stay in WhatsApp and don’t appear here.</p></header>

      <div className="a-stats" role="group" aria-label="Filter by status">
        {stats.map(([s, label]) => (
          <button key={s} type="button" className={`a-stat is-${s}`} aria-pressed={filter === s} onClick={() => pick(s)}>
            <b>{counts ? counts[s] : '–'}</b><span>{label}</span>
          </button>
        ))}
      </div>

      <div className="a-toolbar">
        <label className="a-search">
          <span className="sr-only">Search enquiries</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, email, car or place" maxLength={80} />
        </label>
        <span className="a-hint" aria-live="polite">{data && !loading ? `${data.total} ${data.total === 1 ? 'enquiry' : 'enquiries'}` : loading ? 'Loading…' : ''}</span>
      </div>

      {error && <p className="a-empty" role="alert">{error.message} <button type="button" className="a-link" onClick={load}>Try again</button></p>}
      {!data && !error && <div className="a-skel" />}
      {data?.items.length === 0 && <p className="a-empty">{emptyText}</p>}

      <div className={`a-enquiries${loading && data ? ' is-loading' : ''}`} aria-busy={loading}>
        {data?.items.map((e) => <EnquiryCard key={e._id} e={e} site={site} onUpdate={update} onRemove={remove} onNote={replace} />)}
      </div>

      {data && data.pages > 1 && (
        <nav className="a-pager" aria-label="Pages">
          <button type="button" className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Newer</button>
          <span>Page {data.page} of {data.pages}</span>
          <button type="button" className="btn btn-ghost btn-sm" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Older →</button>
        </nav>
      )}
    </>
  );
}

function EnquiryCard({ e, site, onUpdate, onRemove, onNote }) {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const due = e.followUpDate && e.followUpDate <= today() && !['confirmed', 'closed'].includes(e.status);
  const waNumber = (phone) => { const d = phone.replace(/\D/g, ''); return d.length === 10 ? `91${d}` : d; };
  const people = [e.passengers && `${e.passengers} ${e.passengers === 1 ? 'traveller' : 'travellers'}`, e.luggage !== undefined && e.luggage !== null && `${e.luggage} ${e.luggage === 1 ? 'bag' : 'bags'}`].filter(Boolean).join(' · ');

  async function addNote(ev) {
    ev.preventDefault();
    setSaving(true);
    try { onNote(await api('POST', `/api/admin/enquiries/${e._id}/notes`, { text: note })); setNote(''); toast('Note added'); }
    catch (err) { toast(err.message, 'bad'); }
    finally { setSaving(false); }
  }

  return (
    <article className={`a-enquiry is-${e.status}${due ? ' is-due' : ''}`}>
      <header>
        <div>
          <h2>{e.name}</h2>
          <time dateTime={e.createdAt} title={new Date(e.createdAt).toLocaleString('en-IN')}>{ago(e.createdAt)} · {formatDate(e.createdAt)}</time>
          {e.source && e.source !== 'form' && <span className="a-pill">{SOURCES[e.source] || e.source}</span>}
        </div>
        <label>
          <span className="sr-only">Status of {e.name}’s enquiry</span>
          <select value={e.status} onChange={(ev) => onUpdate(e, { status: ev.target.value }, `Marked as ${statusLabel[ev.target.value]}`)}>
            {STATUSES.map(([s, label]) => <option key={s} value={s}>{label}</option>)}
          </select>
        </label>
      </header>
      <dl>
        <div><dt>Phone</dt><dd><a href={telLink(e.phone)}>{e.phone}</a></dd></div>
        {e.email && <div><dt>Email</dt><dd><a href={`mailto:${e.email}`}>{e.email}</a></dd></div>}
        {e.vehicle && <div><dt>Car</dt><dd>{e.vehicle}</dd></div>}
        {e.tripType && <div><dt>Trip</dt><dd>{tripLabel(e.tripType)}</dd></div>}
        {(e.pickupDate || e.returnDate) && <div><dt>Dates</dt><dd>{[e.pickupDate, e.returnDate].filter(Boolean).map((d) => formatDate(d)).join(' → ')}</dd></div>}
        {(e.pickupLocation || e.destination) && <div><dt>Route</dt><dd>{[e.pickupLocation, e.destination].filter(Boolean).join(' → ')}</dd></div>}
        {people && <div><dt>Group</dt><dd>{people}</dd></div>}
      </dl>
      {e.message && <p className="a-message">{e.message}</p>}

      <div className="a-follow">
        <label className={`a-field a-follow-date${due ? ' is-due' : ''}`}>
          <span className="a-label">Follow up on{due && <em> · due</em>}</span>
          <input type="date" value={e.followUpDate || ''} onChange={(ev) => onUpdate(e, { followUpDate: ev.target.value }, ev.target.value ? `Follow-up set for ${formatDate(ev.target.value)}` : 'Follow-up cleared')} />
        </label>
        <details className="a-notes" open={e.notes?.length > 0 && e.notes.length < 3}>
          <summary>Internal notes ({e.notes?.length || 0})</summary>
          {e.notes?.length > 0 && (
            <ol>
              {e.notes.map((n) => <li key={n._id}><p>{n.text}</p><small>{n.by} · {new Date(n.at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</small></li>)}
            </ol>
          )}
          <form onSubmit={addNote} className="a-note-form">
            <label className="a-field"><span className="sr-only">New note for {e.name}</span>
              <textarea rows={2} value={note} onChange={(ev) => setNote(ev.target.value)} maxLength={1000} placeholder="e.g. Sent Creta rate, customer will confirm by Friday" required />
            </label>
            <button className="btn btn-dark btn-sm" disabled={saving || !note.trim()}>{saving ? 'Saving…' : 'Add note'}</button>
          </form>
        </details>
      </div>

      <footer>
        <a className="btn btn-wa btn-sm" target="_blank" rel="noreferrer" href={waLink(waNumber(e.phone), `Hi ${e.name.split(' ')[0]}, this is ${site?.businessName || 'Drive Ease'} replying to your enquiry${e.vehicle ? ` about the ${e.vehicle}` : ''}.`)}>
          <Icon name="whatsapp" size={16} />Reply on WhatsApp
        </a>
        <a className="btn btn-ghost btn-sm" href={telLink(e.phone)}><Icon name="phone" size={16} />Call</a>
        <button type="button" className="a-link danger" onClick={() => onRemove(e)}>Delete</button>
      </footer>
    </article>
  );
}
