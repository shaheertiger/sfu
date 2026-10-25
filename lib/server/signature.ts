import { PLATFORMS, type PlatformId } from './platforms';
import { splitThread, THREAD_PLATFORMS } from './thread';

/**
 * Adds the workspace signature on its own paragraph, unless it is already there or would push the
 * post past the platform's limit. On a thread (X, Bluesky, Threads) it goes on the last part.
 */
export function withSignature(caption: string, signature: string, platform: string) {
  if (!signature || caption.includes(signature)) return caption;
  const max = PLATFORMS[platform as PlatformId]?.maxChars;
  const parts = THREAD_PLATFORMS.has(platform) ? splitThread(caption) : [caption];
  if (parts.length > 1) {
    const last = parts[parts.length - 1];
    const next = `${last}\n\n${signature}`;
    if (max && next.length > max) return caption;
    // Keep the caption as written and only extend its last part.
    const i = caption.lastIndexOf(last);
    return caption.slice(0, i) + next + caption.slice(i + last.length);
  }
  const next = caption.trim() ? `${caption.trimEnd()}\n\n${signature}` : signature;
  return max && next.length > max ? caption : next;
}
