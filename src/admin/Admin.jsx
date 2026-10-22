import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Route, Routes, useBlocker, useNavigate, useParams } from 'react-router';
import { Icon } from '../components.jsx';
import { clearCache, img, telLink, useApi, waLink } from '../lib.js';
import { collections, settingsFields } from './config.js';
import { Fields } from './Fields.jsx';
import './admin.css';

/* ---------- Helpers ---------- */
async function api(method, url, body) {
  const res = await fetch(url, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body && JSON.stringify(body) });
  const data = res.status === 204 ? null : await res.json().catch(() => ({}));
  if (res.status === 401 && !url.endsWith('/login')) dispatchEvent(new Event('admin:signedout'));
  if (!res.ok) throw Object.assign(new Error(data?.error || 'Couldn’t save. Check your connection and try again.'), { errors: data?.errors });
  return data;
}

const toast = (text, tone = 'ok') => dispatchEvent(new CustomEvent('admin:toast', { detail: { text, tone } }));

function Toasts() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const on = (e) => {
      const t = { ...e.detail, id: Math.random() };
      setItems((x) => [...x, t]);
      setTimeout(() => setItems((x) => x.filter((i) => i !== t)), 2800);
    };
    addEventListener('admin:toast', on);
    return () => removeEventListener('admin:toast', on);
  }, []);
  return <div className="a-toasts" role="status" aria-live="polite">{items.map((t) => <div key={t.id} className={`a-toast ${t.tone}`}>{t.text}</div>)}</div>;
}

function useLoad(url) {
  const [state, setState] = useState({});
  const reload = () => api('GET', url).then((data) => setState({ data }), (error) => setState({ error }));
  useEffect(() => { if (url) reload(); }, [url]); // eslint-disable-line react-hooks/exhaustive-deps
  return [state, (data) => setState({ data }), reload];
}

// Warns before leaving a form with unsaved edits (in-app links and closing the tab).
function useUnsavedGuard(dirtyRef) {
  const blocker = useBlocker(() => dirtyRef.current);
  useEffect(() => {
    if (blocker.state === 'blocked') confirm('You have unsaved changes. Leave without saving?') ? blocker.proceed() : blocker.reset();
  }, [blocker]);
  useEffect(() => {
    const on = (e) => { if (dirtyRef.current) e.preventDefault(); };
    addEventListener('beforeunload', on);
    return () => removeEventListener('beforeunload', on);
  }, [dirtyRef]);
}

const ago = (iso) => {
  const mins = Math.round((Date.now() - new Date(iso)) / 60000);
  const rtf = new Intl.RelativeTimeFormat('en-IN', { numeric: 'auto' });
  if (mins < 60) return rtf.format(-mins, 'minute');
  if (mins < 1440) return rtf.format(-Math.round(mins / 60), 'hour');
  return rtf.format(-Math.round(mins / 1440), 'day');
};

