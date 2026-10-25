import { abs, tokens } from './format';

/** The AEO spec version these responses implement (dualmark.dev/docs/spec/overview). */
export const AEO_VERSION = '1.0';

/**
 * Response headers for every markdown page: see the "AI-readable pages" section of the README.
 * @param {string} markdown
 * @param {{ path?: string, status?: number, updated?: string | number | null, cache?: string, head?: boolean }} [opts]
 */
export function markdownResponse(markdown, { path = '', status = 200, updated = /** @type {string | number | null} */ (null), cache = 'public, s-maxage=3600, stale-while-revalidate=86400', head = false } = {}) {
  const canonical = path ? abs(path) : null;
  const headers = new Headers({
    'Content-Type': 'text/markdown; charset=utf-8',
    'X-Markdown-Tokens': String(tokens(markdown)),
    'X-AEO-Version': AEO_VERSION,
    'X-Robots-Tag': 'noindex, follow',
    'Vary': 'Accept',
    'Cache-Control': status === 200 ? cache : 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  });
  if (canonical) {
    headers.set('Content-Location', canonical);
    headers.set('Link', `<${canonical}>; rel="canonical"`);
  }
  if (updated && !Number.isNaN(Date.parse(String(updated)))) headers.set('Last-Modified', new Date(updated).toUTCString());
  return new Response(head ? null : markdown, { status, headers });
}

export const notFoundMarkdown = (path) => `# Not found\n\n> There is no markdown version of \`${path}\`.\n\nThe list of pages that have one: ${abs('/llms.txt')}\n`;

export const textResponse = (text, { cache = 'public, s-maxage=86400, stale-while-revalidate=604800', head = false, type = 'text/plain; charset=utf-8' } = {}) =>
  new Response(head ? null : text, { status: 200, headers: { 'Content-Type': type, 'Cache-Control': cache, 'Access-Control-Allow-Origin': '*', 'X-Robots-Tag': 'noindex, follow', 'X-AEO-Version': AEO_VERSION } });

export const preflight = () => new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS', 'Access-Control-Allow-Headers': 'Accept', 'Access-Control-Max-Age': '86400' } });
