import { getLocalizedPage, getLocalizedPages } from './content.js';
import { LOCALE_CODES, localeData, localePath } from './i18n.js';
import { platformPage } from './platform-pages.js';
import { toolBySlug } from './tools/registry.js';

/**
 * Which localized pages exist, and the hreflang links between a page and its translations.
 * `kind` is `tools` (/tools/<slug>) or `platforms` (/<slug>).
 */

export const basePath = (kind, slug) => (kind === 'tools' ? `/tools/${slug}` : `/${slug}`);

/** A localized page counts only when its English twin (tool or platform) exists too. */
const hasTwin = (kind, slug) => (kind === 'tools' ? !!toolBySlug(slug) : !!platformPage(slug));

/** Every localized page: [{ locale, kind, slug, path, page }]. */
export function allLocalizedPages() {
  return LOCALE_CODES.flatMap((locale) =>
    ['tools', 'platforms'].flatMap((kind) =>
      getLocalizedPages(locale, kind)
        .filter((p) => hasTwin(kind, p.slug))
        .map((page) => ({ locale, kind, slug: page.slug, path: localePath(locale, basePath(kind, page.slug)), page })),
    ),
  );
}

/** The localized page for a route, or null. */
export const localizedPage = (locale, kind, slug) => (hasTwin(kind, slug) ? getLocalizedPage(locale, kind, slug) : null);

/** Languages a page is translated into: [{ locale, name, path }] (English not included). */
export function translationsOf(kind, slug) {
  return LOCALE_CODES.filter((l) => localizedPage(l, kind, slug)).map((l) => ({ locale: l, name: localeData(l).name, path: localePath(l, basePath(kind, slug)) }));
}

/** hreflang alternates for metadata and the sitemap, or undefined when a page has no translations. */
export function hreflangMap(kind, slug) {
  const list = translationsOf(kind, slug);
  if (!list.length) return undefined;
  const en = basePath(kind, slug);
  return { en, ...Object.fromEntries(list.map((t) => [t.locale, t.path])), 'x-default': en };
}

/** Comma-separated `keywords` frontmatter as a list. */
export const extraKeywords = (page) => String(page.keywords || '').split(',').map((k) => k.trim()).filter(Boolean);
