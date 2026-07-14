'use client';

import { useEffect, useMemo, useState } from 'react';
import { cmsGroups, defaultContent } from '../../lib/cms-schema';
import styles from './admin.module.css';

const STORAGE_KEY = 'kiley-record-content-v1';
const PASSWORD_KEY = 'kiley-record-cms-password';

function Field({ field, value, onChange, onStatus }) {
  const isWide = field.kind === 'long' || field.kind === 'image';
  const wrapClass = isWide ? `${styles.field} ${styles.fieldWide}` : styles.field;

  function handleImagePick(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 750000) {
      onStatus('Choose an image under 750 KB, or paste an image URL.');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result);
      onStatus('Image ready. Save changes to use it.');
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className={wrapClass}>
      <label htmlFor={field.key}>{field.label}</label>
      {field.kind === 'long' && (
        <textarea id={field.key} value={value} onChange={e => onChange(e.target.value)} />
      )}
      {field.kind === 'select' && (
        <select id={field.key} value={value} onChange={e => onChange(e.target.value)}>
          {field.options.map(([optValue, text]) => (
            <option key={optValue} value={optValue}>{text}</option>
          ))}
        </select>
      )}
      {(field.kind === 'short' || field.kind === 'url' || field.kind === 'image') && (
        <input
          id={field.key}
          type={field.kind === 'url' ? 'url' : 'text'}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      )}
      {field.kind === 'url' && (
        <small>{field.key === 'share-url' ? 'Leave blank to share the page currently open.' : 'Leave blank to make this card non-clickable.'}</small>
      )}
      {field.kind === 'image' && (
        <>
          <label className={styles.fileLabel}>
            Choose image
            <input type="file" accept="image/*" onChange={handleImagePick} />
          </label>
          <small>Paste an image URL, or upload a local image under 750 KB.</small>
        </>
      )}
      {['hero-title', 'closing-title'].includes(field.key) && (
        <small>Simple formatting such as &lt;br&gt; and &lt;span&gt; is supported.</small>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [values, setValues] = useState(defaultContent);
  const [activeGroup, setActiveGroup] = useState(0);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPassword(sessionStorage.getItem(PASSWORD_KEY) || '');

    // The content this browser last saved (via this editor or the old
    // cms.html). Kept so we can recover work that never made it into the
    // database — e.g. content published to the previous Vercel Blob store.
    let cached = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') cached = parsed;
      }
    } catch {
      // Ignore an unreadable/corrupt cache; fall through to defaults.
    }

    (async () => {
      try {
        const response = await fetch('/api/content', { cache: 'no-store' });
        const data = await response.json();
        if (response.ok && data.content) {
          setValues(prev => ({ ...prev, ...data.content }));
          setStatus('Loaded published content.');
          return;
        }
      } catch {
        // Fall through to the browser copy below.
      }
      // Nothing in the database yet. If this browser has a saved copy,
      // pre-fill it so the editor shows your content — click Save changes to
      // publish it to the live site.
      if (cached) {
        setValues(prev => ({ ...prev, ...cached }));
        setStatus('The live site has no saved content yet, so this shows your browser’s copy. Click “Save changes” to publish it to the live site.');
      }
    })();
  }, []);

  function updatePassword(next) {
    setPassword(next);
    sessionStorage.setItem(PASSWORD_KEY, next);
  }

  function updateField(key, value) {
    setValues(prev => ({ ...prev, [key]: value }));
  }

  async function save() {
    if (!password) {
      setStatus('Enter the editor password before publishing.');
      return;
    }
    setSaving(true);
    setStatus('Publishing…');
    try {
      const response = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-cms-password': password },
        body: JSON.stringify(values)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to save');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
      setStatus('Published. The live site now has these changes.');
    } catch (error) {
      setStatus(error.message || 'Unable to publish changes.');
    } finally {
      setSaving(false);
    }
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify(values, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kiley-record-content-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    setStatus('Backup exported.');
  }

  async function importBackup(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      setValues(prev => ({ ...prev, ...imported }));
      setStatus('Backup imported. Review, then Save changes to publish.');
    } catch {
      setStatus('That file is not a valid backup.');
    } finally {
      event.target.value = '';
    }
  }

  const group = cmsGroups[activeGroup];

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <div className={styles.topInner}>
          <div>
            <div className={styles.brand}>The Kiley Record</div>
            <p>Content editor</p>
          </div>
          <a className={styles.preview} href="/index.html" target="_blank" rel="noopener noreferrer">Open site preview ↗</a>
        </div>
      </header>
      <main className={styles.main}>
        <p className={styles.intro}>
          <strong>Edit one section at a time, then publish when you’re ready.</strong> Export a backup before making major edits.
        </p>
        <div className={styles.access}>
          <label htmlFor="cms-password">Editor password</label>
          <input id="cms-password" type="password" autoComplete="current-password" value={password} onChange={e => updatePassword(e.target.value)} />
          <p>This password is set in Vercel. It is kept only for this browser session.</p>
        </div>
        <div className={styles.tabs} role="tablist" aria-label="Content sections">
          {cmsGroups.map((g, i) => (
            <button
              key={g.title}
              type="button"
              role="tab"
              aria-selected={i === activeGroup}
              className={i === activeGroup ? `${styles.tab} ${styles.tabActive}` : styles.tab}
              onClick={() => setActiveGroup(i)}
            >
              {g.title}
            </button>
          ))}
        </div>
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>{group.title}</h2>
            <p>{group.description}</p>
          </div>
          <div className={styles.fieldGrid}>
            {group.fields.map(field => (
              <Field
                key={field.key}
                field={field}
                value={values[field.key] ?? field.defaultValue}
                onChange={v => updateField(field.key, v)}
                onStatus={setStatus}
              />
            ))}
          </div>
        </section>
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={save} disabled={saving}>Save changes</button>
          <button type="button" onClick={exportBackup}>Export backup</button>
          <label className={styles.fileLabel}>
            Import backup
            <input type="file" accept="application/json" onChange={importBackup} />
          </label>
          <span className={styles.status} role="status" aria-live="polite">{status}</span>
        </div>
      </main>
    </div>
  );
}
