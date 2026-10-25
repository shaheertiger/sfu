import 'server-only';
import { z } from 'zod';
import { exec, now, one, query, tx, uid } from './db';
import { decrypt } from './crypto';
import { HttpError } from './http-error';
import { overLimitAccountIds } from './accounts';
import { facebookMixProblem, metaFormat, metaFormatProblem, nonJpegImages } from './meta-format';
import { getBytes, readUrl } from './storage';
import { PLATFORMS, type PlatformId } from './platforms';
import { COMMENT_PLATFORMS, MAX_THREAD_PARTS, commentLimit, firstComment, threadParts } from './thread';
import type { MediaFile, SocialAccount } from './adapters/types';

export type TargetInput = { account_id: string; caption?: string | null; options?: Record<string, any> };
export type PostInput = {
  id?: string;
  caption?: string;
  media?: string[];
  scheduled_at?: number | null;
  status?: 'draft' | 'scheduled' | 'published';
  publish_now?: boolean;
  targets?: TargetInput[];
  labels?: string[];
  repeat?: 'none' | 'weekly' | 'monthly';
  evergreen?: boolean;
  approval?: 'pending' | 'approved' | null;
  remind?: boolean;
  note?: string;
  batch?: string | null;
  /** false: don't add the workspace signature to this post. */
  signature?: boolean;
};

/* ---------- request bodies ---------- */
const ID = z.string().regex(/^[\w-]{1,64}$/, 'Bad id');
const CAPTION_MAX = 65_000; // Facebook allows the most (63,206)

/** A date as epoch milliseconds, an ISO 8601 string, or null (= not scheduled). */
const When = z.union([z.number(), z.string(), z.null()]).transform((v, ctx) => {
  if (v === null) return null;
  const ms = typeof v === 'number' ? v : Date.parse(v);
  if (!Number.isFinite(ms) || ms < 0 || ms > 4102444800000) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'scheduled_at must be an ISO 8601 date or epoch milliseconds' });
    return z.NEVER;
  }
  return Math.floor(ms);
});

/** Everything a post write may contain, from the dashboard, the REST API or the MCP server. Unknown keys are dropped. */
export const PostBody = z.object({
  caption: z.string().max(CAPTION_MAX).optional(),
  media: z.array(ID).max(35).optional(),
  scheduled_at: When.optional(),
  status: z.enum(['draft', 'scheduled']).optional(),
  publish_now: z.boolean().optional(),
  targets: z
    .array(z.object({ account_id: ID, caption: z.string().max(CAPTION_MAX).nullish(), options: z.record(z.string(), z.any()).optional() }))
    .max(100)
    .optional(),
  /** API convenience: one target per account id. */
  account_ids: z.array(ID).max(100).optional(),
  labels: z.array(z.string().max(40)).max(50).optional(),
  repeat: z.enum(['none', 'weekly', 'monthly']).optional(),
  evergreen: z.boolean().optional(),
  approval: z.enum(['pending', 'approved']).nullable().optional(),
  remind: z.boolean().optional(),
  note: z.string().max(2000).optional(),
  batch: z.string().max(80).nullable().optional(),
  signature: z.boolean().optional(),
  /** API: save even when a platform rule fails (the post will fail at publish time instead). */
  force: z.boolean().optional(),
});
export type PostBodyInput = PostInput & { force?: boolean };

/** Validates and normalises a post body. Throws a ZodError (answered as 400) when it is malformed. */
export function parsePostBody(raw: unknown): PostBodyInput {
  const b = PostBody.parse(raw);
  const { account_ids, ...rest } = b;
  const targets = rest.targets ?? (account_ids ? account_ids.map((account_id) => ({ account_id })) : undefined);
  const seen = new Set<string>();
  // caption stays undefined when it isn't sent, so an update without it keeps the existing caption.
  const out: PostBodyInput = { ...rest, targets: (targets || []).filter((t) => !seen.has(t.account_id) && seen.add(t.account_id)) };
  if (rest.targets === undefined && account_ids === undefined) delete (out as any).targets;
  return out;
}

/* ---------- accounts ---------- */
export function rowToAccount(r: any): SocialAccount {
  return { ...r, access_token: decrypt(r.access_token), refresh_token: decrypt(r.refresh_token), meta: r.meta || {} };
}
/**
 * Whether the account keeps its own sign-in fresh, so its token expiry is nothing to warn about:
 * it has a refresh token, or it uses a token that renews itself (Threads) or doesn't expire
 * (Facebook and Instagram Page tokens, Bluesky app passwords).
 */
