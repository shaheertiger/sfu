#!/usr/bin/env node
/**
 * Builds lib/best-time-trends-data.js: an hour-by-hour activity grid for every platform in
 * every country page, from Google Trends search interest (cite "Google Trends" when shown).
 *
 * For each platform topic × country it fetches:
 *   - the past 7 days, hourly  → the shape of the day (weekdays and weekends separately)
 *   - the past 90 days, daily  → how strong each weekday is
 * Google Trends values are a *share* of all searches in each hour, which inflates the small
 * hours (few searches overall). So each share is multiplied by how many people are online in
 * that hour: Wikipedia pageviews on all devices (Wikimedia, CC0) over the past 28 days, in local time,
 * from the country's own language edition where one exists, otherwise the average local-time
 * curve of the countries that have one. The result is a 7×24 grid in local time, 0–100.
 * Weak series (too few searches to read) are dropped; the pages then use the country's
 * average across its readable platforms, and say so.
 *
 *   NODE_USE_ENV_PROXY=1 node scripts/fetch-best-time-trends.mjs [--cache DIR] [--only SG,JP]
 *
 * Raw responses are cached in DIR (default node_modules/.cache/best-time-trends), so a run
 * that hits Google's rate limit stops and can simply be restarted. Delete the cache to refresh.
 * --offline builds the file from the cache alone, keeping only countries with every series cached
 * (the others keep falling back to our own data or the baseline until a later run).
 */
import fs from 'node:fs';
import path from 'node:path';
import { COUNTRIES, BEST_TIME_PLATFORMS } from '../lib/best-time.js';

const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : dflt; };
const CACHE = opt('--cache', path.join('node_modules', '.cache', 'best-time-trends'));
const ONLY = opt('--only', '') ? opt('--only', '').split(',') : null;
const OFFLINE = args.includes('--offline');
const OUT = path.join('lib', 'best-time-trends-data.js');
fs.mkdirSync(CACHE, { recursive: true });

/** Google Trends topics (Knowledge Graph ids), so searches in every language count. */
export const TOPICS = {
  instagram: '/m/0glpjll',
  tiktok: '/g/11f555cn8l',
  facebook: '/m/02y1vz',
  linkedin: '/m/03vgrr',
  x: '/m/0289n8t',
  threads: '/g/11v19b38sz',
  youtube: '/m/09jcvs',
  pinterest: '/m/0h3tm0f',
  bluesky: '/g/11qh3d1qpb',
  google: '/g/11bvwcc_bz',
};

/** Wikipedia editions read mostly in one country (and one time zone), for that country's online-activity curve. */
export const WIKIS = {
  JP: ['ja'], DE: ['de'], IT: ['it'], NL: ['nl'], BE: ['nl'], FR: ['fr'], ID: ['id'], BR: ['pt'],
  ES: ['ca', 'eu', 'gl'], MY: ['ms'], PH: ['tl'], PK: ['ur'], IN: ['hi'], KE: ['sw'], ZA: ['af'], NG: ['ha', 'yo', 'ig'],
};
/** Large, single-zone editions averaged into the curve for countries without their own. */
const UNIVERSAL = ['JP', 'DE', 'IT', 'NL', 'FR', 'ID', 'BR'];
const UA = 'ScheduleForYou-best-time/1.0 (https://scheduleforyou.com)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
class NotCached extends Error {}

