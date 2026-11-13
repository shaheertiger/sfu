import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Figure, { figuresLd } from '@/components/marketing/Figure';
import { bestTimeIndexFigures } from '@/lib/figures';
import BestTimeHeatmap from '@/components/marketing/BestTimeHeatmap';
import { AnswerBanner, Table } from '@/components/marketing/BestTimeCountry';
import { Breadcrumbs, MarketingPage, TrialCta } from '@/components/marketing/Chrome';
import m from '@/components/marketing/marketing.module.css';
import s from '@/components/marketing/best-time.module.css';
import { getBestTimeAllPlatforms } from '@/lib/server/best-time';
import { TRENDS_META } from '@/lib/best-time-trends';
import { BEST_TIME_PLATFORMS, WEEKDAY_NAMES, bestWeekday, combineScores, countryBySlug, formatHour, scoreGrid, topHoursOfDay, topSlots } from '@/lib/best-time';
import { REGIONS, formatHour24, formatOffset, offsetMinutes } from '@/lib/best-time-countries';
import { BEST_TIME_ROOT, BLOG_GUIDES, DAYS_GUIDE, both, pagePath, socialPath } from '@/lib/best-time-pages';
import { abs, breadcrumbLd, faqPageLd, itemListLd, pageMetadata } from '@/lib/seo-pages';
import { organizationLd } from '@/lib/seo';

export const revalidate = 86400;

const year = () => new Date().getUTCFullYear();
const TITLE = () => `Best Time to Post on Social Media in ${year()} (By Platform & Country)`;
const DESCRIPTION = 'The best times to post on Instagram, TikTok, Facebook, LinkedIn, X and 5 more, hour by hour for every weekday and 25 countries, built from Google Trends and Wikipedia activity data.';

export function generateMetadata() {
  return pageMetadata({ title: TITLE(), description: DESCRIPTION, path: BEST_TIME_ROOT, absolute: true, keyword: 'best time to post on social media' });
}

