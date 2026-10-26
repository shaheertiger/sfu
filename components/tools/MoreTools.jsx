'use client';

import { useMemo, useRef, useState } from 'react';
import s from './tools.module.css';
import CopyButton, { Chips, Result } from './CopyButton';
import { HANDLE_RULES, checkEverywhere, checkHandle, checkList, handleVariations } from '@/lib/tools/handles';
import { TAG_LIMIT, TITLE_LIMIT, checkTitle, generateTags, tagsLength } from '@/lib/tools/youtube';
import { compareLists, parseExport } from '@/lib/tools/instagram-export';
import { convert, toPlain } from '@/lib/tools/unicode';
import { plainLength } from '@/lib/tools/counters';
import { SHADOWBAN_PLATFORMS, VERDICT_TEXT, shadowbanVerdict } from '@/lib/tools/shadowban';
import { CAPTION_CTAS, CAPTION_STYLES, TIKTOK_CAPTION_LIMIT, generateCaptions } from '@/lib/tools/generators';

const fmt = (n) => n.toLocaleString('en-US');

/* Username / handle checkers --------------------------------------------------------------------- */

const PLACEHOLDER = { instagram: 'your.name', tiktok: 'yourname', youtube: 'yourchannel', twitch: 'yourname', discord: 'yourname', roblox: 'YourName', telegram: 'yourname', x: 'yourname', reddit: 'yourname' };
const linkBtn = { textDecoration: 'none', display: 'inline-flex', alignItems: 'center' };
const profileHost = (url) => url.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, '');

function ListCheck({ platform }) {
  const rule = HANDLE_RULES[platform];
  const [text, setText] = useState('');
  const rows = useMemo(() => checkList(text, platform), [text, platform]);
  const okCount = rows.filter((r) => r.ok).length;
  return (
    <>
      <label className={s.label}>
        One {rule.noun} per line (or separated by commas), up to 200
        <textarea className={s.textarea} value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder={`${PLACEHOLDER[platform] || 'yourname'}\n${PLACEHOLDER[platform] || 'yourname'}_2`} autoCapitalize="none" autoCorrect="off" spellCheck={false} />
      </label>
      {rows.length > 0 && (
        <>
          <p className={s.hint} aria-live="polite">{fmt(okCount)} of {fmt(rows.length)} follow {rule.label}’s rules.</p>
          <div className={s.limits}>
            {rows.map((r) => (
              <div key={r.handle} className={s.limit}>
                <span>
                  {r.ok && rule.profile ? (
                    <a href={rule.profile(r.handle)} target="_blank" rel="noopener nofollow">{r.handle}</a>
                  ) : (
                    r.handle
                  )}
                </span>
                <span className={r.ok ? s.good : s.over}>{r.ok ? 'Follows the rules' : r.problems[0]}</span>
              </div>
            ))}
          </div>
          <CopyButton text={rows.filter((r) => r.ok).map((r) => r.handle).join('\n')} label="Copy the valid ones" />
        </>
      )}
    </>
  );
}

export function HandleTool({ config }) {
  return config.platform === 'all' ? <AllHandlesTool config={config} /> : <OneHandleTool config={config} />;
}