/** Hourly pageviews (all devices, to match Google Trends' all-device baseline) for a Wikipedia edition over the past 28 days: [{ time (unix s), value }]. */
async function wikiHourly(project) {
  const file = path.join(CACHE, `wiki-${project}.json`);
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  if (OFFLINE) throw new NotCached();
  const end = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate() - 1, 23));
  const start = new Date(end.getTime() - 28 * 86400_000 + 3600_000);
  const stamp = (d) => d.toISOString().slice(0, 13).replace(/[-T]/g, '');
  const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/aggregate/${project}.wikipedia/all-access/user/hourly/${stamp(start)}/${stamp(end)}`;
  for (let i = 0; ; i++) {
    const r = await fetch(url, { headers: { 'user-agent': UA } });
    if (r.ok) {
      const items = (await r.json()).items;
      const points = items.map((x) => ({ time: Date.UTC(+x.timestamp.slice(0, 4), +x.timestamp.slice(4, 6) - 1, +x.timestamp.slice(6, 8), +x.timestamp.slice(8, 10)) / 1000, value: x.views }));
      fs.writeFileSync(file, JSON.stringify(points));
      await sleep(500);
      return points;
    }
    if (i >= 5) throw new Error(`Wikimedia ${project}: HTTP ${r.status}`);
    await sleep(3000 * 2 ** i);
  }
}

/** 7×24 online-activity grid (flattened, max 1) in a zone from one or more editions' hourly views. */
async function activityGrid(projects, tz) {
  const cells = Array.from({ length: 168 }, () => []);
  const byTime = new Map();
  for (const proj of projects) for (const p of await wikiHourly(proj)) byTime.set(p.time, (byTime.get(p.time) || 0) + p.value);
  for (const [time, value] of byTime) {
    const l = local(tz, time);
    cells[l.weekday * 24 + l.hour].push(value);
  }
  const g = cells.map(mean);
  const max = Math.max(...g) || 1;
  return g.map((v) => v / max);
}
let cookie = '';
async function refreshCookie() {
  const r = await fetch('https://trends.google.com/trends/?geo=US', { headers: { 'user-agent': 'Mozilla/5.0' } });
  cookie = (r.headers.getSetCookie?.() || []).map((c) => c.split(';')[0]).join('; ');
}

async function get(url, tries = 0) {
  const r = await fetch(url, { headers: { cookie, 'user-agent': 'Mozilla/5.0', 'accept-language': 'en-US' } });
  if (r.status === 429 || r.status >= 500) {
    if (tries >= 6) throw new Error(`HTTP ${r.status} after retries: ${url.slice(0, 120)}`);
    const wait = 15000 * 2 ** tries;
    console.warn(`  ${r.status}, waiting ${wait / 1000}s`);
    await sleep(wait);
    await refreshCookie();
    return get(url, tries + 1);
  }
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${url.slice(0, 160)}`);
  const text = await r.text();
  return JSON.parse(text.slice(text.indexOf('{')));
}

/** Timeline points for one topic in one country: [{ time (unix s), value }]. */
async function timeline(topic, geo, time, tz) {
  const file = path.join(CACHE, `${geo}-${topic.replace(/\//g, '_')}-${time.replace(/\s/g, '')}.json`);
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  if (OFFLINE) throw new NotCached();
  const req = { comparisonItem: [{ keyword: topic, geo, time }], category: 0, property: '' };
  const explore = await get(`https://trends.google.com/trends/api/explore?hl=en-US&tz=${tz}&req=${encodeURIComponent(JSON.stringify(req))}`);
  const w = explore.widgets.find((x) => x.id === 'TIMESERIES');
  await sleep(1200);
  const data = await get(`https://trends.google.com/trends/api/widgetdata/multiline?hl=en-US&tz=${tz}&req=${encodeURIComponent(JSON.stringify(w.request))}&token=${w.token}`);
  const points = data.default.timelineData.map((p) => ({ time: Number(p.time), value: p.value[0] }));
  fs.writeFileSync(file, JSON.stringify(points));
  await sleep(4000);
  return points;
}

