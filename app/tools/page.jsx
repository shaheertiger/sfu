import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import { Breadcrumbs, MarketingPage, TrialCta } from '@/components/marketing/Chrome';
import m from '@/components/marketing/marketing.module.css';
import { getToolPage } from '@/lib/content';
import { CATEGORIES, TOOLS } from '@/lib/tools/registry';
import { collectionLd, pageMetadata } from '@/lib/seo-pages';

const TITLE = 'Free Social Media Tools: Fonts, Counters, Resizers and More';
const DESCRIPTION = 'Free social media tools that run in your browser: font and bold text generators, character counters, photo resizers, and name, bio and comment ideas.';

export const metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: '/tools', absolute: true });

const crumbs = [
  { name: 'Home', href: '/' },
  { name: 'Free tools', href: '/tools' },
];

export default function ToolsIndex() {
  const tools = TOOLS.map((t) => ({ ...t, page: getToolPage(t.slug) })).filter((t) => t.page);
  return (
    <MarketingPage>
      <JsonLd data={collectionLd({ name: TITLE, description: DESCRIPTION, path: '/tools', crumbs, items: tools.map((t) => ({ name: t.page.h1, href: `/tools/${t.slug}` })) })} />
      <div className={m.container}>
        <Breadcrumbs items={crumbs} />
        <section className={m.hero}>
          <span className={m.eyebrow}>{tools.length} free tools · No sign-up</span>
          <h1 className={m.h1}>Free social media tools</h1>
          <p className={m.lead}>Style your text, check character limits, resize images and get name, bio and comment ideas. Everything runs in your browser, and nothing you type or upload leaves your device.</p>
        </section>
        {CATEGORIES.map((c) => {
          const list = tools.filter((t) => t.category === c.id);
          if (!list.length) return null;
          return (
            <section key={c.id} className={m.group} aria-labelledby={`cat-${c.id}`}>
              <h2 id={`cat-${c.id}`}>{c.name}</h2>
              <p>{c.blurb}</p>
              <ul className={m.cards}>
                {list.map((t) => (
                  <li key={t.slug}>
                    <Link href={`/tools/${t.slug}`} className={m.card}>
                      <h3 className={m.cardTitle}>{t.page.h1}</h3>
                      <p className={m.cardText}>{t.page.lead}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        <div className={m.narrow}>
          <TrialCta heading="Schedule your posts with Schedule For You">
            <p>Write one post, tailor it for each platform and publish to X, Bluesky, Instagram, LinkedIn, Threads, TikTok, YouTube, Facebook Pages, Pinterest and Google Business Profile from one queue.</p>
          </TrialCta>
        </div>
      </div>
    </MarketingPage>
  );
}