function OneHandleTool({ config }) {
  const platform = config.platform;
  const rule = HANDLE_RULES[platform];
  const [mode, setMode] = useState('one');
  const [value, setValue] = useState(config.sample || '');
  const res = checkHandle(value, platform);
  const ideas = useMemo(() => (res.handle ? handleVariations(res.handle, platform) : []), [res.handle, platform]);
  const profile = res.ok && rule.profile ? rule.profile(res.handle) : null;
  return (
    <div className={s.widget}>
      <Chips options={[{ id: 'one', label: `Check one ${rule.noun}` }, { id: 'list', label: 'Check a list' }]} value={mode} onChange={setMode} label="Mode" />
      {mode === 'list' ? (
        <ListCheck platform={platform} />
      ) : (
        <>
          <label className={s.label}>
            {rule.label} {rule.noun}
            <input className={s.input} value={value} onChange={(e) => setValue(e.target.value)} placeholder={PLACEHOLDER[platform] || 'yourname'} maxLength={60} autoCapitalize="none" autoCorrect="off" spellCheck={false} />
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
          {profile && (
            <div className={s.row}>
              <a className={`${s.btn} ${s.btnPrimary}`} href={profile} target="_blank" rel="noopener nofollow" style={linkBtn}>
                Open {profileHost(profile)}
              </a>
              <p className={s.hint}>
                {platform === 'roblox'
                  ? 'This opens Roblox’s user search: an exact match in the results means the name is taken. Roblox’s sign-up form gives the final answer.'
                  : 'If a profile opens, the name is taken. If not, it may still be held by a deactivated or banned account: the only sure test is trying it in the app’s settings or sign-up form.'}
              </p>
            </div>
          )}
          {res.ok && !rule.profile && (
            <p className={s.hint}>{rule.label} has no public profile page you can open by {rule.noun}, so the only way to see whether it’s free is to try it in the app: User Settings → My Account → Username.</p>
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
        </>
      )}
    </div>
  );
}

/** One name against every platform's rules, with a profile link per platform. */
function AllHandlesTool({ config }) {
  const [value, setValue] = useState(config.sample || '');
  const rows = useMemo(() => checkEverywhere(value), [value]);
  const clean = String(value).trim().replace(/^@+/, '');
  const okCount = rows.filter((r) => r.ok).length;
  return (
    <div className={s.widget}>
      <label className={s.label}>
        Username to check
        <input className={s.input} value={value} onChange={(e) => setValue(e.target.value)} placeholder="yourname" maxLength={60} autoCapitalize="none" autoCorrect="off" spellCheck={false} />
      </label>
      {clean && (
        <>
          <p className={s.hint} aria-live="polite">Fits the rules on {okCount} of {rows.length} platforms.</p>
          <div className={s.limits}>
            {rows.map((r) => (
              <div key={r.platform} className={s.limit}>
                <span>
                  <strong>{r.label}</strong>
                  {!r.ok && <> · <span className={s.over}>{r.problems[0]}</span></>}
                </span>
                <span>
                  {r.ok ? (
                    r.profile ? (
                      <a href={r.profile} target="_blank" rel="noopener nofollow" className={s.good}>Fits · open profile</a>
                    ) : (
                      <span className={s.good}>Fits · check in the app</span>
                    )
                  ) : (
                    <span className={s.over}>Not allowed</span>
                  )}
                </span>
              </div>
            ))}
          </div>
          <p className={s.hint}>A profile that opens means the name is taken there. A page that says the account doesn’t exist usually means it’s free, but deactivated and banned accounts can still hold a name: the sign-up or settings screen has the final word.</p>
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

/* TikTok caption generator ------------------------------------------------------------------------- */

export function CaptionTool() {
  const [topic, setTopic] = useState('sourdough bread');
  const [style, setStyle] = useState('hook');
  const [cta, setCta] = useState('follow');
  const [tags, setTags] = useState('sourdough, baking');
  const [seed, setSeed] = useState(0);
  const captions = useMemo(() => generateCaptions({ topic, style, cta, hashtags: tags, seed }), [topic, style, cta, tags, seed]);
  return (
    <div className={s.widget}>
      <div className={s.row}>
        <label className={s.label}>
          What is the video about?
          <input className={s.input} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. sourdough bread" maxLength={80} />
        </label>
        <label className={s.label}>
          Your hashtags (up to 5)
          <input className={s.input} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. baking, sourdough" maxLength={120} />
        </label>
      </div>
      <Chips options={CAPTION_STYLES} value={style} onChange={setStyle} label="Style" />
      <Chips options={CAPTION_CTAS} value={cta} onChange={setCta} label="Call to action" />
      <div className={`${s.results} ${s.resultsWide}`}>
        {captions.map((c) => (
          <Result key={c} text={c} meta={`${fmt(plainLength(c))} / ${fmt(TIKTOK_CAPTION_LIMIT)} characters`} />
        ))}
      </div>
      <div className={s.row}>
        <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={() => setSeed((x) => x + 1)}>More ideas</button>
        <p className={s.hint}>Starting points from templates: edit the first line so it sounds like you.</p>
      </div>
    </div>
  );
}

/* Guided shadowban test --------------------------------------------------------------------------- */

const VERDICT_TONE = { unknown: '', clear: s.good, watch: '', likely: s.over, confirmed: s.over };

export function ShadowbanTool({ config }) {
  const fixed = config.platform && SHADOWBAN_PLATFORMS[config.platform] ? config.platform : null;
  const [platform, setPlatform] = useState(fixed || 'x');
  const [handle, setHandle] = useState('');
  const [answers, setAnswers] = useState({});
  const p = SHADOWBAN_PLATFORMS[platform];
  const h = handle.trim().replace(/^@+/, '');
  const verdict = shadowbanVerdict(platform, answers);
  const text = VERDICT_TEXT[verdict.level];
  const pick = (id) => {
    setPlatform(id);
    setAnswers({});
  };
  return (
    <div className={s.widget}>
      {!fixed && <Chips options={Object.entries(SHADOWBAN_PLATFORMS).map(([id, x]) => ({ id, label: x.label }))} value={platform} onChange={pick} label="Platform" />}
      <label className={s.label}>
        {p.handle} (optional, fills in the test links)
        <input className={s.input} value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="yourname" maxLength={60} autoCapitalize="none" autoCorrect="off" spellCheck={false} />
      </label>
      <p className={s.hint}>Where to check your status: {p.status}.</p>
      <div className={s.limits}>
        {p.checks.map((c, i) => (
          <div key={c.id} className={s.limit} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
            <span>
              <strong>{i + 1}. {c.q}</strong>
              <br />
              <span className={s.hint}>{c.how}</span>
              {c.link && h && (
                <>
                  {' '}
                  <a href={c.link(h)} target="_blank" rel="noopener nofollow">Open the test</a>
                </>
              )}
            </span>
            <Chips options={[{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }, { id: 'skip', label: 'Not sure' }]} value={answers[c.id] || ''} onChange={(v) => setAnswers((a) => ({ ...a, [c.id]: v }))} label={c.q} />
          </div>
        ))}
      </div>
      <div className={s.result} aria-live="polite">
        <span className={s.resultText}>
          <span className={s.resultMeta}>{verdict.answered} of {verdict.total} tests answered</span>
          <strong className={VERDICT_TONE[verdict.level]}>{text.title}</strong>
          <br />
          {text.body}
        </span>
      </div>
      <p className={s.hint}>Nothing is sent anywhere: this page can’t see inside {p.label}, so the verdict only reflects your answers.</p>
    </div>
  );
}
