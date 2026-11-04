#!/usr/bin/env node
/**
 * Renders the illustration cards used inside blog posts (a hero image plus one picture per main
 * section) from a small JSON spec, so every guide gets the same image rhythm without stock art.
 *
 *   node scripts/blog-illustrations.mjs                  # every spec in scripts/illustrations/
 *   node scripts/blog-illustrations.mjs am-i-shadowbanned-twitter
 *
 * A spec is scripts/illustrations/<post-slug>.json: { "cards": [{ "name": "hero", "type": "hero", ... }] }.
 * Each card is written to public/images/blog/<post-slug>-<name>-1200x675.webp (rendered at 2x), and
 * the size in the name gives the <img> its width and height. Card types and their fields:
 *
 *   hero       kicker, title, sub, chips[]
 *   steps      kicker, title, steps[] ({ title, text, highlight? })
 *   versus     kicker, title, left { label, tone: good|bad|neutral, items[] }, right { ... }
 *   checklist  kicker, title, good { label, items[] }, bad { label, items[] }
 *   bars       kicker, title, rows[] ({ label, value 0-100, note })
 *   lists      kicker, title, a { label, items[] }, b { label, items[] }, result { label, items[] }
 *   callout    kicker, quote, by
 *
 * Only draw what's true: these are diagrams in our brand style, never mock screenshots of other apps.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = process.cwd();
const SPECS = path.join(ROOT, 'scripts', 'illustrations');
const OUT = path.join(ROOT, 'public', 'images', 'blog');
const W = 1200;
const H = 675;

const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// **bold** inside card text becomes a lime highlight.
const rich = (s = '') => esc(s).replace(/\*\*(.+?)\*\*/g, '<mark>$1</mark>');
const font = (f) => pathToFileURL(path.join(ROOT, 'public', 'fonts', f)).href;

