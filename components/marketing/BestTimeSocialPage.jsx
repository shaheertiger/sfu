import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import Figure, { figuresLd } from '@/components/marketing/Figure';
import { SOCIAL } from '@/lib/best-time-pages';
import { bestTimeFigures } from '@/lib/figures';
import BestTimeHeatmap from '@/components/marketing/BestTimeHeatmap';
import BestTimeNow from '@/components/marketing/BestTimeNow';
import { AnswerBanner, NearbySection, PlaceSection, StudiesSection, Table, TimezoneSection } from '@/components/marketing/BestTimeCountry';
import { Breadcrumbs, MarketingPage, TrialCta } from '@/components/marketing/Chrome';
import m from '@/components/marketing/marketing.module.css';
import s from '@/components/marketing/best-time.module.css';
import { getBestTimeAllPlatforms } from '@/lib/server/best-time';
import { TRENDS_META } from '@/lib/best-time-trends';
import { BEST_TIME_PLATFORMS, COUNTRIES, WEEKDAY_NAMES, bestWeekday, combineScores, formatHour, quietSlots, scoreGrid, topHoursOfDay, topSlots } from '@/lib/best-time';
import { countryLocal, currentAbbr, formatHour24 } from '@/lib/best-time-countries';
import { BEST_TIME_ROOT, DAYS_GUIDE, both, pagePath, socialCopy, socialFaq, socialPath } from '@/lib/best-time-pages';
import { abs, breadcrumbLd, faqPageLd } from '@/lib/seo-pages';
import { organizationLd } from '@/lib/seo';

/** Data for /best-time-to-post/social-media/in-{country}: every platform's grid for the country, plus a combined one. */
export async function loadSocialPage(countrySlug) {
  const local = countryLocal(countrySlug);
  if (!local) return null;
  const at = Date.now();
  const all = await getBestTimeAllPlatforms(local.code);
  const perPlatform = BEST_TIME_PLATFORMS.map((p) => {
    const scores = scoreGrid(all[p.id].grid);
    const top = topSlots(scores, 2);
    return { platform: p, scores, best: top[0], second: top[1], bestDay: bestWeekday(scores), source: all[p.id].source, trendsKind: all[p.id].trendsKind };
  });
  const scores = combineScores(perPlatform.map((x) => x.scores));
  const best = topSlots(scores, 5);
  const bestDay = bestWeekday(scores);
  const quiet = quietSlots(scores, 3);
  const live = perPlatform.filter((x) => x.source === 'region' || x.source === 'global').length;
  const fromTrends = perPlatform.filter((x) => x.source === 'trends').length;
  const copy = socialCopy({ country: countrySlug, best, bestDay, at });
  const faq = socialFaq({ country: countrySlug, best, bestDay, perPlatform, scores, fetchedAt: TRENDS_META.fetchedAt, at });
  return { local, at, perPlatform, scores, best, bestDay, quiet, live, fromTrends, copy, faq };
}

