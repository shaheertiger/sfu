import Link from 'next/link';
import m from './marketing.module.css';
import { PLATFORM_PAGES } from '@/lib/platform-pages';
import { LANDING_PAGES } from '@/lib/landing-pages';
import NavAuth from './NavAuth';
import { pageString } from '@/lib/i18n';

/** Header, footer and breadcrumbs shared by the tools, blog and comparison pages. Server components. */

export function SiteHeader() {
  return (
    <header className={m.header}>
      <div className={`${m.container} ${m.headerInner}`}>
        <Link href="/" className={m.brand} aria-label="Schedule For You home">
          <img src="/logos/schedule-for-you-glyph.svg" alt="" width="26" height="26" />
          <span className={m.brandText}>schedule for you</span>
        </Link>
        <nav className={m.nav} aria-label="Main">
          <Link href="/tools">Free tools</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/pricing" className={m.navHide}>Pricing</Link>
          <NavAuth hideClass={m.navHide} ctaClass={m.navCta} />
        </nav>
      </div>
    </header>
  );
}

const FOOTER = [
  {
    title: 'Free tools',
    links: [
      ['/tools/font-generator', 'Font generator'],
      ['/tools/x-character-counter', 'X character counter'],
      ['/tools/instagram-line-break-generator', 'Instagram line breaks'],
      ['/tools/instagram-photo-resizer', 'Instagram photo resizer'],
      ['/tools/instagram-bio-generator', 'Instagram bio generator'],
      ['/tools', 'All free tools'],
    ],
  },
  {
    title: 'Guides',
    links: [
      ['/blog/best-days-to-post-on-social-media', 'Best days to post'],
      ['/blog/reel-size-instagram', 'Instagram Reel size'],
      ['/blog/tiktok-video-size-ratio', 'TikTok video size'],
      ['/blog/image-sizes-for-linkedin-posts', 'LinkedIn image sizes'],
      ['/blog', 'All articles'],
    ],
  },
  {
    title: 'Compare',
    links: [
      ['/compare/later/recurpost', 'Later vs. RecurPost'],
      ['/compare/brandwatch/recurpost', 'Brandwatch vs. RecurPost'],
      ...LANDING_PAGES.filter((p) => p.group === 'Compare').map((p) => [`/${p.slug}`, p.name]),
      ['/blog/free-hootsuite-alternative', 'Hootsuite alternatives'],
    ],
  },
  {
    title: 'Platforms',
    links: PLATFORM_PAGES.map((p) => [`/${p.slug}`, p.name]),
  },
  {
    title: 'Product',
    links: [
      ['/about', 'About'],
      ['/pricing', 'Pricing'],
      ...LANDING_PAGES.filter((p) => p.group === 'Product' && p.slug !== 'pricing').map((p) => [`/${p.slug}`, p.name]),
      ['/docs', 'API reference'],
      ['/blog/connect-facebook-page', 'Connect a Facebook Page'],
      ['/blog/connect-google-business-profile', 'Connect Google Business'],
      ['/signup', 'Start free'],
      ['/login', 'Sign in'],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className={m.footer}>
      <div className={m.container}>
        <div className={m.footGrid}>
          <div>
            <Link href="/" className={m.brand}>
              <img src="/logos/schedule-for-you-glyph.svg" alt="" width="22" height="22" />
              <span>schedule for you</span>
            </Link>
            <p style={{ marginTop: 12, lineHeight: 1.55 }}>Write one post, tailor it per platform and publish to ten networks from one queue.</p>
          </div>
          {FOOTER.map((col) => (
            <div key={col.title}>
              <p className={m.footTitle}>{col.title}</p>
              <ul>
                {col.links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className={m.footNote}>© 2026 Schedule For You · <Link href="/privacy">Privacy Policy</Link> · <Link href="/data-deletion">Data deletion</Link>. Platform names are trademarks of their owners; Schedule For You is not affiliated with them.</p>
      </div>
    </footer>
  );
}

/** Visible breadcrumbs. `items` is [{ name, href }]; the last item is the current page. */
export function Breadcrumbs({ items }) {
  return (
    <nav className={m.crumbs} aria-label="Breadcrumb">
      <ol>
        {items.map((it, i) => (
          <li key={it.href}>{i === items.length - 1 ? <span aria-current="page">{it.name}</span> : <Link href={it.href}>{it.name}</Link>}</li>
        ))}
      </ol>
    </nav>
  );
}

/** `locale` translates the buttons on localized pages (the sign-up flow itself is in English). */
export function TrialCta({ heading, html, children, locale = 'en' }) {
  return (
    <section className={m.cta} aria-labelledby="cta-heading">
      <h2 id="cta-heading">{heading}</h2>
      {html ? <div dangerouslySetInnerHTML={{ __html: html }} /> : children}
      <div className={m.ctaRow}>
        <Link href="/signup" className={`${m.btn} ${m.btnPrimary}`}>{pageString(locale, 'trial')}</Link>
        <Link href="/pricing" className={m.btn}>{pageString(locale, 'pricing')}</Link>
      </div>
      <p className={m.ctaNote}>{pageString(locale, 'trialNote')}</p>
    </section>
  );
}

/**
 * Links to the same page in other languages. `current` is the page's own language; `links` is
 * [{ locale, name, path }] including English.
 */
export function LanguageLinks({ current = 'en', links }) {
  const others = (links || []).filter((l) => l.locale !== current);
  if (!others.length) return null;
  return (
    <nav className={m.meta} aria-label={pageString(current, 'otherLanguages')} style={{ marginTop: 28 }}>
      {pageString(current, 'otherLanguages')}:{' '}
      {others.map((l, i) => (
        <span key={l.locale}>
          {i > 0 && ' · '}
          <Link href={l.path} hrefLang={l.locale} lang={l.locale}>{l.name}</Link>
        </span>
      ))}
    </nav>
  );
}

/** `lang` marks the main content's language on localized pages; header and footer stay English. */
export function MarketingPage({ children, lang }) {
  return (
    <div className={m.page}>
      <SiteHeader />
      <main lang={lang}>{children}</main>
      <SiteFooter />
    </div>
  );
}
