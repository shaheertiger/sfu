/** "Post as" for Instagram and Facebook: a feed post (default), a Reel or a Story. */
export type MetaFormat = 'post' | 'reel' | 'story';
export const metaFormat = (options?: Record<string, any> | null): MetaFormat =>
  options?.format === 'reel' || options?.format === 'story' ? options.format : 'post';

/**
 * What a Reel or Story needs, checked before anything is uploaded. Returns an error message or null.
 * Reels are one video; Stories are one image or one video.
 */
export function metaFormatProblem(format: MetaFormat, media: { mime: string }[]): string | null {
  const videos = media.filter((m) => m.mime.startsWith('video/')).length;
  if (format === 'reel' && (media.length !== 1 || videos !== 1)) return 'A Reel needs exactly one video.';
  if (format === 'story' && media.length !== 1) return 'A Story needs exactly one image or video.';
  return null;
}
