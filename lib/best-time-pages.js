/**
 * Copy and URL inventory for the /best-time-to-post pages. Four page shapes:
 *   /best-time-to-post/{platform}                    the platform hub (full-week heatmap)
 *   /best-time-to-post/{platform}/{weekday}          one weekday
 *   /best-time-to-post/{platform}/in-{country}       one platform in one country
 *   /best-time-to-post/social-media/in-{country}     every platform in one country
 * The numbers come from lib/server/best-time.ts at render time; this file only knows words.
 */
import { BEST_TIME_PLATFORMS, COUNTRIES, WEEKDAYS, WEEKDAY_NAMES, countryBySlug, formatHour, formatRange, platformBySlug, topHoursOfDay } from './best-time';
import { abbrLabel, countryLocal, currentAbbr, dstInfo, formatHour24, formatOffset, offsetMinutes } from './best-time-countries';

export const BEST_TIME_ROOT = '/best-time-to-post';

/** URL segment for the all-platforms country pages: /best-time-to-post/social-media/in-singapore. */
export const SOCIAL = 'social-media';

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
  for (const c of COUNTRIES) out.push({ platform: SOCIAL, segment: `in-${c.slug}` });
  return out;
}

export const pagePath = (platform, segment = '') => `${BEST_TIME_ROOT}/${platform}${segment ? `/${segment}` : ''}`;
export const socialPath = (countrySlug) => pagePath(SOCIAL, `in-${countrySlug}`);

/** Our long-form guides for a platform, linked from its data pages (and back from the guides). */
export const BLOG_GUIDES = {
  instagram: [['How to find your own best time to post on Instagram', '/blog/best-time-to-post-on-instagram'], ['Best time to post Reels on Instagram', '/blog/best-time-to-post-reels-on-instagram'], ['Best time to post on Instagram on Monday', '/blog/best-time-to-post-on-instagram-on-monday']],
  tiktok: [['How to find your own best time to post on TikTok', '/blog/best-time-to-post-on-tiktok']],
  facebook: [['How to find your own best time to post on Facebook', '/blog/best-time-to-post-on-facebook']],
  youtube: [['How to find your own best time to post on YouTube', '/blog/best-time-to-post-on-youtube']],
};
export const DAYS_GUIDE = ['The best days to post on social media', '/blog/best-days-to-post-on-social-media'];

const year = () => new Date().getUTCFullYear();
const capName = (n) => n.replace(/^the /, 'The ');
const day3 = (d) => WEEKDAY_NAMES[d].slice(0, 3);
/** "9 PM (21:00)". */
export const both = (h) => `${formatHour(h)} (${formatHour24(h)})`;

/**
 * How a Trends grid was built, in plain words. `where` is "in Japan" or '' (worldwide pages);
 * `kind` is 'platform', 'country' (too few searches for this platform, so the country's average)
 * or 'global' (the average of every country page, each in its own local time).
 */
export function trendsLine({ platform, where, kind, fetchedAt, countryCount = COUNTRIES.length }) {
  const when = fetchedAt ? ` Refreshed ${fetchedAt}.` : '';
  if (kind === 'global') return `Based on Google Trends: hourly search interest in ${platform} across the ${countryCount} countries we have Trends data for so far, each in its own local time, weighted by how many people are online each hour (Wikipedia traffic) and averaged.${when}`;
  if (kind === 'country') return `Too few people search for ${platform} ${where} to read it on its own, so this uses the country's average across the platforms Google Trends can read, weighted by how many people are online each hour (Wikipedia traffic).${when}`;
  return `Based on Google Trends: hourly search interest in ${platform} from people ${where} over the past 7 days, the weekday pattern over the past 90 days, weighted by how many people are online each hour (Wikipedia traffic, past 28 days).${when}`;
}

