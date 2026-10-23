import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { getComparisons, getContentPage, getPlatformPages, getPosts, getStaticPage, getToolPages } from '../lib/content.js';
import { TOOLS, toolBySlug } from '../lib/tools/registry.js';
import { PLATFORM_PAGES } from '../lib/platform-pages.js';
import { LANDING_PAGES } from '../lib/landing-pages.js';

const ROOT = path.join(process.cwd(), 'content');
const files = (dir: string) => fs.readdirSync(path.join(ROOT, dir)).filter((f) => f.endsWith('.md')).map((f) => [f.slice(0, -3), fs.readFileSync(path.join(ROOT, dir, f), 'utf8')] as const);
const all = [...files('tools'), ...files('blog'), ...files('compare'), ...files('platforms'), ...files('pages')];

test('every tool in the registry has a page, and every tool page has a tool', () => {
  const pages = getToolPages().map((p: any) => p.slug).sort();
  assert.deepEqual(pages, TOOLS.map((t) => t.slug).sort());
  for (const p of getToolPages() as any[]) assert.ok(toolBySlug(p.slug), p.slug);
});

test('tool pages have the metadata, FAQ and call to action the template needs', () => {
  for (const p of getToolPages() as any[]) {
    for (const k of ['title', 'description', 'h1', 'lead', 'keyword']) assert.ok(p[k], `${p.slug}: ${k}`);
    assert.ok(Array.from(p.title as string).length <= 70, `${p.slug}: title too long`);
    assert.ok(p.description.length >= 110 && p.description.length <= 170, `${p.slug}: description length ${p.description.length}`);
    assert.ok(p.sections.length >= 3, `${p.slug}: sections`);
    assert.ok(p.faq.length >= 4, `${p.slug}: faq`);
    assert.ok(p.cta, `${p.slug}: cta`);
  }
});

test('articles have metadata, one mid-article CTA and an FAQ', () => {
  for (const p of [...getPosts(), ...getComparisons()] as any[]) {
    for (const k of ['title', 'description', 'h1', 'category', 'excerpt', 'date']) assert.ok(p[k], `${p.slug}: ${k}`);
    assert.match(p.date, /^\d{4}-\d{2}-\d{2}$/, p.slug);
    assert.ok(p.htmlAfter.length > 0, `${p.slug}: missing <!-- cta --> marker`);
    assert.ok(p.faq.length >= 3, `${p.slug}: faq`);
  }
  for (const [slug, raw] of [...files('blog'), ...files('compare')]) assert.equal(raw.split('<!-- cta -->').length, 2, `${slug}: one CTA marker`);
});

test('internal links point at pages that exist', () => {
  const tools = new Set(TOOLS.map((t) => t.slug));
  const posts = new Set(files('blog').map(([s]) => s));
  const ok = (href: string) => {
    const [p] = href.split('#');
    if (['', '/', '/signup', '/login', '/tools', '/blog', '/compare', '/about', '/later-alternative', '/docs'].includes(p)) return true;
    if (PLATFORM_PAGES.some((x) => p === `/${x.slug}`)) return true;
    if (LANDING_PAGES.some((x) => p === `/${x.slug}`)) return true;
    let m = /^\/tools\/([a-z0-9-]+)$/.exec(p);
    if (m) return tools.has(m[1]);
    m = /^\/blog\/([a-z0-9-]+)$/.exec(p);
    if (m) return posts.has(m[1]);
    return /^\/compare\/[a-z0-9-]+\/[a-z0-9-]+$/.test(p);
  };
  for (const [slug, raw] of all) {
    for (const [, href] of raw.matchAll(/\]\((\/[^)\s]*)\)/g)) assert.ok(ok(href), `${slug}: broken link ${href}`);
  }
});

test('copy never promises what the product does not do', () => {
  // Free plans and no-card trials may be discussed for other tools; any sentence about our own
  // product that mentions one must say we don't offer it.
  const banned = [/\bfree plan\b/i, /\bno card\b/i, /\bno credit card\b/i, /free forever/i, /\bAI[- ](?:powered|writer|generated|assistant)\b/i];
  const ours = /Schedule For You|\bour (?:plan|trial|tool|app|scheduler)|\bwe (?:offer|have|include)/i;
  const negated = /\b(?:no|not|never|without)\b|n['’]t\b/i;
  for (const [slug, raw] of all) {
    const sentences = raw.replace(/\n+/g, ' ').split(/(?<=[.!?])\s+/);
    for (const sentence of sentences) {
      if (!banned.some((re) => re.test(sentence)) || !ours.test(sentence) || sentence.trim().endsWith('?')) continue;
      assert.ok(negated.test(sentence), `${slug}: "${sentence.slice(0, 160)}"`);
    }
  }
});

test('pages for platforms we do not publish to never say we schedule there', () => {
  const unsupported = ['Discord', 'Telegram', 'Reddit', 'Slack'];
  const claim = (p: string) => new RegExp(`(?:schedul\\w*|publish\\w*|auto-?post\\w*)\\s+(?:your\\s+)?(?:posts?|messages?|content|updates?)?\\s*(?:to|on)\\s+${p}\\b`, 'i');
  for (const [slug, raw] of all) {
    for (const p of unsupported) {
      for (const m of raw.matchAll(new RegExp(claim(p).source, 'gi'))) {
        const before = raw.slice(Math.max(0, (m.index ?? 0) - 80), m.index);
        assert.ok(/(?:not|n['’]t|no)\b[^.]*$/i.test(before), `${slug}: "${m[0]}" reads like a claim`);
      }
    }
  }
});

test('every platform landing page has copy, and the copy has a FAQ and call to action', () => {
  const slugs = files('platforms').map(([s]) => s).sort();
  assert.deepEqual(slugs, PLATFORM_PAGES.map((p) => p.slug).sort());
  for (const p of getPlatformPages() as any[]) {
    for (const k of ['title', 'description', 'h1', 'lead', 'keyword']) assert.ok(p[k], `${p.slug}: ${k}`);
    assert.ok(p.faq.length >= 4, `${p.slug}: faq`);
    assert.ok(p.cta, `${p.slug}: cta`);
  }
  for (const slug of ['about', 'later-alternative']) assert.ok((getStaticPage(slug) as any)?.title, slug);
});

test('every standalone page has copy and a route, and every page file is listed', () => {
  const listed = new Set(LANDING_PAGES.map((p) => p.slug));
  for (const [slug] of files('pages')) if (slug !== 'about') assert.ok(listed.has(slug), `content/pages/${slug}.md is not in LANDING_PAGES`);
  for (const { slug } of LANDING_PAGES) {
    const c = getContentPage(slug) as any;
    assert.ok(c, `${slug}: missing content`);
    assert.ok(fs.existsSync(path.join(process.cwd(), 'app', slug, 'page.jsx')), `${slug}: missing route`);
    for (const k of ['title', 'description', 'h1']) assert.ok(c.page[k], `${slug}: ${k}`);
    if (c.layout !== 'legal') assert.ok(c.page.faq.length >= 4, `${slug}: faq`);
  }
});

test('the privacy policy covers every platform we publish to and names a contact', () => {
  const privacy = fs.readFileSync(path.join(ROOT, 'pages', 'privacy.md'), 'utf8');
  for (const name of ['Facebook', 'Instagram', 'Threads', 'X', 'LinkedIn', 'TikTok', 'YouTube', 'Google Business Profile', 'Pinterest', 'Bluesky']) assert.ok(privacy.includes(`| ${name} |`), name);
  assert.match(privacy, /privacy@scheduleforyou\.com/);
  assert.match(privacy, /Limited Use/);
});
