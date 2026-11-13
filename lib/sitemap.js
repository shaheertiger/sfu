/**
 * The public sitemap, split into one file per page family and one per language, so coverage in
 * Search Console can be read family by family. /sitemap.xml is the index (app/sitemap.xml/route.js);
 * each family is /sitemaps/<family>.xml (app/sitemaps/[file]/route.js).
 *
 * lastmod is only sent where we know when the content last changed: a post's `updated` date, the
 * date specs and notify answers were verified, the date the best-time data was fetched. Pages with
 * no honest date get none. Signed-in pages, previews and utility pages (signup, demo) are left out.
 */
import { siteUrl } from './site';
import { getComparisons, getContentPage, getPlatformPages, getPosts, getStaticPage, getToolPages } from './content';
import { PLATFORM_PAGES } from './platform-pages';
import { LANDING_PAGES } from './landing-pages';
import { toolBySlug } from './tools/registry';
import { allLocalizedPages, hreflangMap } from './i18n-pages';
import { BEST_TIME_ROOT, allBestTimePages, pagePath as bestTimePath } from './best-time-pages';
import { SPECS_ROOT, SPECS_VERIFIED, SPEC_PLATFORMS, allSpecPages, specPath } from './specs';
import { NOTIFY_PLATFORMS, NOTIFY_ROOT, NOTIFY_VERIFIED, allNotifyPages, notifyPath } from './notify';
import { POST_IDEAS_ROOT, allPostIdeaPages, postIdeasPath } from './post-ideas';
import { allProgrammaticFigures, markdownImages } from './figures';
import { TRENDS_META, bestTimeIndexable } from './best-time-trends';

