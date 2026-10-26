'use client';

import { useMemo, useState } from 'react';
import s from './tools.module.css';
import { Chips } from './CopyButton';
import { useToolText } from './locale';
import { PACES, READING, TARGETS, countScript, formatDuration, readingSeconds, speakingSeconds, targetFit, targetLabel } from '@/lib/tools/readtime';

const T = {
  en: {
    script: 'Your script or caption',
    placeholder: 'Paste or type what you will say. Japanese, English or a mix of both.',
    pace: 'Speaking pace',
    paces: { slow: 'Slow', normal: 'Normal', fast: 'Fast' },
    jaChars: 'Japanese characters',
    words: 'Words',
    chars: 'Characters (no spaces)',
    speaking: 'Speaking time',
    reading: 'Reading time',
    target: 'Target length',
    shortVideo: 'Short video (Reels · TikTok · Shorts)',
    longer: 'Longer',
    custom: 'Custom',
    minutes: 'Minutes',
    fits: (t, ja, en) => `${t} fits about ${en} words of English or ${ja} Japanese characters at this pace.`,
    unitJa: 'characters',
    unitEn: 'words',
    over: (n, unit, sec) => `${n} ${unit} over (${sec} too long). Cut a little.`,
    under: (n, unit, sec) => `${n} ${unit} to spare (${sec} under the target).`,
    onTarget: 'Right on target.',
    room: (n, unit) => `Room for about ${n} ${unit}.`,
    paceNote: (p) => `Based on ${p.ja} Japanese characters or ${p.en} words a minute out loud (announcers read Japanese at about 300 a minute), and ${READING.ja} characters or ${READING.en} words a minute read silently. Everyone speaks at their own speed: time one take and adjust the pace.`,
  },
  ja: {
    script: '台本・キャプション',
    placeholder: '話す内容を貼り付けるか入力してください。日本語・英語・混在どれでもOKです。',
    pace: '話す速さ',
    paces: { slow: 'ゆっくり', normal: 'ふつう', fast: 'はやい' },
    jaChars: '文字数',
    words: '英単語数',
    chars: '総文字数（空白なし）',
    speaking: '読み上げ時間',
    reading: '黙読時間',
    target: '目標の長さ',
    shortVideo: 'ショート動画（リール・TikTok・ショート）',
    longer: '長め',
    custom: 'カスタム',
    minutes: '分',
    fits: (t, ja, en) => `この速さなら${t}で日本語は約${ja}文字、英語は約${en}語です。`,
    unitJa: '文字',
    unitEn: '語',
    over: (n, unit, sec) => `${n}${unit}オーバー（${sec}長い）。少し削りましょう。`,
    under: (n, unit, sec) => `あと${n}${unit}入ります（目標より${sec}短い）。`,
    onTarget: 'ちょうど目標どおりです。',
    room: (n, unit) => `約${n}${unit}まで入ります。`,
    paceNote: (p) => `声に出す速さは日本語${p.ja}文字/分・英語${p.en}語/分、黙読は日本語${READING.ja}文字/分・英語${READING.en}語/分で計算しています（アナウンサーの読む速さは1分あたり約300文字といわれます）。話す速さは人それぞれなので、一度実際に読んで計り、速さを調整してください。`,
  },
};

const PACE_IDS = ['slow', 'normal', 'fast'];
const SHORT = [15, 30, 60, 90, 180];