export default function BestTimeSocialPage({ page }) {
  const { local, at, perPlatform, scores, best, bestDay, quiet, live, fromTrends, copy, faq } = page;
  const path = socialPath(local.slug);
  const abbr = currentAbbr(local, at);
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Best time to post', href: BEST_TIME_ROOT },
    { name: `Social media in ${local.short}`, href: path },
  ];
  // Drawn from the committed Trends data: shown only while no platform here has measured data.
  const figs = live === 0 ? bestTimeFigures(SOCIAL, `in-${local.slug}`) : [];
  const img = figuresLd(figs);
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationLd(),
      { '@type': 'WebPage', '@id': `${abs(path)}#webpage`, url: abs(path), name: copy.title, description: copy.description, isPartOf: { '@id': `${abs('/')}#website` }, inLanguage: 'en', ...img.primary },
      ...img.nodes,
      { '@type': 'Dataset', name: `Social media posting times by weekday and hour in ${local.name.replace(/^the /, '')}`, description: copy.description, url: abs(path), creator: { '@type': 'Organization', name: 'Schedule For You' }, temporalCoverage: 'P90D', ...(fromTrends ? { isBasedOn: ['https://trends.google.com/', 'https://wikimedia.org/api/rest_v1/'] } : {}), spatialCoverage: { '@type': 'Place', name: local.name.replace(/^the /, '') }, variableMeasured: ['posts per hour', 'link clicks per post'] },
      breadcrumbLd(crumbs),
      faqPageLd(faq),
    ],
  };
  // For each weekday: its best combined hour, and the platform that scores highest in that hour.
  const dayPlan = WEEKDAY_NAMES.map((name, d) => {
    const hours = topHoursOfDay(scores, d, 3);
    const h = hours[0].hour;
    const leader = perPlatform.reduce((a, b) => (b.scores[d][h] > a.scores[d][h] ? b : a));
    return { name, d, hours, leader };
  });
  const work = perPlatform.filter((x) => ['linkedin', 'google', 'x'].includes(x.platform.id));
  const fun = perPlatform.filter((x) => ['tiktok', 'instagram', 'youtube'].includes(x.platform.id));

  return (
    <MarketingPage>
      <JsonLd data={ld} />
      <div className={m.container}>
        <Breadcrumbs items={crumbs} />
        <section className={m.hero}>
          <span className={m.eyebrow}>{live ? `Live data for ${live} of ${perPlatform.length} platforms · last 90 days` : fromTrends ? `${perPlatform.some((x) => x.trendsKind === 'activity') ? 'Wikipedia + Google Trends data' : 'Google Trends data'} for ${local.short} · refreshed ${TRENDS_META.fetchedAt}` : 'Baseline · switches to live data automatically'}</span>
          <h1 className={m.h1}>{copy.h1}</h1>
          <AnswerBanner>{copy.answer}</AnswerBanner>
          <p className={m.lead}>{copy.intro}</p>
          <div className={m.toolArea}>
            <div className={s.answer}>
              {best.slice(0, 3).map((b, i) => (
                <div key={i} className={s.slot}>
                  <div className={s.slotRank}>{i === 0 ? 'Best slot' : `#${i + 1}`}</div>
                  <div className={s.slotTime}>{formatHour(b.hour)}</div>
                  <div className={s.slotDay}>{WEEKDAY_NAMES[b.weekday]}</div>
                  <div className={s.slotScore}>Score {b.score}/100 · {abbr} ({formatHour24(b.hour)})</div>
                </div>
              ))}
            </div>
            <BestTimeNow scores={scores} tz={local.tz} place={local.name} platform="social media" />
            <BestTimeHeatmap scores={scores} caption={`All ${perPlatform.length} platforms combined in ${local.name}: how strong each hour is, 0–100, in ${local.adj} time (${abbr}).`} />
            <p className={s.source}>
              {fromTrends && perPlatform.some((x) => x.trendsKind === 'activity') ? <>Source: hourly Wikipedia traffic from {local.name}'s local-language Wikipedia (Wikimedia, CC0, past 28 days), showing when people there are online, combined with each platform's hourly search pattern from Google Trends in the {TRENDS_META.countryCount} countries we measure directly, then averaged across platforms. Refreshed {TRENDS_META.fetchedAt}; direct Google Trends data, then our own scheduling data, replace it automatically.</> : fromTrends ? <>Source: Google Trends hourly search interest in each platform from {local.name}, weighted by hourly Wikipedia traffic (Wikimedia, CC0) so the hours reflect how many people are online, then averaged across platforms. Platforms with too few searches use the country average. Refreshed {TRENDS_META.fetchedAt}; our own scheduling data replaces it automatically once there is enough of it.</> : live ? <>Source: posts scheduled through Schedule For You, counted per local weekday and hour for each platform, then averaged. No individual account data is shown. <Link href="/privacy">How we handle data</Link>.</> : <>Source: our published baseline for each platform, averaged, shown until Google Trends data or enough posts scheduled through Schedule For You are available for {local.name}. It switches automatically.</>}
            </p>
          </div>
        </section>

        <article className={`${m.narrow} ${m.prose}`}>
          <Figure fig={figs[0]} priority />
          <section className={m.section}>
            <h2 id="answer">When Is the Best Time to Post on Social Media in {local.name}?</h2>
            <p>Across every platform combined, {WEEKDAY_NAMES[best[0].weekday]} at {both(best[0].hour)} {abbr} is the strongest slot in {local.name}, and {WEEKDAY_NAMES[bestDay]} is the best day. That single answer is a compromise, though: work networks peak in the morning, entertainment apps at night.</p>
            <blockquote><p><strong>Key point:</strong> use the combined time only if you post the same thing everywhere at once. If you can give each platform its own time, use the table below instead.</p></blockquote>
          </section>

          <section className={m.section}>
            <h2 id="by-platform">Best Time to Post in {local.name} on Every Platform</h2>
            <p>Each platform's single best slot and runner-up, in {local.adj} time ({abbr}). Click a platform for its full heatmap, day-by-day table and FAQ.</p>
            <Table
              head={['Platform', 'Best time', '24-hour', 'Runner-up', 'Best day']}
              rows={perPlatform.map((x) => [
                <Link key={x.platform.slug} href={pagePath(x.platform.slug, `in-${local.slug}`)}>{x.platform.name} in {local.short}</Link>,
                `${WEEKDAY_NAMES[x.best.weekday]} ${formatHour(x.best.hour)}`, formatHour24(x.best.hour),
                `${WEEKDAY_NAMES[x.second.weekday].slice(0, 3)} ${formatHour(x.second.hour)}`, WEEKDAY_NAMES[x.bestDay],
              ])}
            />
            <h3>Why the Platforms Peak at Different Hours</h3>
            <p>
              Work-first networks ({work.map((x) => `${x.platform.name} ${formatHour(x.best.hour)}`).join(', ')}) do best when people are at their desks.
              {' '}Entertainment apps ({fun.map((x) => `${x.platform.name} ${formatHour(x.best.hour)}`).join(', ')}) do best when people are off work and scrolling for fun.
              {' '}Schedule each one for its own hour and the same post reaches more people overall.
            </p>
          </section>

          <section className={m.section}>
            <h2 id="by-day">Best Day to Post on Social Media in {local.name} (Day-by-Day Plan)</h2>
            <p>The strongest hours each day across all platforms, and which platform is strongest at the day's best hour. Use it as a weekly posting plan.</p>
            <Table
              head={['Day', 'Best time', 'Also good', 'Best platform at that hour']}
              rows={dayPlan.map(({ name, d, hours, leader }) => [
                `${name}${d === bestDay ? ' (best day)' : ''}`,
                `${formatHour(hours[0].hour)} (${formatHour24(hours[0].hour)})`,
                hours.slice(1).map((h) => formatHour(h.hour)).join(', '),
                <Link key={name} href={pagePath(leader.platform.slug, `in-${local.slug}`)}>{leader.platform.name}</Link>,
              ])}
            />
          </section>

          <TimezoneSection local={local} best={best} at={at} />
          <PlaceSection local={local} subject="Social Media" quiet={quiet} />
          <StudiesSection local={local} subject="social media" best={best} source={fromTrends || live ? 'data' : 'baseline'} />

          <section className={m.section}>
            <h2 id="how-to-schedule">How to Schedule Posts for {local.adj} Time (4 Steps)</h2>
            <ol>
              <li><strong>Set your workspace to {local.adj} time.</strong> Then every time you type matches this page, wherever you are.</li>
              <li><strong>Add the best hours as queue slots.</strong> Each new post takes the next free slot, so you don't have to pick a time for every post.</li>
              <li><strong>Schedule a post per platform at its own peak</strong> from the platform table above when timing matters, instead of one shared time for every network.</li>
              <li><strong>Review after three weeks.</strong> Compare reach per slot in each app's insights and swap out the weakest.</li>
            </ol>
            <blockquote><p><strong>Pro tip:</strong> if you also have followers in another country, don't split the difference. Post at the best time for your biggest audience, then reshare or post a variation at the best time for the second.</p></blockquote>
          </section>

          <NearbySection
            local={local}
            at={at}
            heading="Best Time to Post on Social Media in Nearby Countries"
            intro="Audiences cross borders. If part of your following lives in a neighbouring country, check its times too:"
            href={(c) => socialPath(c.slug)}
            label={(c) => `Best time to post on social media in ${c.name}`}
          />

          <section className={m.faq} aria-labelledby="faq">
            <h2 id="faq">Frequently Asked Questions</h2>
            {faq.map((f) => (
              <div key={f.q} className={m.faqItem}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </section>

          <TrialCta heading={`Post to every platform at the best times for ${local.name}`}>
            <p>Set your posting slots to these hours once, in {local.adj} time, and Schedule For You publishes each post in the next free slot. Free plan: 3 accounts, up to 10 scheduled posts at a time, no card.</p>
          </TrialCta>

          <div className={m.more}>
            <section>
              <h3>Social media in other countries</h3>
              <ul className={s.chips}>
                {COUNTRIES.map((c) => <li key={c.slug}><Link href={socialPath(c.slug)} className={`${s.chip} ${c.slug === local.slug ? s.chipOn : ''}`}>{c.short}</Link></li>)}
              </ul>
            </section>
            <section>
              <h3>Guides</h3>
              <ul className={m.linkGrid}>
                <li><Link href={DAYS_GUIDE[1]} className={m.linkCard}>{DAYS_GUIDE[0]}</Link></li>
                <li><Link href="/blog/best-time-to-post-on-instagram" className={m.linkCard}>How to find your own best time on Instagram</Link></li>
                <li><Link href="/blog/best-time-to-post-on-tiktok" className={m.linkCard}>How to find your own best time on TikTok</Link></li>
              </ul>
            </section>
          </div>
        </article>
      </div>
    </MarketingPage>
  );
}
