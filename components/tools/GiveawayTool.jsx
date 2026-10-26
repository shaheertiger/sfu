'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import s from './tools.module.css';
import CopyButton from './CopyButton';
import { useToolText } from './locale';
import { MAX_ALTERNATES, MAX_WINNERS, cryptoRandomInt, drawWinners, parseEntries, resultsText } from '@/lib/tools/giveaway';

const T = {
  en: {
    entrants: 'Entrants',
    placeholder: 'One username per line or separated by commas.\n@alice\n@bob\n@carol',
    pasteHint: 'Copy the usernames from your comments and paste them here. A leading @ is removed.',
    dedupe: 'Remove duplicates',
    weight: 'Extra chance for each extra entry (one win per person)',
    winners: 'Winners',
    alternates: 'Alternates',
    exclude: 'Exclude (your own account, team members…)',
    excludePlaceholder: '@yourbrand, @staff',
    draw: 'Draw',
    again: 'Draw again',
    spinning: 'Spinning…',
    wheel: 'Wheel',
    wheelLabel: (n) => `Prize wheel with ${n} entrants`,
    count: (u, l, d, x) => `${u} entrants from ${l} lines` + (d ? ` · ${d} duplicates` : '') + (x ? ` · ${x} excluded` : ''),
    results: 'Draw results',
    drawn: 'Drawn',
    from: (n, e) => (e > n ? `from ${n} entrants (${e} entries)` : `from ${n} entrants`),
    settingsDedupe: 'duplicates removed',
    settingsWeighted: 'weighted by entries',
    settingsAll: 'every line counted',
    copy: 'Copy results',
    notEnough: 'Not enough entrants for every place.',
    empty: 'Add at least one entrant.',
    honest: 'This tool does not read comments from Instagram, TikTok, X or anywhere else: paste the entrants yourself. Winners are picked in your browser with crypto.getRandomValues. Check your platform’s promotion rules and your local laws before you run a giveaway.',
  },
  ja: {
    entrants: '参加者',
    placeholder: '1行に1人、またはカンマ区切りで入力\n@alice\n@bob\n@carol',
    pasteHint: 'コメント欄のユーザー名をコピーして貼り付けてください。先頭の @ は自動で外します。',
    dedupe: '重複を除く',
    weight: '複数回の応募は回数分だけ当たりやすくする（当選は1人1回）',
    winners: '当選者',
    alternates: '補欠',
    exclude: '除外する名前（自分のアカウント・スタッフなど）',
    excludePlaceholder: '@yourbrand, @staff',
    draw: '抽選する',
    again: 'もう一度抽選する',
    spinning: '抽選中…',
    wheel: 'ルーレット',
    wheelLabel: (n) => `参加者${n}人のルーレット`,
    count: (u, l, d, x) => `${l}行から参加者${u}人` + (d ? `・重複${d}件` : '') + (x ? `・除外${x}件` : ''),
    results: '抽選結果',
    drawn: '抽選日時',
    from: (n, e) => (e > n ? `参加者${n}人（応募${e}件）から抽選` : `参加者${n}人から抽選`),
    settingsDedupe: '重複を除外',
    settingsWeighted: '応募回数で重み付け',
    settingsAll: '全行を応募として数える',
    copy: '結果をコピー',
    notEnough: '参加者が足りず、すべての枠は埋まりませんでした。',
    empty: '参加者を1人以上入力してください。',
    honest: 'このツールはInstagram・TikTok・Xなどのコメントを読み込みません。参加者はご自身で貼り付けてください。当選者はブラウザ内で crypto.getRandomValues を使って選ばれます。キャンペーンを行う前に、各プラットフォームのプロモーション規約と景品表示法などの法令をご確認ください。',
  },
};

const SIZE = 640;
const R = SIZE / 2 - 14;
const COLORS = ['#dcff2e', '#5865f2', '#ff6b6b', '#25f4ee', '#ff9e00', '#b07cff', '#7ae582', '#ff7fdf'];
const LABEL_LIMIT = 200;

/** Segment start angles (radians, clockwise from the top) in proportion to each entrant's weight. */
function segments(pool) {
  const total = pool.reduce((n, e) => n + e.weight, 0) || 1;
  let a = 0;
  return pool.map((e) => {
    const start = a;
    a += (e.weight / total) * Math.PI * 2;
    return { name: e.name, start, end: a };
  });
}