const CSS = `
@font-face { font-family: Geist; font-weight: 100 900; src: url(${font('geist-normal-100-900-latin.woff2')}) format('woff2'); }
@font-face { font-family: 'Geist Mono'; font-weight: 500; src: url(${font('geist-mono-normal-500-latin.woff2')}) format('woff2'); }
@font-face { font-family: 'Bodoni Moda'; font-style: italic; font-weight: 400 900; src: url(${font('bodoni-moda-italic-400-900-latin.woff2')}) format('woff2'); }
@font-face { font-family: 'Bodoni Moda'; font-style: normal; font-weight: 400 900; src: url(${font('bodoni-moda-normal-400-900-latin.woff2')}) format('woff2'); }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: ${W}px; height: ${H}px; }
body { font-family: Geist, system-ui, sans-serif; color: #131417; background: #f6f5f1; overflow: hidden; }
.card { position: relative; width: ${W}px; height: ${H}px; padding: 56px 72px 86px; display: flex; flex-direction: column; }
.card.dark { background: #131417; color: #f6f5f1; }
.grid { position: absolute; inset: 0; background-image: radial-gradient(#d6d9de 1.2px, transparent 1.2px); background-size: 28px 28px; opacity: .55; }
.dark .grid { background-image: radial-gradient(#2a2e34 1.2px, transparent 1.2px); opacity: 1; }
.inner { position: relative; display: flex; flex-direction: column; height: 100%; }
.kicker { font-family: 'Geist Mono', monospace; font-size: 18px; letter-spacing: .14em; text-transform: uppercase; color: #6b7079; display: flex; align-items: center; gap: 12px; }
.dark .kicker { color: #a7abb2; }
.kicker::before { content: ''; width: 14px; height: 14px; border-radius: 50%; background: #dcff2e; box-shadow: 0 0 0 2px #131417; }
.dark .kicker::before { box-shadow: none; }
h1 { font-family: 'Bodoni Moda', serif; font-style: italic; font-weight: 600; letter-spacing: -.01em; line-height: 1.02; }
h2 { font-family: 'Bodoni Moda', serif; font-style: italic; font-weight: 600; font-size: 46px; line-height: 1.05; margin: 14px 0 0; letter-spacing: -.01em; }
mark { background: #dcff2e; color: #131417; padding: 0 .18em; border-radius: 4px; }
.brand { position: absolute; right: 0; bottom: -52px; font-family: 'Geist Mono', monospace; font-size: 15px; color: #8a8f97; letter-spacing: .06em; }
.dark .brand { color: #6b7079; }

/* hero */
.hero h1 { font-size: 78px; margin: 26px 0 26px; max-width: 980px; }
.hero .sub { font-size: 28px; line-height: 1.35; color: #3a3e45; max-width: 860px; }
.dark.hero .sub { color: #c4c7cc; }
.chips { display: flex; flex-wrap: wrap; gap: 12px; margin-top: auto; }
.chip { font-size: 21px; font-weight: 600; padding: 12px 20px; border-radius: 999px; border: 2px solid #131417; background: #fff; }
.chip:first-child { background: #dcff2e; }
.dark .chip { border-color: #3a3e45; background: #22252a; color: #f6f5f1; }
.dark .chip:first-child { background: #dcff2e; color: #131417; border-color: #dcff2e; }

/* steps */
.steps { display: flex; gap: 18px; align-items: stretch; margin: auto 0; }
.step { flex: 1; background: #fff; border: 2px solid #131417; border-radius: 22px; padding: 30px 28px 36px; display: flex; flex-direction: column; gap: 12px; box-shadow: 6px 6px 0 #131417; }
.step.hl { background: #dcff2e; }
.step .n { font-family: 'Geist Mono', monospace; font-size: 18px; color: #6b7079; }
.step.hl .n { color: #131417; }
.step .t { font-size: 31px; font-weight: 700; line-height: 1.12; }
.step .x { font-size: 23px; line-height: 1.4; color: #3a3e45; }

/* versus / checklist / lists */
.cols { display: flex; gap: 22px; align-items: stretch; margin: auto 0; }
.col { flex: 1; border-radius: 22px; padding: 28px 30px; border: 2px solid #131417; background: #fff; display: flex; flex-direction: column; gap: 14px; }
.col.good { background: #fff; }
.col.bad { background: #22252a; color: #f6f5f1; border-color: #22252a; }
.col.neutral { background: #fff; }
.col .label { font-family: 'Geist Mono', monospace; font-size: 17px; letter-spacing: .1em; text-transform: uppercase; display: flex; align-items: center; gap: 10px; }
.col .label .dot { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; font-family: Geist; font-size: 18px; font-weight: 800; }
.col.good .dot { background: #dcff2e; color: #131417; border: 2px solid #131417; }
.col.bad .dot { background: #f6f5f1; color: #131417; }
.col.neutral .dot { background: #131417; color: #f6f5f1; }
.col ul { list-style: none; display: flex; flex-direction: column; gap: 12px; }
.col li { font-size: 27px; line-height: 1.3; padding-left: 26px; position: relative; }
.col li::before { content: ''; position: absolute; left: 0; top: .5em; width: 10px; height: 10px; border-radius: 50%; background: currentColor; opacity: .5; }
.col.good li::before { background: #131417; opacity: 1; box-shadow: 0 0 0 3px #dcff2e; }
.arrow { align-self: center; font-size: 46px; font-weight: 300; color: #8a8f97; }
.col.result { background: #dcff2e; }
.col li.user { font-family: "Geist Mono", monospace; font-size: 23px; }
.col li.user.miss { text-decoration: line-through; opacity: .45; }

/* bars */
.bars { display: flex; flex-direction: column; gap: 34px; margin: auto 0; }
.bar { display: grid; grid-template-columns: 290px 1fr 250px; align-items: center; gap: 22px; }
.bar .l { font-size: 30px; font-weight: 650; }
.bar .track { height: 46px; border-radius: 999px; background: #fff; border: 2px solid #131417; overflow: hidden; }
.bar .fill { height: 100%; background: #131417; border-radius: 999px; }
.bar.top .fill { background: #dcff2e; border-right: 2px solid #131417; }
.bar .note { font-family: "Geist Mono", monospace; font-size: 19px; color: #6b7079; }

/* callout */
.callout .q { font-family: 'Bodoni Moda', serif; font-style: italic; font-weight: 500; font-size: 60px; line-height: 1.12; margin: auto 0; max-width: 1000px; }
.callout .by { font-family: 'Geist Mono', monospace; font-size: 19px; color: #a7abb2; letter-spacing: .06em; margin-bottom: 30px; }
`;