/** Every family's entries: { family: [{ url, lastModified?, changeFrequency, priority, images?, languages? }] }. */
export function sitemapFamilies() {
  const base = siteUrl();
  const posts = getPosts();
  const latest = (dates) => dates.filter(Boolean).sort().pop();
  const languages = (kind, slug) => {
    const map = hreflangMap(kind, slug);
    return map ? { languages: Object.fromEntries(Object.entries(map).map(([l, p]) => [l, `${base}${p}`])) } : {};
  };
  const abs = (p) => `${base}${p}`;
  const figs = new Map(allProgrammaticFigures().map((x) => [x.page, x.figures.map((f) => abs(f.src))]));
  const images = (path) => { const list = figs.get(path); return list?.length ? { images: list } : {}; };
  const mdImages = (dir, slug) => { const list = markdownImages(dir, slug).map(abs); return list.length ? { images: list } : {}; };
  const methodology = getStaticPage('methodology');
  const comparisons = getComparisons();

  const localized = {};
  for (const p of allLocalizedPages()) {
    const locale = p.path.split('/')[1];
    (localized[`lang-${locale}`] ||= []).push({ url: abs(p.path), changeFrequency: 'monthly', priority: p.kind === 'platforms' ? 0.8 : 0.7, ...languages(p.kind, p.slug) });
  }

  return {
    core: [
      { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
      ...PLATFORM_PAGES.filter((p) => getPlatformPages().some((c) => c.slug === p.slug)).map((p) => ({ url: abs(`/${p.slug}`), changeFrequency: 'monthly', priority: 0.8, ...languages('platforms', p.slug) })),
      ...(getStaticPage('about') ? [{ url: abs('/about'), changeFrequency: 'yearly', priority: 0.4 }] : []),
      ...(methodology ? [{ url: abs('/methodology'), lastModified: methodology.updated, changeFrequency: 'monthly', priority: 0.5 }] : []),
      ...LANDING_PAGES.filter((p) => getContentPage(p.slug)).map((p) => ({ url: abs(`/${p.slug}`), lastModified: getContentPage(p.slug).page.updated, changeFrequency: 'monthly', priority: p.slug === 'pricing' ? 0.9 : 0.7 })),
      { url: abs('/docs'), changeFrequency: 'monthly', priority: 0.7 },
      { url: abs('/compare'), lastModified: latest(comparisons.map((c) => c.updated || c.date)), changeFrequency: 'monthly', priority: 0.5 },
      ...comparisons.map((c) => ({ url: abs(`/compare/${c.aSlug}/${c.bSlug}`), lastModified: c.updated || c.date, changeFrequency: 'monthly', priority: 0.6 })),
    ],
    tools: [
      { url: abs('/tools'), changeFrequency: 'weekly', priority: 0.8 },
      ...getToolPages().filter((p) => toolBySlug(p.slug)).map((p) => ({ url: abs(`/tools/${p.slug}`), changeFrequency: 'monthly', priority: 0.7, ...languages('tools', p.slug), ...mdImages('tools', p.slug) })),
    ],
    blog: [
      { url: abs('/blog'), lastModified: latest(posts.map((p) => p.updated || p.date)), changeFrequency: 'weekly', priority: 0.7 },
      ...posts.map((p) => ({ url: abs(`/blog/${p.slug}`), lastModified: p.updated || p.date, changeFrequency: 'monthly', priority: 0.6, ...languages('blog', p.slug), ...mdImages('blog', p.slug) })),
    ],
    'best-time': [
      { url: abs(BEST_TIME_ROOT), lastModified: TRENDS_META.fetchedAt, changeFrequency: 'weekly', priority: 0.8, ...images(BEST_TIME_ROOT) },
      ...allBestTimePages().filter((p) => bestTimeIndexable(p.platform, p.segment)).map((p) => ({ url: abs(bestTimePath(p.platform, p.segment)), lastModified: TRENDS_META.fetchedAt, changeFrequency: 'weekly', priority: p.segment ? 0.6 : 0.8, ...images(bestTimePath(p.platform, p.segment)) })),
    ],
    specs: [
      { url: abs(SPECS_ROOT), lastModified: SPECS_VERIFIED, changeFrequency: 'monthly', priority: 0.7, ...images(SPECS_ROOT) },
      ...SPEC_PLATFORMS.map((p) => ({ url: abs(specPath(p.slug)), lastModified: SPECS_VERIFIED, changeFrequency: 'monthly', priority: 0.7, ...images(specPath(p.slug)) })),
      ...allSpecPages().map((p) => ({ url: abs(specPath(p.platform, p.spec)), lastModified: SPECS_VERIFIED, changeFrequency: 'monthly', priority: 0.6, ...images(specPath(p.platform, p.spec)) })),
    ],
    'does-it-notify': [
      { url: abs(NOTIFY_ROOT), lastModified: NOTIFY_VERIFIED, changeFrequency: 'monthly', priority: 0.7, ...images(NOTIFY_ROOT) },
      ...NOTIFY_PLATFORMS.map((p) => ({ url: abs(notifyPath(p.slug)), lastModified: NOTIFY_VERIFIED, changeFrequency: 'monthly', priority: 0.7, ...images(notifyPath(p.slug)) })),
      ...allNotifyPages().map((p) => ({ url: abs(notifyPath(p.platform, p.action)), lastModified: NOTIFY_VERIFIED, changeFrequency: 'monthly', priority: 0.6, ...images(notifyPath(p.platform, p.action)) })),
    ],
    'post-ideas': [
      { url: abs(POST_IDEAS_ROOT), changeFrequency: 'monthly', priority: 0.7 },
      ...allPostIdeaPages().map((p) => ({ url: abs(postIdeasPath(p.industry)), changeFrequency: 'monthly', priority: 0.6 })),
    ],
    ...localized,
  };
}

/** Every URL in every family, for IndexNow and tests. */
export const allSitemapEntries = () => Object.values(sitemapFamilies()).flat();

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** One family as sitemap XML, with hreflang alternates and image entries. */
export function familyXml(entries) {
  const urls = entries.map((e) => [
    '<url>',
    `<loc>${esc(e.url)}</loc>`,
    ...Object.entries(e.languages || {}).map(([l, href]) => `<xhtml:link rel="alternate" hreflang="${esc(l)}" href="${esc(href)}"/>`),
    ...(e.images || []).map((src) => `<image:image><image:loc>${esc(src)}</image:loc></image:image>`),
    e.lastModified ? `<lastmod>${esc(e.lastModified)}</lastmod>` : '',
    `<changefreq>${e.changeFrequency}</changefreq>`,
    `<priority>${e.priority}</priority>`,
    '</url>',
  ].filter(Boolean).join('\n'));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>\n`;
}

/** The sitemap index: one <sitemap> per family, with the newest lastmod inside it. */
export function indexXml(families) {
  const base = siteUrl();
  const items = Object.entries(families).map(([name, entries]) => {
    const last = entries.map((e) => e.lastModified).filter(Boolean).sort().pop();
    return `<sitemap>\n<loc>${esc(`${base}/sitemaps/${name}.xml`)}</loc>${last ? `\n<lastmod>${esc(last)}</lastmod>` : ''}\n</sitemap>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join('\n')}\n</sitemapindex>\n`;
}