/** Draws the static wheel once; each animation frame only rotates this image. */
function paintWheel(segs) {
  const c = document.createElement('canvas');
  c.width = c.height = SIZE;
  const ctx = c.getContext('2d');
  ctx.translate(SIZE / 2, SIZE / 2);
  if (!segs.length) {
    ctx.fillStyle = '#22252a';
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fill();
    return c;
  }
  const n = segs.length;
  segs.forEach((g, i) => {
    let color = COLORS[i % COLORS.length];
    if (i === n - 1 && n > 1 && i % COLORS.length === 0) color = COLORS[3];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, R, g.start - Math.PI / 2, g.end - Math.PI / 2);
    ctx.closePath();
    ctx.fill();
    if (n <= 400) {
      ctx.strokeStyle = '#131417';
      ctx.lineWidth = n > 60 ? 0.5 : 2;
      ctx.stroke();
    }
  });
  if (n <= LABEL_LIMIT) {
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    segs.forEach((g, i) => {
      const arc = (g.end - g.start) * R * 0.8;
      const size = Math.max(7, Math.min(22, arc * 0.75));
      ctx.save();
      ctx.rotate((g.start + g.end) / 2 - Math.PI / 2);
      ctx.font = `600 ${size}px system-ui, -apple-system, "Hiragino Sans", sans-serif`;
      ctx.fillStyle = [0, 3, 6].includes(i % COLORS.length) ? '#15171a' : '#ffffff';
      const name = Array.from(g.name);
      ctx.fillText(name.length > 18 ? name.slice(0, 17).join('') + '…' : g.name, R - 14, 0, R * 0.62);
      ctx.restore();
    });
  }
  return c;
}

function drawFrame(canvas, wheel, rotation) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.save();
  ctx.translate(SIZE / 2, SIZE / 2);
  ctx.rotate(rotation);
  ctx.drawImage(wheel, -SIZE / 2, -SIZE / 2);
  ctx.restore();
  ctx.fillStyle = '#131417';
  ctx.beginPath();
  ctx.arc(SIZE / 2, SIZE / 2, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f6f5f1';
  ctx.lineWidth = 4;
  ctx.stroke();
  // The pointer at the top.
  ctx.fillStyle = '#f6f5f1';
  ctx.beginPath();
  ctx.moveTo(SIZE / 2 - 18, 2);
  ctx.lineTo(SIZE / 2 + 18, 2);
  ctx.lineTo(SIZE / 2, 44);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#131417';
  ctx.lineWidth = 3;
  ctx.stroke();
}

function formatWhen(date, locale) {
  try {
    return date.toLocaleString(locale === 'ja' ? 'ja-JP' : locale, { dateStyle: 'medium', timeStyle: 'medium' });
  } catch {
    return date.toISOString();
  }
}

