import { siteUrl } from '../site';
import { CTA_MARKER } from '../content';

/** Markdown building blocks shared by every renderer in lib/md/registry.js. */

export const abs = (path) => (/^https?:\/\//.test(path) ? path : `${siteUrl()}${path.startsWith('/') ? path : `/${path}`}`);
export const link = (text, path) => `[${String(text).replace(/\]/g, '\\]')}](${abs(path)})`;
export const date = (d) => (d ? String(d).slice(0, 10) : '');
export const today = () => new Date().toISOString().slice(0, 10);

/** Page header every markdown page starts with. */
export function header({ title, summary, path, updated }) {
  return [`# ${title}`, '', `> ${String(summary || '').replace(/\s+/g, ' ').trim()}`, '', `Canonical: ${abs(path)}`, ...(updated ? [`Last updated: ${date(updated)}`] : []), ''].join('\n');
}

/** A GitHub-flavoured table. Cells are escaped for `|` and newlines. */
export function table(head, rows) {
  const cell = (c) => String(c ?? '').replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ');
  return [`| ${head.map(cell).join(' | ')} |`, `| ${head.map(() => '---').join(' | ')} |`, ...rows.map((r) => `| ${r.map(cell).join(' | ')} |`)].join('\n');
}

export const bullets = (items) => items.map((i) => `- ${i}`).join('\n');

/** FAQ pairs as `### Question` + answer. */
export const faq = (pairs) => pairs.map(([q, a]) => `### ${q}\n\n${a}`).join('\n\n');

/**
 * A content file body made ready for agents: the mid-article CTA marker and HTML comments go,
 * relative links become absolute HTML URLs, and stray blank lines are collapsed.
 */
export function cleanBody(body) {
  return String(body || '')
    .split(CTA_MARKER).join('')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\]\((\/[^)\s]*)\)/g, (_, p) => `](${abs(p)})`)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const related = (items) => (items.length ? `\n\n## Related\n\n${bullets(items.map(([t, p]) => link(t, p)))}` : '');

/** Roughly how many tokens a model spends reading the text. */
export const tokens = (text) => Math.ceil(String(text).length / 4);
