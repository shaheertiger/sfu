'use client';

import { useMemo, useState } from 'react';
import s from './tools.module.css';
import CopyButton from './CopyButton';
import { parseYouTubeLink, thumbnails } from '@/lib/tools/youtube-ids';

const linkBtn = { textDecoration: 'none', display: 'inline-flex', alignItems: 'center' };

const AVATAR_SIZES = [
  { label: 'Small', size: 88 },
  { label: 'Medium', size: 240 },
  { label: 'Large', size: 800 },
  { label: 'Original', size: 0 },
];

const download = (url, name) => `/api/public/youtube-avatar/image?u=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}`;
const fileName = (title, what) => `${String(title || 'youtube').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'youtube'}-${what}`;

/** YouTube PFP downloader: looks up a channel's profile picture and banner through our API. */
export function YouTubePfpTool() {
  const [q, setQ] = useState('');
  const [state, setState] = useState({ status: 'idle' });

  async function lookUp(e) {
    e.preventDefault();
    if (!q.trim()) return;
    setState({ status: 'loading' });
    try {
      const res = await fetch(`/api/public/youtube-avatar?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      if (!res.ok) setState({ status: 'error', message: data.error || 'Something went wrong. Try again.' });
      else setState({ status: 'done', data });
    } catch {
      setState({ status: 'error', message: 'Couldn’t reach the server. Check your connection and try again.' });
    }
  }

  const d = state.status === 'done' ? state.data : null;
  return (
    <div className={s.widget}>
      <form onSubmit={lookUp}>
        <label className={s.label}>
          Channel link, @handle or video link
          <input className={s.input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="https://www.youtube.com/@channelname" autoComplete="off" spellCheck={false} />
        </label>
        <div className={s.row}>
          <button type="submit" className={`${s.btn} ${s.btnPrimary}`} disabled={state.status === 'loading'}>
            {state.status === 'loading' ? 'Looking up…' : 'Get profile picture'}
          </button>
        </div>
      </form>
      {state.status === 'error' && <p className={s.hint} role="alert">{state.message}</p>}
      {d && (
        <div aria-live="polite">
          <div className={s.row} style={{ alignItems: 'center', gap: 16, marginTop: 16 }}>
            <img src={`${d.avatar}=s240`} alt={`${d.title} profile picture`} width={120} height={120} style={{ borderRadius: '50%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
            <div>
              <strong>{d.title}</strong>
              <p className={s.hint}><a href={d.channelUrl} target="_blank" rel="noopener nofollow">Open the channel</a></p>
            </div>
          </div>
          <div className={s.limits}>
            {AVATAR_SIZES.map((z) => {
              const url = `${d.avatar}=s${z.size}`;
              return (
                <div key={z.size} className={s.limit}>
                  <span>{z.label}{z.size ? ` (${z.size}×${z.size})` : ' (as uploaded)'}</span>
                  <span style={{ display: 'flex', gap: 10 }}>
                    <a href={url} target="_blank" rel="noopener nofollow">View</a>
                    <a href={download(url, fileName(d.title, z.size ? `pfp-${z.size}` : 'pfp-original'))}>Download</a>
                  </span>
                </div>
              );
            })}
          </div>
          {d.banner && (
            <>
              <img src={`${d.banner}=w1060`} alt={`${d.title} channel banner`} style={{ width: '100%', height: 'auto', borderRadius: 12, marginTop: 16 }} referrerPolicy="no-referrer" />
              <div className={s.row}>
                <a className={s.btn} style={linkBtn} href={`${d.banner}=s0`} target="_blank" rel="noopener nofollow">View full banner</a>
                <a className={`${s.btn} ${s.btnPrimary}`} style={linkBtn} href={download(`${d.banner}=s0`, fileName(d.title, 'banner'))}>Download banner</a>
              </div>
            </>
          )}
          <p className={s.hint}>Profile pictures and banners belong to the channel owner. Use them for reference, research or with permission, not to impersonate the channel or reuse its branding.</p>
        </div>
      )}
    </div>
  );
}

/** YouTube video ID finder: parses links in the browser, nothing is sent anywhere. */
export function YouTubeIdTool() {
  const [text, setText] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s');
  const r = useMemo(() => parseYouTubeLink(text), [text]);
  const rows = r ? [
    r.videoId && ['Video ID', r.videoId],
    r.channelId && ['Channel ID', r.channelId],
    r.handle && ['Handle', r.handle],
    r.playlistId && ['Playlist ID', r.playlistId],
    r.start && ['Start time', r.start],
    r.videoId && ['Short link', `https://youtu.be/${r.videoId}`],
    r.videoId && ['Embed link', `https://www.youtube.com/embed/${r.videoId}`],
  ].filter(Boolean) : [];
  return (
    <div className={s.widget}>
      <label className={s.label}>
        Paste a YouTube link
        <input className={s.input} value={text} onChange={(e) => setText(e.target.value)} placeholder="https://youtu.be/…" autoComplete="off" spellCheck={false} />
      </label>
      {!r && text.trim() && <p className={s.hint} role="alert">That doesn’t look like a YouTube link. Paste a watch, youtu.be, Shorts, live, embed or channel link.</p>}
      {rows.length > 0 && (
        <div className={s.limits} aria-live="polite">
          {rows.map(([k, v]) => (
            <div key={k} className={s.limit}>
              <span>{k}</span>
              <span style={{ display: 'flex', gap: 10, alignItems: 'center', fontFamily: 'ui-monospace, monospace' }}>{v} <CopyButton text={v} /></span>
            </div>
          ))}
        </div>
      )}
      {r?.videoId && (
        <div className={s.limits}>
          {thumbnails(r.videoId).map((t) => (
            <div key={t.url} className={s.limit}>
              <span>Thumbnail: {t.label}</span>
              <a href={t.url} target="_blank" rel="noopener nofollow">Open</a>
            </div>
          ))}
        </div>
      )}
      <p className={s.hint}>Everything runs in your browser. The link isn’t sent anywhere.</p>
    </div>
  );
}