function sourceLine(source, posts, where, trends = null) {
  if (source === 'trends' && trends) return `${trendsLine(trends)} Our own scheduling data takes over once enough posts are scheduled${where ? ` in ${where}` : ''}.`;
  if (source === 'baseline') return 'Until enough posts have been scheduled through Schedule For You for this platform, the page shows our published baseline; it switches to measured data automatically.';
  if (source === 'global') return `Based on ${posts.toLocaleString('en-US')} posts scheduled through Schedule For You worldwide in the last 90 days, each counted in the hour it went out in its own local time.`;
  return `Based on ${posts.toLocaleString('en-US')} posts scheduled through Schedule For You by accounts in ${where} in the last 90 days.`;
}

/** Title, description, H1 and intro for a page, given the best slots computed from its grid. */
export function pageCopy({ platform: slug, segment, best, bestDay, source, posts, trendsKind = null, fetchedAt = null, countryCount = COUNTRIES.length, at = Date.now() }) {
  const p = platformBySlug(slug);
  const seg = parseSegment(segment);
  if (!p || !seg) return null;
  const top = best[0];
  const topLabel = top ? `${WEEKDAY_NAMES[top.weekday]} at ${formatHour(top.hour)}` : '';
  const trends = trendsKind ? { platform: p.name, where: seg.kind === 'country' ? `in ${seg.country.name}` : '', kind: trendsKind, fetchedAt, countryCount } : null;
  if (seg.kind === 'hub') {
    return {
      title: `Best Time to Post on ${p.name} in ${year()}: ${topLabel} [By Day, Hour & Country]`,
      description: `The best time to post on ${p.name} is ${topLabel}, with ${WEEKDAY_NAMES[bestDay]} the strongest day. Hour-by-hour heatmap for every weekday and ${COUNTRIES.length} countries, updated daily.`,
      h1: `Best Time to Post on ${p.name} (${year()})`,
      answer: `The best time to post on ${p.name} is ${WEEKDAY_NAMES[top.weekday]} at ${both(top.hour)}, local time.`,
      intro: `${WEEKDAY_NAMES[bestDay]} is the strongest day overall, and every time here is your local time. Below: the top slots, every hour of every day, and the best times in ${COUNTRIES.length} countries. ${sourceLine(source, posts, '', trends)}`,
      keyword: `best time to post on ${p.slug === 'x' ? 'x' : p.name.toLowerCase()}`,
    };
  }
  if (seg.kind === 'weekday') {
    const dayName = WEEKDAY_NAMES[seg.weekday];
    const hours = best.map((b) => formatHour(b.hour));
    return {
      title: `Best Time to Post on ${p.name} on ${dayName}: ${hours[0]} [${hours.slice(1, 3).join(', ')}]`,
      description: `The best time to post on ${p.name} on ${dayName} is ${hours[0]}, then ${hours.slice(1, 3).join(' and ')}. Full ${dayName} hour-by-hour chart in your local time, updated daily.`,
      h1: `Best Time to Post on ${p.name} on ${dayName}`,
      answer: `The best time to post on ${p.name} on ${dayName} is ${both(best[0].hour)}, local time.`,
      intro: `The hour from ${formatRange(best[0].hour)} scores highest, followed by ${hours.slice(1, 3).join(' and ')}, all in your local time. ${sourceLine(source, posts, '', trends)}`,
      keyword: `best time to post on ${p.name.toLowerCase()} ${dayName.toLowerCase()}`,
    };
  }
  const c = seg.country;
  const local = countryLocal(c.slug);
  const abbr = currentAbbr(local, at);
  const offset = formatOffset(offsetMinutes(c.tz, at));
  const next = best.slice(1, 3).map((b) => `${day3(b.weekday)} ${formatHour(b.hour)}`);
  let title = `Best Time to Post on ${p.name} in ${c.short} (${year()}): ${day3(top.weekday)} ${formatHour(top.hour)} ${abbr}`;
  if (title.length > 70) title = `Best Time to Post on ${p.name} in ${c.short} (${year()}): ${day3(top.weekday)} ${formatHour(top.hour)}`;
  return {
    title,
    description: `The best time to post on ${p.name} in ${c.name} is ${topLabel} ${abbr} (${formatHour24(top.hour)}), then ${next.join(' and ')}. Every day hour by hour, in ${local.adj} time (${offset}).`,
    h1: `Best Time to Post on ${p.name} in ${c.name} (${year()})`,
    answer: `The best time to post on ${p.name} in ${c.name} is ${WEEKDAY_NAMES[top.weekday]} at ${both(top.hour)} ${abbr}.`,
    intro: `${WEEKDAY_NAMES[bestDay]} is the strongest day, and the next best slots are ${best.slice(1, 3).map((b) => `${WEEKDAY_NAMES[b.weekday]} at ${formatHour(b.hour)}`).join(' and ')}. Every time on this page is ${local.adj} local time (${local.zoneName}, ${offset}). ${sourceLine(source, posts, c.name, trends)}`,
    keyword: `best time to post on ${p.name.toLowerCase()} in ${c.short.toLowerCase()}`,
  };
}