/* ---------- Shell ---------- */
export default function AdminApp() {
  const [me, setMe] = useState(); // undefined = checking, null = signed out
  useEffect(() => {
    document.title = 'Admin — Drive Ease';
    const robots = Object.assign(document.createElement('meta'), { name: 'robots', content: 'noindex' });
    document.head.append(robots);
    api('GET', '/api/auth/me').then(setMe, () => setMe(null));
    const out = () => setMe(null);
    addEventListener('admin:signedout', out);
    return () => { robots.remove(); removeEventListener('admin:signedout', out); };
  }, []);

  if (me === undefined) return <div className="a-boot" aria-busy="true" />;
  if (!me) return <Login onSignedIn={setMe} />;

  async function signOut() { await api('POST', '/api/auth/logout').catch(() => {}); setMe(null); }

  return (
    <div className="a-shell">
      <aside className="a-side">
        <Link to="/admin" className="a-brand">
          <svg viewBox="0 0 32 40" width="22" height="28" aria-hidden="true"><path d="M3 17a13 13 0 0 1 26 0v20H3z" fill="#fff" stroke="#1a1e21" strokeWidth="2.5" /><path d="M3 17a13 13 0 0 1 26 0z" fill="var(--cap)" stroke="#1a1e21" strokeWidth="2.5" /></svg>
          <span>Drive Ease<small>Admin</small></span>
        </Link>
        <nav className="a-nav" aria-label="Admin">
          <NavLink to="/admin" end>Enquiries</NavLink>
          <NavLink to="/admin/vehicles">Cars</NavLink>
          <NavLink to="/admin/posts">Blog</NavLink>
          <NavLink to="/admin/reviews">Reviews</NavLink>
          <NavLink to="/admin/settings">Site details</NavLink>
        </nav>
        <div className="a-side-foot">
          <a href="/" target="_blank" rel="noreferrer">View website ↗</a>
          <NavLink to="/admin/account">Account</NavLink>
          <button type="button" onClick={signOut}>Sign out</button>
          <small>{me.email}</small>
        </div>
      </aside>
      <main className="a-main">
        <Routes>
          <Route index element={<Enquiries />} />
          {Object.keys(collections).map((type) => [
            <Route key={type} path={type} element={<CollectionList type={type} />} />,
            <Route key={`${type}-edit`} path={`${type}/:id`} element={<CollectionEdit type={type} />} />,
          ])}
          <Route path="settings" element={<SettingsPage />} />
          <Route path="account" element={<Account />} />
          <Route path="*" element={<p className="a-empty">This admin page doesn’t exist. <Link to="/admin">Go to enquiries</Link></p>} />
        </Routes>
      </main>
      <Toasts />
    </div>
  );
}

function Login({ onSignedIn }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    const form = new FormData(e.target);
    try { onSignedIn(await api('POST', '/api/auth/login', { email: form.get('email'), password: form.get('password') })); }
    catch (err) { setError(err.message); setBusy(false); }
  }
  return (
    <div className="a-login">
      <form className="milestone" onSubmit={submit}>
        <div className="milestone-cap"><span className="km">Drive Ease</span><h1>Admin sign in</h1></div>
        <div className="milestone-body">
          <label className="field"><span>Email</span><input name="email" type="email" autoComplete="username" required autoFocus /></label>
          <label className="field"><span>Password</span><input name="password" type="password" autoComplete="current-password" required /></label>
          {error && <p className="form-alert" role="alert">{error}</p>}
          <button className="btn btn-dark btn-block" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
          <Link className="composer-alt" to="/">Back to the website</Link>
        </div>
      </form>
    </div>
  );
}

/* ---------- Enquiries ---------- */
const STATUSES = [['new', 'New'], ['contacted', 'Contacted'], ['closed', 'Closed']];

