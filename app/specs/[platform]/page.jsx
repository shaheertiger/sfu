import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import Figure, { figuresLd } from '@/components/marketing/Figure';
import { specHubFigures } from '@/lib/figures';
import { Breadcrumbs, MarketingPage } from '@/components/marketing/Chrome';
import m from '@/components/marketing/marketing.module.css';
import { SPECS_ROOT, SPECS_VERIFIED, SPEC_PLATFORMS, specPath, specPlatformBySlug } from '@/lib/specs';
import { abs, breadcrumbLd, pageMetadata } from '@/lib/seo-pages';
import { organizationLd } from '@/lib/seo';

export const dynamicParams = false;
export function generateStaticParams() { return SPEC_PLATFORMS.map((p) => ({ platform: p.slug })); }

const copy = (p) => ({ title: `${p.name} Image Sizes & Character Limits (${new Date().getUTCFullYear()}): Every Spec in One Table`, description: `All ${p.name} sizes and limits: ${p.specs.map((s) => s.h1.replace(`${p.name} `, '')).slice(0, 5).join(', ')} and more, verified ${SPECS_VERIFIED}.` });

export async function generateMetadata({ params }) {
  const { platform } = await params; const p = specPlatformBySlug(platform);
  if (!p) return {};
  return pageMetadata({ ...copy(p), path: specPath(platform), absolute: true, keyword: `${p.name.toLowerCase()} image sizes` });
}

export default async function Page({ params }) {
  const { platform } = await params; const p = specPlatformBySlug(platform);
  if (!p) notFound();
  const path = specPath(platform); const c = copy(p);
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Specs & limits', href: SPECS_ROOT }, { name: p.name, href: path }];
  const figs = specHubFigures(p.slug);
  const img = figuresLd(figs);
  const ld = { '@context': 'https://schema.org', '@graph': [organizationLd(), { '@type': 'CollectionPage', '@id': `${abs(path)}#webpage`, url: abs(path), name: c.title, description: c.description, inLanguage: 'en', dateModified: SPECS_VERIFIED, ...img.primary }, ...img.nodes, breadcrumbLd(crumbs)] };
  return (
    <MarketingPage>
      <JsonLd data={ld} />
      <div className={m.container}>
        <Breadcrumbs items={crumbs} />
        <section className={m.hero}><span className={m.eyebrow}>Verified {SPECS_VERIFIED}</span><h1 className={m.h1}>{p.name} sizes and limits</h1><p className={m.lead}>Every {p.name} image size, video spec and character limit, with the values Schedule For You checks before publishing.</p><Figure fig={figs[0]} priority /></section>
        <article className={`${m.narrow} ${m.prose}`}>
          <div className="table-wrap"><table><thead><tr><th>Spec</th><th>Value</th></tr></thead><tbody>
            {p.specs.map((s) => <tr key={s.slug}><td><Link href={specPath(platform, s.slug)}>{s.h1.replace(`${p.name} `, '')}</Link></td><td>{s.answer}</td></tr>)}
          </tbody></table></div>
          <div className={m.more}><section><h3>Other platforms</h3><ul className={m.linkGrid}>{SPEC_PLATFORMS.filter((x) => x.slug !== platform).map((x) => <li key={x.slug}><Link href={specPath(x.slug)} className={m.linkCard}>{x.name} sizes and limits</Link></li>)}</ul></section></div>
        </article>
      </div>
    </MarketingPage>
  );
}