/** Copy for /best-time-to-post/social-media/in-{country}. */
export function socialCopy({ country: slug, best, bestDay, at = Date.now() }) {
  const local = countryLocal(slug);
  if (!local) return null;
  const top = best[0];
  const abbr = currentAbbr(local, at);
  const offset = formatOffset(offsetMinutes(local.tz, at));
  const topLabel = `${WEEKDAY_NAMES[top.weekday]} at ${formatHour(top.hour)}`;
  return {
    title: `Best Time to Post on Social Media in ${local.short} (${year()}): ${day3(top.weekday)} ${formatHour(top.hour)} ${abbr}`,
    description: `The best time to post on social media in ${local.name} is ${topLabel} ${abbr} (${formatHour24(top.hour)}). Best times for Instagram, TikTok, Facebook, LinkedIn and 6 more, in ${local.adj} time (${offset}).`,
    h1: `Best Time to Post on Social Media in ${local.name} (${year()})`,
    answer: `The best time to post on social media in ${local.name} is ${WEEKDAY_NAMES[top.weekday]} at ${both(top.hour)} ${abbr}.`,
    intro: `That's the strongest slot with all platforms combined, and ${WEEKDAY_NAMES[bestDay]} is the strongest day across all ${BEST_TIME_PLATFORMS.length} platforms. Each network peaks at a different hour, so the table below gives every platform its own best time, all in ${local.adj} local time (${offset}).`,
    keyword: `best time to post on social media in ${local.short.toLowerCase()}`,
  };
}

/** Time zone facts in one sentence, for FAQs and the time zone section. */
export function zoneSentence(local, at = Date.now()) {
  const d = dstInfo(local.tz, new Date(at).getUTCFullYear());
  const name = `${local.zoneName} (${abbrLabel(local)})`;
  const clocks = d.observes
    ? `It is ${formatOffset(d.standard)} in winter and ${formatOffset(d.daylight)} while daylight saving time is on.`
    : `It is ${formatOffset(d.standard)} all year, with no daylight saving time.`;
  const many = local.zones.length > 1 ? ` ${capName(local.name)} spans ${local.zones.length} time zones; this page uses ${local.zones[0][0].replace(/ \(.*\)$/, '')} time as the default.` : '';
  return `${local.name.replace(/^the /, 'The ').replace(/^./, (ch) => ch.toUpperCase())} uses ${name}. ${clocks}${many}`;
}

/**
 * FAQ for a platform page. Pass the computed slots for answers that name times; they are optional.
 * @param {{ platform: string, segment: string, best?: { weekday: number, hour: number, score: number }[], bestDay?: number | null, quiet?: { weekday: number, hour: number, score: number }[], source?: string | null, trendsKind?: string | null, fetchedAt?: string | null, countryCount?: number, at?: number }} opts
 */
