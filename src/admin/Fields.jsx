import { useId, useMemo, useRef, useState } from 'react';
import { marked } from 'marked';
import { img } from '../lib.js';

// Renders a field config (see config.js) against a value object. Nested types recurse.
export function Fields({ fields, value, onChange, errors, path = '' }) {
  return fields.map((f, i) => <Field key={f.name || f.section || i} f={f} value={value || {}} onChange={onChange} errors={errors} path={path} />);
}

function Field({ f, value, onChange, errors, path }) {
  const id = useId();
  if (f.row) return <div className="a-row"><Fields fields={f.row} value={value} onChange={onChange} errors={errors} path={path} /></div>;
  if (f.section) return (
    <section className="a-card">
      <h2>{f.section}</h2>
      {f.hint && <p className="a-hint">{f.hint}</p>}
      <Fields fields={f.fields} value={value} onChange={onChange} errors={errors} path={path} />
    </section>
  );

  const v = value[f.name];
  const set = (next) => onChange({ ...value, [f.name]: next });
  const key = path + f.name;
  const err = errors?.[key] || Object.entries(errors || {}).find(([k]) => k.startsWith(`${key}.`))?.[1];

  if (f.type === 'group') return <Fields fields={f.fields} value={v} onChange={set} errors={errors} path={`${key}.`} />;
  if (f.type === 'list') return <ListField f={f} items={v || []} set={set} errors={errors} path={key} />;
  if (f.type === 'toggle') return (
    <label className="a-toggle">
      <input type="checkbox" checked={!!v} onChange={(e) => set(e.target.checked)} />
      <span className="a-switch" aria-hidden="true" />
      <span><strong>{f.label}</strong>{f.hint && <small>{f.hint}</small>}</span>
    </label>
  );

  let control;
  const common = { id, required: f.required, maxLength: f.max, placeholder: f.placeholder, 'aria-invalid': !!err || undefined };
  switch (f.type) {
    case 'textarea':
      control = <textarea {...common} rows={f.rows || 3} value={v ?? ''} onChange={(e) => set(e.target.value)} />; break;
    case 'lines':
      control = <textarea {...common} rows={f.rows || 4} value={(v || []).join('\n')} onChange={(e) => set(e.target.value.split('\n'))} />; break;
    case 'number':
      control = <input {...common} type="number" min={f.min} max={f.max} maxLength={undefined} value={v ?? ''} onChange={(e) => set(e.target.value === '' ? '' : Number(e.target.value))} />; break;
    case 'select':
      control = (
        <select {...common} value={v ?? ''} onChange={(e) => set(f.number ? Number(e.target.value) : e.target.value)}>
          {f.options.map((o) => (typeof o === 'object' ? <option key={o.value} value={o.value}>{o.label}</option> : <option key={o}>{o}</option>))}
        </select>
      ); break;
    case 'date':
      control = <input {...common} type="date" value={v ? String(v).slice(0, 10) : ''} onChange={(e) => set(e.target.value)} />; break;
    case 'url':
      control = <input {...common} type="url" pattern="https://.+" placeholder={f.placeholder || 'https://'} value={v ?? ''} onChange={(e) => set(e.target.value)} />; break;
    case 'email':
      control = <input {...common} type="email" value={v ?? ''} onChange={(e) => set(e.target.value)} />; break;
    case 'image':
      return <Wrap f={f} err={err} as="div"><ImageList images={v ? [v] : []} onChange={(list) => set(list[0] || '')} single /></Wrap>;
    case 'images':
      return <Wrap f={f} err={err} as="div"><ImageList images={v || []} onChange={set} /></Wrap>;
    case 'markdown':
      return <Wrap f={f} err={err} as="div"><Markdown value={v || ''} onChange={set} /></Wrap>;
    default:
      control = (
        <>
          <input {...common} pattern={f.pattern} list={f.list && `${id}-list`} value={v ?? ''} onChange={(e) => set(e.target.value)} />
          {f.list && <datalist id={`${id}-list`}>{f.list.map((o) => <option key={o} value={o} />)}</datalist>}
        </>
      );
  }
  return (
    <Wrap f={f} err={err} htmlFor={id}>
      {f.prefix ? <span className="a-prefixed"><span>{f.prefix}</span>{control}</span> : control}
    </Wrap>
  );
}

function Wrap({ f, err, htmlFor, as = 'label', children }) {
  const Tag = as;
  return (
    <Tag className={`a-field${err ? ' has-error' : ''}`} {...(as === 'label' ? { htmlFor } : { role: 'group', 'aria-label': f.label })}>
      {f.label && <span className="a-label">{f.label}{f.required && <em aria-hidden="true"> *</em>}</span>}
      {children}
      {f.hint && <small className="a-hint">{f.hint}</small>}
      {err && <small className="a-error">{err}</small>}
    </Tag>
  );
}

