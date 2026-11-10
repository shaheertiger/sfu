#!/usr/bin/env node
/**
 * Renders the figures for the programmatic page families from the data they are built from
 * (lib/figures.js): /does-it-notify (answer + platform matrix per page, a matrix per hub, the full
 * grid on the index), /best-time-to-post (a week × hour heatmap per page) and /specs (a spec card
 * per page, an overview per hub, a chart on the index). Files go to public/images/figures/.
 *
 *   npm run figures:programmatic             # unchanged cards (same content hash) are skipped
 *   npm run figures:programmatic -- --force
 *
 * Card types and the design system are documented in scripts/illustrations/render.mjs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRenderer } from './illustrations/render.mjs';
import { allProgrammaticFigures } from '../lib/figures.js';

const ROOT = process.cwd();
const force = process.argv.includes('--force');
const pages = allProgrammaticFigures();
const r = await createRenderer({ force, quiet: true });
const want = new Set();
const families = {};
for (const { page, figures } of pages) {
  const family = page.split('/')[1];
  families[family] = (families[family] || 0) + figures.length;
  for (const f of figures) {
    const base = path.join(ROOT, 'public', f.src.replace(/-1200x\d+\.webp$/, ''));
    want.add(f.src);
    want.add(f.small);
    await r.render(f.card, base, f.src);
  }
}
const s = await r.close();
// Remove figures no page uses any more (a renamed action, a dropped country).
const dir = path.join(ROOT, 'public', 'images', 'figures');
let removed = 0;
for (const sub of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
  for (const f of fs.readdirSync(path.join(dir, sub))) {
    if (!want.has(`/images/figures/${sub}/${f}`)) { fs.unlinkSync(path.join(dir, sub, f)); removed++; }
  }
}
console.log(`${pages.length} pages: ${Object.entries(families).map(([k, v]) => `${k} ${v}`).join(', ')} figures`);
console.log(`${s.rendered} rendered, ${s.skipped} unchanged, ${removed} removed`);
if (s.warnings.length) {
  console.log(`\n${s.warnings.length} layout warnings:\n${s.warnings.join('\n')}`);
  process.exitCode = 1;
}
