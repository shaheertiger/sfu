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

/**
 * User-Agent patterns from the AEO spec's AI agent registry (dualmark.dev/docs/spec/ai-bot-detection).
 * These clients get the markdown twin of a page whatever their Accept header says.
 */
export const AI_AGENT_UA = /GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|Anthropic-ai|Claude-Web|Claude-SearchBot|Claude-User|PerplexityBot|Perplexity-User|Google-Extended|Applebot-Extended|cohere-ai|CCBot|Bytespider|DeepSeekBot|Amazonbot|YouBot|Diffbot|ImagesiftBot|Omgilibot|DuckAssistBot|meta-externalagent|meta-externalfetcher/i;
export const isAiAgent = (ua) => !!ua && AI_AGENT_UA.test(ua);

/**
 * True when an Accept header rules out both HTML and markdown (no text/html, text/markdown, text/*
 * or *\/* with q > 0), which the spec answers with 406. No header means anything is fine.
 * @param {string | null | undefined} accept
 */
export function acceptsNeither(accept) {
  if (!accept || !accept.trim()) return false;
  for (const part of accept.split(',')) {
    const [type, ...params] = part.trim().split(';');
    const q = Number((params.find((x) => x.trim().startsWith('q=')) || 'q=1').trim().slice(2));
    const t = type.trim().toLowerCase();
    // text/x-component is the app router's own payload request; it is never a negotiation failure.
    if (['text/html', 'text/markdown', 'text/*', '*/*', 'application/xhtml+xml', 'text/x-component'].includes(t) && (Number.isNaN(q) || q > 0)) return false;
  }
  return true;
}

/** Paths the markdown rewrite never touches: the API, Next internals, well-known files and the policy files. */
const NEVER = /^\/(api|_next|\.well-known)\/|^\/(llms(-full)?|ai|robots)\.txt$|^\/sitemap\.xml$/;

/**
 * The HTML path a request wants markdown for: /pricing.md → /pricing, /index.md → /, a page fetched
 * with Accept: text/markdown → itself, or null for a normal request. An unknown .md path still maps
 * (to the markdown 404) so the markdown endpoint never answers with HTML.
 * @param {string} path
 * @param {string | null} accept
 * @param {string} [method]
 * @param {string | null} [userAgent] a client from the AI agent registry gets markdown too
 */
export function markdownTarget(path, accept, method = 'GET', userAgent = null) {
  if (NEVER.test(path)) return null;
  if (path.endsWith('.md')) return path === '/index.md' ? '/' : path.slice(0, -3);
  const wants = (method === 'GET' || method === 'HEAD') && (wantsMarkdown(accept) || isAiAgent(userAgent));
  return wants && isMarkdownPath(path) ? path : null;
}