/** Local weekday (0 = Sunday) and hour of an instant in a zone. */
function local(tz, unix) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', hour: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(unix * 1000));
  const g = (t) => parts.find((x) => x.type === t).value;
  return { weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(g('weekday')), hour: Number(g('hour')) % 24 };
}
function offsetMinutes(tz, at = Date.now()) {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(new Date(at));
  const g = (t) => Number(p.find((x) => x.type === t).value);
  return Math.round((Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute')) - Math.floor(at / 60000) * 60000) / 60000);
}

const mean = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0);

/**
 * 7×24 grid (flattened, weekday-major) from an hourly week and a daily quarter, or null when
 * the series is too thin to read (mostly zeros).
 */
export function buildGrid(hourly, daily, tz, activity) {
  if (hourly.filter((p) => p.value > 0).length < hourly.length * 0.6) return null;
  if (daily.filter((p) => p.value > 0).length < daily.length * 0.8) return null;
  const cells = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => []));
  for (const p of hourly) {
    const l = local(tz, p.time);
    cells[l.weekday][l.hour].push(p.value);
  }
  const weekend = (d) => d === 0 || d === 6;
  const profile = (isWeekend) => {
    const hours = Array.from({ length: 24 }, (_, h) => mean([0, 1, 2, 3, 4, 5, 6].filter((d) => weekend(d) === isWeekend).flatMap((d) => cells[d][h])));
    // Light smoothing (neighbouring hours) so one odd hour in a single week doesn't win.
    const smooth = hours.map((v, h) => 0.25 * hours[(h + 23) % 24] + 0.5 * v + 0.25 * hours[(h + 1) % 24]);
    const m = mean(smooth) || 1;
    return smooth.map((v) => v / m);
  };
  const wk = profile(false);
  const we = profile(true);
  const dayVals = Array.from({ length: 7 }, () => []);
  // Daily points are midnight in the request's tz, which we set to the country's zone.
  for (const p of daily) dayVals[new Date((p.time + offsetMinutes(tz, p.time * 1000) * 60) * 1000).getUTCDay()].push(p.value);
  const dayFactor = dayVals.map(mean);
  const raw = [];
  for (let d = 0; d < 7; d++) for (let h = 0; h < 24; h++) raw.push((weekend(d) ? we : wk)[h] * dayFactor[d] * activity[d * 24 + h]);
  const max = Math.max(...raw) || 1;
  return raw.map((v) => Math.round((v / max) * 100));
}

async function main() {
  await refreshCookie();
  const out = { source: 'Google Trends and Wikimedia pageviews', fetchedAt: new Date().toISOString().slice(0, 10), hourly: 'past 7 days', daily: 'past 90 days', activity: 'past 28 days', countries: {} };
  // The fallback activity curve: the average local-time curve of big single-country editions.
  const uni = [];
  for (const code of UNIVERSAL) {
    const c = COUNTRIES.find((x) => x.code === code);
    uni.push(await activityGrid(WIKIS[code], c.tz));
  }
  const universal = uni[0].map((_, i) => mean(uni.map((g) => g[i])));
  const countries = COUNTRIES.filter((c) => !ONLY || ONLY.includes(c.code));
  for (const c of countries) {
    const tz = -offsetMinutes(c.tz);
    let activity;
    try {
      activity = WIKIS[c.code] ? await activityGrid(WIKIS[c.code], c.tz) : universal;
    } catch (e) {
      if (!(e instanceof NotCached)) throw e;
      console.log(`${c.code}: not fully cached, skipped`);
      continue;
    }
    const grids = {};
    let complete = true;
    for (const p of BEST_TIME_PLATFORMS) {
      const topic = TOPICS[p.id];
      try {
        const hourly = await timeline(topic, c.code, 'now 7-d', 0);
        const daily = await timeline(topic, c.code, 'today 3-m', tz);
        grids[p.id] = buildGrid(hourly, daily, c.tz, activity);
      } catch (e) {
        // A missing or refused series is not "too few searches": leave the whole country out.
        if (!(e instanceof NotCached)) throw e;
        complete = false;
        break;
      }
      console.log(`${c.code} ${p.id}: ${grids[p.id] ? 'ok' : 'too few searches'}`);
    }
    if (!complete) { console.log(`${c.code}: not fully cached, skipped`); continue; }
    const readable = Object.values(grids).filter(Boolean);
    if (readable.length) {
      const avg = readable[0].map((_, i) => mean(readable.map((g) => g[i])));
      const max = Math.max(...avg) || 1;
      grids._all = avg.map((v) => Math.round((v / max) * 100));
    }
    grids._activity = WIKIS[c.code] ? WIKIS[c.code].join('+') : 'average';
    out.countries[c.code] = grids;
  }
  const body = `/**\n * Generated by scripts/fetch-best-time-trends.mjs on ${out.fetchedAt}. Do not edit by hand.\n * Hour-by-hour activity (0–100, local time, weekday-major 7×24) per country and platform,\n * from Google Trends search interest. null = too few searches to read; _all = country average.\n */\nexport default ${JSON.stringify(out)};\n`;
  fs.writeFileSync(OUT, body);
  console.log(`wrote ${OUT} (${(body.length / 1024).toFixed(0)} KB)`);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e); process.exit(1); });
