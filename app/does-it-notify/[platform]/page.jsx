import { fitTitle, shortPlatform } from '@/lib/fit-title';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import Figure, { figuresLd } from '@/components/marketing/Figure';
import { notifyHubFigures } from '@/lib/figures';
import { Breadcrumbs, MarketingPage } from '@/components/marketing/Chrome';
import m from '@/components/marketing/marketing.module.css';
import { NOTIFY_PLATFORMS, NOTIFY_ROOT, NOTIFY_VERIFIED, answerLabel, notifyActionsFor, notifyEntry, notifyPath, notifyPlatformBySlug } from '@/lib/notify';
import { abs, breadcrumbLd, faqPageLd, pageMetadata } from '@/lib/seo-pages';
import { organizationLd } from '@/lib/seo';

export const dynamicParams = false;
export function generateStaticParams() { return NOTIFY_PLATFORMS.map((p) => ({ platform: p.slug })); }

const copy = (p) => {
  const acts = notifyActionsFor(p.slug);
  const yes = acts.filter((a) => notifyEntry(p.slug, a.slug).answer === 'yes').length;
  return {
    title: fitTitle(`What Does ${p.name} Notify People About? ${yes} of ${acts.length} Actions Do (${new Date().getUTCFullYear()})`, `What Does ${p.name} Notify About? ${yes} of ${acts.length} Actions Do (${new Date().getUTCFullYear()})`, `What Does ${shortPlatform(p.name)} Notify About? ${yes} of ${acts.length} Actions Do (${new Date().getUTCFullYear()})`),
    description: `Screenshots, story views, unfollows, blocks, saves and ${acts.length - 5} more ${p.name} actions, each with a yes/no answer and what the other person sees. Verified ${NOTIFY_VERIFIED}.`,
    yes,
    acts,
  };
};

export async function generateMetadata({ params }) {
  const { platform } = await params; const p = notifyPlatformBySlug(platform);
  if (!p) return {};
  const c = copy(p);
  return pageMetadata({ title: c.title, description: c.description, path: notifyPath(platform), absolute: true, keyword: `does ${p.name.toLowerCase()} notify` });
}

export default async function Page({ params }) {
  const { platform } = await params; const p = notifyPlatformBySlug(platform);
  if (!p) notFound();
  const path = notifyPath(platform); const c = copy(p);
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Does it notify?', href: NOTIFY_ROOT }, { name: p.name, href: path }];
  const faq = c.acts.slice(0, 8).map((a) => { const e = notifyEntry(p.slug, a.slug); return { q: a.q.replace('{p}', p.name), a: e.rule }; });
  const figs = notifyHubFigures(p.slug);
  const img = figuresLd(figs);
  const ld = { '@context': 'https://schema.org', '@graph': [organizationLd(), { '@type': 'CollectionPage', '@id': `${abs(path)}#webpage`, url: abs(path), name: c.title, description: c.description, inLanguage: 'en', dateModified: NOTIFY_VERIFIED, ...img.primary }, ...img.nodes, breadcrumbLd(crumbs), faqPageLd(faq)] };
  const group = (answer) => c.acts.filter((a) => notifyEntry(p.slug, a.slug).answer === answer);
  return (
    <MarketingPage>
      <JsonLd data={ld} />
      <div className={m.container}>
        <Breadcrumbs items={crumbs} />
        <section className={m.hero}><span className={m.eyebrow}>Verified {NOTIFY_VERIFIED}</span><h1 className={m.h1}>What does {p.name} notify people about?</h1><p className={m.lead}>Of the {c.acts.length} things people worry about, <strong>{c.yes} send a notification</strong>, {group('partly').length} depend on the situation and {group('no').length} are silent. Tap any row for the exceptions and what the other person sees.</p><Figure fig={figs[0]} priority /></section>
        <article className={`${m.narrow} ${m.prose}`}>
          <div className="table-wrap"><table><thead><tr><th>When you…</th><th>Notifies?</th><th>Rule</th></tr></thead><tbody>
            {c.acts.map((a) => { const e = notifyEntry(p.slug, a.slug); return <tr key={a.slug}><td><Link href={notifyPath(platform, a.slug)}>{a.short.replace(/^\w/, (ch) => ch.toUpperCase())}</Link></td><td>{answerLabel(e.answer)}</td><td>{e.rule}</td></tr>; })}
          </tbody></table></div>
          <section className={m.section}>
            <h2 id="silent">What {p.name} Never Tells Anyone</h2>
            <ul>{group('no').map((a) => <li key={a.slug}><Link href={notifyPath(platform, a.slug)}>{a.gerund.replace(/^\w/, (ch) => ch.toUpperCase())}</Link></li>)}</ul>
          </section>
          {group('yes').length > 0 && (
            <section className={m.section}>
              <h2 id="visible">What Always Shows</h2>
              <ul>{group('yes').map((a) => <li key={a.slug}><Link href={notifyPath(platform, a.slug)}>{a.gerund.replace(/^\w/, (ch) => ch.toUpperCase())}</Link>: {notifyEntry(p.slug, a.slug).sees}</li>)}</ul>
            </section>
          )}
          <section className={m.faq} aria-labelledby="faq"><h2 id="faq">Frequently Asked Questions</h2>{faq.map((f) => <div key={f.q} className={m.faqItem}><h3>{f.q}</h3><p>{f.a}</p></div>)}</section>
          <div className={m.more}><section><h3>Other platforms</h3><ul className={m.linkGrid}>{NOTIFY_PLATFORMS.filter((x) => x.slug !== platform).map((x) => <li key={x.slug}><Link href={notifyPath(x.slug)} className={m.linkCard}>What does {x.name} notify people about?</Link></li>)}</ul></section></div>
        </article>
      </div>
    </MarketingPage>
  );
}
