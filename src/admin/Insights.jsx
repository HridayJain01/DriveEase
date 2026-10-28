import { useEffect, useState } from 'react';
import { api } from './api.js';

const RANGES = [[7, 'Last 7 days'], [30, 'Last 30 days'], [90, 'Last 90 days']];
const SOURCES = { 'car-page': 'Car cards & pages', concierge: 'Concierge', compare: 'Compare', garage: 'My Garage', general: 'General buttons', form: 'Forms' };

/* ---------- Insights: which cars people ask about ---------- */
export default function Insights() {
  const [days, setDays] = useState(30);
  const [state, setState] = useState({});
  useEffect(() => {
    let live = true;
    setState((s) => ({ data: s.data, loading: true }));
    api('GET', `/api/admin/insights?days=${days}`).then((data) => live && setState({ data }), (error) => live && setState({ error }));
    return () => { live = false; };
  }, [days]);

  const { data, error, loading } = state;
  const top = data ? Math.max(1, ...data.cars.map((c) => c.whatsapp + c.share + c.forms)) : 1;
  const sources = data ? Object.entries(data.sources).sort((a, b) => b[1] - a[1]) : [];

  return (
    <>
      <header className="a-head a-head-row">
        <div>
          <h1>Insights</h1>
          <p>Which cars visitors ask about. Counts are anonymous: no names, numbers or devices are recorded.</p>
        </div>
        <div className="a-tabs" role="group" aria-label="Period">
          {RANGES.map(([d, label]) => <button key={d} type="button" aria-pressed={days === d} onClick={() => setDays(d)}>{label}</button>)}
        </div>
      </header>

      {error && <p className="a-empty" role="alert">{error.message}</p>}
      {!data && !error && <div className="a-skel" />}
      {data && (
        <div className={loading ? 'is-loading' : ''}>
          <div className="a-stats a-stats-3">
            <div className="a-stat is-new"><b>{data.totals.whatsapp}</b><span>WhatsApp chats opened</span></div>
            <div className="a-stat is-contacted"><b>{data.totals.share}</b><span>Cars sent to family</span></div>
            <div className="a-stat is-quoted"><b>{data.totals.forms}</b><span>Enquiry forms</span></div>
          </div>
          <p className="a-hint a-insight-note">“Chats opened” counts taps on the website’s WhatsApp buttons, once per visitor per car. WhatsApp doesn’t tell the website whether the message was then sent, so expect fewer chats than this in your WhatsApp.</p>

          <section className="a-card">
            <h2>By car</h2>
            {data.cars.every((c) => !c.whatsapp && !c.share && !c.forms)
              ? <p className="a-empty">No activity in this period yet.</p>
              : (
                <table className="a-table">
                  <thead><tr><th scope="col">Car</th><th scope="col">WhatsApp</th><th scope="col">Sent to family</th><th scope="col">Forms</th><th scope="col"><span className="sr-only">Share of interest</span></th></tr></thead>
                  <tbody>
                    {data.cars.map((c) => (
                      <tr key={c.slug} className={c.published ? '' : 'is-draft'}>
                        <th scope="row">{c.name}{!c.published && <small> · hidden</small>}</th>
                        <td>{c.whatsapp}</td>
                        <td>{c.share}</td>
                        <td>{c.forms}</td>
                        <td className="a-bar-cell" aria-hidden="true">{c.whatsapp + c.share + c.forms > 0 && <span className="a-bar" style={{ width: `${((c.whatsapp + c.share + c.forms) / top) * 100}%` }} />}</td>
                      </tr>
                    ))}
                    {(data.general.whatsapp > 0) && (
                      <tr><th scope="row">No car chosen<small> · general WhatsApp buttons</small></th><td>{data.general.whatsapp}</td><td>–</td><td>–</td><td /></tr>
                    )}
                  </tbody>
                </table>
              )}
          </section>

          {sources.length > 0 && (
            <section className="a-card a-sources">
              <h2>Where WhatsApp chats start</h2>
              <ul>{sources.map(([s, n]) => <li key={s}><span>{SOURCES[s] || s}</span><b>{n}</b></li>)}</ul>
            </section>
          )}
        </div>
      )}
    </>
  );
}
