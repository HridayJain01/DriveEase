import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { ErrorState, Icon, Photo, Rate, Seo, Specs } from '../components.jsx';
import { CompareButton, EnquireButton, SaveButton } from '../features.jsx';
import { blankAnswers, BUDGETS, recommend, TIERS, TRIPS, tripLabel, validateAnswers } from '../concierge/match.js';
import { inr } from '../fleet.js';
import { formatDate, today, useApi } from '../lib.js';
import { calm } from '../motion.jsx';
import { PAGES } from '../seo.js';
import { compare, trip as tripStore, useStore } from '../stores.js';
import { enquiryFormPath } from '../whatsapp.js';

const STEPS = [
  { id: 'trip', title: 'What’s the trip?' },
  { id: 'where', title: 'Where and when?' },
  { id: 'people', title: 'Who’s coming, and how much luggage?' },
  { id: 'prefs', title: 'Any preferences?' },
];
const RESULTS = STEPS.length;

export default function Concierge() {
  const { data: vehicles, error } = useApi('/api/vehicles');
  const stored = useStore(tripStore);
  const [a, setA] = useState(() => ({ ...blankAnswers(), ...stored }));
  const [errors, setErrors] = useState({});
  const [params, setParams] = useSearchParams();
  const heading = useRef();

  // The step lives in the URL, so the browser's back button steps back through the questions.
  const firstInvalid = STEPS.findIndex((s) => Object.keys(validateAnswers(a, s.id, today())).length);
  const wanted = Math.max(0, Math.min(RESULTS, Number(params.get('step')) || 0));
  const step = firstInvalid === -1 ? wanted : Math.min(wanted, firstInvalid);

  // ?trip=family (from the home page) preselects the trip and moves on.
  useEffect(() => {
    const t = params.get('trip');
    if (t && TRIPS.some((x) => x.id === t)) {
      setA((x) => ({ ...x, trip: t }));
      setParams({ step: '1' }, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { tripStore.set(a); }, [a]); // remembered for this visit: car pages and WhatsApp reuse it
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) { // new question: bring the card to the top and move focus to its heading
      heading.current?.closest('.cq-panel')?.scrollIntoView({ block: 'start', behavior: calm() ? 'auto' : 'smooth' });
      heading.current?.focus({ preventScroll: true });
    }
    mounted.current = true;
  }, [step]);

  const set = (patch) => { setA((x) => ({ ...x, ...patch })); setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => !(k in patch)))); };
  const go = (n) => setParams(n ? { step: String(n) } : {}, { preventScrollReset: false });

  function next(e) {
    e?.preventDefault();
    const errs = validateAnswers(a, STEPS[step].id, today());
    setErrors(errs);
    if (Object.keys(errs).length) {
      requestAnimationFrame(() => document.querySelector('.cq [aria-invalid="true"], .cq .field-error')?.closest('label, fieldset')?.querySelector('input, select, button')?.focus());
      return;
    }
    go(step + 1);
  }

  if (error) return <ErrorState error={error} what="Concierge" />;
  const categories = vehicles ? [...new Set(vehicles.map((v) => v.category).filter(Boolean))] : [];

  return (
    <>
      <Seo {...PAGES['/concierge']} />
      <section className="wrap concierge">
        <aside className="cq-intro">
          <p className="eyebrow">Drive Ease Concierge</p>
          <h1>{step === RESULTS ? <>Your shortlist, <em>ready.</em></> : <>Four questions. <em>The right car.</em></>}</h1>
          <p className="lede">Tell us about the trip and we’ll match it against every car in our fleet, explaining why each one fits. No sign-up, nothing booked.</p>
          {step > 0 && <Summary a={a} upTo={step} onEdit={go} />}
        </aside>

        <div className="cq-panel">
          {step < RESULTS ? (
            <form className="cq" onSubmit={next} noValidate>
              <div className="cq-progress" aria-hidden="true"><i style={{ width: `${((step + 1) / RESULTS) * 100}%` }} /></div>
              <p className="cq-count mono">Step {step + 1} of {RESULTS}</p>
              <h2 ref={heading} tabIndex={-1} className="cq-title">{STEPS[step].title}</h2>
              <div className="cq-body" key={step}>
                {step === 0 && <TripStep a={a} set={set} errors={errors} />}
                {step === 1 && <WhereStep a={a} set={set} errors={errors} />}
                {step === 2 && <PeopleStep a={a} set={set} errors={errors} />}
                {step === 3 && <PrefsStep a={a} set={set} errors={errors} categories={categories} />}
              </div>
              <div className="cq-nav">
                {step > 0 && <button type="button" className="btn btn-glass" onClick={() => go(step - 1)}><Icon name="left" size={18} />Back</button>}
                <button className="btn btn-amber">{step === RESULTS - 1 ? <>Show my matches<Icon name="spark" size={18} /></> : <>Continue<Icon name="arrow" size={18} /></>}</button>
              </div>
            </form>
          ) : (
            <Results a={a} vehicles={vehicles} headingRef={heading} onEdit={go} onReset={() => { setA(blankAnswers()); setErrors({}); go(0); }} />
          )}
        </div>
      </section>
    </>
  );
}

