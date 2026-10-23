'use client';

import { useMemo, useRef, useState } from 'react';
import s from './tools.module.css';
import CopyButton, { Chips, Result } from './CopyButton';
import { HANDLE_RULES, checkHandle, handleVariations } from '@/lib/tools/handles';
import { TAG_LIMIT, TITLE_LIMIT, checkTitle, generateTags, tagsLength } from '@/lib/tools/youtube';
import { compareLists, parseExport } from '@/lib/tools/instagram-export';
import { convert, toPlain } from '@/lib/tools/unicode';
import { plainLength } from '@/lib/tools/counters';

const fmt = (n) => n.toLocaleString('en-US');

/* Instagram / TikTok handle checker ------------------------------------------------------------- */

export function HandleTool({ config }) {
  const platform = config.platform;
  const rule = HANDLE_RULES[platform];
  const [value, setValue] = useState(config.sample || '');
  const res = checkHandle(value, platform);
  const ideas = useMemo(() => (res.handle ? handleVariations(res.handle, platform) : []), [res.handle, platform]);
  return (
    <div className={s.widget}>
      <label className={s.label}>
        {rule.label} {platform === 'tiktok' ? 'username' : 'handle'}
        <input className={s.input} value={value} onChange={(e) => setValue(e.target.value)} placeholder={platform === 'tiktok' ? 'yourname' : 'your.name'} maxLength={60} autoCapitalize="none" autoCorrect="off" spellCheck={false} />
      </label>
      {res.handle && (
        <div className={s.limits} aria-live="polite">
          <div className={s.limit}>
            <span>Format</span>
            <span className={res.ok ? s.good : s.over}>{res.ok ? `Follows ${rule.label}’s rules` : 'Not allowed'}</span>
          </div>
          {res.problems.map((p) => (
            <div key={p} className={s.limit}>
              <span className={s.over}>{p}</span>
            </div>
          ))}
          <div className={s.limit}>
            <span>Length</span>
            <span>{fmt(Array.from(res.handle).length)} / {rule.max}</span>
          </div>
        </div>
      )}
      {res.ok && (
        <div className={s.row}>
          <a className={`${s.btn} ${s.btnPrimary}`} href={rule.profile(res.handle)} target="_blank" rel="noopener nofollow" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            Open {platform === 'tiktok' ? `tiktok.com/@${res.handle}` : `instagram.com/${res.handle}`}
          </a>
          <p className={s.hint}>If a profile opens, the name is taken. If not, it may still be held by a deactivated account: the only sure test is trying it in your profile settings.</p>
        </div>
      )}
      {ideas.length > 0 && (
        <>
          <p className={s.hint}>Close variations that follow the rules:</p>
          <div className={s.results}>
            {ideas.map((i) => (
              <Result key={i} text={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* LinkedIn text formatter -------------------------------------------------------------------------- */

const LI_STYLES = [
  { id: 'sansBold', label: 'Bold' },
  { id: 'sansItalic', label: 'Italic' },
  { id: 'sansBoldItalic', label: 'Bold italic' },
  { id: 'underline', label: 'Underline' },
  { id: 'strike', label: 'Strike' },
  { id: 'mono', label: 'Monospace' },
];
const LI_LIMIT = 3000;
const LI_FOLD = 210;

export function LinkedInTool() {
  const [text, setText] = useState('Three lessons from my first year freelancing:\n\nCharge for discovery calls.\nWrite the scope down.\nInvoice the same day.\n\nWhich one would you add?');
  const ref = useRef(null);

  function apply(fn) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b } = el;
    if (a === b) return;
    const next = text.slice(0, a) + fn(text.slice(a, b)) + text.slice(b);
    setText(next);
    requestAnimationFrame(() => {
      el.focus();
      const delta = next.length - text.length;
      el.setSelectionRange(a, b + delta);
    });
  }

  function lines(prefix) {
    const el = ref.current;
    if (!el) return;
    let { selectionStart: a, selectionEnd: b } = el;
    a = text.lastIndexOf('\n', a - 1) + 1;
    const end = text.indexOf('\n', b);
    b = end < 0 ? text.length : end;
    let n = 0;
    const block = text
      .slice(a, b)
      .split('\n')
      .map((l) => {
        const clean = l.replace(/^(?:• |\d+\. )/, '');
        if (!clean.trim()) return l;
        n++;
        return prefix === 'num' ? `${n}. ${clean}` : prefix === 'bullet' ? `• ${clean}` : clean;
      })
      .join('\n');
    setText(text.slice(0, a) + block + text.slice(b));
  }

  const len = plainLength(text);
  const fold = Array.from(text).slice(0, LI_FOLD).join('');
  const foldLines = fold.split('\n').slice(0, 3).join('\n');
  const preview = text.length > foldLines.length ? `${foldLines.trimEnd()}… more` : text;
  return (
    <div className={s.widget}>
      <div className={s.chips} role="toolbar" aria-label="Formatting">
        {LI_STYLES.map((st) => (
          <button key={st.id} type="button" className={s.chip} onMouseDown={(e) => e.preventDefault()} onClick={() => apply((t) => convert(toPlain(t), st.id))}>
            {st.label}
          </button>
        ))}
        <button type="button" className={s.chip} onMouseDown={(e) => e.preventDefault()} onClick={() => apply(toPlain)}>Plain</button>
        <button type="button" className={s.chip} onMouseDown={(e) => e.preventDefault()} onClick={() => lines('bullet')}>• List</button>
        <button type="button" className={s.chip} onMouseDown={(e) => e.preventDefault()} onClick={() => lines('num')}>1. List</button>
      </div>
      <label className={s.label}>
        Your post (select words, then pick a style)
        <textarea ref={ref} className={s.textarea} value={text} onChange={(e) => setText(e.target.value)} rows={9} />
      </label>
      <div className={s.stats}>
        <div className={s.stat}>
          <div className={`${s.statNum} ${len > LI_LIMIT ? s.over : ''}`}>{fmt(len)} / {fmt(LI_LIMIT)}</div>
          <div className={s.statLabel}>Characters</div>
        </div>
      </div>
      <div className={s.result}>
        <span className={s.resultText}>
          <span className={s.resultMeta}>Roughly what shows before “…more” in the feed</span>
          {preview}
        </span>
      </div>
      <div className={s.row}>
        <CopyButton text={text} label="Copy post" />
        <p className={s.hint}>Styled letters are Unicode characters: keep names, hashtags and key search words plain.</p>
      </div>
    </div>
  );
}

/* YouTube title checker ------------------------------------------------------------------------------ */

export function TitleTool() {
  const [title, setTitle] = useState('How to Make Cold Brew at Home (3 Easy Steps)');
  const [keyword, setKeyword] = useState('cold brew');
  const res = checkTitle(title, keyword);
  return (
    <div className={s.widget}>
      <label className={s.label}>
        Video title
        <input className={s.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Your video title" maxLength={200} />
      </label>
      <label className={s.label}>
        Target keyword (optional)
        <input className={s.input} value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g. cold brew" maxLength={60} />
      </label>
      <div className={s.stats} aria-live="polite">
        <div className={s.stat}>
          <div className={`${s.statNum} ${res.score >= 75 ? s.good : res.score < 50 ? s.over : ''}`}>{res.score} / 100</div>
          <div className={s.statLabel}>Checklist score</div>
        </div>
        <div className={s.stat}>
          <div className={`${s.statNum} ${res.length > TITLE_LIMIT ? s.over : ''}`}>{res.length} / {TITLE_LIMIT}</div>
          <div className={s.statLabel}>Characters</div>
        </div>
      </div>
      <div className={s.limits}>
        {res.checks.map((c) => (
          <div key={c.id} className={s.limit} style={{ flexDirection: 'column', gap: 4 }}>
            <span>
              <span className={c.pass === true ? s.good : c.pass === false ? s.over : ''}>{c.pass === true ? '✓' : c.pass === false ? '✗' : '–'}</span> {c.label}
            </span>
            {c.pass !== true && <span className={s.hint}>{c.tip}</span>}
          </div>
        ))}
      </div>
      <p className={s.hint}>A checklist of common title practices, not a prediction of views. Your thumbnail and the video itself matter more.</p>
    </div>
  );
}

/* YouTube tag generator ------------------------------------------------------------------------------- */

export function TagTool() {
  const [topic, setTopic] = useState('cold brew');
  const [extra, setExtra] = useState('coffee, iced coffee');
  const [removed, setRemoved] = useState([]);
  const tags = useMemo(() => generateTags(topic, extra).filter((t) => !removed.includes(t)), [topic, extra, removed]);
  const used = tagsLength(tags);
  const list = tags.join(', ');
  return (
    <div className={s.widget}>
      <div className={s.row}>
        <label className={s.label}>
          Video topic
          <input className={s.input} value={topic} onChange={(e) => { setTopic(e.target.value); setRemoved([]); }} placeholder="e.g. cold brew" maxLength={60} />
        </label>
        <label className={s.label}>
          Extra keywords (comma separated)
          <input className={s.input} value={extra} onChange={(e) => { setExtra(e.target.value); setRemoved([]); }} placeholder="e.g. coffee, iced coffee" maxLength={200} />
        </label>
      </div>
      <div className={s.chips} aria-label="Tags (tap to remove)">
        {tags.map((t) => (
          <button key={t} type="button" className={s.chip} onClick={() => setRemoved((r) => [...r, t])} title="Remove">
            {t} ✕
          </button>
        ))}
      </div>
      <div className={s.stats}>
        <div className={s.stat}>
          <div className={`${s.statNum} ${used > TAG_LIMIT ? s.over : ''}`}>{used} / {TAG_LIMIT}</div>
          <div className={s.statLabel}>Characters as YouTube counts them</div>
        </div>
        <div className={s.stat}>
          <div className={s.statNum}>{tags.length}</div>
          <div className={s.statLabel}>Tags</div>
        </div>
      </div>
      <div className={s.row}>
        <CopyButton text={list} label="Copy tags" />
        {removed.length > 0 && <button type="button" className={s.btn} onClick={() => setRemoved([])}>Restore removed</button>}
      </div>
      <p className={s.hint}>YouTube counts the commas between tags and the quotes it adds around tags with spaces.</p>
    </div>
  );
}

/* Instagram unfollowers checker ---------------------------------------------------------------------- */

export function UnfollowersTool() {
  const [files, setFiles] = useState({ followers: null, following: null });
  const [error, setError] = useState('');
  const [view, setView] = useState('notBack');
  const input = useRef(null);

  async function load(list) {
    setError('');
    const next = { ...files };
    for (const f of Array.from(list || [])) {
      const parsed = parseExport(await f.text(), f.name);
      if (parsed.error) {
        setError(`${f.name}: ${parsed.error}`);
        continue;
      }
      const kind = parsed.kind === 'unknown' ? (next.followers ? 'following' : 'followers') : parsed.kind;
      next[kind] = { name: f.name, users: parsed.usernames };
    }
    setFiles(next);
  }

  const ready = files.followers && files.following;
  const res = ready ? compareLists(files.followers.users, files.following.users) : null;
  const list = res ? (view === 'notBack' ? res.notBack : res.fans) : [];
  return (
    <div className={s.widget}>
      <div className={s.drop} role="button" tabIndex={0} onClick={() => input.current?.click()} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); load(e.dataTransfer.files); }}>
        <strong style={{ color: '#f6f5f1' }}>Choose your followers and following files</strong>
        <span>From Instagram’s “Download your information” export (JSON or HTML). Read on your device only.</span>
        <input ref={input} type="file" accept=".json,.html,application/json,text/html" multiple hidden onChange={(e) => load(e.target.files)} />
      </div>
      <div className={s.limits}>
        <div className={s.limit}><span>Followers file</span><span className={files.followers ? s.good : ''}>{files.followers ? `${files.followers.name} · ${fmt(files.followers.users.size)}` : 'Not added'}</span></div>
        <div className={s.limit}><span>Following file</span><span className={files.following ? s.good : ''}>{files.following ? `${files.following.name} · ${fmt(files.following.users.size)}` : 'Not added'}</span></div>
      </div>
      {error && <p className={`${s.hint} ${s.over}`}>{error}</p>}
      {res && (
        <>
          <Chips
            options={[
              { id: 'notBack', label: `Don’t follow you back · ${fmt(res.notBack.length)}` },
              { id: 'fans', label: `You don’t follow back · ${fmt(res.fans.length)}` },
            ]}
            value={view}
            onChange={setView}
            label="List"
          />
          <div className={s.results}>
            {list.slice(0, 500).map((u) => (
              <div key={u} className={s.result}>
                <span className={s.resultText}>@{u}</span>
                <a className={s.copy} href={`https://www.instagram.com/${u}/`} target="_blank" rel="noopener nofollow" style={{ textDecoration: 'none' }}>Open</a>
              </div>
            ))}
          </div>
          {list.length > 500 && <p className={s.hint}>Showing the first 500 of {fmt(list.length)}.</p>}
          <div className={s.row}>
            <CopyButton text={list.map((u) => `@${u}`).join('\n')} label="Copy list" />
            <p className={s.hint}>Based on your export date, not live data. {fmt(res.mutual)} mutual follows.</p>
          </div>
        </>
      )}
    </div>
  );
}