export function GiveawayTool({ config = {} }) {
  const { locale, num } = useToolText();
  const tx = T[locale] || T.en;
  const [text, setText] = useState('');
  const [dedupe, setDedupe] = useState(true);
  const [weight, setWeight] = useState(false);
  const [winners, setWinners] = useState(Math.min(MAX_WINNERS, Math.max(1, Number(config.winners) || 1)));
  const [alternates, setAlternates] = useState(0);
  const [exclude, setExclude] = useState('');
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const canvas = useRef(null);
  const wheel = useRef(null);
  const rotation = useRef(0);
  const frame = useRef(0);

  const parsed = useMemo(() => parseEntries(text, { dedupe, weight: dedupe && weight, exclude }), [text, dedupe, weight, exclude]);
  const segs = useMemo(() => segments(parsed.pool), [parsed]);

  useEffect(() => {
    cancelAnimationFrame(frame.current);
    setSpinning(false);
    setResult(null);
    wheel.current = paintWheel(segs);
    if (canvas.current) drawFrame(canvas.current, wheel.current, rotation.current);
  }, [segs, winners, alternates]);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  function draw() {
    if (!parsed.pool.length || spinning) return;
    const picked = drawWinners(parsed.pool, { winners, alternates });
    const entries = parsed.pool.reduce((n, e) => n + e.weight, 0);
    const next = { ...picked, at: new Date(), entrants: parsed.pool.length, entries, dedupe, weight: dedupe && weight };
    // Land the pointer somewhere inside the first winner's segment (not on an edge).
    const index = parsed.pool.findIndex((e) => e.name === picked.winners[0]);
    const g = segs[index];
    const mid = g.start + (g.end - g.start) * (0.15 + 0.7 * (cryptoRandomInt(1000) / 1000));
    const start = rotation.current;
    const TAU = Math.PI * 2;
    const end = start + 5 * TAU + ((((-mid - start) % TAU) + TAU) % TAU);
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const duration = reduce ? 600 : 5200;
    const t0 = performance.now();
    setResult(null);
    setSpinning(true);
    cancelAnimationFrame(frame.current);
    const step = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      rotation.current = start + (end - start) * eased;
      if (canvas.current && wheel.current) drawFrame(canvas.current, wheel.current, rotation.current);
      if (p < 1) frame.current = requestAnimationFrame(step);
      else {
        rotation.current = end % TAU;
        setSpinning(false);
        setResult(next);
      }
    };
    frame.current = requestAnimationFrame(step);
  }

  const when = result ? formatWhen(result.at, locale) : '';
  const fromText = result ? tx.from(num(result.entrants), result.entries) : '';
  const settings = result ? (result.dedupe ? (result.weight ? `${tx.settingsDedupe} · ${tx.settingsWeighted}` : tx.settingsDedupe) : tx.settingsAll) : '';
  const copyText = result
    ? resultsText(result, { header: tx.results, when: `${tx.drawn}: ${when}`, entrants: `${fromText} (${settings})`, winnersLabel: tx.winners, alternatesLabel: tx.alternates })
    : '';
  const short = result && result.winners.length + result.alternates.length < winners + alternates;
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

  return (
    <div className={s.widget}>
      <label className={s.label}>
        {tx.entrants}
        <textarea className={s.textarea} value={text} onChange={(e) => setText(e.target.value)} rows={7} placeholder={tx.placeholder} autoCapitalize="none" autoCorrect="off" spellCheck={false} />
      </label>
      <p className={s.hint} aria-live="polite">
        {parsed.lines ? tx.count(num(parsed.pool.length), num(parsed.lines), dedupe ? parsed.duplicates : 0, parsed.excluded) : tx.pasteHint}
      </p>
      <div className={s.row}>
        <label className={s.toggle}>
          <input type="checkbox" checked={dedupe} onChange={(e) => setDedupe(e.target.checked)} /> {tx.dedupe}
        </label>
        {dedupe && (
          <label className={s.toggle}>
            <input type="checkbox" checked={weight} onChange={(e) => setWeight(e.target.checked)} /> {tx.weight}
          </label>
        )}
      </div>
      <div className={s.row}>
        <label className={s.label} style={{ flex: '1 1 120px' }}>
          {tx.winners}
          <select className={s.select} value={winners} onChange={(e) => setWinners(Number(e.target.value))}>
            {range(1, MAX_WINNERS).map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label className={s.label} style={{ flex: '1 1 120px' }}>
          {tx.alternates}
          <select className={s.select} value={alternates} onChange={(e) => setAlternates(Number(e.target.value))}>
            {range(0, MAX_ALTERNATES).map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>
      <label className={s.label}>
        {tx.exclude}
        <input className={s.input} value={exclude} onChange={(e) => setExclude(e.target.value)} placeholder={tx.excludePlaceholder} autoCapitalize="none" autoCorrect="off" spellCheck={false} />
      </label>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <canvas ref={canvas} width={SIZE} height={SIZE} role="img" aria-label={`${tx.wheel}: ${tx.wheelLabel(num(parsed.pool.length))}`} style={{ width: '100%', maxWidth: 420, height: 'auto', display: 'block' }} />
      </div>
      <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={draw} disabled={!parsed.pool.length || spinning}>
        {spinning ? tx.spinning : result ? tx.again : tx.draw}
      </button>
      {!parsed.pool.length && parsed.lines > 0 && <p className={`${s.hint} ${s.over}`}>{tx.empty}</p>}

      <div aria-live="polite">
        {result && (
          <div className={s.limits} style={{ padding: 14, borderRadius: 14, background: '#0f1012', border: '1px solid #2a2e34' }}>
            <strong style={{ fontSize: 16, color: '#f6f5f1' }}>{tx.results}</strong>
            <span className={s.hint}>
              {tx.drawn}: {when}
              <br />
              {fromText} · {settings}
            </span>
            <strong className={s.good} style={{ fontSize: 14, marginTop: 6 }}>{tx.winners}</strong>
            <ol style={{ margin: 0, paddingLeft: 24, color: '#f6f5f1', fontSize: 18, fontWeight: 700, lineHeight: 1.6, wordBreak: 'break-all' }}>
              {result.winners.map((n, i) => <li key={i}>@{n}</li>)}
            </ol>
            {result.alternates.length > 0 && (
              <>
                <strong style={{ fontSize: 14, marginTop: 6, color: '#a7abb2' }}>{tx.alternates}</strong>
                <ol style={{ margin: 0, paddingLeft: 24, color: '#d6d9de', fontSize: 16, lineHeight: 1.6, wordBreak: 'break-all' }}>
                  {result.alternates.map((n, i) => <li key={i}>@{n}</li>)}
                </ol>
              </>
            )}
            {short && <span className={`${s.hint} ${s.over}`}>{tx.notEnough}</span>}
            <div className={s.row} style={{ marginTop: 6 }}>
              <CopyButton text={copyText} label={tx.copy} />
            </div>
          </div>
        )}
      </div>
      <p className={s.hint}>{tx.honest}</p>
    </div>
  );
}
