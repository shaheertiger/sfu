/**
 * Figures for the programmatic page families (/does-it-notify, /best-time-to-post, /specs): which
 * illustration cards each page gets, built from the same data the page renders. One source for
 * the generator (scripts/programmatic-figures.mjs), the page components, the JSON-LD, the sitemap
 * and the markdown twins, so they always agree.
 *
 * A figure is { src, small, width, height, alt, card }: `src` is the 1200-px file under public/,
 * `small` the 720-px variant, `card` the spec rendered by scripts/illustrations/render.mjs.
 * Only data the page states goes on a card.
 *
 * Best-time grids are drawn from the Google Trends data committed in lib/best-time-trends-data.js
 * (the same grid the markdown twins use). Pages switch to measured scheduling data once a
 * platform × country has enough posts; re-run `npm run figures:programmatic` after that happens.
 */
import fs from 'node:fs';
import path from 'node:path';
import { NOTIFY_ACTIONS, NOTIFY_PLATFORMS, allNotifyPages, notifyActionsFor, notifyEntry, notifyPlatformsFor, question } from './notify.js';
import { SPEC_PLATFORMS, SPECS_VERIFIED, allSpecPages } from './specs.js';
import { BEST_TIME_PLATFORMS, COUNTRIES, WEEKDAY_NAMES, combineScores, formatHour, platformBySlug, scoreGrid, topSlots } from './best-time.js';
import { allBestTimePages, parseSegment, SOCIAL } from './best-time-pages.js';
import { TRENDS_META, staticGrid } from './best-time-trends.js';

const ROOT = '/images/figures';
const fig = (base, card, alt, height = 675) => ({
  src: `${base}-1200x${height}.webp`,
  small: `${base}-720x${Math.round((720 * height) / 1200)}.webp`,
  width: 1200,
  height,
  alt,
  card: { ...card, ...(height !== 675 ? { height } : {}) },
});
const cap = (s) => s.replace(/^\w/, (c) => c.toUpperCase());
const list = (a) => (a.length <= 1 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);
const shortName = (p) => p.name.replace(' (Twitter)', '');

/* ---------- Does it notify? ---------- */

const VERDICT = { yes: 'Yes.', no: 'No.', partly: 'Sometimes.' };
const MARK = { yes: 'bell', no: 'bell-off', partly: 'tilde' };
const ACTION_ICONS = {
  screenshot: ['camera-shutter', 'eye'], 'screen-record': ['record-dot', 'eye'], save: ['bookmark'], download: ['bookmark'], view: ['eye'],
  follow: ['user-plus'], unfollow: ['user-minus'], 'remove-follower': ['user-minus'], block: ['block'], mute: ['mute'], restrict: ['shield'],
  like: ['bell'], unsend: ['send'], archive: ['eye-off'], hide: ['eye-off'], report: ['shield'], share: ['send'],
};
const actionIcons = (slug) => ACTION_ICONS[Object.keys(ACTION_ICONS).find((k) => slug.startsWith(k))] || [];
const NOTIFY_LEGEND = { yes: 'Notifies', no: 'Silent', partly: 'Depends' };

export function notifyFigures(platformSlug, actionSlug) {
  const p = NOTIFY_PLATFORMS.find((x) => x.slug === platformSlug);
  const a = NOTIFY_ACTIONS.find((x) => x.slug === actionSlug);
  const e = p && a && notifyEntry(p.slug, a.slug);
  if (!e) return [];
  const q = question(a, p);
  const kicker = `${p.name} privacy`;
  const hero = fig(`${ROOT}/notify/${p.slug}-${a.slug}`, { name: 'hero', type: 'answer', kicker, question: q, answer: VERDICT[e.answer], tone: e.answer, mark: MARK[e.answer], qualifier: e.rule, icons: actionIcons(a.slug), dark: e.answer === 'yes' },
    `${q} ${VERDICT[e.answer]} ${e.rule}`);
  const others = notifyPlatformsFor(a.slug);
  const rows = NOTIFY_PLATFORMS.map((x) => ({ label: x.name, cells: [notifyEntry(x.slug, a.slug)?.answer || 'na'], ...(x.slug === p.slug ? { hl: true } : {}) }));
  const matrix = fig(`${ROOT}/notify/${p.slug}-${a.slug}-platforms`, { name: 'platforms', type: 'matrix', kicker: 'Does it notify?', title: `${cap(a.gerund)}, **platform by platform**`, cols: ['Notifies?'], rows, legend: NOTIFY_LEGEND, legendNote: '— no such feature' },
    `Table of whether ${a.gerund} sends a notification on ${list(NOTIFY_PLATFORMS.map((x) => x.name))}: ${list(others.map((x) => `${x.name} ${({ yes: 'notifies', no: 'is silent', partly: 'depends' })[notifyEntry(x.slug, a.slug).answer]}`))}.`);
  return [hero, matrix];
}