export function hasRefresh(r: any): boolean {
  if (r.refresh_token) return true;
  if (r.platform === 'threads' || r.platform === 'facebook' || r.platform === 'bluesky') return true;
  return r.platform === 'instagram' && r.meta?.token_kind === 'page';
}

export function publicAccount(r: any) {
  const renews = hasRefresh(r);
  return {
    id: r.id, platform: r.platform, username: r.username, display_name: r.display_name, avatar_url: r.avatar_url,
    status: r.status, last_error: r.last_error,
    has_refresh: renews,
    // Only an expiry the person has to act on (by reconnecting) is shown.
    token_expires_at: renews ? null : r.token_expires_at ?? null,
    created_at: r.created_at,
    // Posted under every post to this account that has no first comment of its own.
    default_first_comment: typeof r.meta?.default_first_comment === 'string' && r.meta.default_first_comment.trim() ? r.meta.default_first_comment : null,
    meta: { boards: r.meta?.boards },
  };
}
export async function listAccounts(workspaceId: string) {
  const [rows, over] = await Promise.all([
    query('SELECT * FROM social_accounts WHERE workspace_id=$1 ORDER BY created_at', [workspaceId]),
    overLimitAccountIds(workspaceId),
  ]);
  return rows.map((r) => ({ ...publicAccount(r), over_limit: over.has(r.id) }));
}

/* ---------- media ---------- */
export async function mediaFiles(workspaceId: string, ids: string[]): Promise<MediaFile[]> {
  if (!ids.length) return [];
  const rows = await query('SELECT * FROM media WHERE workspace_id=$1 AND id = ANY($2) AND uploaded', [workspaceId, ids]);
  const byId = new Map(rows.map((m) => [m.id, m]));
  const out: MediaFile[] = [];
  for (const id of ids) {
    const m = byId.get(id);
    if (!m) continue;
    let cache: Promise<Buffer> | null = null;
    out.push({ id: m.id, key: m.object_key, url: await readUrl(m.object_key), mime: m.mime, size: m.size, filename: m.filename, bytes: () => (cache ||= getBytes(m.object_key)) });
  }
  return out;
}

/* ---------- posts ---------- */
async function hydrate(rows: any[]) {
  if (!rows.length) return [];
  const targets = await query('SELECT * FROM post_targets WHERE post_id = ANY($1) ORDER BY id', [rows.map((r) => r.id)]);
  const byPost = new Map<string, any[]>();
  for (const t of targets) byPost.set(t.post_id, [...(byPost.get(t.post_id) || []), t]);
  return rows.map((r) => ({ ...r, targets: byPost.get(r.id) || [] }));
}

/**
 * A post as the public API returns it: internal bookkeeping (workspace, author, reminder and
 * repeat links, retry counters) is left out.
 */
export function publicPost(p: any) {
  if (!p) return p;
  const { workspace_id, created_by, reminded_for, parent_id, repeat_anchor, repeat_n, ...post } = p;
  return { ...post, targets: (p.targets || []).map(({ post_id, attempts, progress, ...t }: any) => t) };
}

export async function getPost(workspaceId: string, id: string) {
  const rows = await query('SELECT * FROM posts WHERE id=$1 AND workspace_id=$2', [id, workspaceId]);
  return (await hydrate(rows))[0] || null;
}

export async function listPosts(workspaceId: string, opts: { status?: string; from?: number; to?: number; limit?: number } = {}) {
  const where = ['workspace_id=$1'];
  const args: any[] = [workspaceId];
  if (opts.status) { args.push(opts.status); where.push(`status=$${args.length}`); }
  if (opts.from) { args.push(opts.from); where.push(`COALESCE(scheduled_at, created_at)>=$${args.length}`); }
  if (opts.to) { args.push(opts.to); where.push(`COALESCE(scheduled_at, created_at)<=$${args.length}`); }
  args.push(Math.min(opts.limit || 500, 2000));
  const rows = await query(`SELECT * FROM posts WHERE ${where.join(' AND ')} ORDER BY COALESCE(scheduled_at, created_at) DESC LIMIT $${args.length}`, args);
  return hydrate(rows);
}