function Enquiries() {
  const [{ data, error }, setData] = useLoad('/api/admin/enquiries');
  const { data: site } = useApi('/api/site');
  const [tab, setTab] = useState('new');
  const count = (s) => data?.filter((e) => e.status === s).length ?? '';
  const shown = data?.filter((e) => tab === 'all' || e.status === tab);

  async function setStatus(e, status) {
    const saved = await api('PATCH', `/api/admin/enquiries/${e._id}`, { status }).catch((err) => toast(err.message, 'bad'));
    if (saved) { setData(data.map((x) => (x._id === e._id ? saved : x))); toast(`Marked as ${status}`); }
  }
  async function remove(e) {
    if (!confirm(`Delete the enquiry from ${e.name}? This can’t be undone.`)) return;
    await api('DELETE', `/api/admin/enquiries/${e._id}`).then(() => { setData(data.filter((x) => x._id !== e._id)); toast('Enquiry deleted'); }, (err) => toast(err.message, 'bad'));
  }
  const waNumber = (phone) => { const d = phone.replace(/\D/g, ''); return d.length === 10 ? `91${d}` : d; };

  return (
    <>
      <header className="a-head"><h1>Enquiries</h1><p>Messages sent through the website form. WhatsApp chats stay in WhatsApp.</p></header>
      <div className="a-tabs" role="tablist">
        {[...STATUSES, ['all', 'All']].map(([s, label]) => (
          <button key={s} role="tab" aria-selected={tab === s} onClick={() => setTab(s)}>{label}<small>{s === 'all' ? data?.length ?? '' : count(s)}</small></button>
        ))}
      </div>
      {error && <p className="a-empty">{error.message}</p>}
      {!data && !error && <div className="a-skel" />}
      {shown?.length === 0 && <p className="a-empty">{tab === 'new' ? 'No new enquiries. Form submissions from the website will appear here.' : 'Nothing here yet.'}</p>}
      <div className="a-enquiries">
        {shown?.map((e) => (
          <article key={e._id} className={`a-enquiry is-${e.status}`}>
            <header>
              <div><h2>{e.name}</h2><time dateTime={e.createdAt} title={new Date(e.createdAt).toLocaleString('en-IN')}>{ago(e.createdAt)}</time></div>
              <select value={e.status} onChange={(ev) => setStatus(e, ev.target.value)} aria-label={`Status of ${e.name}’s enquiry`}>
                {STATUSES.map(([s, label]) => <option key={s} value={s}>{label}</option>)}
              </select>
            </header>
            <dl>
              <div><dt>Phone</dt><dd><a href={telLink(e.phone)}>{e.phone}</a></dd></div>
              {e.email && <div><dt>Email</dt><dd><a href={`mailto:${e.email}`}>{e.email}</a></dd></div>}
              {e.vehicle && <div><dt>Car</dt><dd>{e.vehicle}</dd></div>}
              {(e.pickupDate || e.returnDate) && <div><dt>Dates</dt><dd>{[e.pickupDate, e.returnDate].filter(Boolean).join(' → ')}</dd></div>}
              {(e.pickupLocation || e.destination) && <div><dt>Route</dt><dd>{[e.pickupLocation, e.destination].filter(Boolean).join(' → ')}</dd></div>}
            </dl>
            {e.message && <p className="a-message">{e.message}</p>}
            <footer>
              <a className="btn btn-wa btn-sm" target="_blank" rel="noreferrer" href={waLink(waNumber(e.phone), `Hi ${e.name.split(' ')[0]}, this is ${site?.businessName || 'Drive Ease'} replying to your enquiry${e.vehicle ? ` about the ${e.vehicle}` : ''}.`)}>
                <Icon name="whatsapp" size={16} />Reply on WhatsApp
              </a>
              <a className="btn btn-ghost btn-sm" href={telLink(e.phone)}><Icon name="phone" size={16} />Call</a>
              <button type="button" className="a-link danger" onClick={() => remove(e)}>Delete</button>
            </footer>
          </article>
        ))}
      </div>
    </>
  );
}

