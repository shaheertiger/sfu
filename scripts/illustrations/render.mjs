/**
 * Card renderer shared by scripts/blog-illustrations.mjs (blog and tool pages) and
 * scripts/programmatic-figures.mjs (does-it-notify, best-time, specs). Turns a card spec into
 * HTML styled by system.css, screenshots it in Chromium at deviceScaleFactor 2 and writes WebP
 * (quality 86) at the card's size plus a 720-px-wide variant:
 *   <base>-1200x675.webp and <base>-720x405.webp
 * The size in the file name gives the <img> its width and height.
 *
 * Card types and fields (all optional unless marked):
 *   hero       title*, sub, chips[], big (the key number; taken from the title when left out),
 *              icons[] (names from icons.mjs; picked from the title when left out), dark
 *   steps      title*, steps[]* ({ title, text, highlight? }), 3–5 steps
 *   versus     title*, left* { label, tone: good|bad|neutral, items[] }, right* { ... }
 *   checklist  title*, good* { label, items[] }, bad { label, items[] }
 *   bars       title*, rows[]* ({ label, value 0-100, note })
 *   lists      title*, a { label, items[] }, b { ... }, result { ... }   (a − b = result)
 *              or groups[] ({ label, items[] }), 2–3 groups side by side
 *   callout    quote*, by
 *   answer     answer* ("No." / "2,000 characters"), question, qualifier, tone: yes|no|partly|neutral,
 *              mark (icon in the verdict disc), icons[]
 *   spec       value* ("1080 × 1350" or "2,200"), unit ("px", "characters"), what (what it applies
 *              to), others[] ({ value, label }, up to 4), shape: frame|lines (drawn from the value)
 *   grid       title*, values* (7 × 24, weekday 0 = Sunday, 0–100), top[] ({ weekday, hour }, the
 *              best slots, up to 3), focus (a weekday to keep bright), note (the data source)
 *   matrix     title*, cols[]*, rows[]* ({ label, cells[]: yes|no|partly|na|text, hl? }),
 *              legend { yes, no, partly }, legendNote — max 6 columns; one column with many rows flows
 *              into 2–3; dense: true (with a taller card, height) takes up to 10 columns with upright headers
 *   path       title*, crumbs[]* (menu labels, in order), note (default: labels change between versions)
 *   compare    title*, cols[3]* (e.g. ["Native", "Other tools", "Schedule For You"]), us (index of
 *              our column, default 2), rows[]* ({ label, cells[3]: true|false|"partly"|text })
 * Every card also takes: name* (file suffix), kicker (shown in the folio), dark, height (default 675).
 * `**text**` in titles and quotes is set in italic; in body text it is bold. Lime is applied by
 * the layout (the key number, the top slot, the highlighted step), never by the copy.
 *
 * Only draw what's true: diagrams in our style, never logos or mock screenshots of other apps.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { icon, topicIcons } from './icons.mjs';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
export const W = 1200;
export const H = 675;
const VERSION = 'figures-v2';
const CSS_FILE = path.join(HERE, 'system.css');

const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const title = (s = '') => esc(s).replace(/\*\*(.+?)\*\*/g, '<em>$1</em>');
const rich = (s = '') => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
const plain = (s = '') => String(s).replace(/\*\*/g, '');
const font = (f) => pathToFileURL(path.join(ROOT, 'public', 'fonts', f)).href;
const FONTS = `
@font-face { font-family: Geist; font-weight: 100 900; src: url(${font('geist-normal-100-900-latin.woff2')}) format('woff2'); }
@font-face { font-family: Geist; font-weight: 100 900; src: url(${font('geist-normal-100-900-latin-ext.woff2')}) format('woff2'); unicode-range: U+0100-024F, U+1E00-1EFF; }
@font-face { font-family: 'Geist Mono'; font-weight: 500; src: url(${font('geist-mono-normal-500-latin.woff2')}) format('woff2'); }
@font-face { font-family: 'Bodoni Moda'; font-style: italic; font-weight: 400 900; src: url(${font('bodoni-moda-italic-400-900-latin.woff2')}) format('woff2'); }
@font-face { font-family: 'Bodoni Moda'; font-style: normal; font-weight: 400 900; src: url(${font('bodoni-moda-normal-400-900-latin.woff2')}) format('woff2'); }`;

