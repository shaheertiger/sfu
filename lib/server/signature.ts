import { PLATFORMS, type PlatformId } from './platforms';

/** Adds the workspace signature on its own paragraph, unless it is already there or would push the post past the platform's limit. */
export function withSignature(caption: string, signature: string, platform: string) {
  if (!signature || caption.includes(signature)) return caption;
  const next = caption.trim() ? `${caption.trimEnd()}\n\n${signature}` : signature;
  const max = PLATFORMS[platform as PlatformId]?.maxChars;
  return max && next.length > max ? caption : next;
}
