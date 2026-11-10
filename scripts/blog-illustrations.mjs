#!/usr/bin/env node
/**
 * Renders the illustration cards for blog posts and tool pages (a hero image plus one picture per
 * main section) from small JSON specs, so every page gets the same image rhythm without stock art.
 *
 *   node scripts/blog-illustrations.mjs                       # every blog spec in scripts/illustrations/
 *   node scripts/blog-illustrations.mjs am-i-shadowbanned-twitter
 *   node scripts/blog-illustrations.mjs --tools               # every tool spec in scripts/illustrations/tools/
 *   node scripts/blog-illustrations.mjs --tools discord-character-counter
 *   node scripts/blog-illustrations.mjs --specimen            # docs/figures-specimen.png, one of every card type
 *   add --force to re-render cards whose content hash hasn't changed
 *
 * A spec is { "cards": [{ "name": "hero", "type": "hero", ... }] }. Blog cards are written to
 * public/images/blog/<slug>-<name>-1200x675.webp, tool cards to public/images/tools/, each with a
 * -720x405.webp variant; the size in the name gives the <img> its width and height.
 *
 * Card types and their fields are documented at the top of scripts/illustrations/render.mjs:
 * hero, steps, versus, checklist, bars, lists, callout (blog), and answer, spec, grid, matrix,
 * path, compare (added for tool pages and the programmatic families). The look is defined in
 * scripts/illustrations/system.css; icons in scripts/illustrations/icons.mjs.
 *
 * Only draw what's true: these are diagrams in our brand style, never logos or mock screenshots of
 * other apps, and every card states only what the page's text states.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRenderer, cardHtml } from './illustrations/render.mjs';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const force = args.includes('--force');
const tools = args.includes('--tools');
const specimen = args.includes('--specimen');
const only = args.find((a) => !a.startsWith('--'));

const SPECS = path.join(ROOT, 'scripts', 'illustrations', tools ? 'tools' : '');
const OUT = path.join(ROOT, 'public', 'images', tools ? 'tools' : 'blog');

if (specimen) {
  await buildSpecimen();
} else {
  const files = fs.readdirSync(SPECS).filter((f) => f.endsWith('.json') && f !== 'figure-hashes.json' && f !== 'specimen.json' && (!only || f === `${only}.json`));
  if (!files.length) throw new Error(only ? `No spec ${path.relative(ROOT, SPECS)}/${only}.json` : 'No specs found');
  const r = await createRenderer({ force });
  for (const file of files) {
    const slug = file.slice(0, -5);
    const { cards } = JSON.parse(fs.readFileSync(path.join(SPECS, file), 'utf8'));
    for (const card of cards) await r.render(card, path.join(OUT, `${slug}-${card.name}`), slug);
  }
  const s = await r.close();
  console.log(`\n${s.rendered} rendered, ${s.skipped} unchanged`);
  if (s.warnings.length) {
    console.log(`\n${s.warnings.length} layout warnings:\n${s.warnings.join('\n')}`);
    process.exitCode = 1;
  }
}

/**
 * One example of every card type on a contact sheet, plus each card at 360 px (a phone's column
 * width) to check that nothing is too small. Written to docs/figures-specimen.png.
 */
async function buildSpecimen() {
  const { cards } = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'illustrations', 'specimen.json'), 'utf8'));
  const tmp = path.join(ROOT, 'docs', '.specimen');
  fs.mkdirSync(tmp, { recursive: true });
  const r = await createRenderer({ force: true, quiet: true });
  for (const card of cards) await r.render(card, path.join(tmp, card.name), 'specimen');
  const { page } = r;
  const tiles = cards.map((c) => `<figure><img src="${path.join(tmp, `${c.name}-1200x${c.height || 675}.webp`)}" width="560"><img class="m" src="${path.join(tmp, `${c.name}-720x${Math.round((720 * (c.height || 675)) / 1200)}.webp`)}" width="360"><figcaption>${c.type}</figcaption></figure>`).join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;padding:40px;background:#e4e2db;font:600 18px Geist,system-ui;color:#3a3e45;width:1920px}main{display:grid;grid-template-columns:1fr 1fr;gap:36px}figure{margin:0;display:grid;grid-template-columns:560px 360px;gap:16px;align-items:start}figcaption{grid-column:1/-1}img{display:block;box-shadow:0 1px 0 #0002}</style></head><body><main>${tiles}</main></body></html>`;
  const sheet = path.join(tmp, 'sheet.html');
  fs.writeFileSync(sheet, html);
  await page.setViewportSize({ width: 1920, height: 900 });
  await page.goto(`file://${sheet}`);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(ROOT, 'docs', 'figures-specimen.png'), fullPage: true });
  const s = await r.close();
  // Drop the specimen entries from the hash manifest: they are not site images.
  const mf = path.join(ROOT, 'scripts', 'illustrations', 'figure-hashes.json');
  const m = JSON.parse(fs.readFileSync(mf, 'utf8'));
  for (const k of Object.keys(m)) if (k.startsWith('docs/')) delete m[k];
  fs.writeFileSync(mf, `${JSON.stringify(m, null, 0).replace(/,"/g, ',\n"')}\n`);
  console.log(`docs/figures-specimen.png  (${cards.length} card types)${s.warnings.length ? `\n${s.warnings.join('\n')}` : ''}`);
  void cardHtml;
}
