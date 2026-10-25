'use client';
import { useEffect, useRef, useState } from 'react';
import s from './automations.module.css';

/** Referrals, share-to-queue, signature, link tracking, calendar, webhooks and RSS auto-post for the active workspace. */

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
        {data.referral && <ReferFriend referral={data.referral} />}
        {data.share && <ShareToQueue share={data.share} />}
        <Signature initial={data.signature} canEdit={canEdit} />
        <LinkClicks on={data.track_links} utm={data.utm_tags} clicks={data.link_clicks} links={data.tracked_links} canEdit={canEdit} reload={load} />
        <SharedCalendar calendar={data.calendar} canEdit={canEdit} reload={load} />
        <DefaultComments accounts={data.accounts} canEdit={canEdit} reload={load} />
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

const money = (cents) => `$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`;

function ReferFriend({ referral }) {
  const [msg, setMsg] = useState(['', '']);
  const copy = (text, what) => navigator.clipboard?.writeText(text).then(() => setMsg(['ok', `${what} copied.`])).catch(() => setMsg(['err', 'Could not copy. Select the link and copy it by hand.']));
  const enc = encodeURIComponent;
  const text = referral.share_text;
  const pending = Math.max(0, referral.signups - referral.rewarded);
  return (
    <section className={s.card}>
      <h2>Give a month, get a month</h2>
      <p className={s.help}>
        Anyone who signs up through your link gets a {referral.trial_days}-day free trial instead of 7. When they pay for their first month, you get one month of your plan ({money(referral.credit_cents)}) taken off your next bill. No limit on how many people you invite, and the credit stacks.
      </p>
      <div className={s.row}>
        <strong>Your link</strong>
        <span className={s.url}>{referral.url}</span>
        <div className={s.actions}>
          <button className={`${s.btn} ${s.btnDark}`} onClick={() => copy(referral.url, 'Your link')}>Copy link</button>
          <button className={s.btn} onClick={() => copy(text, 'Message')}>Copy message</button>
          <a className={s.btn} style={{ textDecoration: 'none' }} target="_blank" rel="noreferrer" href={`https://x.com/intent/post?text=${enc(text)}`}>Post on X</a>
          <a className={s.btn} style={{ textDecoration: 'none' }} target="_blank" rel="noreferrer" href={`https://bsky.app/intent/compose?text=${enc(text)}`}>Post on Bluesky</a>
          <a className={s.btn} style={{ textDecoration: 'none' }} target="_blank" rel="noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(referral.url)}`}>Share on LinkedIn</a>
          <a className={s.btn} style={{ textDecoration: 'none' }} href={`mailto:?subject=${enc('Try Schedule For You (14 days free)')}&body=${enc(text)}`}>Email</a>
        </div>
      </div>
      <div className={s.row}>
        <strong>So far</strong>
        <span className={s.meta}>
          {referral.signups === 0
            ? 'Nobody has used your link yet. Share it where your audience already is: a pinned post, your newsletter footer, a community you are in.'
            : `${referral.signups} signed up · ${referral.rewarded} paying (${money(referral.rewarded * referral.credit_cents)} credited)${pending ? ` · ${pending} still on trial` : ''}`}
        </span>
      </div>
      {msg[0] === 'err' && <p className={s.error}>{msg[1]}</p>}
      {msg[0] === 'ok' && <p className={s.notice}>{msg[1]}</p>}
    </section>
  );
}

