import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import BestTimeHeatmap from '@/components/marketing/BestTimeHeatmap';
import { Breadcrumbs, MarketingPage, TrialCta } from '@/components/marketing/Chrome';
import m from '@/components/marketing/marketing.module.css';
import s from '@/components/marketing/best-time.module.css';
import { getBestTime } from '@/lib/server/best-time';
import { BEST_TIME_PLATFORMS, WEEKDAY_NAMES, bestWeekday, formatHour, formatRange, platformBySlug, scoreGrid, topHoursOfDay, topSlots } from '@/lib/best-time';
import { BEST_TIME_ROOT, pageCopy, pageFaq, pagePath, parseSegment, siblingLinks } from '@/lib/best-time-pages';
import { abs, breadcrumbLd, faqPageLd } from '@/lib/seo-pages';
import { organizationLd } from '@/lib/seo';
import { TOOLS } from '@/lib/tools/registry';

/** Everything a best-time page needs, computed once per render (ISR, daily). */
export async function loadBestTimePage(platformSlug, segment = '') {
  const platform = platformBySlug(platformSlug);
  const seg = parseSegment(segment);
  if (!platform || !seg) return null;
  const data = await getBestTime(platform.id, seg.kind === 'country' ? seg.country.code : null);
  const scores = scoreGrid(data.grid);
  const bestDay = bestWeekday(scores);
  const best = seg.kind === 'weekday' ? topHoursOfDay(scores, seg.weekday, 5).map((h) => ({ ...h, weekday: seg.weekday })) : topSlots(scores, 5);
  const copy = pageCopy({ platform: platformSlug, segment, best, bestDay, source: data.source, posts: data.posts });
  return { platform, seg, data, scores, bestDay, best, copy, faq: pageFaq({ platform: platformSlug, segment }) };
}

