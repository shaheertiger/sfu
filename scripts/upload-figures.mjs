#!/usr/bin/env node
/**
 * Uploads the rendered illustration cards (public/images/{blog,tools,figures}/…-1200x*.webp and
 * …-720x*.webp) to Vercel Blob under the same path, so next.config.mjs can serve them on our own
 * domain. Run after rendering:
 *
 *   npm run figures:upload        # needs BLOB_READ_WRITE_TOKEN (vercel env pull, store "sfu-figures")
 *
 * Files whose bytes haven't changed since the last upload are skipped (scripts/illustrations/
 * blob-uploads.json keeps a hash per path). Writes the store's base URL to lib/figures-cdn.json;
 * commit both files.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { put } from '@vercel/blob';

const ROOT = process.cwd();
if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('BLOB_READ_WRITE_TOKEN is not set. Run `vercel env pull .env.local` and load it, or export it.');
const LOG = path.join(ROOT, 'scripts', 'illustrations', 'blob-uploads.json');
const CDN = path.join(ROOT, 'lib', 'figures-cdn.json');
const GENERATED = /-(?:1200|720)x\d+\.webp$/;
const force = process.argv.includes('--force');

const log = fs.existsSync(LOG) ? JSON.parse(fs.readFileSync(LOG, 'utf8')) : {};
const cdn = JSON.parse(fs.readFileSync(CDN, 'utf8'));
const files = ['blog', 'tools', 'figures'].flatMap((dir) => {
  const walk = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])) : []);
  return walk(path.join(ROOT, 'public', 'images', dir)).filter((f) => GENERATED.test(f));
});

const todo = [];
for (const file of files) {
  const key = `/${path.relative(path.join(ROOT, 'public'), file).split(path.sep).join('/')}`;
  const hash = crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex').slice(0, 16);
  if (!force && log[key] === hash) continue;
  todo.push({ file, key, hash });
}
console.log(`${files.length} cards, ${todo.length} to upload`);

let done = 0;
let failed = 0;
const worker = async () => {
  for (let job = todo.shift(); job; job = todo.shift()) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await put(job.key.slice(1), fs.readFileSync(job.file), { access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'image/webp', cacheControlMaxAge: 86400 });
        if (!cdn.base) cdn.base = new URL(res.url).origin;
        log[job.key] = job.hash;
        done++;
        if (done % 200 === 0) console.log(`  ${done} uploaded`);
        break;
      } catch (err) {
        if (attempt === 3) { failed++; console.error(`failed ${job.key}: ${err.message}`); }
        else await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }
  }
};
await Promise.all(Array.from({ length: 12 }, worker));

const sorted = Object.fromEntries(Object.entries(log).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(LOG, `${JSON.stringify(sorted, null, 0).replace(/,"/g, ',\n"')}\n`);
fs.writeFileSync(CDN, `${JSON.stringify({ base: cdn.base }, null, 2)}\n`);
console.log(`${done} uploaded, ${failed} failed. Base: ${cdn.base}`);
if (failed) process.exitCode = 1;