export function ReadTimeTool({ config = {} }) {
  const { locale, num } = useToolText();
  const tx = T[locale] || T.en;
  const [text, setText] = useState('');
  const [pace, setPace] = useState('normal');
  const initial = Number(config.defaultTarget) > 0 ? Number(config.defaultTarget) : 60;
  const [target, setTarget] = useState(TARGETS.includes(initial) ? initial : 'custom');
  const [customMin, setCustomMin] = useState(TARGETS.includes(initial) ? '2' : String(+(initial / 60).toFixed(2)));

  const counts = useMemo(() => countScript(text), [text]);
  const seconds = target === 'custom' ? Math.max(0, Math.min(600, Number(customMin) || 0)) * 60 : target;
  const fit = targetFit(counts, seconds, pace, locale === 'ja' ? 'ja' : 'en');
  const speak = speakingSeconds(counts, pace);
  const read = readingSeconds(counts);
  const empty = counts.ja + counts.words === 0;
  const unit = fit.unit === 'ja' ? tx.unitJa : tx.unitEn;
  const targetText = targetLabel(Math.round(seconds), locale);
  const pct = seconds ? Math.min(100, (speak / seconds) * 100) : 0;
  const over = fit.diffSeconds > 0.5;

  let verdict;
  if (empty) verdict = tx.room(num(fit.fit), unit);
  else if (fit.diff > 0 && over) verdict = tx.over(num(fit.diff), unit, formatDuration(fit.diffSeconds));
  else if (fit.diff < 0 && fit.diffSeconds < -0.5) verdict = tx.under(num(-fit.diff), unit, formatDuration(-fit.diffSeconds));
  else verdict = tx.onTarget;

  const chip = (secs) => ({ id: secs, label: targetLabel(secs, locale) });
  return (
    <div className={s.widget}>
      <label className={s.label}>
        {tx.script}
        <textarea className={s.textarea} value={text} onChange={(e) => setText(e.target.value)} rows={7} placeholder={tx.placeholder} />
      </label>
      <div className={s.row}>
        <span className={s.hint}>{tx.pace}</span>
        <Chips options={PACE_IDS.map((id) => ({ id, label: tx.paces[id] }))} value={pace} onChange={setPace} label={tx.pace} />
      </div>
      <div className={s.stats} aria-live="polite">
        <div className={s.stat}>
          <div className={s.statNum}>{formatDuration(speak)}</div>
          <div className={s.statLabel}>{tx.speaking}</div>
        </div>
        <div className={s.stat}>
          <div className={s.statNum}>{formatDuration(read)}</div>
          <div className={s.statLabel}>{tx.reading}</div>
        </div>
        <div className={s.stat}>
          <div className={s.statNum}>{num(counts.ja)}</div>
          <div className={s.statLabel}>{tx.jaChars}</div>
        </div>
        <div className={s.stat}>
          <div className={s.statNum}>{num(counts.words)}</div>
          <div className={s.statLabel}>{tx.words}</div>
        </div>
        <div className={s.stat}>
          <div className={s.statNum}>{num(counts.chars)}</div>
          <div className={s.statLabel}>{tx.chars}</div>
        </div>
      </div>

      <fieldset style={{ border: 0, padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
        <legend style={{ fontSize: 15, fontWeight: 600, color: '#f6f5f1', padding: 0, marginBottom: 10 }}>{tx.target}</legend>
        <span className={s.hint}>{tx.shortVideo}</span>
        <Chips options={SHORT.map(chip)} value={target} onChange={setTarget} label={tx.shortVideo} />
        <span className={s.hint}>{tx.longer}</span>
        <div className={s.row}>
          <Chips options={[chip(300), { id: 'custom', label: tx.custom }]} value={target} onChange={setTarget} label={tx.longer} />
          {target === 'custom' && (
            <label className={s.toggle}>
              <input
                className={s.input}
                style={{ width: 96 }}
                type="number"
                inputMode="decimal"
                min="0.25"
                max="10"
                step="0.25"
                value={customMin}
                onChange={(e) => setCustomMin(e.target.value)}
                aria-label={tx.minutes}
              />
              {tx.minutes}
            </label>
          )}
        </div>
      </fieldset>

      <div className={s.limits} aria-live="polite">
        <div className={s.meter} aria-hidden="true">
          <div className={`${s.meterFill} ${over ? s.meterOver : ''}`} style={{ width: `${pct}%` }} />
        </div>
        <div className={s.limit}>
          <span>
            {formatDuration(speak)} / {formatDuration(seconds)}
          </span>
          <strong className={over ? s.over : s.good}>{verdict}</strong>
        </div>
        {!empty && (
          <div className={s.limit}>
            <span>{fit.unit === 'ja' ? tx.jaChars : tx.words}</span>
            <span>
              {num(fit.current)} / {num(fit.fit)}
            </span>
          </div>
        )}
      </div>
      <p className={s.hint}>{tx.fits(targetText, num(fit.jaFit), num(fit.enFit))}</p>
      <p className={s.hint}>{tx.paceNote(PACES[pace])}</p>
    </div>
  );
}
