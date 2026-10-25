import { PLATFORMS, type PlatformId } from './platforms';

/*
 * Threads and first comments. Pure helpers shared by the server (validation, publishing) and the
 * dashboard (character counters), so there is no `server-only` import here.
 */

/** Platforms where a caption split by `---` lines is published as a thread (a chain of replies). */
export const THREAD_PLATFORMS: ReadonlySet<string> = new Set(['x', 'bluesky', 'threads']);
/** Platforms that can post a comment on the published post right after it goes live. */
export const COMMENT_PLATFORMS: ReadonlySet<string> = new Set(['x', 'bluesky', 'threads', 'instagram', 'facebook', 'linkedin']);
export const MAX_THREAD_PARTS = 25;

/** A line holding only `---` (spaces around it allowed) separates the parts of a thread. */
const SEPARATOR = /(?:^|\r?\n)[ \t]*---[ \t]*(?=\r?\n|$)/;

/** The parts of a caption, split on separator lines. Empty parts are dropped; a caption without separators is one part. */
export function splitThread(caption: string): string[] {
  const parts = caption.split(SEPARATOR).map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts : [caption.trim()];
}

/** The posts a caption becomes on a platform: several for a thread on X, Bluesky or Threads, otherwise just the caption. */
export function threadParts(caption: string, platform: string): string[] {
  return THREAD_PLATFORMS.has(platform) ? splitThread(caption) : [caption];
}

export const isThread = (caption: string, platform: string) => threadParts(caption, platform).length > 1;

/** Per-platform comment length limits (each platform's own rule for comments, not posts). */
const COMMENT_LIMITS: Record<string, number> = { x: 280, bluesky: 300, threads: 500, instagram: 2200, facebook: 8000, linkedin: 1250 };
export function commentLimit(platform: string): number {
  return COMMENT_LIMITS[platform] ?? PLATFORMS[platform as PlatformId]?.maxChars ?? 2200;
}

/** The first comment set on a target (`options.first_comment`), trimmed, or null when there is none. */
export function firstComment(options: Record<string, any> | null | undefined): string | null {
  const v = options?.first_comment;
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t ? t : null;
}