export function notifyHubFigures(platformSlug) {
  const p = NOTIFY_PLATFORMS.find((x) => x.slug === platformSlug);
  if (!p) return [];
  const acts = notifyActionsFor(p.slug);
  const rows = acts.map((a) => ({ label: cap(a.short), cells: [notifyEntry(p.slug, a.slug).answer] }));
  const yes = acts.filter((a) => notifyEntry(p.slug, a.slug).answer === 'yes').map((a) => a.short);
  return [fig(`${ROOT}/notify/${p.slug}`, { name: 'hub', type: 'matrix', kicker: `${p.name} privacy`, title: `What **${p.name}** tells people`, cols: ['Notifies?'], rows, legend: NOTIFY_LEGEND },
    `Table of ${acts.length} actions on ${p.name} and whether each one notifies the other person; ${yes.length ? `only ${list(yes)} ${yes.length === 1 ? 'does' : 'do'}` : 'none of them do'}.`)];
}

export function notifyIndexFigures() {
  const acts = [...NOTIFY_ACTIONS].sort((a, b) => a.order - b.order);
  const rows = acts.map((a) => ({ label: cap(a.short), cells: NOTIFY_PLATFORMS.map((p) => notifyEntry(p.slug, a.slug)?.answer || 'na') }));
  return [fig(`${ROOT}/notify/index`, { name: 'index', type: 'matrix', dense: true, kicker: 'Does it notify?', title: 'Every platform, **every action**', cols: NOTIFY_PLATFORMS.map(shortName), rows, legend: NOTIFY_LEGEND, legendNote: '— no such feature' },
    `Grid of ${allNotifyPages().length} answers to whether ${list(NOTIFY_PLATFORMS.map(shortName))} notify people about ${acts.length} actions such as screenshots, story views, unfollows and blocks.`, 1600)];
}

/* ---------- Best time to post ---------- */

const sourceNote = (src) => (src === 'trends' ? `Google Trends × Wikipedia activity, ${TRENDS_META.fetchedAt}` : 'Starting baseline (estimate)');
const slotText = (t, withDay = true) => `${withDay ? `${WEEKDAY_NAMES[t.weekday]} ` : ''}${formatHour(t.hour)}`;

function bestTimeGrid(platformSlug, segment) {
  if (platformSlug === SOCIAL) {
    const c = COUNTRIES.find((x) => `in-${x.slug}` === segment);
    if (!c) return null;
    const grids = BEST_TIME_PLATFORMS.map((p) => staticGrid(p.id, c.code));
    return { scores: combineScores(grids.map((g) => scoreGrid(g.grid))), source: grids.some((g) => g.source === 'trends') ? 'trends' : 'baseline', where: ` in ${c.name}`, name: 'Social media', seg: { kind: 'country', country: c } };
  }
  const p = platformBySlug(platformSlug);
  const seg = parseSegment(segment);
  if (!p || !seg) return null;
  const g = staticGrid(p.id, seg.kind === 'country' ? seg.country.code : null);
  return { scores: scoreGrid(g.grid), source: g.source, where: seg.kind === 'country' ? ` in ${seg.country.name}` : '', name: p.name, seg };
}

export function bestTimeFigures(platformSlug, segment = '') {
  const d = bestTimeGrid(platformSlug, segment);
  if (!d) return [];
  const { scores, seg } = d;
  const top = topSlots(scores, 3);
  const local = seg.kind === 'country' ? 'local time' : 'your local time';
  const long = `${d.name}${d.where}`.length > 34;
  const title = long ? `${d.name} **${d.where.trim()}**` : `${d.name}${d.where}, **every hour of the week**`;
  const base = `${ROOT}/best-time/${platformSlug}${segment ? `-${segment}` : ''}`;
  return [fig(base, { name: 'grid', type: 'grid', kicker: sourceNote(d.source), title, values: scores, top },
    `Heatmap of the best time to post on ${d.name}${d.where} by weekday and hour in ${local}; the top slots are ${list(top.map((t) => slotText(t)))}.`)];
}

export function bestTimeIndexFigures() {
  const grids = BEST_TIME_PLATFORMS.map((p) => staticGrid(p.id, null));
  const scores = combineScores(grids.map((g) => scoreGrid(g.grid)));
  const top = topSlots(scores, 3);
  return [fig(`${ROOT}/best-time/index`, { name: 'grid', type: 'grid', kicker: sourceNote(grids.some((g) => g.source === 'trends') ? 'trends' : 'baseline'), title: `All ${BEST_TIME_PLATFORMS.length} platforms, **every hour of the week**`, values: scores, top },
    `Heatmap of the best time to post on social media across all ${BEST_TIME_PLATFORMS.length} platforms by weekday and hour; the top slots are ${list(top.map((t) => slotText(t)))}.`)];
}

/* ---------- Specs and limits ---------- */

function parseAnswer(answer) {
  const size = /^(\d[\d,]*)\s*×\s*(\d[\d,]*)\s*px/.exec(answer);
  if (size) return { value: `${size[1]} × ${size[2]}`, unit: 'px' };
  const m = /^([\d,.]+)\s+(\w+)\s*(?:\((.+)\))?/.exec(answer);
  if (m) return { value: m[1], unit: m[2], ...(m[3] ? { unitNote: m[3] } : {}) };
  return { value: answer, unit: '' };
}

