/**
 * Copy and URL inventory for the /best-time-to-post pages. Three page shapes:
 *   /best-time-to-post/{platform}                 the platform hub (full-week heatmap)
 *   /best-time-to-post/{platform}/{weekday}       one weekday
 *   /best-time-to-post/{platform}/in-{country}    one country
 * The numbers come from lib/server/best-time.ts at render time; this file only knows words.
 */
import { BEST_TIME_PLATFORMS, COUNTRIES, WEEKDAYS, WEEKDAY_NAMES, countryBySlug, formatHour, formatRange, platformBySlug } from './best-time';

export const BEST_TIME_ROOT = '/best-time-to-post';

export function parseSegment(segment) {
  if (!segment) return { kind: 'hub' };
  const wd = WEEKDAYS.indexOf(segment);
  if (wd >= 0) return { kind: 'weekday', weekday: wd };
  if (segment.startsWith('in-')) {
    const country = countryBySlug(segment.slice(3));
    if (country) return { kind: 'country', country };
  }
  return null;
}

/** Every page: [{ platform, segment }] with segment '' for the hub. */
export function allBestTimePages() {
  const out = [];
  for (const p of BEST_TIME_PLATFORMS) {
    out.push({ platform: p.slug, segment: '' });
    for (const d of WEEKDAYS) out.push({ platform: p.slug, segment: d });
    for (const c of COUNTRIES) out.push({ platform: p.slug, segment: `in-${c.slug}` });
  }
  return out;
}

export const pagePath = (platform, segment = '') => `${BEST_TIME_ROOT}/${platform}${segment ? `/${segment}` : ''}`;

const year = () => new Date().getUTCFullYear();

/** Title, description, H1 and intro for a page, given the best slots computed from its grid. */
export function pageCopy({ platform: slug, segment, best, bestDay, source, posts }) {
  const p = platformBySlug(slug);
  const seg = parseSegment(segment);
  if (!p || !seg) return null;
  const top = best[0];
  const topLabel = top ? `${WEEKDAY_NAMES[top.weekday]} at ${formatHour(top.hour)}` : '';
  const sourceLine = source === 'baseline'
    ? 'This page shows our published baseline until enough posts have been scheduled through Schedule For You for this platform; it switches to measured data automatically.'
    : source === 'global'
      ? `Based on ${posts.toLocaleString('en-US')} posts scheduled through Schedule For You worldwide in the last 90 days, bucketed by the hour they went out in each account's own timezone.`
      : `Based on ${posts.toLocaleString('en-US')} posts scheduled through Schedule For You by accounts in this country in the last 90 days.`;
  if (seg.kind === 'hub') {
    return {
      title: `Best Time to Post on ${p.name} in ${year()}: ${topLabel} [Heatmap by Day & Hour]`,
      description: `The best time to post on ${p.name} is ${topLabel}, with ${WEEKDAY_NAMES[bestDay]} the strongest day. Hour-by-hour heatmap for every weekday, by country, from real scheduling data.`,
      h1: `Best time to post on ${p.name}`,
      intro: `The best time to post on ${p.name} is ${topLabel} in your local time. ${WEEKDAY_NAMES[bestDay]} is the strongest day overall. ${sourceLine}`,
      keyword: `best time to post on ${p.slug === 'x' ? 'x' : p.name.toLowerCase()}`,
    };
  }
  if (seg.kind === 'weekday') {
    const dayName = WEEKDAY_NAMES[seg.weekday];
    const hours = best.map((b) => formatHour(b.hour));
    return {
      title: `Best Time to Post on ${p.name} on ${dayName}: ${hours[0]} [${hours.slice(1, 3).join(', ')}]`,
      description: `The best time to post on ${p.name} on ${dayName} is ${hours[0]}, then ${hours.slice(1, 3).join(' and ')}. Full ${dayName} hour-by-hour chart in your local time.`,
      h1: `Best time to post on ${p.name} on ${dayName}`,
      intro: `The best time to post on ${p.name} on ${dayName} is ${formatRange(best[0].hour)}, followed by ${hours.slice(1, 3).join(' and ')} (local time). ${sourceLine}`,
      keyword: `best time to post on ${p.name.toLowerCase()} ${dayName.toLowerCase()}`,
    };
  }
  const c = seg.country;
  return {
    title: `Best Time to Post on ${p.name} in ${c.short} (${year()}): ${topLabel}`,
    description: `The best time to post on ${p.name} in ${c.name} is ${topLabel}, local time. Hour-by-hour heatmap for all seven days, from accounts posting in ${c.short}.`,
    h1: `Best time to post on ${p.name} in ${c.name}`,
    intro: `The best time to post on ${p.name} in ${c.name} is ${topLabel} (${c.tz.replace('_', ' ')} time). ${WEEKDAY_NAMES[bestDay]} is the strongest day. ${sourceLine}`,
    keyword: `best time to post on ${p.name.toLowerCase()} in ${c.short.toLowerCase()}`,
  };
}

export function pageFaq({ platform: slug, segment }) {
  const p = platformBySlug(slug);
  const seg = parseSegment(segment);
  const where = seg?.kind === 'country' ? ` in ${seg.country.name}` : '';
  return [
    { q: `How is the best time to post on ${p.name}${where} worked out?`, a: `Every post scheduled through Schedule For You is counted in the hour and weekday it went out, in that account's own timezone. The busiest slots, lifted by the link clicks those posts earned, score highest. Only counts are kept: no captions, accounts or names.` },
    { q: 'Is the time shown in my timezone?', a: 'Yes. Slots are local time: 9 AM means 9 AM wherever you and your audience are. If your audience is in another country, use that country\'s page.' },
    { q: `Does posting at the best time guarantee more reach on ${p.name}?`, a: `No. Timing matters less than the post itself, but a good slot gives a post its best start. Test two or three of the top slots for a few weeks and keep the one that performs for you.` },
    { q: 'How often is this updated?', a: 'The data is rebuilt every day from the last 90 days of scheduled posts, so it follows seasonal and platform changes.' },
    { q: `Can I schedule ${p.name} posts for these times automatically?`, a: `Yes. Schedule For You's queue has posting slots: set them to the best hours here and every new post takes the next free slot. The Free plan includes 3 accounts and up to 10 scheduled posts at a time, no card needed.` },
  ];
}

/** Links to the sibling pages: other weekdays, other countries, other platforms. */
export function siblingLinks(slug, segment) {
  const p = platformBySlug(slug);
  const seg = parseSegment(segment);
  const days = WEEKDAYS.map((d, i) => ({ href: pagePath(slug, d), label: WEEKDAY_NAMES[i], current: seg?.kind === 'weekday' && seg.weekday === i }));
  const countries = COUNTRIES.map((c) => ({ href: pagePath(slug, `in-${c.slug}`), label: c.short, current: seg?.kind === 'country' && seg.country.slug === c.slug }));
  const platforms = BEST_TIME_PLATFORMS.filter((x) => x.slug !== slug).map((x) => ({ href: pagePath(x.slug, segment), label: x.name }));
  return { platform: p, days, countries, platforms };
}
