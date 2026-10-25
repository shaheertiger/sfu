'use client';
import { useEffect, useState } from 'react';
import s from './automations.module.css';

/** Signature, webhooks and RSS auto-post for the active workspace. */

const EVENTS = [
  ['post.published', 'Published'],
  ['post.partial', 'Partly published'],
  ['post.failed', 'Failed'],
];
const PLATFORM = { bluesky: 'Bluesky', x: 'X', instagram: 'Instagram', linkedin: 'LinkedIn', facebook: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube', threads: 'Threads', pinterest: 'Pinterest', google_business: 'Google Business' };

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, { method, headers: body ? { 'content-type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    window.location.href = '/login?next=/app/automations';
    throw new Error('Signed out');
  }
  if (!res.ok) throw new Error(data.issues?.[0]?.message || data.error || `Request failed (${res.status})`);
  return data;
}

const ago = (t) => {
  if (!t) return 'never';
  const m = Math.round((Date.now() - Number(t)) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  if (m < 1440) return `${Math.round(m / 60)} h ago`;
  return new Date(Number(t)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function AutomationsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = () => api('/api/v1/automations').then(setData).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  if (!data) {
    return (
      <main className={s.page}>
        <div className={s.wrap}>{error ? <p className={s.error}>{error}</p> : <p className={s.empty}>Loading…</p>}</div>
      </main>
    );
  }
  const canEdit = data.workspace.role === 'owner' || data.workspace.role === 'editor';
  return (
    <main className={s.page}>
      <div className={s.wrap}>
        <div className={s.top}>
          <div>
            <a href="/app" className={s.back}>← Back to dashboard</a>
            <h1 className={s.h1}>Automations</h1>
            <p className={s.lead}>{data.workspace.name}{canEdit ? '' : ' · view only (ask the owner to change these)'}</p>
          </div>
        </div>
        <Signature initial={data.signature} canEdit={canEdit} />
        <LinkClicks on={data.track_links} clicks={data.link_clicks} links={data.tracked_links} canEdit={canEdit} reload={load} />
        <Feeds feeds={data.feeds} accounts={data.accounts} canEdit={canEdit} reload={load} />
        <Webhooks hooks={data.webhooks} canEdit={canEdit} reload={load} />
        <section className={s.card}>
          <h2>Client preview links</h2>
          <p className={s.help}>
            Open a saved post in the dashboard and choose <b>Share for review</b>. Anyone with the link can see the post, approve it, ask for changes or comment, without an account. You get an email for each response, and approving clears the post&apos;s approval hold. Links last 30 days.
          </p>
        </section>
      </div>
    </main>
  );
}

function Signature({ initial, canEdit }) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(['', '']);
  const save = async () => {
    setBusy(true);
    setMsg(['', '']);
    try {
      const r = await api('/api/v1/signature', { method: 'PUT', body: { signature: value } });
      setSaved(r.signature);
      setValue(r.signature);
      setMsg(['ok', r.signature ? 'Signature saved.' : 'Signature turned off.']);
    } catch (e) {
      setMsg(['err', e.message]);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className={s.card}>
      <h2>Signature</h2>
      <p className={s.help}>Added on its own line at the end of every post when it publishes. It is skipped when it would take a post over the platform&apos;s character limit, or when the post already contains it. Leave empty to turn it off.</p>
      <textarea className={s.textarea} value={value} maxLength={500} disabled={!canEdit} onChange={(e) => setValue(e.target.value)} placeholder="e.g. Follow us for daily tips → scheduleforyou.com" />
      {msg[0] === 'err' && <p className={s.error}>{msg[1]}</p>}
      {msg[0] === 'ok' && <p className={s.notice}>{msg[1]}</p>}
      {canEdit && (
        <div className={s.actions}>
          <button className={`${s.btn} ${s.btnDark}`} disabled={busy || value.trim() === saved} onClick={save}>{busy ? 'Saving…' : 'Save signature'}</button>
          <span className={s.meta}>{value.length}/500</span>
        </div>
      )}
    </section>
  );
}

function LinkClicks({ on, clicks, links, canEdit, reload }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(['', '']);
  const flip = async () => {
    setBusy(true);
    setMsg(['', '']);
    try {
      await api('/api/app/prefs', { method: 'PATCH', body: { prefs: { trackLinks: !on } } });
      await reload();
      setMsg(['ok', !on ? 'Link clicks are now counted on every post that publishes from here on.' : 'Link tracking turned off. Existing short links keep working.']);
    } catch (e) {
      setMsg(['err', e.message]);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className={s.card}>
      <h2>Link clicks</h2>
      <p className={s.help}>
        When this is on, links in your captions and first comments are swapped for short links on scheduleforyou.com when the post publishes, and every click is counted. Analytics then shows real clicks per post. A link is only swapped when the short link is not longer than it.
      </p>
      <p className={s.meta}>{links} tracked link{links === 1 ? '' : 's'} · {clicks} click{clicks === 1 ? '' : 's'} so far</p>
      {msg[0] === 'err' && <p className={s.error}>{msg[1]}</p>}
      {msg[0] === 'ok' && <p className={s.notice}>{msg[1]}</p>}
      {canEdit && (
        <div className={s.actions}>
          <label className={s.toggle}>
            <input type="checkbox" checked={!!on} disabled={busy} onChange={flip} /> Count link clicks
          </label>
        </div>
      )}
    </section>
  );
}

function Feeds({ feeds, accounts, canEdit, reload }) {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState('draft');
  const [picked, setPicked] = useState([]);
  const [template, setTemplate] = useState('{title}\n\n{link}');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(['', '']);
  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const run = async (key, fn, ok) => {
    setBusy(key);
    setMsg(['', '']);
    try {
      const r = await fn();
      if (ok) setMsg(['ok', typeof ok === 'function' ? ok(r) : ok]);
      await reload();
    } catch (e) {
      setMsg(['err', e.message]);
    } finally {
      setBusy('');
    }
  };
  const add = () => run('add', () => api('/api/v1/feeds', { method: 'POST', body: { url: url.trim(), mode, template, account_ids: picked } }), (r) => {
    setUrl('');
    return `Added ${r.feed.title || r.feed.url}. Posts already in the feed are skipped; new ones will appear within 15 minutes of being published.`;
  });
  const accLabel = (a) => `${PLATFORM[a.platform] || a.platform} · @${a.username || a.display_name || '?'}`;
  return (
    <section className={s.card}>
      <h2>RSS auto-post</h2>
      <p className={s.help}>When your blog, newsletter or YouTube channel publishes something new, a post is created for you. Feeds are checked every 15 minutes.</p>
      {feeds.length === 0 && <p className={s.empty}>No feeds yet.</p>}
      {feeds.map((f) => (
        <div key={f.id} className={s.row}>
          <div className={s.rowTop}>
            <strong>{f.title || 'Feed'}</strong>
            {canEdit && (
              <div className={s.actions}>
                <label className={s.toggle}>
                  <input type="checkbox" checked={f.active} onChange={() => run(`a${f.id}`, () => api(`/api/v1/feeds/${f.id}`, { method: 'PATCH', body: { active: !f.active } }))} /> On
                </label>
                <button className={s.btn} disabled={!!busy} onClick={() => run(`c${f.id}`, () => api(`/api/v1/feeds/${f.id}/check`, { method: 'POST' }), (r) => (r.created ? `Created ${r.created} post${r.created === 1 ? '' : 's'}.` : 'No new items.'))}>
                  {busy === `c${f.id}` ? 'Checking…' : 'Check now'}
                </button>
                <button className={`${s.btn} ${s.btnDanger}`} disabled={!!busy} onClick={() => confirm('Remove this feed?') && run(`d${f.id}`, () => api(`/api/v1/feeds/${f.id}`, { method: 'DELETE' }))}>Remove</button>
              </div>
            )}
          </div>
          <span className={s.url}>{f.url}</span>
          <span className={s.meta}>
            {f.mode === 'queue' && f.account_ids.length ? 'Adds to the queue (next open slot)' : 'Creates drafts to review'} · {f.account_ids.length} account{f.account_ids.length === 1 ? '' : 's'} · checked {ago(f.last_checked_at)}
          </span>
          {f.last_error && <span className={s.bad}>Last check failed: {f.last_error}</span>}
        </div>
      ))}
      {canEdit && (
        <div className={s.form}>
          <label>
            <span>Feed URL</span>
            <input className={s.input} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://yourblog.com/feed" inputMode="url" />
          </label>
          <label>
            <span>New items become</span>
            <select className={s.select} value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="draft">Drafts I review first</option>
              <option value="queue">Posts added to the queue</option>
            </select>
          </label>
          <label>
            <span>Post to</span>
          </label>
          <div className={s.chips}>
            {accounts.length === 0 && <span className={s.meta}>Connect accounts in the dashboard first. Without accounts, items become drafts.</span>}
            {accounts.map((a) => (
              <span key={a.id} role="checkbox" aria-checked={picked.includes(a.id)} tabIndex={0} className={`${s.chip} ${picked.includes(a.id) ? s.chipOn : ''}`} onClick={() => toggle(a.id)} onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && (e.preventDefault(), toggle(a.id))}>
                {accLabel(a)}
              </span>
            ))}
          </div>
          <label>
            <span>Post text ({'{title}'}, {'{link}'} and {'{description}'} are filled in)</span>
            <textarea className={s.textarea} value={template} maxLength={2000} onChange={(e) => setTemplate(e.target.value)} />
          </label>
          {msg[0] === 'err' && <p className={s.error}>{msg[1]}</p>}
          {msg[0] === 'ok' && <p className={s.notice}>{msg[1]}</p>}
          <div className={s.actions}>
            <button className={`${s.btn} ${s.btnDark}`} disabled={!!busy || !url.trim()} onClick={add}>{busy === 'add' ? 'Reading feed…' : 'Add feed'}</button>
          </div>
        </div>
      )}
    </section>
  );
}

function Webhooks({ hooks, canEdit, reload }) {
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState(EVENTS.map((e) => e[0]));
  const [created, setCreated] = useState(null);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(['', '']);
  const run = async (key, fn, ok) => {
    setBusy(key);
    setMsg(['', '']);
    try {
      const r = await fn();
      if (ok) setMsg(['ok', typeof ok === 'function' ? ok(r) : ok]);
      await reload();
      return r;
    } catch (e) {
      setMsg(['err', e.message]);
    } finally {
      setBusy('');
    }
  };
  const add = async () => {
    const r = await run('add', () => api('/api/v1/webhooks', { method: 'POST', body: { url: url.trim(), events } }));
    if (r?.webhook) {
      setCreated(r.webhook);
      setUrl('');
    }
  };
  const flip = (e) => setEvents((xs) => (xs.includes(e) ? xs.filter((x) => x !== e) : [...xs, e]));
  return (
    <section className={s.card}>
      <h2>Webhooks</h2>
      <p className={s.help}>Send post results to Zapier, Make, n8n or your own server. Each event is a JSON POST, signed so you can check it came from us.</p>
      {hooks.length === 0 && <p className={s.empty}>No webhooks yet.</p>}
      {hooks.map((h) => (
        <div key={h.id} className={s.row}>
          <div className={s.rowTop}>
            <span className={s.url}>{h.url}</span>
            {canEdit && (
              <div className={s.actions}>
                <label className={s.toggle}>
                  <input type="checkbox" checked={h.active} onChange={() => run(`a${h.id}`, () => api(`/api/v1/webhooks/${h.id}`, { method: 'PATCH', body: { active: !h.active } }))} /> On
                </label>
                <button className={s.btn} disabled={!!busy} onClick={() => run(`t${h.id}`, () => api(`/api/v1/webhooks/${h.id}/test`, { method: 'POST' }), (r) => (r.error ? `Test failed: ${r.error}` : `Test delivered (HTTP ${r.status}).`))}>
                  {busy === `t${h.id}` ? 'Sending…' : 'Send test'}
                </button>
                <button className={`${s.btn} ${s.btnDanger}`} disabled={!!busy} onClick={() => confirm('Remove this webhook?') && run(`d${h.id}`, () => api(`/api/v1/webhooks/${h.id}`, { method: 'DELETE' }))}>Remove</button>
              </div>
            )}
          </div>
          <span className={s.meta}>
            {h.events.map((e) => EVENTS.find((x) => x[0] === e)?.[1] || e).join(', ')} · last delivery {ago(h.last_sent_at)}
          </span>
          {h.last_sent_at && (h.last_error ? <span className={s.bad}>Last delivery failed: {h.last_error}</span> : <span className={s.good}>Last delivery OK (HTTP {h.last_status})</span>)}
        </div>
      ))}
      {created && (
        <div className={s.row}>
          <strong>Signing secret for {created.url}</strong>
          <span className={s.meta}>Copy it now. It won&apos;t be shown again.</span>
          <div className={s.secret}>{created.secret}</div>
          <div className={s.actions}>
            <button className={s.btn} onClick={() => navigator.clipboard?.writeText(created.secret)}>Copy secret</button>
            <button className={s.btn} onClick={() => setCreated(null)}>Done</button>
          </div>
        </div>
      )}
      {canEdit && (
        <div className={s.form}>
          <label>
            <span>Endpoint URL</span>
            <input className={s.input} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://hooks.zapier.com/…" inputMode="url" />
          </label>
          <div className={s.chips}>
            {EVENTS.map(([id, label]) => (
              <span key={id} role="checkbox" aria-checked={events.includes(id)} tabIndex={0} className={`${s.chip} ${events.includes(id) ? s.chipOn : ''}`} onClick={() => flip(id)} onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && (e.preventDefault(), flip(id))}>
                {label}
              </span>
            ))}
          </div>
          {msg[0] === 'err' && <p className={s.error}>{msg[1]}</p>}
          {msg[0] === 'ok' && <p className={s.notice}>{msg[1]}</p>}
          <div className={s.actions}>
            <button className={`${s.btn} ${s.btnDark}`} disabled={!!busy || !url.trim() || !events.length} onClick={add}>{busy === 'add' ? 'Adding…' : 'Add webhook'}</button>
          </div>
        </div>
      )}
      <details>
        <summary className={s.meta} style={{ cursor: 'pointer' }}>How to check the signature</summary>
        <pre className={s.code}>{`Headers:
  X-SFY-Event: post.published | post.partial | post.failed | ping
  X-SFY-Signature: t=<unix seconds>,v1=<hex>

v1 = HMAC-SHA256(secret, "<t>.<raw request body>")

Body:
  { "event": "post.published", "workspace_id": "…", "sent_at": "…",
    "data": { "post": { "id", "caption", "scheduled_at", "status", "labels" },
              "targets": [{ "platform", "username", "status", "url", "error" }] } }`}</pre>
      </details>
    </section>
  );
}
