'use client';

import { useMemo, useState } from 'react';
import s from './tools.module.css';
import CopyButton, { Chips, Result } from './CopyButton';
import { convert, stylesFor } from '@/lib/tools/unicode';
import { DISCORD_LIMITS, X_LIMITS, instagramLineBreaks, plainLength, stats, xLength } from '@/lib/tools/counters';
import { BIO_PLATFORMS, BIO_TONES, COMMENT_TONES, NAME_RULES, NAME_STYLES, generateBios, generateComments, generateNames } from '@/lib/tools/generators';

const fmt = (n) => n.toLocaleString('en-US');

export function FontTool({ config }) {
  const [text, setText] = useState(config.sample || 'Your text here');
  const styles = useMemo(() => stylesFor(config.group || 'all'), [config.group]);
  return (
    <div className={s.widget}>
      <label className={s.label}>
        Type your text
        <textarea className={s.textarea} value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Type something…" />
      </label>
      <div className={s.results}>
        {styles.map((st) => (
          <Result key={st.id} meta={st.name} text={convert(text, st.id)} />
        ))}
      </div>
    </div>
  );
}

function Meter({ value, limit }) {
  const pct = Math.min(100, (value / limit) * 100);
  return (
    <div className={s.meter} aria-hidden="true">
      <div className={`${s.meterFill} ${value > limit ? s.meterOver : ''}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function Stat({ num, label, tone }) {
  return (
    <div className={s.stat}>
      <div className={`${s.statNum} ${tone || ''}`}>{num}</div>
      <div className={s.statLabel}>{label}</div>
    </div>
  );
}

function XCounter() {
  const [text, setText] = useState('');
  const [premium, setPremium] = useState(false);
  const { length, urls } = xLength(text);
  const limit = premium ? X_LIMITS.premium : X_LIMITS.standard;
  const left = limit - length;
  const st = stats(text);
  const plain = plainLength(text);
  return (
    <div className={s.widget}>
      <label className={s.label}>
        Paste or write your post
        <textarea className={s.textarea} value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder="What’s happening?" />
      </label>
      <label className={s.toggle}>
        <input type="checkbox" checked={premium} onChange={(e) => setPremium(e.target.checked)} /> X Premium long post ({fmt(X_LIMITS.premium)} characters)
      </label>
      <Meter value={length} limit={limit} />
      <div className={s.stats} aria-live="polite">
        <Stat num={`${fmt(length)} / ${fmt(limit)}`} label="Counted by X" tone={left < 0 ? s.over : ''} />
        <Stat num={fmt(left)} label={left < 0 ? 'Characters over' : 'Characters left'} tone={left < 0 ? s.over : s.good} />
        <Stat num={fmt(st.words)} label="Words" />
        <Stat num={fmt(urls)} label="Links (23 each)" />
      </div>
      <div className={s.limits}>
        <div className={s.limit}><span>Bio (160)</span><span className={plain > X_LIMITS.bio ? s.over : s.good}>{plain > X_LIMITS.bio ? `${plain - X_LIMITS.bio} over` : 'Fits'}</span></div>
        <div className={s.limit}><span>Display name (50)</span><span className={plain > X_LIMITS.name ? s.over : s.good}>{plain > X_LIMITS.name ? `${plain - X_LIMITS.name} over` : 'Fits'}</span></div>
      </div>
    </div>
  );
}

function DiscordCounter() {
  const [text, setText] = useState('');
  const len = plainLength(text);
  const st = stats(text);
  return (
    <div className={s.widget}>
      <label className={s.label}>
        Paste or write your message
        <textarea className={s.textarea} value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder="Message #general" />
      </label>
      <div className={s.stats} aria-live="polite">
        <Stat num={fmt(len)} label="Characters" />
        <Stat num={fmt(st.words)} label="Words" />
        <Stat num={fmt(st.lines)} label="Lines" />
      </div>
      <div className={s.limits}>
        {DISCORD_LIMITS.map((l) => (
          <div key={l.id} className={s.limit}>
            <span>{l.label} ({fmt(l.limit)})</span>
            <span className={len > l.limit ? s.over : s.good}>{len > l.limit ? `${fmt(len - l.limit)} over` : `${fmt(l.limit - len)} left`}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CounterTool({ config }) {
  return config.mode === 'discord' ? <DiscordCounter /> : <XCounter />;
}

export function LineBreakTool() {
  const [text, setText] = useState('First line of your caption.\n\nA new paragraph that keeps its space.\n\n.\n.\n#hashtags #below');
  const out = instagramLineBreaks(text);
  return (
    <div className={s.widget}>
      <label className={s.label}>
        Write your caption or bio with the spacing you want
        <textarea className={s.textarea} value={text} onChange={(e) => setText(e.target.value)} rows={8} />
      </label>
      <div className={s.result}>
        <span className={s.resultText}>
          <span className={s.resultMeta}>Ready to paste · {fmt(plainLength(out))} / 2,200 characters</span>
          {out}
        </span>
        <CopyButton text={out} label="Copy caption" />
      </div>
      <p className={s.hint}>Empty lines get an invisible character so Instagram keeps them. Trailing spaces are removed.</p>
    </div>
  );
}

export function NameTool({ config }) {
  const rule = NAME_RULES[config.rule] || NAME_RULES.generic;
  const [keyword, setKeyword] = useState(config.sample || '');
  const [style, setStyle] = useState('cool');
  const [seed, setSeed] = useState(0);
  const names = useMemo(() => generateNames({ keyword, style, platform: config.rule, seed }), [keyword, style, config.rule, seed]);
  return (
    <div className={s.widget}>
      <label className={s.label}>
        A word about you or your topic
        <input className={s.input} value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g. coffee, travel, pixel" maxLength={40} />
      </label>
      <Chips options={NAME_STYLES} value={style} onChange={setStyle} label="Style" />
      <div className={s.results}>
        {names.map((n) => (
          <Result key={n} text={n} />
        ))}
      </div>
      <div className={s.row}>
        <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={() => setSeed((x) => x + 1)}>More ideas</button>
        <p className={s.hint}>
          {rule.label}: {rule.min}–{rule.max} characters{rule.mode === 'handle' ? ', allowed characters only' : ''}. Check availability on the platform before you settle on one.
        </p>
      </div>
    </div>
  );
}

export function BioTool({ config }) {
  const platform = BIO_PLATFORMS[config.platform] || BIO_PLATFORMS.instagram;
  const [role, setRole] = useState(config.role || '');
  const [topic, setTopic] = useState(config.topic || '');
  const [tone, setTone] = useState('friendly');
  const [emoji, setEmoji] = useState(true);
  const [seed, setSeed] = useState(0);
  const bios = useMemo(() => generateBios({ role, topic, tone, platform: config.platform, emoji, seed }), [role, topic, tone, config.platform, emoji, seed]);
  return (
    <div className={s.widget}>
      <div className={s.row}>
        <label className={s.label}>
          What you do
          <input className={s.input} value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. photographer" maxLength={40} />
        </label>
        <label className={s.label}>
          What you post about
          <input className={s.input} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. street photos" maxLength={60} />
        </label>
      </div>
      <Chips options={BIO_TONES} value={tone} onChange={setTone} label="Tone" />
      <label className={s.toggle}>
        <input type="checkbox" checked={emoji} onChange={(e) => setEmoji(e.target.checked)} /> Include emoji
      </label>
      <div className={`${s.results} ${platform.long ? s.resultsWide : ''}`}>
        {bios.map((b) => (
          <Result key={b} text={b} meta={`${fmt(plainLength(b))} / ${fmt(platform.limit)} characters`} />
        ))}
      </div>
      <div className={s.row}>
        <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={() => setSeed((x) => x + 1)}>More ideas</button>
        <p className={s.hint}>Edit any bio to make it yours: specifics beat templates.</p>
      </div>
    </div>
  );
}

export function CommentTool({ config }) {
  const [topic, setTopic] = useState('latte art');
  const [tone, setTone] = useState('supportive');
  const [seed, setSeed] = useState(0);
  const comments = useMemo(() => generateComments({ topic, tone, platform: config.platform, seed }), [topic, tone, config.platform, seed]);
  return (
    <div className={s.widget}>
      <label className={s.label}>
        What is the post about?
        <input className={s.input} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. your morning routine" maxLength={80} />
      </label>
      <Chips options={COMMENT_TONES} value={tone} onChange={setTone} label="Tone" />
      <div className={`${s.results} ${s.resultsWide}`}>
        {comments.map((c) => (
          <Result key={c} text={c} />
        ))}
      </div>
      <div className={s.row}>
        <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={() => setSeed((x) => x + 1)}>More ideas</button>
        <p className={s.hint}>Starting points only. Edit each one so it’s genuinely yours, and never post the same comment in bulk.</p>
      </div>
    </div>
  );
}