/** Checks captions, media and required fields against each platform's rules. */
export async function validatePost(workspaceId: string, input: PostInput) {
  const errors: string[] = [];
  if (!input.targets?.length) errors.push('Pick at least one account');
  // Only confirmed uploads count: unconfirmed files would be dropped at publish time.
  const media = input.media?.length ? await query('SELECT id, mime, filename FROM media WHERE workspace_id=$1 AND id = ANY($2) AND uploaded', [workspaceId, input.media]) : [];
  if (media.length !== new Set(input.media || []).size) errors.push('Some media files were not found or have not finished uploading. Confirm each upload with PATCH /media/{id} { "uploaded": true }.');
  const accounts = await query('SELECT id, platform, username FROM social_accounts WHERE workspace_id=$1 AND id = ANY($2)', [workspaceId, (input.targets || []).map((t) => t.account_id)]);
  const byId = new Map(accounts.map((a) => [a.id, a]));
  const over = accounts.length ? await overLimitAccountIds(workspaceId) : new Set<string>();
  const hasImg = media.some((m) => m.mime.startsWith('image/'));
  const hasVid = media.some((m) => m.mime.startsWith('video/'));
  for (const t of input.targets || []) {
    const acc = byId.get(t.account_id);
    if (!acc) { errors.push(`Unknown account ${t.account_id}`); continue; }
    const p = PLATFORMS[acc.platform as PlatformId];
    if (acc.platform === 'instagram' || acc.platform === 'facebook') {
      const format = metaFormat(t.options);
      const problem = metaFormatProblem(format, media) ?? (acc.platform === 'facebook' && format === 'post' ? facebookMixProblem(media) : null);
      if (problem) errors.push(`${p.label} (@${acc.username}): ${problem}`);
    }
    if (acc.platform === 'instagram') {
      const notJpeg = nonJpegImages(media);
      if (notJpeg.length) errors.push(`Instagram only accepts JPEG images. Convert ${notJpeg.map((m) => m.filename || m.id).join(', ')} to JPEG or deselect @${acc.username}.`);
    }
    if (over.has(acc.id)) errors.push(`${p.label} (@${acc.username}) is paused because the workspace is over its plan's account limit. Upgrade or disconnect an account.`);
    const text = t.caption ?? input.caption ?? '';
    // On X, Bluesky and Threads a caption split by `---` lines is a thread: each part has the limit.
    const parts = threadParts(text, acc.platform);
    if (parts.length > MAX_THREAD_PARTS) errors.push(`${p.label} (@${acc.username}): a thread can have up to ${MAX_THREAD_PARTS} posts (this one has ${parts.length})`);
    else if (parts.length > 1) {
      parts.forEach((part, i) => { if (part.length > p.maxChars) errors.push(`${p.label} (@${acc.username}): part ${i + 1} of the thread is ${part.length}/${p.maxChars} characters`); });
    } else if (text.length > p.maxChars) errors.push(`${p.label} (@${acc.username}): ${text.length}/${p.maxChars} characters`);
    const comment = firstComment(t.options);
    if (comment) {
      if (!COMMENT_PLATFORMS.has(acc.platform)) errors.push(`${p.label} (@${acc.username}) cannot post a first comment`);
      else if (comment.length > commentLimit(acc.platform)) errors.push(`${p.label} (@${acc.username}): first comment ${comment.length}/${commentLimit(acc.platform)} characters`);
    }
    if (p.requiresMedia === 'any' && !media.length) errors.push(`${p.label} needs an image or video`);
    if (p.requiresMedia === 'image' && !hasImg) errors.push(`${p.label} needs an image`);
    if (p.requiresMedia === 'video' && !hasVid) errors.push(`${p.label} needs a video`);
  }
  return errors;
}

function statusFor(input: PostInput, existing?: any) {
  if (input.publish_now) return { status: 'scheduled', at: now() };
  if (input.status === 'draft' || input.scheduled_at === null) return { status: 'draft', at: input.scheduled_at ?? null };
  if (input.scheduled_at != null) return { status: 'scheduled', at: input.scheduled_at };
  return { status: existing?.status === 'failed' ? 'scheduled' : existing?.status || 'draft', at: existing?.scheduled_at ?? null };
}

/** How far in the past a new scheduled time may be (slow requests, clock differences). */
export const PAST_GRACE_MS = 5 * 60_000;

/**
 * A post can't be newly scheduled in the past: it would publish the moment it is saved. A post that
 * was already due (a failed post being retried, an overdue post being edited) keeps its time, since
 * saving it doesn't make anything go out sooner. Returns an error message or null.
 */
export function pastScheduleProblem(status: string, at: number | null, existing: any, publishNow = false, t = now()): string | null {
  if (publishNow || status !== 'scheduled' || at == null || at >= t - PAST_GRACE_MS) return null;
  if (existing && existing.status !== 'draft' && existing.scheduled_at != null && existing.scheduled_at <= t) return null;
  return 'scheduled_at is in the past. Pick a time from now on, or publish the post now.';
}

/**
 * The repeating series a post belongs to: its anchor (first occurrence) and its occurrence number.
 * The anchor stays put through edits, retries and "publish now"; giving the post a new time
 * re-anchors the series there.
 */