export function pageFaq({ platform: slug, segment, best = [], bestDay = null, quiet = [], source = null, trendsKind = null, fetchedAt = null, countryCount = COUNTRIES.length, at = Date.now() }) {
  const p = platformBySlug(slug);
  const seg = parseSegment(segment);
  if (!p || !seg) return [];
  const where = seg.kind === 'country' ? ` in ${seg.country.name}` : '';
  const general = [
    { q: `How is the best time to post on ${p.name}${where} worked out?`, a: source === 'trends' && trendsKind
      ? `${trendsLine({ platform: p.name, where: where.trim(), kind: trendsKind, fetchedAt, countryCount })} Google Trends shows each platform's share of all searches in an hour, which overstates the small hours when few people search; weighting by Wikipedia traffic corrects that. Once enough posts are scheduled through Schedule For You${where}, our own data (posts per hour, lifted by the clicks they earned) replaces it.`
      : `Every post scheduled through Schedule For You is counted in the hour and weekday it went out, in that account's own time zone. The busiest slots, lifted by the link clicks those posts earned, score highest. Only counts are kept: no captions, accounts or names.` },
    { q: `Does posting at the best time guarantee more reach on ${p.name}?`, a: `No. Timing matters less than the post itself, but a good slot gives a post its best start. Test two or three of the top slots for a few weeks and keep the one that performs for you.` },
    { q: 'How often is this updated?', a: source === 'trends' ? `The page is rebuilt daily. The Google Trends data was last refreshed ${fetchedAt || 'recently'}, and our own scheduling data replaces it automatically once there is enough of it.` : 'Every day, from the last 90 days of scheduled posts, so it follows seasonal and platform changes.' },
    { q: `Can I schedule ${p.name} posts for these times automatically?`, a: `Yes. Schedule For You's queue has posting slots: set them to the best hours here and every new post takes the next free slot. The Free plan includes 3 accounts and up to 10 scheduled posts at a time, no card needed.` },
  ];
  if (seg.kind !== 'country') {
    const top = best[0];
    const lead = top && bestDay !== null ? [
      seg.kind === 'weekday'
        ? { q: `What is the best time to post on ${p.name} on ${WEEKDAY_NAMES[seg.weekday]}?`, a: `${both(top.hour)} local time, followed by ${best.slice(1, 3).map((b) => formatHour(b.hour)).join(' and ')}. Check the hour-by-hour table above for the rest of the day.` }
        : { q: `What is the best time to post on ${p.name}?`, a: `${WEEKDAY_NAMES[top.weekday]} at ${both(top.hour)} in your local time. ${WEEKDAY_NAMES[bestDay]} is the strongest day overall, and the next best slots are ${best.slice(1, 3).map((b) => `${WEEKDAY_NAMES[b.weekday]} at ${formatHour(b.hour)}`).join(' and ')}.` },
    ] : [];
    return [...lead, { q: 'Is the time shown in my timezone?', a: 'Yes. Slots are local time: 9 AM means 9 AM wherever you and your audience are. If your audience is in another country, use that country\'s page.' }, ...general];
  }
  const c = seg.country;
  const local = countryLocal(c.slug);
  const top = best[0];
  const abbr = currentAbbr(local, at);
  const out = [];
  if (top) out.push({ q: `What is the best time to post on ${p.name} in ${c.name}?`, a: `${WEEKDAY_NAMES[top.weekday]} at ${both(top.hour)} ${abbr}. The next best slots are ${best.slice(1, 3).map((b) => `${WEEKDAY_NAMES[b.weekday]} at ${formatHour(b.hour)}`).join(' and ')}, all in ${c.short} local time.` });
  if (bestDay !== null && best.length) out.push({ q: `What is the best day to post on ${p.name} in ${c.name}?`, a: `${WEEKDAY_NAMES[bestDay]}. It has the highest total score across all 24 hours; its strongest hours are listed in the day-by-day table above.` });
  out.push({ q: `What time zone should I use to post on ${p.name} in ${c.name}?`, a: zoneSentence(local, at) });
  out.push(local.zones.length > 1
    ? { q: `Is the best time to post on ${p.name} the same across ${c.name}?`, a: `The local clock time is the same, but the moment differs: ${local.zones.length} zones mean a slot at 9 AM in ${local.zones[0][0].replace(/ \(.*\)$/, '')} time arrives at a different local hour elsewhere. Schedule for the zone where most of your followers live, or post once per zone.` }
    : { q: `Is the best time to post on ${p.name} the same across ${c.name}?`, a: `Yes. ${c.name.replace(/^the /, 'The ').replace(/^./, (ch) => ch.toUpperCase())} uses a single time zone, so one schedule reaches followers in ${local.cities.slice(0, 3).join(', ')} and everywhere else at the same moment.` });
  if (quiet.length) out.push({ q: `When should I avoid posting on ${p.name} in ${c.name}?`, a: `The quietest waking hours are ${quiet.map((s) => `${WEEKDAY_NAMES[s.weekday]} at ${formatHour(s.hour)}`).join(', ')}. Posts that go out then wait longer for their first likes and comments.` });
  // The update-frequency answer is the same on every country page; the source line already says it.
  return [...out, ...general.filter((f) => f.q !== 'How often is this updated?')];
}

