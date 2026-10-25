import 'server-only';
import crypto from 'node:crypto';
import { exec, now, one, query } from './db';
import { appUrl } from './url';

/*
 * Link click tracking. With the workspace setting on, every link in a caption (and first comment)
 * is swapped for a short link on the app's own domain when the post publishes; /l/<code> counts
 * the visit and redirects. Clicks are kept per link and summed onto the target (post_targets.stats).
 */

/** Short-link codes: unambiguous letters and digits (no 0/O, 1/l/I). */
const ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const CODE_RE = /^[A-Za-z0-9]{6,12}$/;
export const newCode = (len = 7) => Array.from(crypto.randomBytes(len), (b) => ALPHABET[b % ALPHABET.length]).join('');

/** http(s) URLs in a text. Closing punctuation right after a link (`.`, `,`, `)`) is not part of it. */
const URL_RE = /https?:\/\/[^\s<>"'`]+/g;
const TRAILING = /[.,;:!?)\]}'"»”’]+$/;
export function findUrls(text: string): string[] {
  const out: string[] = [];
  for (const m of text.match(URL_RE) || []) {
    const u = m.replace(TRAILING, '');
    if (u && !out.includes(u)) out.push(u);
  }
  return out;
}

/** The base of the app's short links, e.g. https://scheduleforyou.com/l/ */
export const shortBase = () => `${appUrl()}/l/`;

/**
 * Whether a link should be swapped for a tracked one: a real http(s) address on a named host,
 * not one of our own short links, and long enough that the short link doesn't make the post longer
 * (a longer post could break a platform's character limit after validation).
 */
export function isTrackable(url: string, base = shortBase()): boolean {
  if (url.startsWith(base)) return false;
  if (url.length > 2000 || url.length < base.length + 7) return false;
  try {
    const u = new URL(url);
    return (u.protocol === 'https:' || u.protocol === 'http:') && u.hostname.includes('.');
  } catch {
    return false;
  }
}

export type LinkContext = { workspaceId: string; postId: string; targetId: string; utm?: UtmTags | null };
export type UtmTags = { source: string; campaign?: string | null };

/** A label as a utm_campaign value: lower case, dashes, nothing odd. */
export const campaignSlug = (label: string | null | undefined) =>
  String(label || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || null;

/**
 * Adds UTM tags for attribution in analytics tools: utm_source = the platform, utm_medium = social,
 * utm_campaign = the post's first label (when it has one). Tags the link already carries are kept.
 */
export function withUtm(url: string, utm: UtmTags | null | undefined): string {
  if (!utm) return url;
  try {
    const u = new URL(url);
    if (!u.searchParams.has('utm_source')) u.searchParams.set('utm_source', utm.source);
    if (!u.searchParams.has('utm_medium')) u.searchParams.set('utm_medium', 'social');
    if (utm.campaign && !u.searchParams.has('utm_campaign')) u.searchParams.set('utm_campaign', utm.campaign);
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * Replaces the trackable links in `text` with short links. The same link on the same target always
 * gets the same code, so a retried target never creates duplicates.
 */
export async function shortenLinks(text: string, ctx: LinkContext): Promise<string> {
  const base = shortBase();
  let out = text;
  for (const url of findUrls(text)) {
    if (!isTrackable(url, base)) continue;
    const code = await codeFor(withUtm(url, ctx.utm), ctx);
    out = out.split(url).join(base + code);
  }
  return out;
}

async function codeFor(url: string, ctx: LinkContext): Promise<string> {
  const existing = await one('SELECT code FROM links WHERE target_id=$1 AND url=$2', [ctx.targetId, url]);
  if (existing) return existing.code;
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = newCode(attempt < 3 ? 7 : 9);
    const made = await query('INSERT INTO links (code, workspace_id, post_id, target_id, url, created_at) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (code) DO NOTHING RETURNING code', [code, ctx.workspaceId, ctx.postId, ctx.targetId, url, now()]);
    if (made.length) return code;
  }
  throw new Error('Could not allocate a short link code');
}

/** Counts a visit and returns where to send it, or null for an unknown code. */
export async function recordClick(code: string): Promise<string | null> {
  if (!CODE_RE.test(code)) return null;
  const row = await one('UPDATE links SET clicks = clicks + 1, last_click_at = $2 WHERE code=$1 RETURNING url, target_id', [code, now()]);
  if (!row) return null;
  if (row.target_id) {
    await exec(
      `UPDATE post_targets SET stats = COALESCE(stats, '{}'::jsonb) || jsonb_build_object('clicks', COALESCE((stats->>'clicks')::int, 0) + 1) WHERE id=$1`,
      [row.target_id],
    ).catch((e) => console.error('[links] stats', e?.message || e));
  }
  return row.url;
}

/** Click totals for a workspace: all time and the last 7 days' worth of links. */
export async function linkTotals(workspaceId: string) {
  const r = await one('SELECT COALESCE(SUM(clicks),0)::int AS clicks, COUNT(*)::int AS links FROM links WHERE workspace_id=$1', [workspaceId]);
  return { clicks: r?.clicks ?? 0, links: r?.links ?? 0 };
}
