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
const base = (process.env.APP_URL || 'https://scheduleforyou.com').replace(/\/$/, '');
// The key: INDEXNOW_KEY, or the key file committed to public/<key>.txt (IndexNow's standard location).
const pub = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const committed = fs.readdirSync(pub).map((f) => /^([a-f0-9]{16,64})\.txt$/i.exec(f)?.[1]).find(Boolean);
const key = process.env.INDEXNOW_KEY || committed;
if (!key) {
  console.error('No IndexNow key: set INDEXNOW_KEY or add public/<key>.txt (openssl rand -hex 16), deploy, then run this again.');
  process.exit(1);
}
const keyLocation = committed === key ? `${base}/${key}.txt` : `${base}/indexnow-key.txt`;
async function sitemapUrls() {
  const res = await fetch(`${base}/sitemap.xml`);
  if (!res.ok) return [`${base}/`, `${base}/signup`];
  return [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}
const urls = process.argv.slice(2).length ? process.argv.slice(2) : await sitemapUrls();
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(base).host, key, keyLocation, urlList: urls }),
});
// 200 = accepted, 202 = accepted and the key will be checked shortly.
console.log(`IndexNow answered ${res.status} for ${urls.length} URL${urls.length === 1 ? '' : 's'}`);
if (res.status >= 400) {
  console.error(await res.text());
  process.exit(1);
}