export default async function BestTimeIndex() {
  const all = await getBestTimeAllPlatforms(null);
  const rows = BEST_TIME_PLATFORMS.map((p) => {
    const scores = scoreGrid(all[p.id].grid);
    return { p, scores, best: topSlots(scores, 1)[0], day: bestWeekday(scores) };
  });
  const scores = combineScores(rows.map((r) => r.scores));
  const best = topSlots(scores, 3);
  const bestDay = bestWeekday(scores);
  const at = Date.now();
  // True once any platform shows posts scheduled through Schedule For You instead of Trends or the baseline.
  const measured = Object.values(all).some((d) => d.source !== 'trends' && d.source !== 'baseline');
  const faq = [
    { q: 'What is the best time to post on social media?', a: `Across all ${rows.length} platforms combined, ${WEEKDAY_NAMES[best[0].weekday]} at ${formatHour(best[0].hour)} local time scores highest, and ${WEEKDAY_NAMES[bestDay]} is the strongest day. Each platform has its own peak, listed in the table on this page.` },
    { q: 'What is the best day to post on social media?', a: `${WEEKDAY_NAMES[bestDay]}, when all platforms are combined. Work networks such as LinkedIn favour weekdays, while TikTok, Instagram and YouTube stay strong into the evening and the weekend.` },
    { q: 'Are these times in my time zone?', a: 'Yes. Every slot is local time: 9 AM means 9 AM wherever your audience is. If your followers are in another country, open that country\'s page, which lists the times in its own clock and converts them to other zones.' },
    { q: 'Which country pages are there?', a: `${REGIONS.reduce((n, r) => n + r.countries.length, 0)} countries, grouped by region below. Each has a page for social media overall and one for each of the ${rows.length} platforms.` },
    { q: 'How is the data collected?', a: `Two sources. Where enough posts are scheduled through Schedule For You, each post is counted in the hour and weekday it went out, in the account's own time zone, lifted by the link clicks it earned; only counts are kept. Everywhere else the pages use Google Trends: hourly search interest in each platform, read directly in ${TRENDS_META.countryCount} countries and weighted by hourly Wikipedia traffic (Wikimedia) so the hours reflect how many people are online. ${TRENDS_META.estimatedCount} more countries are estimated from their own Wikipedia traffic and the measured pattern, and ${TRENDS_META.baselineCount} show a starting baseline until there is data. The Trends data was refreshed ${TRENDS_META.fetchedAt}. Each page says which source it shows, and our methodology page explains each one.` },
    { q: 'How often should I check my best time?', a: 'Every few months, or after a big change in your audience. The pages here are rebuilt daily from the last 90 days, and your own insights will tell you when your followers shift.' },
  ];
  const crumbs = [{ name: 'Home', href: '/' }, { name: 'Best time to post', href: BEST_TIME_ROOT }];
  // Drawn from the committed Trends data: shown only while no platform has measured data worldwide.
  const figs = Object.values(all).every((d) => d.source === 'trends' || d.source === 'baseline') ? bestTimeIndexFigures() : [];
  const img = figuresLd(figs);
  const ld = { '@context': 'https://schema.org', '@graph': [organizationLd(), { '@type': 'CollectionPage', '@id': `${abs(BEST_TIME_ROOT)}#webpage`, url: abs(BEST_TIME_ROOT), name: TITLE(), description: DESCRIPTION, inLanguage: 'en', ...img.primary }, ...img.nodes, itemListLd('Best time to post by platform', BEST_TIME_PLATFORMS.map((p) => ({ name: `Best time to post on ${p.name}`, path: pagePath(p.slug) }))), breadcrumbLd(crumbs), faqPageLd(faq)] };
  return (
    <MarketingPage>
      <JsonLd data={ld} />
      <div className={m.container}>
        <Breadcrumbs items={crumbs} />
        <section className={m.hero}>
          <span className={m.eyebrow}>{`${measured ? 'Google Trends + scheduling data' : 'Google Trends + Wikipedia activity'} · refreshed ${TRENDS_META.fetchedAt} · local time`}</span>
          <h1 className={m.h1}>Best Time to Post on Social Media in {year()}</h1>
          <AnswerBanner>The best time to post on social media is {WEEKDAY_NAMES[best[0].weekday]} at {both(best[0].hour)}, local time.</AnswerBanner>
          <p className={m.lead}>That's the strongest slot with all {rows.length} platforms combined, but each network peaks at its own hour. Pick a platform for a full-week heatmap, or pick the country your audience is in for times in its own time zone. {measured ? 'Built from Google Trends search data and posts scheduled through Schedule For You, not a survey.' : `Built from Google Trends search data, read directly in ${TRENDS_META.countryCount} countries and estimated for the rest, not a survey.`} <Link href="/methodology">How we collect this data</Link>.</p>
          <div className={m.toolArea}>
            <BestTimeHeatmap scores={scores} caption={`All ${rows.length} platforms combined: how strong each hour is, 0–100, in your local time.`} />
          </div>
        </section>
        <article className={`${m.narrow} ${m.prose}`}>
          <Figure fig={figs[0]} priority />
          <section className={m.section}>
            <h2 id="by-platform">Best Time to Post on Each Social Media Platform</h2>
            <p>Each platform's single best slot and strongest day, in local time. Click through for the full heatmap, every weekday and every country.</p>
            <Table
              head={['Platform', 'Best time', '24-hour', 'Best day']}
              rows={rows.map(({ p, best: b, day }) => [<Link key={p.slug} href={pagePath(p.slug)}>Best time to post on {p.name}</Link>, `${WEEKDAY_NAMES[b.weekday]} ${formatHour(b.hour)}`, formatHour24(b.hour), WEEKDAY_NAMES[day]])}
            />
            <blockquote><p><strong>Key point:</strong> these are starting points. Post in the top slots for three weeks, then keep the ones your own insights say work for your followers.</p></blockquote>
          </section>

          <section className={m.section}>
            <h2 id="by-country">Best Time to Post on Social Media by Country (25 Countries)</h2>
            <p>Audiences keep local hours, so the right time depends on where your followers live. Each country page lists every platform's best time in that country's clock, its time zone and UTC offset, the cities it covers and the local habits that shift the numbers.</p>
            {REGIONS.map((r) => (
              <div key={r.slug}>
                <h3 className={s.regionTitle}>{r.name}</h3>
                <ul className={m.linkGrid}>
                  {r.countries.map((slug) => {
                    const c = countryBySlug(slug);
                    return <li key={slug}><Link href={socialPath(slug)} className={m.linkCard}>{c.short} <span style={{ opacity: 0.6, fontWeight: 400 }}>({formatOffset(offsetMinutes(c.tz, at))})</span></Link></li>;
                  })}
                </ul>
              </div>
            ))}
          </section>

          <section className={m.section}>
            <h2 id="by-day">Best Time to Post by Day of the Week</h2>
            <p>The three strongest hours for each day with all {rows.length} platforms combined, in your local time. Each platform's page has the same table for that platform alone, for example <Link href={`${pagePath('instagram')}#by-day`}>Instagram by day</Link> or <Link href={`${pagePath('linkedin')}#by-day`}>LinkedIn by day</Link>.</p>
            <Table
              head={['Day', 'Best time', '24-hour', 'Also good']}
              rows={WEEKDAY_NAMES.map((name, d) => {
                const hours = topHoursOfDay(scores, d, 3);
                return [`${name}${d === bestDay ? ' (best day)' : ''}`, formatHour(hours[0].hour), formatHour24(hours[0].hour), hours.slice(1).map((h) => formatHour(h.hour)).join(', ')];
              })}
            />
          </section>

          <section className={m.section}>
            <h2 id="how-to-find">How to Find Your Own Best Time (3 Steps)</h2>
            <ol>
              <li><strong>Start with the times here</strong> for your platform and country.</li>
              <li><strong>Post in the top three slots for three weeks</strong>, keeping the type of post the same so timing is the only thing changing.</li>
              <li><strong>Compare reach per slot</strong> in each app's insights and keep the winners.</li>
            </ol>
            <p>Our guides walk through the test step by step: {Object.values(BLOG_GUIDES).map((g) => g[0]).concat([DAYS_GUIDE]).map(([label, href], i, arr) => <span key={href}><Link href={href}>{label.replace(/^How to find your own best time/, 'best time')}</Link>{i < arr.length - 1 ? ', ' : '.'}</span>)}</p>
          </section>

          <section className={m.faq} aria-labelledby="faq">
            <h2 id="faq">Frequently Asked Questions</h2>
            {faq.map((f) => (
              <div key={f.q} className={m.faqItem}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </section>

          <TrialCta heading="Post at the best times automatically">
            <p>Set posting slots once and Schedule For You fills them. Free plan: 3 accounts, up to 10 scheduled posts at a time, no card.</p>
          </TrialCta>
        </article>
      </div>
    </MarketingPage>
  );
}
