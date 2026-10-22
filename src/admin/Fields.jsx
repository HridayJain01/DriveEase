import { useId, useMemo, useRef, useState } from 'react';
import { marked } from 'marked';
import { img } from '../lib.js';
import { api, uploadImage } from './api.js';

// Renders a field config (see config.js) against a value object. Nested types recurse.
// onChange always receives an updater function, so slow uploads never overwrite edits made meanwhile.
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
  const set = (next) => onChange((prev = {}) => ({ ...prev, [f.name]: typeof next === 'function' ? next(prev[f.name]) : next }));
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
      return <Wrap f={f} err={err} as="div"><ImageList images={v ? [v] : []} onChange={(fn) => set((prev) => fn(prev ? [prev] : [])[0] || '')} single /></Wrap>;
    case 'images':
      return <Wrap f={f} err={err} as="div"><ImageList images={v || []} onChange={(fn) => set((prev) => fn(prev || []))} /></Wrap>;
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
  const move = (i, d) => set((list = []) => { const next = [...list]; [next[i], next[i + d]] = [next[i + d], next[i]]; return next; });
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
              <button type="button" className="a-icon-btn danger" onClick={() => set((list = []) => list.filter((_, j) => j !== i))} aria-label={`Remove ${f.item}`}>✕</button>
            </span>
          </div>
          <Fields fields={f.fields} value={item} onChange={(next) => set((list = []) => list.map((x, j) => (j === i ? (typeof next === 'function' ? next(x) : next) : x)))} errors={errors} path={`${path}.${i}.`} />
        </div>
      ))}
      <button type="button" className="a-btn a-btn-ghost" onClick={() => set((list = []) => [...list, { ...f.blank }])}>+ Add {f.item}</button>
    </div>
  );
}

// Photos: upload (button or drag-and-drop) straight to Cloudinary, or paste a link.
function ImageList({ images, onChange, single }) {
  const [uploads, setUploads] = useState([]); // in-flight: { id, name, progress }
  const [msg, setMsg] = useState('');
  const [dragging, setDragging] = useState(false);
  const [draft, setDraft] = useState('');

  async function upload(fileList) {
    let files = [...fileList].filter((f) => f.type.startsWith('image/') || /\.hei[cf]$/i.test(f.name));
    if (!files.length) return setMsg('Choose image files: JPG, PNG, WebP or HEIC.');
    if (single) files = files.slice(0, 1);
    setMsg('');
    let sig;
    try { sig = await api('POST', '/api/admin/uploads/sign'); } catch (e) { return setMsg(e.message); }
    await Promise.all(files.map(async (file) => {
      const id = Math.random();
      setUploads((u) => [...u, { id, name: file.name, progress: 0 }]);
      try {
        const url = await uploadImage(file, sig, (p) => setUploads((u) => u.map((x) => (x.id === id ? { ...x, progress: p } : x))));
        onChange((list) => (single ? [url] : [...list, url]));
      } catch (e) { setMsg(e.message); }
      finally { setUploads((u) => u.filter((x) => x.id !== id)); }
    }));
  }

  function addLink(e) {
    e.preventDefault();
    const url = draft.trim();
    if (!/^https:\/\/\S+$/.test(url)) return setMsg('Paste a full https:// image link.');
    onChange((list) => (single ? [url] : [...list, url]));
    setDraft(''); setMsg('');
  }

  const picker = (label, cls) => (
    <label className={cls}>
      <input type="file" accept="image/*,.heic,.heif" multiple={!single} onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
      {label}
    </label>
  );
  const empty = images.length === 0 && uploads.length === 0;

  return (
    <div
      className={`a-images${dragging ? ' is-dragging' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget) && setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files); }}
    >
      {!empty && (
        <ul className="a-thumbs">
          {images.map((src, i) => (
            <li key={src + i}>
              <img src={img(src, 300)} alt="" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
              {!single && i === 0 && <span className="a-cover">Cover</span>}
              <span className="a-thumb-actions">
                {!single && i > 0 && <button type="button" onClick={() => onChange((list) => [src, ...list.filter((x) => x !== src)])}>Make cover</button>}
                {single && picker('Replace', 'a-thumb-btn')}
                <button type="button" onClick={() => onChange((list) => list.filter((x) => x !== src))}>Remove</button>
              </span>
            </li>
          ))}
          {uploads.map((u) => (
            <li key={u.id} className="a-uploading" aria-label={`Uploading ${u.name}`}>
              <span>{u.progress < 1 ? `${Math.round(u.progress * 100)}%` : 'Processing…'}</span>
              <progress max="1" value={u.progress} />
            </li>
          ))}
        </ul>
      )}
      {(!single || empty) && (
        <div className="a-dropzone">
          {picker(single ? 'Upload a photo' : 'Upload photos', 'btn btn-dark btn-sm a-upload')}
          <span className="a-hint">or drag {single ? 'one' : 'them'} here. JPG, PNG, WebP or HEIC, up to 20 MB.</span>
        </div>
      )}
      <details className="a-paste">
        <summary>Paste an image link instead</summary>
        <div className="a-add-image">
          <input type="url" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addLink(e)} placeholder="https://…" aria-label="Image link" />
          <button type="button" className="a-btn a-btn-ghost" onClick={addLink}>Add</button>
        </div>
      </details>
      {msg && <small className="a-error" role="alert">{msg}</small>}
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