const list = (items = [], cls = '') => `<ul>${items.map((i) => `<li class="${cls}">${rich(i)}</li>`).join('')}</ul>`;
const DOT = { good: '✓', bad: '✕', neutral: '•' };
const col = (c, tone = c.tone || 'neutral') => `<div class="col ${tone}"><div class="label"><span class="dot">${DOT[tone] || '•'}</span>${esc(c.label)}</div>${list(c.items)}</div>`;

function body(card) {
  const head = `<div class="kicker">${esc(card.kicker || '')}</div>${card.type === 'hero' || card.type === 'callout' ? '' : `<h2>${rich(card.title)}</h2>`}`;
  switch (card.type) {
    case 'hero':
      return `${head}<h1>${rich(card.title)}</h1><p class="sub">${rich(card.sub || '')}</p><div class="chips">${(card.chips || []).map((c) => `<span class="chip">${esc(c)}</span>`).join('')}</div>`;
    case 'steps':
      return `${head}<div class="steps">${card.steps.map((s, i) => `<div class="step${s.highlight ? ' hl' : ''}"><span class="n">STEP ${String(i + 1).padStart(2, '0')}</span><span class="t">${rich(s.title)}</span><span class="x">${rich(s.text || '')}</span></div>`).join('')}</div>`;
    case 'versus':
      return `${head}<div class="cols">${col(card.left)}${col(card.right)}</div>`;
    case 'checklist':
      return `${head}<div class="cols">${col(card.good, 'good')}${col(card.bad, 'bad')}</div>`;
    case 'lists': {
      const users = (c, miss = []) => `<div class="col neutral"><div class="label">${esc(c.label)}</div><ul>${c.items.map((u) => `<li class="user${miss.includes(u) ? ' miss' : ''}">${esc(u)}</li>`).join('')}</ul></div>`;
      return `${head}<div class="cols">${users(card.a)}<span class="arrow">−</span>${users(card.b)}<span class="arrow">=</span><div class="col result"><div class="label">${esc(card.result.label)}</div><ul>${card.result.items.map((u) => `<li class="user">${esc(u)}</li>`).join('')}</ul></div></div>`;
    }
    case 'bars': {
      const max = Math.max(...card.rows.map((r) => r.value));
      return `${head}<div class="bars">${card.rows.map((r) => `<div class="bar${r.value === max ? ' top' : ''}"><span class="l">${esc(r.label)}</span><span class="track"><span class="fill" style="display:block;width:${r.value}%"></span></span><span class="note">${esc(r.note || '')}</span></div>`).join('')}</div>`;
    }
    case 'callout':
      return `${head}<p class="q">${rich(card.quote)}</p><p class="by">${esc(card.by || '')}</p>`;
    default:
      throw new Error(`Unknown card type "${card.type}"`);
  }
}

const html = (card) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
<div class="card ${card.type}${card.dark || card.type === 'callout' ? ' dark' : ''}"><div class="grid"></div><div class="inner">${body(card)}<span class="brand">scheduleforyou.com</span></div></div></body></html>`;

const only = process.argv[2];
const specs = fs.readdirSync(SPECS).filter((f) => f.endsWith('.json') && (!only || f === `${only}.json`));
if (!specs.length) throw new Error(only ? `No spec scripts/illustrations/${only}.json` : 'No specs found');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
for (const file of specs) {
  const slug = file.slice(0, -5);
  const { cards } = JSON.parse(fs.readFileSync(path.join(SPECS, file), 'utf8'));
  for (const card of cards) {
    await page.setContent(html(card), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const png = await page.screenshot({ type: 'png' });
    // Chromium can encode WebP itself, so no image library is needed.
    const webp = await page.evaluate(async (b64) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext('2d').drawImage(img, 0, 0);
      return c.toDataURL('image/webp', 0.86).split(',')[1];
    }, png.toString('base64'));
    const out = path.join(OUT, `${slug}-${card.name}-${W}x${H}.webp`);
    fs.writeFileSync(out, Buffer.from(webp, 'base64'));
    console.log(`${path.relative(ROOT, out)}  ${(fs.statSync(out).size / 1024).toFixed(0)} KB`);
  }
}
await browser.close();