export function repeatSeries(input: PostInput, existing: any, at: number | null): { anchor: number | null; n: number } {
  const repeat = input.repeat ?? existing?.repeat ?? 'none';
  if (repeat === 'none') return { anchor: null, n: 0 };
  const moved = !input.publish_now && input.scheduled_at != null && input.scheduled_at !== existing?.scheduled_at;
  if (existing?.repeat_anchor != null && existing.repeat === repeat && !moved) return { anchor: existing.repeat_anchor, n: existing.repeat_n ?? 0 };
  return { anchor: at, n: 0 };
}

/** Create or replace a post (and its targets). Published targets are kept as they are. */
export async function savePost(workspaceId: string, input: PostInput, userId: string | null) {
  const existing = input.id ? await getPost(workspaceId, input.id) : null;
  if (input.id && !existing && !/^[\w-]{1,64}$/.test(input.id)) throw new HttpError(400, 'Bad post id');
  if (existing && existing.status === 'publishing') throw new HttpError(409, 'This post is publishing right now. Try again in a minute.');
  const id = existing?.id || input.id || uid('post');
  const t = now();
  const { status, at } = statusFor(input, existing);
  const past = pastScheduleProblem(status, at, existing, input.publish_now, t);
  if (past) throw new HttpError(422, past);
  const series = repeatSeries(input, existing, at);
  const fields = [
    input.caption ?? existing?.caption ?? '', JSON.stringify(input.media ?? existing?.media ?? []), at, status,
    JSON.stringify(input.labels ?? existing?.labels ?? []), input.repeat ?? existing?.repeat ?? 'none', input.evergreen ?? existing?.evergreen ?? false,
    input.approval === undefined ? existing?.approval ?? null : input.approval, input.remind ?? existing?.remind ?? true, input.note ?? existing?.note ?? '',
    input.batch === undefined ? existing?.batch ?? null : input.batch,
    input.signature ?? existing?.signature ?? true,
    series.anchor, series.n,
  ];
  await tx(async (q) => {
    if (existing) {
      if (existing.status === 'published' && status !== 'published') throw new HttpError(409, 'Published posts cannot be rescheduled. Duplicate it instead.');
      await q(`UPDATE posts SET caption=$1, media=$2, scheduled_at=$3, status=$4, labels=$5, repeat=$6, evergreen=$7, approval=$8, remind=$9, note=$10, batch=$11, signature=$12, repeat_anchor=$13, repeat_n=$14, updated_at=$15 WHERE id=$16 AND workspace_id=$17`,
        [...fields, t, id, workspaceId]);
    } else {
      await q(`INSERT INTO posts (caption, media, scheduled_at, status, labels, repeat, evergreen, approval, remind, note, batch, signature, repeat_anchor, repeat_n, id, workspace_id, created_by, created_at, updated_at)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$18)`, [...fields, id, workspaceId, userId, t]);
    }
    if (input.targets) {
      const keep = new Map<string, any>((existing?.targets || []).map((x: any) => [x.account_id, x]));
      await q('DELETE FROM post_targets WHERE post_id=$1 AND status <> $2', [id, 'published']);
      for (const tg of input.targets) {
        const prev = keep.get(tg.account_id);
        if (prev?.status === 'published') continue;
        await q('INSERT INTO post_targets (id,post_id,account_id,caption_override,options) VALUES ($1,$2,$3,$4,$5)',
          [uid('tgt'), id, tg.account_id, tg.caption ?? null, JSON.stringify(tg.options || {})]);
      }
    } else {
      if (status === 'scheduled') {
        await q(`UPDATE post_targets SET status='pending', error=NULL, attempts=0, progress='{}'::jsonb WHERE post_id=$1 AND status='failed'`, [id]);
      }
      // An Instagram upload saved by an earlier attempt holds the old caption and media.
      const changed = existing && ((input.caption !== undefined && input.caption !== existing.caption) || (input.media !== undefined && JSON.stringify(input.media) !== JSON.stringify(existing.media)));
      if (changed) await q(`UPDATE post_targets SET progress = progress - 'ig' - 'waits' WHERE post_id=$1 AND status <> 'published'`, [id]);
    }
  });
  return (await getPost(workspaceId, id))!;
}

export async function deletePost(workspaceId: string, id: string) {
  return (await exec('DELETE FROM posts WHERE id=$1 AND workspace_id=$2', [id, workspaceId])) > 0;
}

export async function accountRow(id: string) {
  return one('SELECT * FROM social_accounts WHERE id=$1', [id]);
}