export default function BestTimePage({ page, segment }) {
  const { platform, seg, data, scores, bestDay, best, copy, faq } = page;
  const path = pagePath(platform.slug, segment);
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Best time to post', href: BEST_TIME_ROOT },
    { name: `${platform.name}`, href: pagePath(platform.slug) },
    ...(segment ? [{ name: copy.h1, href: path }] : []),
  ];
  const links = siblingLinks(platform.slug, segment);
  const tools = TOOLS.filter((t) => t.platform === platform.id).slice(0, 4);
  const updated = data.computedAt ? new Date(data.computedAt).toISOString().slice(0, 10) : null;
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationLd(),
      { '@type': 'WebPage', '@id': `${abs(path)}#webpage`, url: abs(path), name: copy.title, description: copy.description, isPartOf: { '@id': `${abs('/')}#website` }, inLanguage: 'en', ...(updated ? { dateModified: updated } : {}) },
      { '@type': 'Dataset', name: `${platform.name} posting times by weekday and hour`, description: copy.description, url: abs(path), creator: { '@type': 'Organization', name: 'Schedule For You' }, temporalCoverage: 'P90D', variableMeasured: ['posts per hour', 'link clicks per post'] },
      breadcrumbLd(crumbs),
      faqPageLd(faq),
    ],
  };
  const slotLabel = (b) => (seg.kind === 'weekday' ? formatRange(b.hour) : `${WEEKDAY_NAMES[b.weekday]} ${formatHour(b.hour)}`);

  return (
    <MarketingPage>
      <JsonLd data={ld} />
      <div className={m.container}>
        <Breadcrumbs items={crumbs} />
        <section className={m.hero}>
          <span className={m.eyebrow}>{data.source === 'baseline' ? 'Baseline · switches to live data automatically' : `Live data · ${data.posts.toLocaleString('en-US')} scheduled posts · last 90 days`}</span>
          <h1 className={m.h1}>{copy.h1}</h1>
          <p className={m.lead}>{copy.intro}</p>
          <div className={m.toolArea}>
            <div className={s.answer}>
              {best.slice(0, 3).map((b, i) => (
                <div key={i} className={s.slot}>
                  <div className={s.slotRank}>{i === 0 ? 'Best slot' : `#${i + 1}`}</div>
                  <div className={s.slotTime}>{seg.kind === 'weekday' ? formatRange(b.hour) : formatHour(b.hour)}</div>
                  <div className={s.slotDay}>{seg.kind === 'weekday' ? WEEKDAY_NAMES[seg.weekday] : WEEKDAY_NAMES[b.weekday]}</div>
                  <div className={s.slotScore}>Score {b.score}/100 · local time</div>
                </div>
              ))}
            </div>
            <BestTimeHeatmap scores={scores} highlightDay={seg.kind === 'weekday' ? seg.weekday : null} caption={`${platform.name}${seg.kind === 'country' ? ` in ${seg.country.short}` : ''}: how busy each hour is, 0–100, in your local time. ${updated ? `Updated ${updated}.` : ''}`} />
            <p className={s.source}>Source: posts scheduled through Schedule For You, counted per local weekday and hour; the busiest slots with the best link clicks per post score highest. No individual account data is shown. <Link href="/privacy">How we handle data</Link>.</p>
          </div>
        </section>

        <article className={`${m.narrow} ${m.prose}`}>
          <section className={m.section}>
            <h2 id="by-day">{seg.kind === 'weekday' ? `Every hour on ${WEEKDAY_NAMES[seg.weekday]}` : `Best time to post on ${platform.name} by day of the week`}</h2>
            {seg.kind === 'weekday' ? (
              <p>Scores for {WEEKDAY_NAMES[seg.weekday]}, best first: {topHoursOfDay(scores, seg.weekday, 24).map((h) => `${formatHour(h.hour)} (${h.score})`).join(', ')}.</p>
            ) : (
              <ul>
                {WEEKDAY_NAMES.map((name, d) => {
                  const hours = topHoursOfDay(scores, d, 3);
                  return <li key={d}><Link href={pagePath(platform.slug, name.toLowerCase())}>{name}</Link>: {hours.map((h) => formatHour(h.hour)).join(', ')}{d === bestDay ? ' — strongest day' : ''}</li>;
                })}
              </ul>
            )}
            <ul className={s.chips}>
              {links.days.map((d) => <li key={d.href}><Link href={d.href} className={`${s.chip} ${d.current ? s.chipOn : ''}`}>{d.label}</Link></li>)}
            </ul>
          </section>

          <section className={m.section}>
            <h2 id="by-country">Best time to post on {platform.name} by country</h2>
            <p>Audiences are local. Pick the country most of your followers are in; each page uses posts scheduled by accounts in that country, in that country's time.</p>
            <ul className={s.chips}>
              {links.countries.map((c) => <li key={c.href}><Link href={c.href} className={`${s.chip} ${c.current ? s.chipOn : ''}`}>{c.label}</Link></li>)}
            </ul>
          </section>

          <section className={m.section}>
            <h2 id="how-to-use">How to use these times</h2>
            <ol>
              <li>Pick the top three slots {seg.kind === 'country' ? `for ${seg.country.short}` : 'above'}: {best.slice(0, 3).map(slotLabel).join(', ')}.</li>
              <li>Set them as posting slots in your queue, so every new {platform.name} post takes the next free one.</li>
              <li>After three weeks, compare reach per slot in {platform.name}'s own insights and drop the weakest.</li>
            </ol>
            <p>Timing is a tiebreaker, not a strategy: a strong first line, a native-size image and a clear call to action matter more than the hour.</p>
          </section>

          <section className={m.faq} aria-labelledby="faq">
            <h2 id="faq">Frequently asked questions</h2>
            {faq.map((f) => (
              <div key={f.q} className={m.faqItem}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </section>

          <TrialCta heading={`Post to ${platform.name} at these times automatically`} >
            <p>Set posting slots once; Schedule For You fills them. Free plan: 3 accounts, up to 10 scheduled posts at a time, no card.</p>
          </TrialCta>

          <div className={m.more}>
            <section>
              <h3>Other platforms{seg.kind === 'weekday' ? ` on ${WEEKDAY_NAMES[seg.weekday]}` : seg.kind === 'country' ? ` in ${seg.country.short}` : ''}</h3>
              <ul className={m.linkGrid}>
                {links.platforms.map((p) => <li key={p.href}><Link href={p.href} className={m.linkCard}>{p.label}</Link></li>)}
              </ul>
            </section>
            {tools.length > 0 && (
              <section>
                <h3>Free {platform.name} tools</h3>
                <ul className={m.linkGrid}>
                  {tools.map((t) => <li key={t.slug}><Link href={`/tools/${t.slug}`} className={m.linkCard}>{t.slug.replace(/-/g, ' ')}</Link></li>)}
                </ul>
              </section>
            )}
          </div>
        </article>
      </div>
    </MarketingPage>
  );
}

export const BEST_TIME_PLATFORM_LIST = BEST_TIME_PLATFORMS;
