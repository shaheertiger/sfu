/**
 * Illustration cards (blog, tools and the programmatic figures, named `…-1200x<h>.webp` and
 * `…-720x<h>.webp`) are stored in Vercel Blob, uploaded by `npm run figures:upload`, and served
 * from our own domain: next.config.mjs rewrites /images/{blog,tools,figures}/<card> to the Blob
 * store when the file isn't in public/. Pages, the sitemap, JSON-LD and the markdown twins always
 * use the on-site path, so image search credits scheduleforyou.com and the URLs never change if
 * the storage does. Dashboard screenshots (1440×900) stay in public/.
 *
 * lib/figures-cdn.json holds the store's public base URL; the upload script writes it.
 */
const GENERATED = /^\/images\/(?:blog|tools|figures)\/[\w.-]+-(?:1200|720)x\d+\.webp$/;

export const isGeneratedFigure = (p) => GENERATED.test(p);

/** The 720-px variant of a 1200-px card path, or null. */
export function smallVariant(p) {
  const m = /-1200x(\d+)\.webp$/.exec(p);
  return m && isGeneratedFigure(p) ? p.replace(/-1200x\d+\.webp$/, `-720x${Math.round((720 * Number(m[1])) / 1200)}.webp`) : null;
}