/** Small deterministic PRNG so each page's hero differs but re-renders identically. */
function rng(seed) {
  let h = 2166136261;
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The key number of a hero: a short emphasised phrase ("No.") or the first figure in the title. */
export function keyNumber(t = '') {
  const bold = /\*\*(.+?)\*\*/.exec(t)?.[1]?.trim();
  if (bold && bold.length <= 6) return bold;
  const src = plain(t);
  const m = /(?:\$\d[\d,.]*(?:[–-]\$?\d[\d,.]*)?|\d[\d,.]*\s?(?:K|M|%|x)?)(?![\d])/.exec(src);
  if (!m) return null;
  const v = m[0].trim();
  // Years are not key numbers.
  if (/^(19|20)\d\d$/.test(v)) return null;
  return v.length <= 9 ? v : null;
}

const TONE_ICON = { good: 'check', bad: 'cross', neutral: 'dot', mid: 'tilde' };
const li = (items = [], tone = 'neutral') => `<ul>${items.map((i) => `<li><span class="${tone}">${icon(TONE_ICON[tone] || 'dot', 30)}</span><span>${rich(i)}</span></li>`).join('')}</ul>`;
const col = (c, tone = c.tone || 'neutral', ink = false) => `<div class="col${ink ? ' ink' : ''}"><div class="label"><span class="${tone}">${icon(TONE_ICON[tone] || 'dot', 34, 'tone')}</span>${esc(c.label)}</div>${li(c.items, tone)}</div>`;
const mk = (v, size = 26) => {
  if (v === true || v === 'yes') return `<span class="mk yes">${icon('check', size)}</span>`;
  if (v === false || v === 'no') return `<span class="mk no">${icon('cross', size)}</span>`;
  if (v === 'partly' || v === '~') return `<span class="mk partly">${icon('tilde', size)}</span>`;
  if (v === 'na' || v == null || v === '') return `<span class="mk na">—</span>`;
  return `<span>${rich(v)}</span>`;
};

/* ---------- hero composition ---------- */
function composition(card, seed) {
  const r = rng(`${seed}:${card.name}`);
  const big = card.big === undefined ? keyNumber(card.title) : card.big;
  const icons = card.icons || topicIcons(`${plain(card.title)} ${card.sub || ''}`, 3);
  const motif = card.motif || (['calendar', 'calendar', 'timeline'][Math.floor(r() * 3)]);
  const bigHtml = big ? `<div class="big" data-fitw="392" style="font-size:${big.length <= 3 ? 230 : big.length <= 5 ? 190 : 150}px">${esc(big)}</div>` : '';
  if (motif === 'timeline') {
    const pins = new Set();
    while (pins.size < 4) pins.add(Math.floor(r() * 24));
    const list = [...pins].sort((a, b) => a - b);
    const lime = list[Math.floor(r() * list.length)];
    const y = big ? 150 : 260;
    const pinHtml = list.map((h) => `<i class="pin${h === lime ? ' l' : ''}" style="left:${(h / 23) * 368 + (h === lime ? -8 : 0)}px;top:${y - (h === lime ? 19 : 11)}px"></i>`).join('');
    return `<div class="comp"><div class="icons" style="top:${y - 120}px;left:0">${icons.map((n) => icon(n, 56)).join('')}</div><div class="line" style="top:${y}px"></div><div class="ticks" style="top:${y + 18}px">${'<span></span>'.repeat(24)}</div>${pinHtml}${bigHtml}</div>`;
  }
  const rows = 9;
  const total = rows * 7;
  const offset = Math.floor(r() * 5);
  // With a key number, the bottom rows stay as bare outlines: the number sits on them like ink on a planner page.
  const open = big ? 5 * 7 : total;
  const cells = Array.from({ length: total }, (_, i) => (i < offset ? 'e' : ''));
  const free = () => {
    for (let k = 0; k < 200; k++) {
      const i = offset + Math.floor(r() * (open - offset));
      if (!cells[i]) return i;
    }
    return -1;
  };
  for (let k = 0; k < Math.round(open * 0.16); k++) { const i = free(); if (i >= 0) cells[i] = 'f'; }
  const limeAt = free();
  if (limeAt >= 0) cells[limeAt] = 'l';
  const iconAt = icons.map((n) => { const i = free(); if (i >= 0) cells[i] = `icon:${n}`; return i; });
  void iconAt;
  const cellHtml = cells.map((c) => (c.startsWith('icon:') ? `<i class="icon">${icon(c.slice(5), 34)}</i>` : `<i class="${c}"></i>`)).join('');
  return `<div class="comp"><div class="cal">${cellHtml}</div>${bigHtml}</div>`;
}

/* ---------- spec drawing ---------- */
function specDrawing(card, seed) {
  const m = /(\d[\d,]*)\s*[×x]\s*(\d[\d,]*)/.exec(card.value || '');
  if (m && card.shape !== 'lines') {
    const w = Number(m[1].replace(/,/g, ''));
    const h = Number(m[2].replace(/,/g, ''));
    const box = card.what && card.what.length > 44 ? 250 : 290;
    const s = box / Math.max(w, h);
    const fw = Math.max(40, Math.round(w * s));
    const fh = Math.max(40, Math.round(h * s));
    return `<div style="width:${box + 70}px;height:${box + 44}px;display:flex;align-items:flex-end;justify-content:flex-start;padding:36px 0 0 0;"><div class="frame" style="width:${fw}px;height:${fh}px"><span class="dim" style="left:0;top:-34px">${esc(m[1])}</span><span class="dim" style="left:calc(100% + 12px);bottom:0">${esc(m[2])}</span></div></div>`;
  }
  // A count (characters, hashtags): bars for the main value and the others, to scale.
  const num = (v) => Number(String(v).replace(/[^\d.]/g, '')) || 0;
  // Only plain counts in the same unit are comparable; sizes (W × H) and other units are left out.
  const vals = [{ v: num(card.value), main: true }, ...(card.others || []).slice(0, 4).filter((o) => /^\s*[\d,.]+\s*$/.test(o.value) && (!o.unit || o.unit === card.unit)).map((o) => ({ v: num(o.value) }))].filter((x) => x.v > 0);
  if (vals.length < 2 || !/^\s*[\d,.]+\s*$/.test(card.value || '')) return '';
  const max = Math.max(...vals.map((x) => x.v));
  if (vals[0].v !== max) return '';
  return `<div style="display:flex;align-items:flex-end;gap:14px;height:300px;padding-bottom:4px">${vals.map((x) => `<div style="width:44px;height:${Math.max(4, (x.v / max) * 290)}px;border-radius:4px;${x.main ? 'background:var(--lime);box-shadow:inset 0 0 0 2px var(--ink)' : 'background:var(--ink);opacity:.85'}"></div>`).join('')}</div>`;
}

/* ---------- heatmap ---------- */
const DAYS_MON = [1, 2, 3, 4, 5, 6, 0];
const DAY3 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const hourLabel = (h) => `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? 'AM' : 'PM'}`;
function heat(card) {
  const top = (card.top || []).slice(0, 3);
  const rank = (d, h) => top.findIndex((t) => t.weekday === d && t.hour === h);
  const rows = DAYS_MON.map((d) => {
    const dim = card.focus != null && card.focus !== d;
    const cells = card.values[d].map((v, h) => {
      const k = rank(d, h);
      const pct = Math.round(6 + (Math.max(0, Math.min(100, v)) / 100) * 82);
      return `<div class="c${k >= 0 ? ' top' : ''}" style="background:color-mix(in srgb, var(--ink) ${pct}%, var(--paper));${dim ? 'opacity:.28;' : ''}">${k >= 0 ? k + 1 : ''}</div>`;
    }).join('');
    return `<div class="d"${dim ? ' style="color:var(--sec)"' : ''}>${DAY3[d]}</div>${cells}`;
  }).join('');
  const ticks = [0, 6, 12, 18].map((h) => `<div class="h" style="grid-column:${h + 2} / span 6">${hourLabel(h)}</div>`).join('');
  const slots = top.map((t, i) => `<div class="slot"><span class="k">${i + 1}</span>${DAY3[t.weekday]} <span class="mono">${hourLabel(t.hour)}</span></div>`).join('');
  return `<div class="heat" style="grid-template-columns:76px repeat(24, 1fr);grid-template-rows:repeat(7, 38px) 28px;">${rows}<div></div>${ticks}</div>
  <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:24px"><div class="toprow">${slots}</div><div class="scale" style="flex:none;padding-bottom:10px">Quiet ${[8, 30, 55, 88].map((p) => `<i style="background:color-mix(in srgb, var(--ink) ${p}%, var(--paper))"></i>`).join('')} Busy</div></div>`;
}

/* ---------- matrix ---------- */
function matrix(card) {
  const legend = card.legend ? `<div class="legend">${['yes', 'no', 'partly'].filter((k) => card.legend[k]).map((k) => `<span>${mk(k, 18)}${esc(card.legend[k])}</span>`).join('')}${card.legendNote ? `<span>${esc(card.legendNote)}</span>` : ''}</div>` : '';
  if (card.cols.length === 1 && card.rows.length > 6) {
    const n = card.rows.length > 14 ? 3 : 2;
    const per = Math.ceil(card.rows.length / n);
    const size = per > 9 ? 24 : 26;
    const items = card.rows.map((r) => `<div class="item${r.hl ? ' hl' : ''}"><div class="rl" style="font-size:${size}px">${rich(r.label)}</div>${mk(r.cells[0], 22).replace('class="mk', 'style="width:38px;height:38px" class="mk')}</div>`).join('');
    return `<div class="flow" style="grid-template-columns:repeat(${n}, 1fr);grid-template-rows:repeat(${per}, auto);grid-auto-flow:column;">${items}</div>${legend}`;
  }
  const n = card.cols.length;
  const head = `<div class="ch" style="text-align:left;padding-left:0">${esc(card.corner || '')}</div>${card.cols.map((c) => `<div class="ch">${esc(c)}</div>`).join('')}`;
  const body = card.rows.map((r) => `<div class="rl${r.hl ? ' hl' : ''}">${rich(r.label)}</div>${r.cells.map((v) => `<div class="cell${r.hl ? ' hl' : ''}">${mk(v)}</div>`).join('')}`).join('');
  return `<div class="matrix${card.dense ? ' dense' : ''}" style="grid-template-columns:${card.dense ? '400px' : 'minmax(320px, 1.6fr)'} repeat(${n}, 1fr)">${head}${body}</div>${legend}`;
}

function body(card, seed) {
  const h2 = card.title ? `<h2 data-fit data-min="40">${title(card.title)}</h2>` : '';
  switch (card.type) {
    case 'hero':
      return `<div class="split"><div class="copy"><h1 data-fit data-min="46">${title(card.title)}</h1>${card.sub ? `<p class="sub" data-fit data-min="24">${rich(card.sub)}</p>` : ''}${(card.chips || []).length ? `<div class="chips">${card.chips.map((c) => `<span class="chip">${esc(c)}</span>`).join('')}</div>` : ''}</div>${composition(card, seed)}</div>`;
    case 'steps': {
      const n = card.steps.length;
      return `${h2}<div class="body"><div class="steps n${n}">${card.steps.map((s, i) => `<div class="step${s.highlight ? ' hl' : ''}"><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="t">${rich(s.title)}</span>${s.text ? `<span class="x">${rich(s.text)}</span>` : ''}</div>`).join('')}</div></div>`;
    }
    case 'versus':
      return `${h2}<div class="body"><div class="cols">${col(card.left, card.left.tone || 'neutral', card.left.tone === 'bad')}${col(card.right, card.right.tone || 'neutral', card.right.tone === 'bad' && card.left.tone !== 'bad')}</div></div>`;
    case 'checklist':
      if (!card.bad) return `${h2}<div class="body"><div class="cols"><div class="col"><div class="label"><span class="good">${icon('check', 34, 'tone')}</span>${esc(card.good.label)}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:14px 40px">${card.good.items.map((i) => li([i], 'good').replace('<ul>', '<ul style="gap:0">')).join('')}</div></div></div></div>`;
      return `${h2}<div class="body"><div class="cols">${col(card.good, 'good')}${col(card.bad, 'bad', true)}</div></div>`;
    case 'lists': {
      if (card.groups) {
        const n = card.groups.length;
        return `${h2}<div class="body groups"><div class="cols${n === 4 ? ' quad' : ''}">${card.groups.map((g) => `<div class="col"><div class="label">${esc(g.label)}</div>${g.items ? li(g.items, 'neutral') : `<p class="gt">${rich(g.text || '')}</p>`}</div>`).join('')}</div></div>`;
      }
      const users = (c, miss = []) => `<div class="col"><div class="label">${esc(c.label)}</div><ul>${c.items.map((u) => `<li class="user${miss.includes(u) ? ' miss' : ''}">${esc(u)}</li>`).join('')}</ul></div>`;
      return `${h2}<div class="body"><div class="cols">${users(card.a)}<span class="op">−</span>${users(card.b)}<span class="op">=</span><div class="col result"><div class="label">${esc(card.result.label)}</div><ul>${card.result.items.map((u) => `<li class="user">${esc(u)}</li>`).join('')}</ul></div></div></div>`;
    }
    case 'bars': {
      const max = Math.max(...card.rows.map((r) => r.value));
      return `${h2}<div class="body"><div class="bars">${card.rows.map((r) => `<div class="bar${r.value === max ? ' top' : ''}"><span class="l">${esc(r.label)}</span><span class="track"><span class="fill" style="width:${Math.max(2, r.value)}%"></span></span><span class="note">${esc(r.note || '')}</span></div>`).join('')}</div></div>`;
    }
    case 'callout':
      return `<p class="q" data-fit data-min="40">${title(card.quote)}</p>${card.by ? `<p class="by">${esc(card.by)}</p>` : ''}`;
    case 'answer': {
      const mark = card.mark || { no: 'cross', yes: 'check', partly: 'tilde' }[card.tone] || 'dot';
      const long = plain(card.answer).length > 9;
      const icons = card.icons || [];
      return `${card.question ? `<p class="ask" data-fit data-min="24">${rich(card.question)}</p>` : ''}<div class="row"><div><div class="a${long ? ' long' : ''}" data-fit data-min="${long ? 56 : 120}">${title(card.answer)}</div>${card.qualifier ? `<p class="qual" data-fit data-min="22">${rich(card.qualifier)}</p>` : ''}</div><div class="side">${icons.length ? `<div class="icons">${icons.map((n) => icon(n, 52)).join('')}</div>` : ''}<div class="verdict">${icon(mark, 84)}</div></div></div>`;
    }
    case 'spec': {
      const v = esc(card.value).replace(/\s*[×x]\s*/, '<span class="x">×</span>');
      const others = (card.others || []).slice(0, 4);
      return `${card.what ? (others.length ? `<p class="what">${rich(card.what)}</p>` : `<h2 data-fit data-min="40">${title(card.what)}</h2>`) : ''}<div class="main"><div style="min-width:0"><div class="v" data-fitw="620" style="font-size:${plain(card.value).length > 7 ? 156 : 200}px">${v}</div>${card.unit ? `<div class="u"><mark>${esc(card.unit)}</mark>${card.unitNote ? `<span class="un">${esc(card.unitNote)}</span>` : ''}</div>` : ''}</div>${specDrawing(card, seed)}</div>${others.length ? `<div class="others">${others.map((o) => `<div><b>${esc(o.value)}</b><span>${esc(o.label)}</span></div>`).join('')}</div>` : ''}`;
    }
    case 'grid':
      return `${h2}<div class="body">${heat(card)}</div>`;
    case 'matrix':
      return `${h2}<div class="body">${matrix(card)}</div>`;
    case 'path': {
      const crumbs = card.crumbs.map((c, i) => `<div class="crumb${i === card.crumbs.length - 1 ? ' last' : ''}" style="margin-left:${i * 64}px;${i ? 'margin-top:8px' : ''}">${i ? '<span class="elbow"></span>' : ''}<span class="chipx">${esc(c)}</span></div>`).join('');
      return `${h2}<div class="body"><div class="path">${crumbs}</div></div><p class="pnote">${icon('clock', 26)}${esc(card.note || 'Menu labels change between app versions.')}</p>`;
    }
    case 'compare': {
      const us = card.us ?? 2;
      const head = `<div class="hd"></div>${card.cols.map((c, i) => `<div class="hd${i === us ? ' us' : ''}">${esc(c)}</div>`).join('')}`;
      const rows = card.rows.map((r) => `<div class="rl">${rich(r.label)}</div>${r.cells.map((v, i) => `<div class="cell${i === us ? ' us' : ''}">${typeof v === 'boolean' || v === 'partly' || v === 'yes' || v === 'no' ? mk(v, 20) : rich(v)}</div>`).join('')}`).join('');
      return `${h2}<div class="body"><div class="cmp">${head}${rows}</div></div>`;
    }
    default:
      throw new Error(`Unknown card type "${card.type}"`);
  }
}

const FIT = `
(() => {
  const inner = document.querySelector('.inner');
  const over = () => inner.scrollHeight > inner.clientHeight + 1;
  for (const el of document.querySelectorAll('[data-fitw]')) {
    const max = Number(el.dataset.fitw);
    let s = parseFloat(getComputedStyle(el).fontSize);
    while (el.getBoundingClientRect().width > max && s > 40) { s -= 4; el.style.fontSize = s + 'px'; }
  }
  const fits = [...document.querySelectorAll('[data-fit]')];
  for (let pass = 0; pass < 80 && over(); pass++) {
    let shrunk = false;
    for (const el of fits) {
      const min = Number(el.dataset.min || 24);
      const s = parseFloat(getComputedStyle(el).fontSize);
      if (s > min) { el.style.fontSize = (s - 2) + 'px'; shrunk = true; }
    }
    if (!shrunk) break;
  }
  const box = inner.getBoundingClientRect();
  const bad = [];
  if (over()) bad.push('content taller than the card');
  const first = inner.firstElementChild && inner.firstElementChild.getBoundingClientRect();
  if (first && first.top < box.top - 2) bad.push('content spills above the card');
  for (const b of inner.querySelectorAll('.body')) if (b.scrollHeight > b.clientHeight + 2) { bad.push('body overflows'); break; }
  for (const el of inner.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width && (r.right > box.right + 2 || r.left < box.left - 2) && !el.closest('.comp')) { bad.push('wide: ' + (el.className || el.tagName) + ' ' + (el.textContent || '').slice(0, 40)); break; }
  }
  return bad;
})()`;

export function cardHtml(card, seed = '') {
  const css = fs.readFileSync(CSS_FILE, 'utf8');
  const dark = card.dark || card.type === 'callout';
  const height = card.height || H;
  const folio = `<div class="folio"><span class="wm">Schedule <b>For</b> You</span><span>${esc(card.kicker || '')}</span></div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${FONTS}${css}html,body{height:${height}px}.card{height:${height}px}</style></head><body><div class="card ${card.type}${dark ? ' dark' : ''}"><div class="inner">${body(card, seed)}</div>${folio}</div></body></html>`;
}

/** Content hash of everything that affects a card's pixels. */
export function cardHash(card, seed = '') {
  const css = fs.readFileSync(CSS_FILE, 'utf8');
  const self = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8');
  const icons = fs.readFileSync(path.join(HERE, 'icons.mjs'), 'utf8');
  return crypto.createHash('sha1').update(VERSION).update(css).update(self).update(icons).update(String(seed)).update(JSON.stringify(card)).digest('hex').slice(0, 16);
}

const MANIFEST = path.join(HERE, 'figure-hashes.json');
function readManifest() {
  try { return JSON.parse(fs.readFileSync(MANIFEST, 'utf8')); } catch { return {}; }
}

export const outName = (base, w = W, h = H) => `${base}-${w}x${h}.webp`;
export const smallName = (base, w = W, h = H) => `${base}-720x${Math.round((720 * h) / w)}.webp`;

async function launch() {
  const { chromium } = require('playwright');
  try {
    return await chromium.launch();
  } catch (err) {
    // No bundled browser (e.g. a CI image with Chrome installed): fall back to a system Chrome.
    const exe = process.env.CHROME_PATH || ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find((p) => fs.existsSync(p));
    if (!exe) throw err;
    return chromium.launch({ executablePath: exe });
  }
}

/**
 * Opens a browser and returns { render(card, base, seed), close() }. `base` is the absolute path
 * without the size suffix. Unchanged cards (same content hash, both files present) are skipped.
 */
export async function createRenderer({ force = false, quiet = false } = {}) {
  const browser = await launch();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  const manifest = readManifest();
  const stats = { rendered: 0, skipped: 0, warnings: [] };
  async function render(card, base, seed = '') {
    const height = card.height || H;
    const big = outName(base, W, height);
    const small = smallName(base, W, height);
    const key = path.relative(ROOT, big);
    const hash = cardHash(card, seed);
    if (!force && manifest[key] === hash && fs.existsSync(big) && fs.existsSync(small)) { stats.skipped++; return { skipped: true, file: big }; }
    await page.setViewportSize({ width: W, height });
    await page.setContent(cardHtml(card, seed), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const warn = await page.evaluate(FIT);
    if (warn.length) stats.warnings.push(`${key}: ${warn.join('; ')}`);
    const png = await page.screenshot({ type: 'png' });
    const out = await page.evaluate(async ({ b64, sizes }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      return sizes.map(([w, h]) => {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);
        return c.toDataURL('image/webp', 0.86).split(',')[1];
      });
    }, { b64: png.toString('base64'), sizes: [[W, height], [720, Math.round((720 * height) / W)]] });
    fs.mkdirSync(path.dirname(big), { recursive: true });
    fs.writeFileSync(big, Buffer.from(out[0], 'base64'));
    fs.writeFileSync(small, Buffer.from(out[1], 'base64'));
    manifest[key] = hash;
    stats.rendered++;
    if (!quiet) console.log(`${key}  ${(fs.statSync(big).size / 1024).toFixed(0)} KB${warn.length ? `  ⚠ ${warn.join('; ')}` : ''}`);
    return { skipped: false, file: big };
  }
  async function close() {
    const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
    fs.writeFileSync(MANIFEST, `${JSON.stringify(sorted, null, 0).replace(/,"/g, ',\n"')}\n`);
    await browser.close();
    return stats;
  }
  return { render, close, page, stats };
}
