import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Figure, { figuresLd } from '@/components/marketing/Figure';
import { notifyIndexFigures } from '@/lib/figures';
import { Breadcrumbs, MarketingPage } from '@/components/marketing/Chrome';
import m from '@/components/marketing/marketing.module.css';
import { NOTIFY_ACTIONS, NOTIFY_PLATFORMS, NOTIFY_ROOT, NOTIFY_VERIFIED, allNotifyPages, answerLabel, notifyEntry, notifyPath } from '@/lib/notify';
import { abs, breadcrumbLd, itemListLd, pageMetadata } from '@/lib/seo-pages';
import { organizationLd } from '@/lib/seo';

const total = allNotifyPages().length;
const TITLE = `Does It Notify? ${total} Social Media Actions, Yes or No (${new Date().getUTCFullYear()})`;
const DESCRIPTION = `Screenshots, story views, unfollows, blocks, saves and more on ${NOTIFY_PLATFORMS.map((p) => p.name).join(', ')}: a plain yes/no for each, with what the other person sees. Verified ${NOTIFY_VERIFIED}.`;
export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: NOTIFY_ROOT, absolute: true, keyword: 'does it notify when you screenshot' });

export default function NotifyIndex() {
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Does it notify?', href: NOTIFY_ROOT }];
  const figs = notifyIndexFigures();
  const img = figuresLd(figs);
  const ld = { '@context': 'https://schema.org', '@graph': [organizationLd(), { '@type': 'CollectionPage', '@id': `${abs(NOTIFY_ROOT)}#webpage`, url: abs(NOTIFY_ROOT), name: TITLE, description: DESCRIPTION, inLanguage: 'en', dateModified: NOTIFY_VERIFIED, ...img.primary }, ...img.nodes, itemListLd('Does it notify? by platform', NOTIFY_PLATFORMS.map((p) => ({ name: `What does ${p.name} notify people about?`, path: notifyPath(p.slug) }))), breadcrumbLd(crumbs)] };
  const actions = [...NOTIFY_ACTIONS].sort((a, b) => a.order - b.order);
  return (
    <MarketingPage>
      <JsonLd data={ld} />
      <div className={m.container}>
        <Breadcrumbs items={crumbs} />
        <section className={m.hero}><span className={m.eyebrow}>Verified {NOTIFY_VERIFIED}</span><h1 className={m.h1}>Does it notify? Every platform, every action</h1><p className={m.lead}>Only Snapchat tells people about screenshots. Story views show everywhere they exist. Unfollows, blocks, mutes and saves are silent on every platform. The grid below has the {total} answers; each cell opens the exceptions.</p><Figure fig={figs[0]} priority /></section>
        <article className={`${m.narrow} ${m.prose}`}>
          <div className="table-wrap"><table><thead><tr><th>When you…</th>{NOTIFY_PLATFORMS.map((p) => <th key={p.slug}><Link href={notifyPath(p.slug)}>{p.name.replace(' (Twitter)', '')}</Link></th>)}</tr></thead><tbody>
            {actions.map((a) => <tr key={a.slug}><td>{a.short.replace(/^\w/, (c) => c.toUpperCase())}</td>{NOTIFY_PLATFORMS.map((p) => { const e = notifyEntry(p.slug, a.slug); return <td key={p.slug}>{e ? <Link href={notifyPath(p.slug, a.slug)}>{answerLabel(e.answer)}</Link> : '—'}</td>; })}</tr>)}
          </tbody></table></div>
          <p>"Partly" means the answer depends on a setting or a message type; the page explains which. A dash means the platform has no such feature.</p>
          <div className={m.more}>{NOTIFY_PLATFORMS.map((p) => (
            <section key={p.slug}><h3><Link href={notifyPath(p.slug)}>{p.name}</Link></h3><ul className={m.linkGrid}>{actions.filter((a) => notifyEntry(p.slug, a.slug)).slice(0, 6).map((a) => <li key={a.slug}><Link href={notifyPath(p.slug, a.slug)} className={m.linkCard}>{a.q.replace('{p}', p.name)}<span>{answerLabel(notifyEntry(p.slug, a.slug).answer)}</span></Link></li>)}</ul></section>
          ))}</div>
        </article>
      </div>
    </MarketingPage>
  );
}
