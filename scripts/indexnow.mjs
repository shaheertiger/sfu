// Tells Bing (and the other IndexNow engines) that the public pages changed, so they recrawl
// within minutes instead of days. Usage: INDEXNOW_KEY=… APP_URL=https://scheduleforyou.com npm run seo:indexnow
// By default it submits every URL in the live sitemap. Optional: pass URLs as arguments to submit only those.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const envFile = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env.local');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const key = process.env.INDEXNOW_KEY;
const base = (process.env.APP_URL || 'https://scheduleforyou.com').replace(/\/$/, '');
if (!key) {
  console.error('INDEXNOW_KEY is not set. Generate one (openssl rand -hex 16), add it to the environment, deploy, then run this again.');
  process.exit(1);
}
async function sitemapUrls() {
  const res = await fetch(`${base}/sitemap.xml`);
  if (!res.ok) return [`${base}/`, `${base}/signup`];
  return [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}
const urls = process.argv.slice(2).length ? process.argv.slice(2) : await sitemapUrls();
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(base).host, key, keyLocation: `${base}/indexnow-key.txt`, urlList: urls }),
});
// 200 = accepted, 202 = accepted and the key will be checked shortly.
console.log(`IndexNow answered ${res.status} for ${urls.length} URL${urls.length === 1 ? '' : 's'}`);
if (res.status >= 400) {
  console.error(await res.text());
  process.exit(1);
}
