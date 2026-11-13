// Tells Bing (and the other IndexNow engines) that the public pages changed, so they recrawl
// within minutes instead of days. Usage: INDEXNOW_KEY=… APP_URL=https://scheduleforyou.com npm run seo:indexnow
// By default it submits every URL in the live sitemap. Pass URLs to submit only those, or --since <git ref>
// to submit the pages whose source changed since that commit (CI does this on every push to main).
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
/** Every <loc> in the live sitemap, following the index (/sitemap.xml lists one file per family). */
async function sitemapUrls(url = `${base}/sitemap.xml`) {
  const res = await fetch(url);
  if (!res.ok) return [`${base}/`];
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (!/<sitemapindex/.test(xml)) return locs;
  return (await Promise.all(locs.map((l) => sitemapUrls(l)))).flat();
}

/**
 * --since <git ref>: only the pages whose source changed since that commit (used by CI on every
 * push to main). Content files map to their URL; a change to a programmatic family's data file
 * submits that family's live URLs. Removed pages are submitted too, so engines drop them sooner.
 */
async function changedUrls(since) {
  const { execFileSync } = await import('node:child_process');
  const files = execFileSync('git', ['diff', '--name-only', `${since}..HEAD`], { encoding: 'utf8' }).split('\n').filter(Boolean);
  const live = await sitemapUrls();
  const out = new Set();
  const family = (prefix) => live.filter((u) => u === `${base}${prefix}` || u.startsWith(`${base}${prefix}/`)).forEach((u) => out.add(u));
  for (const f of files) {
    let m;
    if ((m = /^content\/(blog|tools)\/([\w-]+)\.md$/.exec(f))) out.add(`${base}/${m[1]}/${m[2]}`);
    else if ((m = /^content\/(pages|platforms)\/([\w-]+)\.md$/.exec(f))) out.add(`${base}/${m[2]}`);
    else if ((m = /^content\/compare\/([\w-]+)-vs-([\w-]+)\.md$/.exec(f))) out.add(`${base}/compare/${m[1]}/${m[2]}`);
    else if ((m = /^content\/i18n\/(\w+)\/(tools|blog)\/([\w-]+)\.md$/.exec(f))) out.add(`${base}/${m[1]}/${m[2]}/${m[3]}`);
    else if ((m = /^content\/i18n\/(\w+)\/platforms\/([\w-]+)\.md$/.exec(f))) out.add(`${base}/${m[1]}/${m[2]}`);
    else if (/^lib\/specs\.js$/.test(f)) family('/specs');
    else if (/^lib\/notify\.js$/.test(f)) family('/does-it-notify');
    else if (/^lib\/best-time/.test(f)) family('/best-time-to-post');
    else if (/^lib\/post-ideas\.js$/.test(f)) family('/post-ideas');
    else if (/^lib\/retired-pages\.mjs$/.test(f)) { family('/post-ideas'); family('/best-time-to-post'); }
  }
  return [...out];
}

const sinceAt = process.argv.indexOf('--since');
const urls = sinceAt >= 0 ? await changedUrls(process.argv[sinceAt + 1]) : process.argv.slice(2).length ? process.argv.slice(2) : await sitemapUrls();
if (!urls.length) {
  console.log('IndexNow: no public pages changed, nothing to submit.');
  process.exit(0);
}
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(base).host, key, keyLocation, urlList: urls.slice(0, 10000) }),
});
// 200 = accepted, 202 = accepted and the key will be checked shortly.
console.log(`IndexNow answered ${res.status} for ${urls.length} URL${urls.length === 1 ? '' : 's'}`);
if (res.status >= 400) {
  console.error(await res.text());
  process.exit(1);
}
