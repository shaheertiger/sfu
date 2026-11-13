import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { Breadcrumbs, MarketingPage, TrialCta } from '@/components/marketing/Chrome';
import m from '@/components/marketing/marketing.module.css';
import s from '@/components/marketing/best-time.module.css';
import { NOTIFY_ROOT, NOTIFY_VERIFIED, answerLabel, notifyActionsFor, notifyCopy, notifyEntry, notifyFaq, notifyPath, notifyPlatformsFor } from '@/lib/notify';
import { abs, breadcrumbLd, faqPageLd } from '@/lib/seo-pages';
import { organizationLd } from '@/lib/seo';
import { pagePath as bestTimePath } from '@/lib/best-time-pages';
import { platformBySlug as bestTimePlatform } from '@/lib/best-time';
import Figure, { figuresLd } from '@/components/marketing/Figure';
import { notifyFigures } from '@/lib/figures';

const Pill = ({ answer }) => {
  const tone = answer === 'yes' ? { background: '#fde8e8', color: '#9b1c1c' } : answer === 'no' ? { background: '#e6f6ec', color: '#166534' } : { background: '#fff4d6', color: '#92400e' };
  return <span style={{ ...tone, borderRadius: 999, padding: '2px 10px', fontWeight: 600, fontSize: '0.9em', whiteSpace: 'nowrap' }}>{answerLabel(answer)}</span>;
};

export default function NotifyPage({ platform, action }) {
  const entry = notifyEntry(platform.slug, action.slug);
  const path = notifyPath(platform.slug, action.slug);
  const copy = notifyCopy(platform, action, entry);
  const faq = notifyFaq(platform, action, entry);
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Does it notify?', href: NOTIFY_ROOT }, { name: platform.name, href: notifyPath(platform.slug) }, { name: action.short.replace(/^\w/, (c) => c.toUpperCase()), href: path }];
  const siblings = notifyActionsFor(platform.slug).filter((a) => a.slug !== action.slug);
  const others = notifyPlatformsFor(action.slug).filter((p) => p.slug !== platform.slug);
  const [heroFig, matrixFig] = notifyFigures(platform.slug, action.slug);
  const img = figuresLd([heroFig, matrixFig].filter(Boolean));
  const ld = { '@context': 'https://schema.org', '@graph': [organizationLd(), { '@type': 'WebPage', '@id': `${abs(path)}#webpage`, url: abs(path), name: copy.title, description: copy.description, inLanguage: 'en', dateModified: NOTIFY_VERIFIED, ...img.primary }, ...img.nodes, breadcrumbLd(crumbs), faqPageLd(faq)] };
  return (
    <MarketingPage>
      <JsonLd data={ld} />
      <div className={m.container}>
        <Breadcrumbs items={crumbs} />
        <section className={m.hero}>
          <span className={m.eyebrow}>{platform.name} privacy · verified {NOTIFY_VERIFIED}</span>
          <h1 className={m.h1}>{copy.h1}</h1>
          <p className={m.lead}><strong>{entry.rule}</strong> {entry.detail}</p>
          <Figure fig={heroFig} priority />
          <div className={m.toolArea}>
            <div className={s.answer} style={{ gridTemplateColumns: '1fr' }}>
              <div className={s.slot}>
                <div className={s.slotRank}>Short answer</div>
                <div className={s.slotTime}>{copy.short}</div>
                <div className={s.slotDay}>{platform.name} · {action.gerund}</div>
              </div>
            </div>
          </div>
        </section>
        <article className={`${m.narrow} ${m.prose}`}>
          <section className={m.section}>
            <h2 id="sees">What the Other Person Actually Sees</h2>
            <p>{entry.sees}</p>
            <div className="table-wrap">
              <table><thead><tr><th>Question</th><th>Answer</th></tr></thead><tbody>
                <tr><td>Do they get a notification?</td><td><Pill answer={entry.answer} /></td></tr>
                <tr><td>What is visible to them</td><td>{entry.sees}</td></tr>
                <tr><td>How to be sure</td><td>{entry.sure}</td></tr>
                <tr><td>Last checked</td><td>{NOTIFY_VERIFIED} against {platform.name}'s help center (<Link href="/methodology#does-it-notify">how we check</Link>)</td></tr>
              </tbody></table>
            </div>
          </section>
          {entry.except.length > 0 && (
            <section className={m.section}>
              <h2 id="exceptions">The Exceptions That Catch People Out</h2>
              <ul>{entry.except.map((e) => <li key={e}>{e}</li>)}</ul>
            </section>
          )}
          {others.length > 0 && (
            <section className={m.section}>
              <h2 id="compare">Same Action on Other Platforms</h2>
              <Figure fig={matrixFig} />
              <div className="table-wrap">
                <table><thead><tr><th>Platform</th><th>Notifies?</th><th>Rule</th></tr></thead><tbody>
                  <tr><td><strong>{platform.name}</strong></td><td><Pill answer={entry.answer} /></td><td>{entry.rule}</td></tr>
                  {others.map((p) => { const e = notifyEntry(p.slug, action.slug); return <tr key={p.slug}><td><Link href={notifyPath(p.slug, action.slug)}>{p.name}</Link></td><td><Pill answer={e.answer} /></td><td>{e.rule}</td></tr>; })}
                </tbody></table>
              </div>
            </section>
          )}
          <section className={m.section}>
            <h2 id="more">Other {platform.name} Privacy Questions</h2>
            <ul className={s.chips}>{siblings.map((a) => <li key={a.slug}><Link href={notifyPath(platform.slug, a.slug)} className={s.chip}>{a.short.replace(/^\w/, (c) => c.toUpperCase())}: {answerLabel(notifyEntry(platform.slug, a.slug).answer)}</Link></li>)}</ul>
            <p>Source: {platform.name}'s help centre (<a href={platform.help} rel="nofollow noopener" target="_blank">{platform.help.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a>) and the live app, last checked {NOTIFY_VERIFIED}. <Link href="/docs">Report a change</Link>.</p>
          </section>
          <section className={m.faq} aria-labelledby="faq">
            <h2 id="faq">Frequently Asked Questions</h2>
            {faq.map((f) => <div key={f.q} className={m.faqItem}><h3>{f.q}</h3><p>{f.a}</p></div>)}
          </section>
          {bestTimePlatform(platform.slug) ? (
            <TrialCta heading={`Plan your ${platform.name} posts from one calendar`}><p>Schedule For You plans and publishes your {platform.name} posts from one calendar. Free plan: 3 accounts, up to 10 scheduled posts at a time, no card. See also the <Link href={bestTimePath(platform.slug)} style={{ color: 'inherit' }}>best time to post on {platform.name}</Link>.</p></TrialCta>
          ) : (
            <TrialCta heading="Plan your social posts from one calendar"><p>Schedule For You publishes to Instagram, TikTok, Facebook, LinkedIn, X, Threads, YouTube, Pinterest and Bluesky from one calendar, with Google Business Profile coming soon. Free plan: 3 accounts, up to 10 scheduled posts at a time, no card.</p></TrialCta>
          )}
        </article>
      </div>
    </MarketingPage>
  );
}