export function specFigures(platformSlug, specSlug) {
  const p = SPEC_PLATFORMS.find((x) => x.slug === platformSlug);
  const s = p?.specs.find((x) => x.slug === specSlug);
  if (!s) return [];
  const main = parseAnswer(s.answer);
  const others = s.rows
    .filter((r) => !String(r[1]).startsWith(s.answer.replace(/ px$/, '')) && String(r[1]).length <= 16)
    .slice(0, 3)
    .map((r) => {
      const v = parseAnswer(String(r[1]));
      // Comparable counts keep their unit so the card only charts like with like.
      return { value: v.unit === 'px' ? v.value : String(r[1]).replace(/ characters$/, ''), label: r[0], ...(v.unit && v.unit !== 'px' ? { unit: v.unit } : {}) };
    });
  return [fig(`${ROOT}/specs/${p.slug}-${s.slug}`, { name: 'hero', type: 'spec', kicker: `${p.name} specs · verified ${SPECS_VERIFIED}`, what: cap(s.h1), ...main, others },
    `${cap(s.h1)}: ${s.answer}. ${s.detail}`)];
}

export function specHubFigures(platformSlug) {
  const p = SPEC_PLATFORMS.find((x) => x.slug === platformSlug);
  if (!p) return [];
  const KIND = { image: 'Image sizes', video: 'Video', text: 'Character limits', media: 'Media' };
  const groups = Object.entries(KIND).map(([k, label]) => ({ label, items: p.specs.filter((s) => s.kind === k).slice(0, 3).map((s) => `${cap(s.h1.replace(`${p.name} `, '').replace(/ (size|character limit|limit)$/i, ''))}: ${s.answer.replace(/ characters$/, '')}`) })).filter((g) => g.items.length);
  return [fig(`${ROOT}/specs/${p.slug}`, { name: 'hub', type: 'lists', kicker: `${p.name} specs · verified ${SPECS_VERIFIED}`, title: `${p.name} **sizes and limits**`, groups: groups.slice(0, 3) },
    `Overview of ${p.name} sizes and limits: ${list(p.specs.slice(0, 4).map((s) => `${s.h1.replace(`${p.name} `, '')} ${s.answer}`))}.`)];
}

export function specIndexFigures() {
  const pick = ['x', 'bluesky', 'threads', 'instagram', 'tiktok'];
  const rows = pick.map((slug) => {
    const p = SPEC_PLATFORMS.find((x) => x.slug === slug);
    const s = p.specs.find((x) => /^(post|caption)-character-limit$/.test(x.slug));
    return { label: p.name, n: Number(s.answer.replace(/[^\d]/g, '')), note: s.answer };
  });
  const max = Math.max(...rows.map((r) => r.n));
  return [fig(`${ROOT}/specs/index`, { name: 'index', type: 'bars', kicker: `Specs and limits · verified ${SPECS_VERIFIED}`, title: 'Post character limits, **in characters**', rows: rows.map((r) => ({ label: r.label, value: Math.round((r.n / max) * 100), note: r.n.toLocaleString('en-US') })) },
    `Bar chart of post character limits: ${list(rows.map((r) => `${r.label} ${r.note}`))}.`)];
}

/* ---------- inventory ---------- */

/** Every programmatic figure with the page it belongs to: [{ page, figures }]. */
export function allProgrammaticFigures() {
  return [
    { page: '/does-it-notify', figures: notifyIndexFigures() },
    ...NOTIFY_PLATFORMS.map((p) => ({ page: `/does-it-notify/${p.slug}`, figures: notifyHubFigures(p.slug) })),
    ...allNotifyPages().map((x) => ({ page: `/does-it-notify/${x.platform}/${x.action}`, figures: notifyFigures(x.platform, x.action) })),
    { page: '/best-time-to-post', figures: bestTimeIndexFigures() },
    ...allBestTimePages().map((x) => ({ page: `/best-time-to-post/${x.platform}${x.segment ? `/${x.segment}` : ''}`, figures: bestTimeFigures(x.platform, x.segment) })),
    { page: '/specs', figures: specIndexFigures() },
    ...SPEC_PLATFORMS.map((p) => ({ page: `/specs/${p.slug}`, figures: specHubFigures(p.slug) })),
    ...allSpecPages().map((x) => ({ page: `/specs/${x.platform}/${x.spec}`, figures: specFigures(x.platform, x.spec) })),
  ];
}

/** Images referenced from a content markdown file (blog, tools), for the sitemap. */
export function markdownImages(dir, slug) {
  const file = path.join(process.cwd(), 'content', dir, `${slug}.md`);
  if (!fs.existsSync(file)) return [];
  return [...fs.readFileSync(file, 'utf8').matchAll(/!\[[^\]]*\]\((\/images\/[^)\s]+)\)/g)].map((m) => m[1]);
}

/** schema.org ImageObject for a figure; `abs` turns a path into an absolute URL. */
export const imageLd = (f, abs) => ({ '@type': 'ImageObject', '@id': `${abs(f.src)}#image`, url: abs(f.src), contentUrl: abs(f.src), width: f.width, height: f.height, caption: f.alt, encodingFormat: 'image/webp' });