/** FAQ for the all-platforms country page. */
export function socialFaq({ country: slug, best, bestDay, perPlatform, scores = null, fetchedAt = null, at = Date.now() }) {
  const local = countryLocal(slug);
  if (!local) return [];
  const abbr = currentAbbr(local, at);
  const top = best[0];
  const pick = (id) => perPlatform.find((x) => x.platform.id === id);
  const line = (x) => (x ? `${WEEKDAY_NAMES[x.best.weekday]} at ${formatHour(x.best.hour)}` : '');
  return [
    { q: `What is the best time to post on social media in ${local.name}?`, a: `${WEEKDAY_NAMES[top.weekday]} at ${both(top.hour)} ${abbr}, across all ${BEST_TIME_PLATFORMS.length} platforms combined. For a single network, use its row in the platform table: Instagram peaks ${line(pick('instagram'))} and LinkedIn ${line(pick('linkedin'))}.` },
    { q: `What is the best day to post on social media in ${local.name}?`, a: `${WEEKDAY_NAMES[bestDay]}, with the highest combined score across all platforms.${scores ? ` Its strongest hours are ${topHoursOfDay(scores, bestDay, 3).map((h) => formatHour(h.hour)).join(', ')} ${abbr}.` : ''}` },
    { q: `What time zone is ${local.name} in?`, a: zoneSentence(local, at) },
    { q: `Is the best time to post on Instagram in ${local.name} different from TikTok or LinkedIn?`, a: `Yes. Instagram's best slot here is ${line(pick('instagram'))}, TikTok's ${line(pick('tiktok'))} and LinkedIn's ${line(pick('linkedin'))}. Work networks peak on weekday mornings; entertainment apps peak in the evening.` },
    { q: `I'm not in ${local.name}. How do I post at ${local.adj} times?`, a: `Use the "scheduling from abroad" table to convert each slot to your own clock, or set your Schedule For You workspace to ${local.adj} time so you can enter the times exactly as they appear here.` },
    { q: 'How is this worked out?', a: perPlatform.some((x) => x.source === 'trends')
      ? `Each platform gets its own 0–100 grid for ${local.name}. Where we don't yet have enough posts scheduled through Schedule For You, the grid comes from Google Trends: hourly search interest in that platform from people in ${local.name}, weighted by how many people are online each hour (Wikipedia traffic)${fetchedAt ? `, refreshed ${fetchedAt}` : ''}. The social media heatmap is the average of all ${perPlatform.length} grids.`
      : 'Every post scheduled through Schedule For You is counted in the hour and weekday it went out, in that account\'s own time zone. Each platform gets its own 0–100 grid; the social media heatmap is the average of all of them. Only counts are kept: no captions, accounts or names.' },
    { q: 'Can I post to all these platforms at their best times automatically?', a: `Yes. In Schedule For You, set your workspace to ${local.adj} time and add the best hours as queue slots; each new post takes the next free slot. To hit each network's own peak, schedule a post per platform at its time. The Free plan includes 3 accounts and up to 10 scheduled posts at a time, no card needed.` },
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