function ShareToQueue({ share }) {
  // React warns about javascript: URLs in JSX; the bookmarklet is set as a plain DOM attribute instead.
  const link = useRef(null);
  useEffect(() => { if (link.current) link.current.setAttribute('href', share.bookmarklet); }, [share.bookmarklet]);
  const [msg, setMsg] = useState(['', '']);
  const copy = () => navigator.clipboard?.writeText(share.bookmarklet).then(() => setMsg(['ok', 'Bookmarklet copied. Make a new bookmark and paste it as the address.'])).catch(() => setMsg(['err', 'Could not copy.']));
  return (
    <section className={s.card}>
      <h2>Share to queue</h2>
      <p className={s.help}>
        Found something worth posting? Send it straight to the composer with the page title, your selected text and the link already filled in.
      </p>
      <div className={s.row}>
        <strong>Browser bookmarklet</strong>
        <span className={s.meta}>Drag this button to your bookmarks bar, then click it on any page. Select some text first to quote it.</span>
        <div className={s.actions}>
          <a ref={link} className={`${s.btn} ${s.btnDark}`} style={{ textDecoration: 'none', cursor: 'grab' }} onClick={(e) => { e.preventDefault(); copy(); }} draggable>Queue this page</a>
        </div>
      </div>
      <div className={s.row}>
        <strong>Phone and desktop Share sheet</strong>
        <span className={s.meta}>Install the app from your browser menu (Add to Home Screen, or Install). Schedule For You then shows up in the Share menu of other apps on Android and desktop Chrome and Edge. On iPhone, use the bookmarklet in Safari.</span>
      </div>
      <div className={s.row}>
        <strong>From anywhere</strong>
        <span className={s.url}>{share.app_url}?share=1&amp;text=…&amp;url=…</span>
        <span className={s.meta}>Any tool that can open a URL (Shortcuts, Zapier, a script) can prefill a post this way.</span>
      </div>
      {msg[0] === 'err' && <p className={s.error}>{msg[1]}</p>}
      {msg[0] === 'ok' && <p className={s.notice}>{msg[1]}</p>}
    </section>
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

const COMMENT_PLATFORMS = ['x', 'bluesky', 'threads', 'instagram', 'facebook', 'linkedin'];

function DefaultComments({ accounts, canEdit, reload }) {
  const list = accounts.filter((a) => COMMENT_PLATFORMS.includes(a.platform));
  const [values, setValues] = useState(() => Object.fromEntries(list.map((a) => [a.id, a.default_first_comment || ''])));
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(['', '']);
  useEffect(() => { setValues(Object.fromEntries(list.map((a) => [a.id, a.default_first_comment || '']))); }, [accounts]); // eslint-disable-line react-hooks/exhaustive-deps
  const save = async (a) => {
    setBusy(a.id);
    setMsg(['', '']);
    try {
      const text = (values[a.id] || '').trim();
      await api(`/api/v1/accounts/${a.id}`, { method: 'PATCH', body: { default_first_comment: text || null } });
      await reload();
      setMsg(['ok', text ? `Saved. Every post to @${a.username || a.display_name} without its own first comment gets this one.` : `Removed the default first comment for @${a.username || a.display_name}.`]);
    } catch (e) {
      setMsg(['err', e.message]);
    } finally {
      setBusy('');
    }
  };
  return (
    <section className={s.card}>
      <h2>Default first comments</h2>
      <p className={s.help}>
        Your hashtag set or standing link, posted under every post to the account right after it goes live, unless the post has a first comment of its own in the composer. Type a single <b>-</b> as a post&apos;s first comment to skip the default for that post.
      </p>
      {list.length === 0 && <p className={s.empty}>Connect an X, Bluesky, Threads, Instagram, Facebook or LinkedIn account first.</p>}
      {list.map((a) => (
        <div key={a.id} className={s.row}>
          <strong>{PLATFORM[a.platform] || a.platform} · @{a.username || a.display_name || '?'}</strong>
          <textarea className={s.textarea} rows={2} value={values[a.id] || ''} maxLength={2200} disabled={!canEdit} onChange={(e) => setValues((v) => ({ ...v, [a.id]: e.target.value }))} placeholder={a.platform === 'instagram' ? '#yourbrand #yourcity #whatyoudo' : 'e.g. Full story: https://yoursite.com/blog'} />
          {canEdit && (
            <div className={s.actions}>
              <button className={`${s.btn} ${s.btnDark}`} disabled={busy === a.id || (values[a.id] || '').trim() === (a.default_first_comment || '')} onClick={() => save(a)}>{busy === a.id ? 'Saving…' : 'Save'}</button>
              <span className={s.meta}>{(values[a.id] || '').length} characters</span>
            </div>
          )}
        </div>
      ))}
      {msg[0] === 'err' && <p className={s.error}>{msg[1]}</p>}
      {msg[0] === 'ok' && <p className={s.notice}>{msg[1]}</p>}
    </section>
  );
}

function SharedCalendar({ calendar, canEdit, reload }) {
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(['', '']);
  const run = async (key, fn, ok) => {
    setBusy(key);
    setMsg(['', '']);
    try {
      await fn();
      await reload();
      if (ok) setMsg(['ok', ok]);
    } catch (e) {
      setMsg(['err', e.message]);
    } finally {
      setBusy('');
    }
  };
  const copy = (text, what) => navigator.clipboard?.writeText(text).then(() => setMsg(['ok', `${what} copied.`])).catch(() => setMsg(['err', 'Could not copy. Select the link and copy it by hand.']));
  return (
    <section className={s.card}>
      <h2>Shared calendar</h2>
      <p className={s.help}>
        A read-only link to your schedule for clients and teammates, no account needed: what goes out when, to which accounts, with captions and media. It also comes as an iCal feed, so it shows up in Google Calendar, Apple Calendar or Outlook and stays up to date. Anyone with the link can see it; rotate it to cut off old copies.
      </p>
      {calendar?.enabled ? (
        <>
          <div className={s.row}>
            <strong>Web link</strong>
            <span className={s.url}>{calendar.url}</span>
            <div className={s.actions}>
              <button className={s.btn} onClick={() => copy(calendar.url, 'Calendar link')}>Copy link</button>
              <a className={s.btn} href={calendar.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>Open</a>
            </div>
          </div>
          <div className={s.row}>
            <strong>Calendar app (iCal)</strong>
            <span className={s.url}>{calendar.ics_url}</span>
            <span className={s.meta}>Google Calendar: Other calendars → + → From URL. Apple Calendar: File → New Calendar Subscription. Updates within about an hour.</span>
            <div className={s.actions}>
              <button className={s.btn} onClick={() => copy(calendar.ics_url, 'iCal link')}>Copy iCal link</button>
            </div>
          </div>
          {canEdit && (
            <div className={s.actions}>
              <button className={s.btn} disabled={!!busy} onClick={() => confirm('Replace the link? Everyone with the old one loses access.') && run('rotate', () => api('/api/v1/calendar-link', { method: 'POST', body: { rotate: true } }), 'New link made. Share it again with whoever needs it.')}>{busy === 'rotate' ? 'Rotating…' : 'Rotate link'}</button>
              <button className={`${s.btn} ${s.btnDanger}`} disabled={!!busy} onClick={() => confirm('Turn the shared calendar off?') && run('off', () => api('/api/v1/calendar-link', { method: 'DELETE' }), 'Shared calendar turned off.')}>Turn off</button>
            </div>
          )}
        </>
      ) : (
        <>
          <p className={s.empty}>Not shared.</p>
          {canEdit && (
            <div className={s.actions}>
              <button className={`${s.btn} ${s.btnDark}`} disabled={!!busy} onClick={() => run('on', () => api('/api/v1/calendar-link', { method: 'POST', body: {} }), 'Your calendar link is ready.')}>{busy === 'on' ? 'Creating…' : 'Create link'}</button>
            </div>
          )}
        </>
      )}
      {msg[0] === 'err' && <p className={s.error}>{msg[1]}</p>}
      {msg[0] === 'ok' && <p className={s.notice}>{msg[1]}</p>}
    </section>
  );
}

function LinkClicks({ on, utm, clicks, links, canEdit, reload }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(['', '']);
  const set = async (prefs, ok) => {
    setBusy(true);
    setMsg(['', '']);
    try {
      await api('/api/app/prefs', { method: 'PATCH', body: { prefs } });
      await reload();
      setMsg(['ok', ok]);
    } catch (e) {
      setMsg(['err', e.message]);
    } finally {
      setBusy(false);
    }
  };
  const flip = () => set({ trackLinks: !on }, !on ? 'Link clicks are now counted on every post that publishes from here on.' : 'Link tracking turned off. Existing short links keep working.');
  const flipUtm = () => set({ utm: !utm }, !utm ? 'UTM tags will be added to tracked links from the next post on.' : 'UTM tags turned off.');
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
          {on && (
            <label className={s.toggle} title="utm_source = the platform, utm_medium = social, utm_campaign = the post's first label">
              <input type="checkbox" checked={!!utm} disabled={busy} onChange={flipUtm} /> Add UTM tags for Google Analytics and the like
            </label>
          )}
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
  const [format, setFormat] = useState('json');
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
    const r = await run('add', () => api('/api/v1/webhooks', { method: 'POST', body: { url: url.trim(), events, format } }));
    if (r?.webhook) {
      setCreated(r.webhook);
      setUrl('');
    }
  };
  const flip = (e) => setEvents((xs) => (xs.includes(e) ? xs.filter((x) => x !== e) : [...xs, e]));
  return (
    <section className={s.card}>
      <h2>Webhooks</h2>
      <p className={s.help}>Send post results to Slack, Discord, Zapier, Make, n8n or your own server. For Slack or Discord, paste an incoming webhook URL and pick that format: you get a readable message with links. Other endpoints get a signed JSON POST.</p>
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
            {{ slack: 'Slack message', discord: 'Discord message', json: 'Signed JSON' }[h.format] || 'Signed JSON'} · {h.events.map((e) => EVENTS.find((x) => x[0] === e)?.[1] || e).join(', ')} · last delivery {ago(h.last_sent_at)}
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
            <input className={s.input} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://hooks.slack.com/services/… or https://hooks.zapier.com/…" inputMode="url" />
          </label>
          <label>
            <span>Send as</span>
            <select className={s.select} value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="json">Signed JSON (Zapier, Make, n8n, your server)</option>
              <option value="slack">Slack message</option>
              <option value="discord">Discord message</option>
            </select>
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
