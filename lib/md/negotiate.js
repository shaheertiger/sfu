import { isMarkdownPath } from './registry';

/** `text/markdown` wins only when a client asks for it with a higher q than text/html; `*\/*` and no header stay HTML. */
export function wantsMarkdown(accept) {
  if (!accept) return false;
  let md = -1, html = -1;
  for (const part of accept.split(',')) {
    const [type, ...params] = part.trim().split(';');
    const q = Number((params.find((x) => x.trim().startsWith('q=')) || 'q=1').trim().slice(2));
    const t = type.trim().toLowerCase();
    if (t === 'text/markdown') md = Math.max(md, Number.isNaN(q) ? 1 : q);
    else if (t === 'text/html') html = Math.max(html, Number.isNaN(q) ? 1 : q);
  }
  return md > 0 && md > html;
}

/** Paths the markdown rewrite never touches: the API, Next internals, well-known files and the policy files. */
const NEVER = /^\/(api|_next|\.well-known)\/|^\/(llms(-full)?|ai|robots)\.txt$|^\/sitemap\.xml$/;

/**
 * The HTML path a request wants markdown for: /pricing.md → /pricing, /index.md → /, a page fetched
 * with Accept: text/markdown → itself, or null for a normal request. An unknown .md path still maps
 * (to the markdown 404) so the markdown endpoint never answers with HTML.
 * @param {string} path
 * @param {string | null} accept
 * @param {string} method
 */
export function markdownTarget(path, accept, method = 'GET') {
  if (NEVER.test(path)) return null;
  if (path.endsWith('.md')) return path === '/index.md' ? '/' : path.slice(0, -3);
  const wants = (method === 'GET' || method === 'HEAD') && wantsMarkdown(accept);
  return wants && isMarkdownPath(path) ? path : null;
}
