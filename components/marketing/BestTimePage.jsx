import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import BestTimeHeatmap from '@/components/marketing/BestTimeHeatmap';
import BestTimeNow from '@/components/marketing/BestTimeNow';
import { AnswerBanner, NearbySection, PlaceSection, Table, TimezoneSection } from '@/components/marketing/BestTimeCountry';
import { Breadcrumbs, MarketingPage, TrialCta } from '@/components/marketing/Chrome';
import m from '@/components/marketing/marketing.module.css';
import s from '@/components/marketing/best-time.module.css';
import { getBestTime, getBestTimeAllCountries, getBestTimeAllPlatforms } from '@/lib/server/best-time';
import { TRENDS_META } from '@/lib/best-time-trends';
import { BEST_TIME_PLATFORMS, COUNTRIES, WEEKDAY_NAMES, bestWeekday, formatHour, formatRange, platformBySlug, quietSlots, scoreGrid, topHoursOfDay, topSlots } from '@/lib/best-time';
import { REGIONS, countryLocal, currentAbbr, formatHour24 } from '@/lib/best-time-countries';
import { BEST_TIME_ROOT, BLOG_GUIDES, DAYS_GUIDE, both, pageCopy, pageFaq, pagePath, parseSegment, siblingLinks, socialPath } from '@/lib/best-time-pages';
import { abs, breadcrumbLd, faqPageLd } from '@/lib/seo-pages';
import { organizationLd } from '@/lib/seo';
import { TOOLS } from '@/lib/tools/registry';

const bestOf = (data) => topSlots(scoreGrid(data.grid), 1)[0];

/** Everything a best-time page needs, computed once per render (ISR, daily). */
export async function loadBestTimePage(platformSlug, segment = '') {
  const platform = platformBySlug(platformSlug);
  const seg = parseSegment(segment);
  if (!platform || !seg) return null;
  const at = Date.now();
  let data;
  let others = null;
  let countries = null;
  if (seg.kind === 'country') {
    // One query gives this platform and every other platform in the country (for the cross-links table).
    const all = await getBestTimeAllPlatforms(seg.country.code);
    data = all[platform.id];
    others = BEST_TIME_PLATFORMS.filter((p) => p.id !== platform.id).map((p) => ({ platform: p, best: bestOf(all[p.id]) }));
  } else {
    data = await getBestTime(platform.id, null);
    if (seg.kind === 'hub') {
      const all = await getBestTimeAllCountries(platform.id);
      countries = COUNTRIES.map((c) => ({ country: c, best: bestOf(all[c.slug]) }));
    }
  }
  const scores = scoreGrid(data.grid);
  const bestDay = bestWeekday(scores);
  const best = seg.kind === 'weekday' ? topHoursOfDay(scores, seg.weekday, 5).map((h) => ({ ...h, weekday: seg.weekday })) : topSlots(scores, 5);
  const quiet = quietSlots(scores, 3);
  const trendsMeta = { trendsKind: data.source === 'trends' ? data.trendsKind : null, fetchedAt: TRENDS_META.fetchedAt };
  const copy = pageCopy({ platform: platformSlug, segment, best, bestDay, source: data.source, posts: data.posts, ...trendsMeta, at });
  const faq = pageFaq({ platform: platformSlug, segment, best, bestDay, quiet, source: data.source, ...trendsMeta, at });
  return { platform, seg, data, scores, bestDay, best, quiet, copy, faq, others, countries, at };
}

