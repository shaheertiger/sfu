import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Figure, { figuresLd } from '@/components/marketing/Figure';
import { specIndexFigures } from '@/lib/figures';
import { Breadcrumbs, MarketingPage } from '@/components/marketing/Chrome';
import m from '@/components/marketing/marketing.module.css';
import { SPECS_ROOT, SPECS_VERIFIED, SPEC_PLATFORMS, equivalentSpec, specPath } from '@/lib/specs';
import { AnswerBanner, Table } from '@/components/marketing/BestTimeCountry';
import { abs, breadcrumbLd, datasetLd, itemListLd, pageMetadata } from '@/lib/seo-pages';
import { organizationLd } from '@/lib/seo';

const TITLE = `Social Media Image Sizes & Character Limits (${new Date().getUTCFullYear()}): All Platforms`;
const DESCRIPTION = `Instagram, TikTok, Facebook, LinkedIn, X, Threads, YouTube, Pinterest, Bluesky and Google Business Profile sizes and limits in one place, verified ${SPECS_VERIFIED}.`;
export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: SPECS_ROOT, absolute: true, keyword: 'social media image sizes' });

/** The columns of the all-platforms table: one spec role each (lib/specs.js equivalentSpec). */
const COLUMNS = [
  ['Feed image', 'post-image-size'],
  ['Story / vertical video', 'story-size'],
  ['Profile picture', 'profile-picture-size'],
  ['Banner / cover', 'banner-size'],
  ['Post text limit', 'post-character-limit'],
];
const cell = (p, slug) => {
  const s = equivalentSpec(p, { slug });
  return s ? <Link href={specPath(p.slug, s.slug)}>{s.answer}</Link> : '—';
};
/** The most common answer across platforms for a role, for the quick answer. */
const commonest = (slug) => {
  const counts = new Map();
  for (const p of SPEC_PLATFORMS) { const a = equivalentSpec(p, { slug })?.answer; if (a) counts.set(a, (counts.get(a) || 0) + 1); }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
};

export default function SpecsIndex() {
  const feed = commonest('post-image-size');
  const vertical = commonest('story-size');
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Specs & limits', href: SPECS_ROOT }];
  const figs = specIndexFigures();
  const img = figuresLd(figs);
  const ld = { '@context': 'https://schema.org', '@graph': [organizationLd(), { '@type': 'CollectionPage', '@id': `${abs(SPECS_ROOT)}#webpage`, url: abs(SPECS_ROOT), name: TITLE, description: DESCRIPTION, inLanguage: 'en', ...img.primary }, ...img.nodes, datasetLd({ name: 'Social media image sizes and character limits by platform', description: DESCRIPTION, path: SPECS_ROOT, dateModified: SPECS_VERIFIED, variables: COLUMNS.map((c) => c[0]) }), itemListLd('Sizes and limits by platform', SPEC_PLATFORMS.map((p) => ({ name: `${p.name} sizes and limits`, path: specPath(p.slug) }))), breadcrumbLd(crumbs)] };
  return (
    <MarketingPage>
      <JsonLd data={ld} />
      <div className={m.container}>
        <Breadcrumbs items={crumbs} />
        <section className={m.hero}>
          <span className={m.eyebrow}>Verified {SPECS_VERIFIED}</span>
          <h1 className={m.h1}>Social Media Image Sizes and Character Limits ({new Date().getUTCFullYear()})</h1>
          <AnswerBanner>The most common feed image size is {feed[0]} ({feed[1]} of {SPEC_PLATFORMS.length} platforms), and Stories, Reels, TikTok and Shorts use {vertical[0]}.</AnswerBanner>
          <p className={m.lead}>Image sizes, video specs and character limits for every platform Schedule For You publishes to, in one table. Each value links to its own page with the details. <Link href="/methodology#specs">How we check them</Link>.</p>
          <Figure fig={figs[0]} priority />
        </section>
        <article className={`${m.narrow} ${m.prose}`}>
          <section className={m.section}>
            <h2 id="all-platforms">Social Media Image Sizes for Every Platform</h2>
            <Table head={['Platform', ...COLUMNS.map((c) => c[0])]} rows={SPEC_PLATFORMS.map((p) => [<Link key={p.slug} href={specPath(p.slug)}>{p.name}</Link>, ...COLUMNS.map(([, slug]) => cell(p, slug))])} />
            <blockquote><p><strong>Key point:</strong> upload at the recommended size and ratio, not just any large image: each platform crops to its own ratio, and text near the edges is the first thing to go.</p></blockquote>
          </section>
          {SPEC_PLATFORMS.map((p) => (
            <section key={p.slug} className={m.section}>
              <h2 id={p.slug}>What Size Are {p.name} Posts, and What's the Character Limit?</h2>
              <Table head={['Spec', 'Size or limit']} rows={p.specs.map((x) => [<Link key={x.slug} href={specPath(p.slug, x.slug)}>{x.h1.replace(`${p.name} `, '').replace(/^\w/, (c) => c.toUpperCase())}</Link>, x.answer])} />
              <p><Link href={specPath(p.slug)}>Every {p.name} size and limit</Link></p>
            </section>
          ))}
        </article>
      </div>
    </MarketingPage>
  );
}