function ListField({ f, items, set, errors, path }) {
  const move = (i, d) => { const next = [...items]; [next[i], next[i + d]] = [next[i + d], next[i]]; set(next); };
  return (
    <div className="a-list">
      {f.label && <span className="a-label">{f.label}</span>}
      {items.map((item, i) => (
        <div className="a-list-item" key={i}>
          <div className="a-list-head">
            <strong>{Object.values(item)[0] || `New ${f.item}`}</strong>
            <span>
              <button type="button" className="a-icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${f.item} up`}>↑</button>
              <button type="button" className="a-icon-btn" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Move ${f.item} down`}>↓</button>
              <button type="button" className="a-icon-btn danger" onClick={() => set(items.filter((_, j) => j !== i))} aria-label={`Remove ${f.item}`}>✕</button>
            </span>
          </div>
          <Fields fields={f.fields} value={item} onChange={(next) => set(items.map((x, j) => (j === i ? next : x)))} errors={errors} path={`${path}.${i}.`} />
        </div>
      ))}
      <button type="button" className="a-btn a-btn-ghost" onClick={() => set([...items, { ...f.blank }])}>+ Add {f.item}</button>
    </div>
  );
}

function ImageList({ images, onChange, single }) {
  const [draft, setDraft] = useState('');
  const [bad, setBad] = useState('');
  function add(e) {
    e.preventDefault();
    const url = draft.trim();
    if (!/^https:\/\/\S+$/.test(url)) return setBad('Paste a full https:// image link.');
    onChange(single ? [url] : [...images, url]);
    setDraft(''); setBad('');
  }
  return (
    <div className="a-images">
      {images.length > 0 && (
        <ul className="a-thumbs">
          {images.map((src, i) => (
            <li key={src + i}>
              <img src={img(src, 300)} alt="" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
              {!single && i === 0 && <span className="a-cover">Cover</span>}
              <span className="a-thumb-actions">
                {!single && i > 0 && <button type="button" onClick={() => onChange([src, ...images.filter((_, j) => j !== i)])}>Make cover</button>}
                <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))}>Remove</button>
              </span>
            </li>
          ))}
        </ul>
      )}
      {(!single || images.length === 0) && (
        <div className="a-add-image">
          <input type="url" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add(e)} placeholder="Paste an image link (https://…)" aria-label="Image link" />
          <button type="button" className="a-btn a-btn-ghost" onClick={add}>Add photo</button>
        </div>
      )}
      {bad && <small className="a-error">{bad}</small>}
    </div>
  );
}

const TOOLS = [
  ['B', 'Bold', (s) => `**${s || 'bold text'}**`],
  ['I', 'Italic', (s) => `*${s || 'italic text'}*`],
  ['H', 'Heading', (s) => `\n## ${s || 'Heading'}\n`],
  ['•', 'Bullet list', (s) => (s || 'List item').split('\n').map((l) => `- ${l}`).join('\n')],
  ['🔗', 'Link', (s) => `[${s || 'link text'}](https://)`],
];

function Markdown({ value, onChange }) {
  const ref = useRef();
  const [preview, setPreview] = useState(false);
  const html = useMemo(() => (preview ? marked.parse(value) : ''), [preview, value]);
  function apply(fn) {
    const t = ref.current;
    const { selectionStart: a, selectionEnd: b } = t;
    const insert = fn(value.slice(a, b));
    onChange(value.slice(0, a) + insert + value.slice(b));
    requestAnimationFrame(() => { t.focus(); t.setSelectionRange(a, a + insert.length); });
  }
  return (
    <div className="a-md">
      <div className="a-md-bar">
        <span role="tablist">
          <button type="button" role="tab" aria-selected={!preview} onClick={() => setPreview(false)}>Write</button>
          <button type="button" role="tab" aria-selected={preview} onClick={() => setPreview(true)}>Preview</button>
        </span>
        {!preview && <span>{TOOLS.map(([icon, label, fn]) => <button type="button" key={label} title={label} aria-label={label} onClick={() => apply(fn)}>{icon}</button>)}</span>}
      </div>
      {preview
        ? <div className="a-md-preview prose" dangerouslySetInnerHTML={{ __html: html || '<p class="muted">Nothing to preview yet.</p>' }} />
        : <textarea ref={ref} rows={18} value={value} onChange={(e) => onChange(e.target.value)} placeholder={'Write the article here.\n\nUse ## for a heading and - for a list item.'} />}
    </div>
  );
}
