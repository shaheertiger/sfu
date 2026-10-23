import fs from 'node:fs';
import path from 'node:path';
import { Marked } from 'marked';

/**
 * Markdown pages under content/: tools/<slug>.md, blog/<slug>.md and compare/<a>-vs-<b>.md.
 * Read at build time (every page using this is statically generated).
 */

const ROOT = path.join(process.cwd(), 'content');
export const CTA_MARKER = '<!-- cta -->';
export const FAQ_HEADING = 'Frequently asked questions';

export const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;|&#\d+;/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Headings get ids (for the table of contents); external links open in a new tab. */
const md = new Marked({
  gfm: true,
  renderer: {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      return `<h${depth} id="${slugify(text)}">${text}</h${depth}>\n`;
    },
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const external = /^https?:\/\//.test(href);
      const t = title ? ` title="${esc(title)}"` : '';
      return external ? `<a href="${esc(href)}"${t} target="_blank" rel="noopener">${text}</a>` : `<a href="${esc(href)}"${t}>${text}</a>`;
    },
    table(token) {
      // Wide tables scroll inside their own box on phones instead of widening the page.
      const header = token.header.map((c) => `<th>${this.parser.parseInline(c.tokens)}</th>`).join('');
      const rows = token.rows.map((r) => `<tr>${r.map((c) => `<td>${this.parser.parseInline(c.tokens)}</td>`).join('')}</tr>`).join('');
      return `<div class="table-wrap"><table><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table></div>\n`;
    },
  },
});

export const renderMarkdown = (src) => md.parse(String(src || '').trim());
export const renderInline = (src) => md.parseInline(String(src || ''));

/** Plain text of a markdown snippet, for structured data and descriptions. */
export const plainText = (src) =>
  String(src || '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`~]+/g, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

/** `---` frontmatter of simple `key: value` lines, then the body. */
export function parseFrontmatter(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!m) return { data: {}, body: raw };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i < 1) continue;
    let v = line.slice(i + 1).trim();
    if (/^(['"]).*\1$/.test(v)) v = v.slice(1, -1);
    data[line.slice(0, i).trim()] = v;
  }
  return { data, body: m[2] };
}

/** Splits a body into H2 sections: [{ heading, body }]. Text before the first H2 is the intro. */
export function splitSections(body) {
  const parts = String(body).split(/^## +/m);
  const intro = parts.shift().trim();
  const sections = parts.map((p) => {
    const nl = p.indexOf('\n');
    return { heading: (nl < 0 ? p : p.slice(0, nl)).trim(), body: nl < 0 ? '' : p.slice(nl + 1).trim() };
  });
  return { intro, sections };
}

/** Questions and answers under "## Frequently asked questions": `### Q?` followed by the answer. */
export function parseFaq(sectionBody) {
  return String(sectionBody || '')
    .split(/^### +/m)
    .slice(1)
    .map((block) => {
      const nl = block.indexOf('\n');
      const q = (nl < 0 ? block : block.slice(0, nl)).trim();
      const a = nl < 0 ? '' : block.slice(nl + 1).trim();
      return { q, a };
    })
    .filter((x) => x.q && x.a);
}

const words = (s) => String(s).split(/\s+/).filter(Boolean).length;

function readDir(dir) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => ({ slug: f.slice(0, -3), raw: fs.readFileSync(path.join(full, f), 'utf8') }));
}

const cache = new Map();
function cached(key, fn) {
  if (!cache.has(key)) cache.set(key, fn());
  return cache.get(key);
}

/**
 * A tool page: intro sections, FAQ and the closing call to action (the H2 after the FAQ).
 */
function parseToolPage(slug, raw) {
  const { data, body } = parseFrontmatter(raw);
  const { sections } = splitSections(body);
  const faqIdx = sections.findIndex((s) => s.heading.toLowerCase() === FAQ_HEADING.toLowerCase());
  const content = faqIdx < 0 ? sections : sections.slice(0, faqIdx);
  const after = faqIdx < 0 ? [] : sections.slice(faqIdx + 1);
  const cta = after[0] || null;
  return {
    slug,
    ...data,
    sections: content.map((s) => ({ ...s, id: slugify(s.heading), html: renderMarkdown(s.body) })),
    faq: faqIdx < 0 ? [] : parseFaq(sections[faqIdx].body),
    cta: cta ? { heading: cta.heading, html: renderMarkdown(cta.body) } : null,
    extra: after.slice(1).map((s) => ({ ...s, id: slugify(s.heading), html: renderMarkdown(s.body) })),
  };
}

export const getToolPages = () => cached('tools', () => readDir('tools').map(({ slug, raw }) => parseToolPage(slug, raw)));
export const getToolPage = (slug) => getToolPages().find((p) => p.slug === slug) || null;

/**
 * An article (blog post or comparison): the body is split at the CTA marker so a call-to-action box
 * can sit mid-article; the FAQ is also returned on its own for structured data.
 */
function parseArticle(slug, raw) {
  const { data, body } = parseFrontmatter(raw);
  const { sections } = splitSections(body);
  const faqSection = sections.find((s) => s.heading.toLowerCase() === FAQ_HEADING.toLowerCase());
  const [before, after = ''] = body.split(CTA_MARKER);
  return {
    slug,
    ...data,
    toc: sections.map((s) => ({ heading: s.heading, id: slugify(renderInline(s.heading)) })),
    htmlBefore: renderMarkdown(before),
    htmlAfter: renderMarkdown(after),
    faq: faqSection ? parseFaq(faqSection.body) : [],
    words: words(body),
    readingMinutes: Math.max(1, Math.round(words(body) / 230)),
  };
}

export const getPosts = () =>
  cached('blog', () =>
    readDir('blog')
      .map(({ slug, raw }) => parseArticle(slug, raw))
      .sort((a, b) => String(b.date).localeCompare(String(a.date)) || a.slug.localeCompare(b.slug)),
  );
export const getPost = (slug) => getPosts().find((p) => p.slug === slug) || null;

export const getComparisons = () =>
  cached('compare', () =>
    readDir('compare').map(({ slug, raw }) => {
      const [a, b] = slug.split('-vs-');
      return { ...parseArticle(slug, raw), aSlug: a, bSlug: b };
    }),
  );
export const getComparison = (a, b) => getComparisons().find((c) => c.aSlug === a && c.bSlug === b) || null;

/** Platform landing pages: content/platforms/<slug>.md, same shape as a tool page. */
export const getPlatformPages = () => cached('platforms', () => readDir('platforms').map(({ slug, raw }) => parseToolPage(slug, raw)));
export const getPlatformPage = (slug) => getPlatformPages().find((p) => p.slug === slug) || null;

/** One-off pages in content/pages (about, later-alternative), parsed like articles. */
export const getStaticPage = (slug) =>
  cached(`page:${slug}`, () => {
    const file = readDir('pages').find((f) => f.slug === slug);
    return file ? parseArticle(slug, file.raw) : null;
  });
