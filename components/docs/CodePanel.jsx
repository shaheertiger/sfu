'use client';
import { useEffect, useState } from 'react';
import s from './docs.module.css';

const LANG_KEY = 'sfy-docs-lang';
const LANG_EVENT = 'sfy-docs-lang';

/** Copies `text` to the clipboard and says so for a moment. */
export function CopyButton({ text, label = 'Copy', className = '' }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 1600);
    return () => clearTimeout(t);
  }, [done]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand('copy');
      } catch {}
      el.remove();
    }
    setDone(true);
  };
  return (
    <button type="button" className={`${s.copy} ${className}`} onClick={copy} aria-label={done ? 'Copied' : `${label} to clipboard`}>
      {done ? 'Copied' : label}
    </button>
  );
}

/**
 * A dark code panel with optional language tabs and a copy button. Every pane is in the HTML
 * (inactive ones hidden), so the samples are readable without JavaScript. Panels with `sync`
 * share the reader's language choice across the page and remember it.
 */
export default function CodePanel({ title, status, panes, sync = false }) {
  const [active, setActive] = useState(0);
  const labels = panes.map((p) => p.label).join('|');

  useEffect(() => {
    if (!sync) return;
    const list = labels.split('|');
    const apply = (label) => {
      const n = list.indexOf(label);
      if (n >= 0) setActive(n);
    };
    try {
      const saved = window.localStorage.getItem(LANG_KEY);
      if (saved) apply(saved);
    } catch {}
    const on = (e) => apply(e.detail);
    window.addEventListener(LANG_EVENT, on);
    return () => window.removeEventListener(LANG_EVENT, on);
  }, [sync, labels]);

  const choose = (i) => {
    setActive(i);
    if (!sync) return;
    try {
      window.localStorage.setItem(LANG_KEY, panes[i].label);
    } catch {}
    window.dispatchEvent(new CustomEvent(LANG_EVENT, { detail: panes[i].label }));
  };

  return (
    <div className={s.panel}>
      <div className={s.panelHead}>
        <span className={s.panelTitle}>
          {title}
          {status != null && <span className={`${s.status} ${status >= 400 ? s.statusErr : ''}`}>{status}</span>}
        </span>
        {panes.length > 1 && (
          <div className={s.tabs} role="tablist" aria-label={`${title} language`}>
            {panes.map((p, i) => (
              <button key={p.label} type="button" role="tab" aria-selected={i === active} className={s.tab} onClick={() => choose(i)}>
                {p.label}
              </button>
            ))}
          </div>
        )}
        <CopyButton text={panes[active].text} className={s.panelCopy} />
      </div>
      {panes.map((p, i) => (
        <pre key={p.label} className={s.pre} hidden={i !== active} tabIndex={0} aria-label={`${title}${panes.length > 1 ? ` (${p.label})` : ''}`}>
          <code>{p.node}</code>
        </pre>
      ))}
    </div>
  );
}