/* ---------- Steps ---------- */
function Err({ id, msg }) {
  return msg ? <small id={id} className="field-error" role="alert">{msg}</small> : null;
}

function TripStep({ a, set, errors }) {
  return (
    <fieldset className="cq-trips" aria-describedby={errors.trip ? 'trip-err' : undefined}>
      <legend className="sr-only">Type of trip</legend>
      {TRIPS.map((t) => (
        <label key={t.id} className="cq-trip">
          <input type="radio" name="trip" value={t.id} checked={a.trip === t.id} onChange={() => set({ trip: t.id })} aria-invalid={!!errors.trip} />
          <span><strong>{t.label}</strong><small>{t.hint}</small></span>
        </label>
      ))}
      <Err id="trip-err" msg={errors.trip} />
    </fieldset>
  );
}

function Field({ name, label, errors, children, optional }) {
  return (
    <label className={`field${errors[name] ? ' has-error' : ''}`}>
      <span>{label}{optional && <i className="opt"> optional</i>}</span>
      {children}
      <Err id={`${name}-err`} msg={errors[name]} />
    </label>
  );
}

function WhereStep({ a, set, errors }) {
  const input = (name, props) => (
    <input name={name} value={a[name]} onChange={(e) => set({ [name]: e.target.value })} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-err` : undefined} {...props} />
  );
  return (
    <>
      <div className="field-row">
        <Field name="from" label="Pickup area" errors={errors}>{input('from', { placeholder: 'e.g. Airport T2', maxLength: 120, autoComplete: 'off', required: true })}</Field>
        <Field name="to" label="Destination" errors={errors} optional>{input('to', { placeholder: 'e.g. Lonavala', maxLength: 120, autoComplete: 'off' })}</Field>
      </div>
      <div className="field-row">
        <Field name="start" label="Pickup date" errors={errors} optional>{input('start', { type: 'date', min: today() })}</Field>
        <Field name="end" label="Return date" errors={errors} optional>{input('end', { type: 'date', min: a.start || today() })}</Field>
      </div>
      <p className="cq-hint">Dates help us check availability. Leave them blank if you’re not sure yet.</p>
    </>
  );
}

function Stepper({ name, label, value, min, max, onChange, error, unit }) {
  const n = Number(value) || 0;
  return (
    <div className={`stepper${error ? ' has-error' : ''}`} role="group" aria-labelledby={`${name}-label`}>
      <span id={`${name}-label`} className="stepper-label">{label}</span>
      <div className="stepper-row">
        <button type="button" className="icon-btn" onClick={() => onChange(Math.max(min, n - 1))} disabled={n <= min} aria-label={`Fewer ${unit}`}><Icon name="minus" size={18} /></button>
        <input type="number" inputMode="numeric" min={min} max={max} value={value} aria-labelledby={`${name}-label`} aria-invalid={!!error} aria-describedby={error ? `${name}-err` : undefined}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} />
        <button type="button" className="icon-btn" onClick={() => onChange(Math.min(max, n + 1))} disabled={n >= max} aria-label={`More ${unit}`}><Icon name="plus" size={18} /></button>
      </div>
      <Err id={`${name}-err`} msg={error} />
    </div>
  );
}

function PeopleStep({ a, set, errors }) {
  return (
    <>
      <div className="cq-steppers">
        <Stepper name="passengers" label="Travellers, including the driver" unit="travellers" value={a.passengers} min={1} max={20} onChange={(v) => set({ passengers: v })} error={errors.passengers} />
        <Stepper name="bags" label="Large bags or suitcases" unit="bags" value={a.bags} min={0} max={20} onChange={(v) => set({ bags: v })} error={errors.bags} />
      </div>
      <p className="cq-hint">Count suitcases and big holdalls. Small backpacks usually fit in the cabin.</p>
    </>
  );
}

function Chips({ name, legend, options, value, onChange, note }) {
  return (
    <fieldset className="seg">
      <legend>{legend}</legend>
      <div className="seg-row">
        {options.map(([v, label]) => (
          <label key={label}><input type="radio" name={name} checked={value === v} onChange={() => onChange(v)} /><span>{label}</span></label>
        ))}
      </div>
      {note && <p className="cq-hint">{note}</p>}
    </fieldset>
  );
}

function PrefsStep({ a, set, categories }) {
  return (
    <div className="cq-prefs">
      <Chips name="category" legend="Type of car" value={a.category} onChange={(category) => set({ category })} options={[['', 'No preference'], ...categories.map((c) => [c, c])]} />
      <Chips name="transmission" legend="Gearbox" value={a.transmission} onChange={(transmission) => set({ transmission })} options={[['', 'Either'], ['Manual', 'Manual'], ['Automatic', 'Automatic']]} />
      <Chips name="budget" legend="Budget per day" value={a.budget} onChange={(budget) => set({ budget })}
        options={[[0, 'No fixed budget'], ...BUDGETS.map((b) => [b, `Up to ${inr(b)}`])]}
        note="Budgets are checked only against rates we list as a simple daily price. Final rates are confirmed with you." />
    </div>
  );
}

/* ---------- Summary of answers (editable) ---------- */
function Summary({ a, upTo, onEdit }) {
  const dates = [a.start, a.end].filter(Boolean).map((d) => formatDate(d, { day: 'numeric', month: 'short' })).join(' → ');
  const items = [
    [0, 'Trip', tripLabel(a.trip)],
    [1, 'Route', [a.from, a.to].filter(Boolean).join(' → ')],
    [1, 'Dates', dates],
    [2, 'Travellers', a.passengers && `${a.passengers} ${a.passengers === 1 ? 'person' : 'people'} · ${a.bags} ${a.bags === 1 ? 'bag' : 'bags'}`],
    [3, 'Preferences', [a.category, a.transmission, a.budget ? `≤ ${inr(a.budget)}/day` : ''].filter(Boolean).join(' · ')],
  ].filter(([s, , v]) => v && s < upTo); // only answers already given
  return (
    <dl className="cq-summary">
      {items.map(([s, k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}<button type="button" className="link-btn" onClick={() => onEdit(s)} aria-label={`Change ${k.toLowerCase()}`}>Change</button></dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------- Results ---------- */
function Results({ a, vehicles, headingRef, onEdit, onReset }) {
  const navigate = useNavigate();
  const res = useMemo(() => (vehicles ? recommend(vehicles, a) : null), [vehicles, a]);
  if (!res) return <div className="cq-results" aria-busy="true"><div className="result skeleton" /><div className="result skeleton" /></div>;

  const trip = tripLabel(a.trip).toLowerCase();
  const n = res.top.length + res.more.length;
  const pick = res.top[0]?.vehicle;

  function compareTop() {
    compare.replace(res.top.map((r) => r.vehicle.slug));
    navigate('/compare');
  }

  return (
    <div className="cq-results">
      <h2 ref={headingRef} tabIndex={-1} className="cq-title">
        {res.total === 0 ? 'Our fleet list isn’t available right now'
          : n === 0 ? 'No car in our fleet fits all of that'
            : `${n} ${n === 1 ? 'car fits' : 'cars fit'} your ${a.trip === 'other' ? 'trip' : trip}`}
      </h2>
      <p className="cq-disclaimer"><Icon name="info" size={16} />These are suggestions based on the specs listed on our website. They aren’t a booking or a promise of availability: our team confirms the car, dates and rate with you.</p>

      {res.top.length > 0 && (
        <ol className="results">
          {res.top.map((r, i) => <Result key={r.vehicle.slug} r={r} best={i === 0} />)}
        </ol>
      )}

      {res.top.length > 1 && (
        <div className="cq-actions">
          <button type="button" className="btn btn-glass" onClick={compareTop}><Icon name="compare" size={18} />Compare these {res.top.length} side by side</button>
          <EnquireButton className="btn btn-amber" cars={res.top.map((r) => r.vehicle)} context="shortlist" source="concierge">Ask about all {res.top.length} on WhatsApp</EnquireButton>
        </div>
      )}

      {res.more.length > 0 && (
        <details className="cq-more">
          <summary>{res.more.length} more {res.more.length === 1 ? 'car also fits' : 'cars also fit'}<Icon name="down" size={18} /></summary>
          <ul>
            {res.more.map((r) => (
              <li key={r.vehicle.slug}>
                <Link to={`/fleet/${r.vehicle.slug}`}>{r.vehicle.name}</Link>
                <span className={`tier tier-${r.tier}`}>{TIERS[r.tier].label}</span>
                <SaveButton v={r.vehicle} />
                <CompareButton v={r.vehicle} />
              </li>
            ))}
          </ul>
        </details>
      )}

      {n === 0 && res.total > 0 && (
        <div className="cq-none">
          <p>We didn’t want to suggest a car that can’t do the job. Message us: we may be able to arrange two cars, a bigger vehicle or a chauffeur.</p>
          <div className="cq-actions">
            <EnquireButton className="btn btn-amber" cars={[]} source="concierge">Ask us on WhatsApp</EnquireButton>
            <button type="button" className="btn btn-glass" onClick={() => onEdit(2)}><Icon name="edit" size={16} />Change travellers or bags</button>
          </div>
          {res.alternatives.length > 0 && (
            <>
              <h3 className="h-small">Closest options, and what they’re missing</h3>
              <ol className="results">{res.alternatives.map((r) => <Result key={r.vehicle.slug} r={r} />)}</ol>
            </>
          )}
        </div>
      )}

      <div className="cq-foot">
        <Link className="link-arrow" to={enquiryFormPath({ cars: pick ? [pick] : [], trip: a, source: 'concierge' })}>Prefer a call back? Send these details as an enquiry<Icon name="arrow" size={16} /></Link>
        <button type="button" className="link-btn" onClick={onReset}>Start over</button>
      </div>
    </div>
  );
}

function Result({ r, best }) {
  const v = r.vehicle;
  return (
    <li className={`result tier-${r.tier}`}>
      <div className="result-media">
        <Photo src={v.images?.[0]} alt={`${v.name}, ${(v.category || 'car').toLowerCase()}`} sizes="(max-width: 700px) 100vw, 320px" />
        <span className={`tier tier-${r.tier}`}>{best && r.tier === 'great' ? 'Best match' : TIERS[r.tier].label}</span>
        <SaveButton v={v} />
      </div>
      <div className="result-body">
        <p className="result-cat mono">{v.category}</p>
        <h3><Link to={`/fleet/${v.slug}`}>{v.name}</Link></h3>
        {r.why && r.tier !== 'unsuitable' && <p className="result-why">{r.why}</p>}
        <Specs v={v} />
        {(r.fails.length > 0 || r.misses.length > 0 || r.unverified.length > 0) && (
          <ul className="result-notes">
            {r.fails.map((t) => <li key={t} className="is-fail"><Icon name="close" size={14} /><span><span className="sr-only">Doesn’t fit: </span>{t}</span></li>)}
            {r.misses.map((t) => <li key={t} className="is-miss"><Icon name="info" size={14} /><span><span className="sr-only">Worth knowing: </span>{t}</span></li>)}
            {r.unverified.map((t) => <li key={t} className="is-unknown"><Icon name="info" size={14} /><span><span className="sr-only">Not verified: </span>{t}</span></li>)}
          </ul>
        )}
        {r.ok.length > 0 && r.tier === 'unsuitable' && <p className="result-why muted">It does {r.ok.slice(0, 2).join(' and ')}.</p>}
        <div className="result-foot">
          <Rate rate={v.rate} />
          <span className="car-actions">
            <CompareButton v={v} />
            <Link className="btn btn-glass btn-sm" to={`/fleet/${v.slug}`}>Details</Link>
            <EnquireButton cars={[v]} source="concierge" label={`Enquire about the ${v.name} on WhatsApp`} />
          </span>
        </div>
      </div>
    </li>
  );
}