/* ---------- Cars / Blog / Reviews ---------- */
function CollectionList({ type }) {
  const c = collections[type];
  const [{ data, error }, setData] = useLoad(c.api);

  async function togglePublish(d) {
    const saved = await api('PUT', `${c.api}/${d._id}`, { published: !d.published }).catch((err) => toast(err.message, 'bad'));
    if (saved) { setData(data.map((x) => (x._id === d._id ? saved : x))); clearCache(); toast(saved.published ? 'Published' : 'Unpublished'); }
  }
  async function remove(d) {
    if (!confirm(`Delete “${c.title(d)}”? This can’t be undone.`)) return;
    await api('DELETE', `${c.api}/${d._id}`).then(() => { setData(data.filter((x) => x._id !== d._id)); clearCache(); toast('Deleted'); }, (err) => toast(err.message, 'bad'));
  }

  return (
    <>
      <header className="a-head a-head-row">
        <div><h1>{c.label}</h1><p>{data ? `${data.filter((d) => d.published).length} published · ${data.filter((d) => !d.published).length} hidden` : ' '}</p></div>
        <Link className="btn btn-dark" to="new">+ Add {c.singular}</Link>
      </header>
      {error && <p className="a-empty">{error.message}</p>}
      {!data && !error && <div className="a-skel" />}
      {data?.length === 0 && <p className="a-empty">No {c.label.toLowerCase()} yet. <Link to="new">Add the first {c.singular}</Link>.</p>}
      <ul className="a-items">
        {data?.map((d) => (
          <li key={d._id} className={d.published ? '' : 'is-draft'}>
            {c.thumb && <span className="a-item-thumb">{c.thumb(d) ? <img src={img(c.thumb(d), 160)} alt="" loading="lazy" /> : <Icon name="car" />}</span>}
            <span className="a-item-text">
              <Link to={d._id} className="stretch"><strong>{c.title(d)}</strong></Link>
              <small>{c.sub(d)}{d.featured && ' · Featured'}</small>
            </span>
            <span className={`a-pill ${d.published ? 'on' : ''}`}>{d.published ? 'Published' : 'Hidden'}</span>
            <span className="a-item-actions">
              <button type="button" className="a-link" onClick={() => togglePublish(d)}>{d.published ? 'Unpublish' : 'Publish'}</button>
              {c.view && d.published && <a className="a-link" href={c.view(d)} target="_blank" rel="noreferrer">View ↗</a>}
              <button type="button" className="a-link danger" onClick={() => remove(d)}>Delete</button>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

function CollectionEdit({ type }) {
  const c = collections[type];
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const [{ data: loaded, error: loadError }] = useLoad(isNew ? null : `${c.api}/${id}`);
  const [doc, setDoc] = useState(isNew ? structuredClone(c.blank) : null);
  const [base, setBase] = useState(isNew ? JSON.stringify(c.blank) : null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const dirtyRef = useRef(false);
  dirtyRef.current = doc !== null && JSON.stringify(doc) !== base;
  useUnsavedGuard(dirtyRef);

  useEffect(() => { if (loaded) { setDoc(loaded); setBase(JSON.stringify(loaded)); } }, [loaded]);
  if (loadError) return <p className="a-empty">{loadError.message} <Link to={`/admin/${type}`}>Back to {c.label.toLowerCase()}</Link></p>;
  if (!doc) return <div className="a-skel" />;

  async function save(e) {
    e.preventDefault();
    setSaving(true); setErrors({});
    try {
      const saved = isNew ? await api('POST', c.api, doc) : await api('PUT', `${c.api}/${id}`, doc);
      setDoc(saved); setBase(JSON.stringify(saved)); dirtyRef.current = false;
      clearCache();
      toast(isNew ? `${c.singular[0].toUpperCase()}${c.singular.slice(1)} created` : 'Changes saved');
      if (isNew) navigate(`/admin/${type}/${saved._id}`, { replace: true });
    } catch (err) {
      setErrors(err.errors || {});
      toast(err.errors ? 'Fix the highlighted fields' : err.message, 'bad');
    } finally { setSaving(false); }
  }

  async function remove() {
    if (!confirm(`Delete “${c.title(doc)}”? This can’t be undone.`)) return;
    await api('DELETE', `${c.api}/${id}`);
    dirtyRef.current = false; clearCache(); toast('Deleted');
    navigate(`/admin/${type}`);
  }

  return (
    <form onSubmit={save}>
      <header className="a-head">
        <Link className="a-back" to={`/admin/${type}`}>← {c.label}</Link>
        <h1>{isNew ? `New ${c.singular}` : c.title(doc)}</h1>
      </header>
      {Object.keys(errors).length > 0 && (
        <div className="form-alert a-errors" role="alert">
          <strong>Couldn’t save. Fix these first:</strong>
          <ul>{Object.values(errors).map((m) => <li key={m}>{m}</li>)}</ul>
        </div>
      )}
      <div className="a-edit">
        <div className="a-card"><Fields fields={c.main} value={doc} onChange={setDoc} errors={errors} /></div>
        <aside className="a-card a-edit-side">
          <Fields fields={c.side} value={doc} onChange={setDoc} errors={errors} />
          {!isNew && c.view && doc.published && <a className="a-link" href={c.view(doc)} target="_blank" rel="noreferrer">View on website ↗</a>}
          {!isNew && <button type="button" className="a-link danger" onClick={remove}>Delete this {c.singular}</button>}
        </aside>
      </div>
      <SaveBar dirty={dirtyRef.current} saving={saving} label={isNew ? `Create ${c.singular}` : 'Save changes'} />
    </form>
  );
}

function SaveBar({ dirty, saving, label = 'Save changes' }) {
  return (
    <div className="a-savebar">
      <span>{saving ? 'Saving…' : dirty ? 'Unsaved changes' : 'All changes saved'}</span>
      <button className="btn btn-dark" disabled={saving || !dirty}>{label}</button>
    </div>
  );
}

/* ---------- Site details ---------- */
function SettingsPage() {
  const [{ data, error }] = useLoad('/api/admin/settings');
  const [doc, setDoc] = useState(null);
  const [base, setBase] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const dirtyRef = useRef(false);
  dirtyRef.current = doc !== null && JSON.stringify(doc) !== base;
  useUnsavedGuard(dirtyRef);
  useEffect(() => { if (data) { setDoc(data); setBase(JSON.stringify(data)); } }, [data]);

  if (error) return <p className="a-empty">{error.message}</p>;
  if (!doc) return <div className="a-skel" />;

  async function save(e) {
    e.preventDefault();
    setSaving(true); setErrors({});
    try {
      const saved = await api('PUT', '/api/admin/settings', doc);
      setDoc(saved); setBase(JSON.stringify(saved)); clearCache(); toast('Site details saved');
    } catch (err) { setErrors(err.errors || {}); toast(err.errors ? 'Fix the highlighted fields' : err.message, 'bad'); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={save} className="a-settings">
      <header className="a-head"><h1>Site details</h1><p>Contact details, WhatsApp, About page, services and FAQs. Changes go live as soon as you save.</p></header>
      {Object.keys(errors).length > 0 && (
        <div className="form-alert a-errors" role="alert"><strong>Couldn’t save. Fix these first:</strong><ul>{Object.values(errors).map((m) => <li key={m}>{m}</li>)}</ul></div>
      )}
      <Fields fields={settingsFields} value={doc} onChange={setDoc} errors={errors} />
      <SaveBar dirty={dirtyRef.current} saving={saving} />
    </form>
  );
}

/* ---------- Account ---------- */
function Account() {
  const [errors, setErrors] = useState({});
  async function submit(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    if (f.get('next') !== f.get('confirm')) return setErrors({ confirm: 'The new passwords don’t match.' });
    try {
      await api('POST', '/api/auth/password', { current: f.get('current'), next: f.get('next') });
      e.target.reset(); setErrors({}); toast('Password changed');
    } catch (err) { setErrors(err.errors || { form: err.message }); }
  }
  const field = (name, label, auto) => (
    <label className={`a-field${errors[name] ? ' has-error' : ''}`}>
      <span className="a-label">{label}</span>
      <input name={name} type="password" autoComplete={auto} required minLength={name === 'current' ? undefined : 10} />
      {errors[name] && <small className="a-error">{errors[name]}</small>}
    </label>
  );
  return (
    <>
      <header className="a-head"><h1>Account</h1><p>Change the password you use to sign in.</p></header>
      <form className="a-card a-narrow" onSubmit={submit}>
        {field('current', 'Current password', 'current-password')}
        {field('next', 'New password (10+ characters)', 'new-password')}
        {field('confirm', 'Repeat new password', 'new-password')}
        {errors.form && <p className="form-alert">{errors.form}</p>}
        <button className="btn btn-dark">Change password</button>
      </form>
    </>
  );
}
