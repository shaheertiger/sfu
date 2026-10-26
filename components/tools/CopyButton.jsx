'use client';

import { useState } from 'react';
import s from './tools.module.css';
import { useToolText } from './locale';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers and some in-app browsers block the async clipboard API.
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    el.remove();
    return ok;
  }
}

export default function CopyButton({ text, label }) {
  const [done, setDone] = useState(false);
  const { t } = useToolText();
  return (
    <button
      type="button"
      className={`${s.copy} ${done ? s.copied : ''}`}
      disabled={!text}
      onClick={async () => {
        if (await copyText(text)) {
          setDone(true);
          setTimeout(() => setDone(false), 1400);
        }
      }}
      aria-live="polite"
    >
      {done ? t('copied') : label || t('copy')}
    </button>
  );
}

/** A copyable line of output, used by every generator. */
export function Result({ text, meta }) {
  return (
    <div className={s.result}>
      <span className={s.resultText}>
        {meta && <span className={s.resultMeta}>{meta}</span>}
        {text}
      </span>
      <CopyButton text={text} />
    </div>
  );
}

/** A row of single-choice buttons. */
export function Chips({ options, value, onChange, label }) {
  return (
    <div className={s.chips} role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" className={s.chip} aria-pressed={value === o.id} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