export default function BestTimePage({ page, segment }) {
  const { platform, seg, data, scores, bestDay, best, quiet, copy, faq, others, countries, at } = page;
  const path = pagePath(platform.slug, segment);
  const local = seg.kind === 'country' ? countryLocal(seg.country.slug) : null;
  const abbr = local ? currentAbbr(local, at) : '';
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Best time to post', href: BEST_TIME_ROOT },
    { name: platform.name, href: pagePath(platform.slug) },
    ...(segment ? [{ name: local ? `${platform.name} in ${local.short}` : copy.h1, href: path }] : []),
  ];
  const links = siblingLinks(platform.slug, segment);
  const tools = TOOLS.filter((t) => t.platform === platform.id).slice(0, 4);
  const guides = [...(BLOG_GUIDES[platform.slug] || []), DAYS_GUIDE];
  const updated = data.computedAt ? new Date(data.computedAt).toISOString().slice(0, 10) : null;
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationLd(),
      { '@type': 'WebPage', '@id': `${abs(path)}#webpage`, url: abs(path), name: copy.title, description: copy.description, isPartOf: { '@id': `${abs('/')}#website` }, inLanguage: 'en', ...(updated ? { dateModified: updated } : {}) },
      { '@type': 'Dataset', name: `${platform.name} posting times by weekday and hour${local ? ` in ${local.name}` : ''}`, description: copy.description, url: abs(path), creator: { '@type': 'Organization', name: 'Schedule For You' }, temporalCoverage: 'P90D', ...(data.source === 'trends' ? { isBasedOn: ['https://trends.google.com/', 'https://wikimedia.org/api/rest_v1/'], variableMeasured: ['search interest per hour', 'online activity per hour'] } : { variableMeasured: ['posts per hour', 'link clicks per post'] }), ...(local ? { spatialCoverage: { '@type': 'Place', name: local.name.replace(/^the /, '') } } : {}) },
      breadcrumbLd(crumbs),
      faqPageLd(faq),
    ],
  };
  const slotLabel = (b) => (seg.kind === 'weekday' ? formatRange(b.hour) : `${WEEKDAY_NAMES[b.weekday]} ${formatHour(b.hour)}`);
  const where = local ? ` in ${local.name}` : '';

  return (
    <MarketingPage>
      <JsonLd data={ld} />
      <div className={m.container}>
        <Breadcrumbs items={crumbs} />
        <section className={m.hero}>
          <span className={m.eyebrow}>{data.source === 'baseline' ? 'Baseline · switches to live data automatically' : data.source === 'trends' ? `Google Trends data${local ? ` for ${local.short}` : ''} · refreshed ${TRENDS_META.fetchedAt}` : `Live data · ${data.posts.toLocaleString('en-US')} scheduled posts · last 90 days`}</span>
          <h1 className={m.h1}>{copy.h1}</h1>
          <AnswerBanner>{copy.answer}</AnswerBanner>
          <p className={m.lead}>{copy.intro}</p>
          <div className={m.toolArea}>
            <div className={s.answer}>
              {best.slice(0, 3).map((b, i) => (
                <div key={i} className={s.slot}>
                  <div className={s.slotRank}>{i === 0 ? 'Best slot' : `#${i + 1}`}</div>
                  <div className={s.slotTime}>{seg.kind === 'weekday' ? formatRange(b.hour) : formatHour(b.hour)}</div>
                  <div className={s.slotDay}>{seg.kind === 'weekday' ? WEEKDAY_NAMES[seg.weekday] : WEEKDAY_NAMES[b.weekday]}</div>
                  <div className={s.slotScore}>Score {b.score}/100 · {local ? `${abbr} (${formatHour24(b.hour)})` : 'local time'}</div>
                </div>
              ))}
            </div>
            <BestTimeNow scores={scores} tz={local ? local.tz : null} place={local ? local.name : null} platform={platform.name} />
            <BestTimeHeatmap scores={scores} highlightDay={seg.kind === 'weekday' ? seg.weekday : null} caption={`${platform.name}${where}: how strong each hour is, 0–100, in ${local ? `${local.adj} time (${abbr})` : 'your local time'}. ${updated ? `Updated ${updated}.` : ''}`} />
            {data.source === 'trends' ? (
              <p className={s.source}>Source: Google Trends hourly search interest in {platform.name}{local ? ` from ${local.name}` : `, averaged across ${COUNTRIES.length} countries`}{data.trendsKind === 'country' ? ' (country average: too few searches for this platform alone)' : ''}, weighted by hourly Wikipedia traffic (Wikimedia, CC0) so the hours reflect how many people are online. Local time. Refreshed {TRENDS_META.fetchedAt}; our own scheduling data replaces it automatically once there is enough of it.</p>
            ) : (
              <p className={s.source}>Source: posts scheduled through Schedule For You, counted per local weekday and hour; the busiest slots with the best link clicks per post score highest. No individual account data is shown. <Link href="/privacy">How we handle data</Link>.</p>
            )}
          </div>
        </section>

        <article className={`${m.narrow} ${m.prose}`}>
          {seg.kind !== 'weekday' && (
            <section className={m.section}>
              <h2 id="answer">When Is the Best Time to Post on {platform.name}{local ? ` in ${local.name}` : ''}?</h2>
              <p>
                {WEEKDAY_NAMES[best[0].weekday]} at {both(best[0].hour)}{local ? ` ${abbr}` : ' local time'} is the strongest slot, and {WEEKDAY_NAMES[bestDay]} is the best day overall.
                {' '}The five best slots of the week{where}, ranked:
              </p>
              <Table
                head={['Rank', 'Day', 'Time', '24-hour', 'Score']}
                rows={best.map((b, i) => [`#${i + 1}`, WEEKDAY_NAMES[b.weekday], formatHour(b.hour), formatHour24(b.hour), `${b.score}/100`])}
              />
              <blockquote><p><strong>Key point:</strong> treat these as starting points. Post in the top two or three slots for three weeks, then keep the one your own {platform.name} insights say works best for your followers.</p></blockquote>
            </section>
          )}

          <section className={m.section}>
            <h2 id="by-day">{seg.kind === 'weekday' ? `Every Hour on ${WEEKDAY_NAMES[seg.weekday]}, Ranked` : `Best Time to Post on ${platform.name}${where} by Day of the Week`}</h2>
            {seg.kind === 'weekday' ? (
              <>
                <p>The ten strongest hours on {WEEKDAY_NAMES[seg.weekday]}, in your local time. The heatmap above shows the rest.</p>
                <Table head={['Rank', 'Hour', '24-hour', 'Score']} rows={topHoursOfDay(scores, seg.weekday, 10).map((h, i) => [`#${i + 1}`, formatRange(h.hour), formatHour24(h.hour), `${h.score}/100`])} />
              </>
            ) : (
              <>
                <p>The three strongest hours for each day{local ? `, in ${local.adj} time (${abbr})` : ', in your local time'}.</p>
                <Table
                  head={['Day', 'Best time', '24-hour', 'Also good']}
                  rows={WEEKDAY_NAMES.map((name, d) => {
                    const hours = topHoursOfDay(scores, d, 3);
                    return [
                      local ? <>{name}{d === bestDay ? ' (best day)' : ''}</> : <><Link href={pagePath(platform.slug, name.toLowerCase())}>{name}</Link>{d === bestDay ? ' (best day)' : ''}</>,
                      formatHour(hours[0].hour), formatHour24(hours[0].hour), hours.slice(1).map((h) => formatHour(h.hour)).join(', '),
                    ];
                  })}
                />
              </>
            )}
            <ul className={s.chips}>
              {links.days.map((d) => <li key={d.href}><Link href={d.href} className={`${s.chip} ${d.current ? s.chipOn : ''}`}>{platform.name} on {d.label}</Link></li>)}
            </ul>
          </section>

          {local && <TimezoneSection local={local} best={best} at={at} />}
          {local && <PlaceSection local={local} subject={platform.name} quiet={quiet} />}

          {local && others && (
            <section className={m.section}>
              <h2 id="other-platforms">Best Time to Post on Other Platforms in {local.name}</h2>
              <p>Each network peaks at its own hour, even in the same country. For one combined schedule, see the <Link href={socialPath(local.slug)}>best time to post on social media in {local.name}</Link>.</p>
              <Table head={['Platform', `Best time (${abbr})`, '24-hour']} rows={others.map((o) => [<Link key={o.platform.slug} href={pagePath(o.platform.slug, segment)}>{o.platform.name} in {local.short}</Link>, `${WEEKDAY_NAMES[o.best.weekday]} ${formatHour(o.best.hour)}`, formatHour24(o.best.hour)])} />
            </section>
          )}

          {seg.kind === 'hub' && countries && (
            <section className={m.section}>
              <h2 id="by-country">Best Time to Post on {platform.name} by Country ({COUNTRIES.length} Countries)</h2>
              <p>Audiences are local, so pick the country most of your followers are in. Each time is that country's own clock; click through for its heatmap, time zone conversions and local tips.</p>
              <Table
                head={['Country', 'Best time (local)', 'Time zone']}
                rows={REGIONS.flatMap((r) => r.countries).map((slug) => countries.find((x) => x.country.slug === slug)).filter(Boolean).map(({ country, best: b }) => {
                  const l = countryLocal(country.slug);
                  return [<Link key={country.slug} href={pagePath(platform.slug, `in-${country.slug}`)}>{platform.name} in {country.short}</Link>, `${WEEKDAY_NAMES[b.weekday]} ${formatHour(b.hour)}`, currentAbbr(l, at)];
                })}
              />
            </section>
          )}

          {seg.kind !== 'hub' && !local && (
            <section className={m.section}>
              <h2 id="by-country">Best Time to Post on {platform.name} by Country</h2>
              <p>Audiences are local. Pick the country most of your followers are in; each page is in that country's own time, with time zone conversions and local tips.</p>
              <ul className={s.chips}>
                {links.countries.map((c) => <li key={c.href}><Link href={c.href} className={`${s.chip} ${c.current ? s.chipOn : ''}`}>{c.label}</Link></li>)}
              </ul>
            </section>
          )}

          <section className={m.section}>
            <h2 id="how-to-use">How to Post at These Times (3 Steps)</h2>
            <ol>
              <li><strong>Pick the top three slots</strong>{local ? ` for ${local.name}` : ''}: {best.slice(0, 3).map(slotLabel).join(', ')}{local ? ` ${abbr}` : ''}.</li>
              <li><strong>Set them as posting slots in your queue</strong>{local ? `, with the workspace set to ${local.adj} time` : ''}, so every new {platform.name} post takes the next free one.</li>
              <li><strong>After three weeks, compare reach per slot</strong> in {platform.name}'s own insights and drop the weakest.</li>
            </ol>
            <blockquote><p><strong>Pro tip:</strong> timing is a tiebreaker, not a strategy. A strong first line, a native-size image or video and a clear call to action matter more than the hour, so fix those first.</p></blockquote>
          </section>

          {local && (
            <NearbySection
              local={local}
              at={at}
              heading={`Best Time to Post on ${platform.name} in Nearby Countries`}
              intro={`Following spans borders. If part of your audience is in a neighbouring country, check its page too:`}
              href={(c) => pagePath(platform.slug, `in-${c.slug}`)}
              label={(c) => `Best time to post on ${platform.name} in ${c.name}`}
            />
          )}

          <section className={m.faq} aria-labelledby="faq">
            <h2 id="faq">Frequently Asked Questions</h2>
            {faq.map((f) => (
              <div key={f.q} className={m.faqItem}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </section>

          <TrialCta heading={`Post to ${platform.name}${where} at these times automatically`} >
            <p>Set posting slots once; Schedule For You fills them. Free plan: 3 accounts, up to 10 scheduled posts at a time, no card.</p>
          </TrialCta>

          <div className={m.more}>
            {local ? (
              <section>
                <h3>All {platform.name} countries</h3>
                <ul className={s.chips}>
                  {links.countries.map((c) => <li key={c.href}><Link href={c.href} className={`${s.chip} ${c.current ? s.chipOn : ''}`}>{c.label}</Link></li>)}
                </ul>
              </section>
            ) : (
              <section>
                <h3>Other platforms{seg.kind === 'weekday' ? ` on ${WEEKDAY_NAMES[seg.weekday]}` : ''}</h3>
                <ul className={m.linkGrid}>
                  {links.platforms.map((p) => <li key={p.href}><Link href={p.href} className={m.linkCard}>{p.label}</Link></li>)}
                </ul>
              </section>
            )}
            <section>
              <h3>Guides</h3>
              <ul className={m.linkGrid}>
                {guides.map(([label, href]) => <li key={href}><Link href={href} className={m.linkCard}>{label}</Link></li>)}
                {local && <li><Link href={socialPath(local.slug)} className={m.linkCard}>All platforms in {local.name}</Link></li>}
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
