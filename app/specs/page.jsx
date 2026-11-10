import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Figure, { figuresLd } from '@/components/marketing/Figure';
import { specIndexFigures } from '@/lib/figures';
import { Breadcrumbs, MarketingPage } from '@/components/marketing/Chrome';
import m from '@/components/marketing/marketing.module.css';
import { SPECS_ROOT, SPECS_VERIFIED, SPEC_PLATFORMS, specPath } from '@/lib/specs';
import { abs, breadcrumbLd, pageMetadata } from '@/lib/seo-pages';
import { organizationLd } from '@/lib/seo';

const TITLE = `Social Media Image Sizes & Character Limits (${new Date().getUTCFullYear()}): All Platforms`;
const DESCRIPTION = `Instagram, TikTok, Facebook, LinkedIn, X, Threads, YouTube, Pinterest, Bluesky and Google Business Profile sizes and limits in one place, verified ${SPECS_VERIFIED}.`;
export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: SPECS_ROOT, absolute: true, keyword: 'social media image sizes' });

export default function SpecsIndex() {
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Specs & limits', href: SPECS_ROOT }];
  const figs = specIndexFigures();
  const img = figuresLd(figs);
  const ld = { '@context': 'https://schema.org', '@graph': [organizationLd(), { '@type': 'CollectionPage', '@id': `${abs(SPECS_ROOT)}#webpage`, url: abs(SPECS_ROOT), name: TITLE, description: DESCRIPTION, inLanguage: 'en', ...img.primary }, ...img.nodes, breadcrumbLd(crumbs)] };
  return (
    <MarketingPage>
      <JsonLd data={ld} />
      <div className={m.container}>
        <Breadcrumbs items={crumbs} />
        <section className={m.hero}><span className={m.eyebrow}>Verified {SPECS_VERIFIED}</span><h1 className={m.h1}>Social media sizes and limits</h1><p className={m.lead}>Image sizes, video specs and character limits for every platform Schedule For You publishes to.</p><Figure fig={figs[0]} priority /></section>
        <article className={`${m.narrow} ${m.prose}`}>
          <div className={m.more}>{SPEC_PLATFORMS.map((p) => (
            <section key={p.slug}><h3><Link href={specPath(p.slug)}>{p.name}</Link></h3><ul className={m.linkGrid}>{p.specs.map((s) => <li key={s.slug}><Link href={specPath(p.slug, s.slug)} className={m.linkCard}>{s.h1.replace(`${p.name} `, '')}<span>{s.answer}</span></Link></li>)}</ul></section>
          ))}</div>
        </article>
      </div>
    </MarketingPage>
  );
}
