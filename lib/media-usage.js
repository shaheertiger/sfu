/**
 * Media library usage: where each file has been posted, where it hasn't, and whether it has
 * "rested" long enough to reuse. Pure functions shared by the API (summarising post rows) and the
 * dashboard (card text, filters and the composer's heads-up). Times are epoch milliseconds.
 */

export const DEFAULT_COOLDOWN_DAYS = 30;
/** Settings choices for the reuse cooldown. 0 turns the "used recently" state off. */
export const COOLDOWN_OPTIONS = [
  [0, 'Off'],
  [7, '1 week'],
  [14, '2 weeks'],
  [30, '30 days'],
  [60, '60 days'],
  [90, '90 days'],
];
const DAY = 86400000;

/** @typedef {{ published: number, scheduled: number, last: number | null }} PlatformUsage */
/** @typedef {{ posts: number, drafts: number, last: number | null, platforms: Record<string, PlatformUsage> }} Usage */
/** @typedef {{ id: string, post_id: string, platform?: string | null, target_status?: string | null, post_status: string, at?: number | string | null }} UsageRow */

/**
 * Folds (media, post, target) rows into one record per file:
 *   { posts, drafts, last, platforms: { [platform]: { published, scheduled, last } } }
 * Rows: { id, post_id, platform, target_status, post_status, at }. A post counts once in `posts`
 * however many targets it has; failed targets count for nothing; drafts are counted apart.
 * @param {UsageRow[]} rows
 * @returns {Record<string, Usage>}
 */
export function summarizeUsage(rows) {
  /** @type {Record<string, Usage>} */
  const out = {};
  const seen = new Set();
  for (const r of rows || []) {
    if (!r || !r.id) continue;
    const u = (out[r.id] ||= { posts: 0, drafts: 0, last: null, platforms: {} });
    const key = `${r.id}\u0000${r.post_id}`;
    if (!seen.has(key)) {
      seen.add(key);
      if (r.post_status === 'draft') u.drafts++;
      else u.posts++;
    }
    if (!r.platform || r.post_status === 'draft') continue;
    const at = r.at == null ? null : Number(r.at);
    const p = (u.platforms[r.platform] ||= { published: 0, scheduled: 0, last: null });
    if (r.target_status === 'published') {
      p.published++;
      if (at && (!p.last || at > p.last)) p.last = at;
      if (at && (!u.last || at > u.last)) u.last = at;
    } else if (r.target_status !== 'failed' && ['scheduled', 'publishing'].includes(r.post_status)) {
      p.scheduled++;
    }
  }
  return out;
}

const ago = (t, now) => {
  const d = Math.max(0, Math.round((now - t) / DAY));
  if (d === 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 30) return `${d}d ago`;
  if (d < 365) return `${Math.round(d / 30)}mo ago`;
  return `${Math.round(d / 365)}y ago`;
};
const when = (t) => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const times = (n) => (n === 1 ? 'once' : n === 2 ? 'twice' : `${n} times`);
const list = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

/**
 * What the library shows for one file.
 *   state: 'unused' (never published or scheduled) | 'recent' (published within the cooldown, or
 *          scheduled and not yet out) | 'rested' (published before, cooldown passed or off)
 *   unusedOn: connected platforms this file has never been published to
 *   line: one short line for the card; long: a sentence or two for the preview; color: for the line
 * @param {Usage | null | undefined} u
 * @param {{ cooldownDays?: number, platforms?: string[], labels?: Record<string, string>, now?: number }} [opts]
 */
export function mediaState(u, { cooldownDays = DEFAULT_COOLDOWN_DAYS, platforms = /** @type {string[]} */ ([]), labels = /** @type {Record<string, string>} */ ({}), now = Date.now() } = {}) {
  const usage = u || { posts: 0, drafts: 0, last: null, platforms: {} };
  const name = (p) => labels[p] || p;
  const entries = Object.entries(usage.platforms || {});
  const published = entries.filter(([, v]) => v.published > 0).sort((a, b) => (b[1].last || 0) - (a[1].last || 0));
  const scheduled = entries.filter(([, v]) => v.scheduled > 0 && !v.published);
  const unusedOn = platforms.filter((p) => !(usage.platforms || {})[p]?.published);
  const cooldown = Math.max(0, Number(cooldownDays) || 0);
  const restsAt = usage.last && cooldown ? usage.last + cooldown * DAY : null;

  let state, line, long, color;
  if (!published.length && !scheduled.length) {
    state = 'unused';
    color = '#677184';
    line = usage.drafts ? `Never posted · in ${usage.drafts} draft${usage.drafts === 1 ? '' : 's'}` : 'Never used';
    long = (usage.drafts ? `In ${usage.drafts} draft${usage.drafts === 1 ? '' : 's'}, not posted anywhere yet.` : 'Not posted anywhere yet.') + (unusedOn.length ? ` Fresh for ${list(unusedOn.map(name))}.` : '');
  } else {
    const parts = published.map(([p, v]) => `${name(p)} ×${v.published}`);
    const sched = scheduled.map(([p]) => name(p));
    const recent = restsAt != null && restsAt > now;
    if (recent || (!published.length && scheduled.length)) {
      state = 'recent';
      color = '#8a5a00';
    } else {
      state = 'rested';
      color = '#3b7a2a';
    }
    line = [
      ...(parts.length ? [parts.join(' · ')] : []),
      ...(sched.length ? [`Scheduled · ${sched.join(', ')}`] : []),
      ...(usage.last ? [ago(usage.last, now)] : []),
    ].join(' · ');
    const sentences = [];
    if (published.length) sentences.push(`Posted to ${list(published.map(([p, v]) => `${name(p)} ${times(v.published)} (last ${when(v.last)})`))}.`);
    if (sched.length) sentences.push(`Scheduled for ${list(sched)}.`);
    if (unusedOn.length) sentences.push(`Not yet used on ${list(unusedOn.map(name))}.`);
    if (state === 'recent' && restsAt) sentences.push(`Used recently: your ${cooldown}-day cooldown ends ${when(restsAt)}.`);
    else if (state === 'rested' && published.length) sentences.push(cooldown ? 'Rested long enough to reuse.' : 'Ready to reuse.');
    long = sentences.join(' ');
  }
  return { state, unusedOn, line, long, color, last: usage.last || null, posts: usage.posts || 0 };
}

/**
 * Options for the library's usage filter.
 * @param {string[]} [platforms]
 * @param {Record<string, string>} [labels]
 */
export function usageFilterOptions(platforms = /** @type {string[]} */ ([]), labels = /** @type {Record<string, string>} */ ({})) {
  return [
    { value: '', label: 'Any usage' },
    { value: 'unused', label: 'Never used' },
    { value: 'rested', label: 'Ready to reuse' },
    { value: 'recent', label: 'Used recently' },
    ...platforms.map((p) => ({ value: `no:${p}`, label: `Unused on ${labels[p] || p}` })),
  ];
}

/**
 * Does a library item (with `state` and `unusedOn`) pass the usage filter value?
 * @param {{ state?: string, unusedOn?: string[] }} m
 * @param {string | null | undefined} filter
 */
export function matchesUsage(m, filter) {
  if (!filter) return true;
  if (filter.startsWith('no:')) return (m.unusedOn || []).includes(filter.slice(3));
  return (m.state || 'unused') === filter;
}
