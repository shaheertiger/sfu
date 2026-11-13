import { CTA_MARKER, getComparisons, getLocalizedPages, getPosts, getToolPages, rawContent, rawLocalizedContent, FAQ_HEADING, plainText } from '../content';
import { LOCALE_CODES, localeData, pageString } from '../i18n';
import { basePath, hasTwin, localizedPage } from '../i18n-pages';
import { DESCRIPTION, FAQ, FREE, PLANS, PLATFORMS, SITE_NAME, TAGLINE } from '../seo';
import { LANDING_PAGES } from '../landing-pages';
import { PLATFORM_PAGES } from '../platform-pages';
import { CATEGORIES, TOOLS } from '../tools/registry';
import { BASE_URL, DASHBOARD_ONLY, ERRORS, GROUPS, LIMITS, WEBHOOK_EVENTS } from '../api-reference';
import { abs, bullets, cleanBody, faq, figureLines, header, link, related, table } from './format';
import { bestTimeFigures, bestTimeIndexFigures, notifyFigures, notifyHubFigures, notifyIndexFigures, specFigures, specHubFigures, specIndexFigures } from '../figures';
import { BEST_TIME_PLATFORMS, COUNTRIES, WEEKDAYS, WEEKDAY_NAMES, bestWeekday, combineScores, formatHour, platformBySlug, quietSlots, scoreGrid, topHoursOfDay, topSlots } from '../best-time';
import { BEST_TIME_ROOT, SOCIAL, allBestTimePages, pageCopy as bestTimeCopy, pageFaq as bestTimeFaq, pagePath as bestTimePath, parseSegment, socialCopy, socialFaq, socialPath } from '../best-time-pages';
import { REGIONS, countryLocal } from '../best-time-countries';
import { TRENDS_META, staticGrid } from '../best-time-trends';
import { SPECS_ROOT, SPECS_VERIFIED, SPEC_PLATFORMS, allSpecPages, specBySlug, specPath, specPlatformBySlug } from '../specs';
import { NOTIFY_PLATFORMS, NOTIFY_ROOT, NOTIFY_VERIFIED, allNotifyPages, answerLabel, notifyActionBySlug, notifyActionsFor, notifyEntry, notifyPath, notifyPlatformBySlug, notifyPlatformsFor, question } from '../notify';
import { INDUSTRIES, POST_IDEAS_ROOT, WEEKDAY_ANGLES, ideasFor, industryBySlug, industryOne, industryPlural, postIdeasPath, weekPlan } from '../post-ideas';

/**
 * Every public page's markdown version. One entry per route pattern: static pages have a fixed
 * `path`; dynamic ones have a `pattern` with [params] and a `list()` of real instances. Adding a page
 * means adding one entry here; llms.txt, llms-full.txt and /api/md/_catalog follow.
 *
 * Each entry: { path | pattern, group, list?, render(params) → { title, summary, updated?, body } }.
 * Groups order llms.txt and llms-full.txt: core → docs → tools → blog → compare → i18n → legal.
 */

/** Public routes with no markdown version, each with the reason, checked by tests/markdown-site.test.ts. */
export const SKIPPED = {
  '/signup': 'account form',
  '/login': 'account form',
  '/forgot-password': 'account form',
  '/reset-password': 'account form',
  '/demo': 'interactive demo of the dashboard with sample data',
  '/brand': 'logo downloads, no prose',
  '/app': 'signed-in dashboard',
  '/p': 'private preview links',
  '/c': 'private shared calendars',
  '/invite': 'private invitations',
};

const platformNames = PLATFORMS.join(', ');

const home = () => ({
  title: `${SITE_NAME}: social media scheduler for nine platforms`,
  summary: DESCRIPTION,
  body: [
    `## ${TAGLINE}`,
    '',
    `${SITE_NAME} is a social media scheduler. Write one post, tailor the caption per platform, and publish to ${platformNames} from one queue. Every post can be scheduled, added to the next open posting slot, saved as a draft, repeated weekly or monthly, or sent for approval first.`,
    '',
    '## Platforms',
    '',
    bullets(PLATFORM_PAGES.map((p) => link(p.name, `/${p.slug}`))),
    '',
    '## Plans',
    '',
    `Free connects ${FREE.accounts} accounts and holds up to ${FREE.queue} scheduled posts at a time, with no card; posts from it end with a short link back to Schedule For You when it fits. Solo and Studio include unlimited posts, every platform, the queue and calendar, bulk CSV scheduling, approvals, client preview links, a media library, RSS auto-posting, webhooks, the REST API and the MCP server. Their 7-day free trial needs a card; the first charge is on day 8.`,
    '',
    table(['Plan', 'Monthly', 'Yearly (2 months free)', 'Connected accounts', 'Team members'], [[FREE.name, '$0', '$0', String(FREE.accounts), 'No'], ...PLANS.map((p) => [p.name, `$${p.price}`, `$${p.yearly}`, String(p.accounts), p.id === 'studio' ? 'Yes' : 'No'])]),
    '',
    `Full details: ${link('Pricing', '/pricing')}.`,
    '',
    `## ${FAQ_HEADING}`,
    '',
    faq(FAQ),
  ].join('\n') + related([['Pricing', '/pricing'], ['Free social media tools', '/tools'], ['Guides', '/blog'], ['API reference', '/docs']]),
});

/** A content/pages or content/platforms file, with its FAQ and CTA left as the source has them. */
function contentFile(dir, slug, extra = '') {
  const c = rawContent(dir, slug);
  if (!c) return null;
  return { title: c.data.title || c.data.h1 || slug, summary: c.data.description || c.data.lead || '', updated: c.data.updated || c.data.date, body: `${c.data.lead ? `${c.data.lead}\n\n` : ''}${extra}${cleanBody(c.body)}` };
}

const platform = ({ platform: slug }) => {
  const meta = PLATFORM_PAGES.find((p) => p.slug === slug);
  if (!meta) return null;
  const specs = meta.specs?.length ? `## ${meta.name} at a glance\n\n${table(['What', 'Detail'], meta.specs)}\n\n` : '';
  const page = contentFile('platforms', slug, specs);
  return page && { ...page, body: page.body + related([['Pricing', '/pricing'], ['All platforms', '/']]) };
};

const article = (dir) => (params) => {
  const slug = dir === 'compare' ? `${params.a}-vs-${params.b}` : params.slug;
  const c = rawContent(dir, slug);
  if (!c) return null;
  const meta = dir === 'compare' ? `Comparison of ${c.data.a} and ${c.data.b}. ` : c.data.category ? `Category: ${c.data.category}. ` : '';
  return { title: c.data.title || c.data.h1 || slug, summary: c.data.description || c.data.excerpt || '', updated: c.data.updated || c.data.date, body: `${meta ? `${meta}\n\n` : ''}${cleanBody(c.body)}${related([['All guides', '/blog'], ['Pricing', '/pricing']])}` };
};

const blogIndex = () => {
  const posts = getPosts();
  const cats = [...new Set(posts.map((p) => p.category))];
  return {
    title: 'Social media guides and how-tos',
    summary: 'Practical social media guides: image and video sizes, when to post, Instagram, TikTok, Facebook and LinkedIn how-tos, and tool comparisons.',
    updated: posts.reduce((d, p) => (p.date > d ? p.date : d), ''),
    body: cats.map((c) => `## ${c}\n\n${bullets(posts.filter((p) => p.category === c).map((p) => `${link(p.title, `/blog/${p.slug}`)} - ${plainText(p.excerpt || p.description || '')}`))}`).join('\n\n') + `\n\n## Comparisons\n\nSee ${link('all comparisons', '/compare')}.`,
  };
};

const compareIndex = () => {
  const list = getComparisons();
  return {
    title: 'Social media scheduler comparisons',
    summary: 'Side-by-side comparisons of social media scheduling tools: features, pricing and supported platforms.',
    updated: list.reduce((d, p) => (p.date > d ? p.date : d), ''),
    body: bullets(list.map((c) => `${link(c.title, `/compare/${c.aSlug}/${c.bSlug}`)} - ${plainText(c.excerpt || c.description || '')}`)),
  };
};

const toolsIndex = () => {
  const pages = getToolPages();
  return {
    title: 'Free social media tools: fonts, counters, resizers and more',
    summary: 'Free social media tools that run in the browser: font and bold text generators, character counters, photo resizers, and name, bio and comment ideas. No sign-up.',
    body: CATEGORIES.map((c) => {
      const list = TOOLS.filter((t) => t.category === c.id).map((t) => ({ t, p: pages.find((p) => p.slug === t.slug) })).filter((x) => x.p);
      return list.length ? `## ${c.name}\n\n${c.blurb}\n\n${bullets(list.map(({ t, p }) => `${link(p.h1 || p.title, `/tools/${t.slug}`)} - ${plainText(p.lead || p.description || '')}`))}` : '';
    }).filter(Boolean).join('\n\n'),
  };
};

const KIND_NOTE = {
  font: 'a Unicode font generator', counter: 'a character counter', linebreak: 'a line-break formatter', resizer: 'an image resizer', logo: 'a simple logo maker',
  name: 'a name idea generator', handle: 'a handle checker', bio: 'a bio generator', comment: 'a comment idea generator', caption: 'a caption idea generator',
  linkedin: 'a LinkedIn text formatter', slice: 'an image splitter', unfollowers: 'an unfollowers checker (runs on your own export)', yttags: 'a YouTube tag generator', yttitle: 'a YouTube title checker', shadowban: 'a guided shadowban self-test (it asks questions; it does not query any platform)',
  collage: 'a photo collage maker', textimage: 'a text-on-image maker', blur: 'a blur and pixelate tool', exif: 'a photo metadata (EXIF and location) remover', aspect: 'an aspect ratio calculator', readtime: 'a speech and reading time calculator', tierlist: 'a tier list maker', giveaway: 'a giveaway winner picker (entrants are pasted in; it reads nothing from social platforms)',
};

const tool = ({ slug }) => {
  const t = TOOLS.find((x) => x.slug === slug);
  if (!t) return null;
  const note = `This page has ${KIND_NOTE[t.kind] || 'an interactive tool'} that runs in the browser; use the HTML page to run it. The text below is the guide that goes with it.\n\n`;
  const page = contentFile('tools', slug, note);
  return page && { ...page, body: page.body + related([['All free tools', '/tools'], ['Schedule posts with Schedule For You', '/']]) };
};

const docs = () => {
  const endpoint = (e) => {
    const params = [...(e.params?.path || []).map((p) => ['path', p]), ...(e.params?.query || []).map((p) => ['query', p]), ...(e.params?.body || []).map((p) => ['body', p])];
    return [
      `### ${e.title}`, '', `\`${e.method} ${BASE_URL}${e.path}\``, '', ...(e.description || []), '',
      ...(params.length ? [table(['Where', 'Field', 'Type', 'Required', 'Description'], params.map(([w, p]) => [w, `\`${p.name}\``, p.type || '', p.required ? 'yes' : '', p.description || ''])), ''] : []),
      ...(e.example?.body ? ['Example request body:', '', '```json', JSON.stringify(e.example.body, null, 2), '```', ''] : []),
      ...(e.response ? [`Response (${e.response.status}):`, '', '```json', JSON.stringify(e.response.body, null, 2), '```', ''] : []),
      ...(e.errors?.length ? [bullets(e.errors.map(([c, w]) => `${c}: ${w}`)), ''] : []),
    ].join('\n');
  };
  return {
    title: `${SITE_NAME} API reference: posts, media and webhooks`,
    summary: `Reference for the ${SITE_NAME} REST API: authenticate with an API key, create and schedule posts, upload media, manage RSS feeds and verify webhooks.`,
    body: [
      '## Introduction', '', `Base URL: \`${BASE_URL}\`. Solo and Studio include the API; requests from a workspace on the Free plan get a 402. Requests and responses are JSON. Times are ISO 8601 or epoch milliseconds.`, '',
      '## Authentication', '', 'Create an API key in the dashboard under Settings. Send it on every request as `Authorization: Bearer <key>`. A key belongs to one workspace.', '',
      '## Errors', '', table(['Status', 'Meaning', 'When'], ERRORS), '',
      '## Limits', '', table(['What', 'Limit'], LIMITS), '',
      ...GROUPS.flatMap((g) => [`## ${g.title}`, '', ...(g.intro || []), '', ...g.endpoints.map(endpoint)]),
      '## Dashboard-only actions', '', bullets(DASHBOARD_ONLY.map((d) => `\`${d.method} ${d.path}\`: ${d.what}`)), '',
      '## Webhook events', '', table(['Event', 'Sent when'], WEBHOOK_EVENTS), '',
      '## MCP server', '', `The MCP server lives at ${abs('/api/mcp')} and takes the same API key. See the HTML reference for the tool list and client setup.`,
    ].join('\n') + related([['API overview', '/api'], ['Pricing', '/pricing']]),
  };
};

const landing = (slug) => () => contentFile('pages', slug);

/** /methodology: the page's prose with the best-time coverage table where the HTML page shows it (the <!-- cta --> marker). */
const methodology = () => {
  const c = rawContent('pages', 'methodology');
  if (!c) return null;
  const name = (codes) => codes.map((code) => COUNTRIES.find((x) => x.code === code)?.short || code).join(', ');
  const coverage = table(['Source', 'Countries', 'Which'], [
    ['Google Trends, measured directly', String(TRENDS_META.countryCount), name(TRENDS_META.measured)],
    ['Estimate (local Wikipedia activity × measured pattern)', String(TRENDS_META.estimatedCount), name(TRENDS_META.estimated)],
    ['Starting baseline (not measured)', String(TRENDS_META.baselineCount), name(TRENDS_META.baseline)],
  ].filter((r) => r[1] !== '0'));
  const body = c.body.replace(CTA_MARKER, `\n${coverage}\n\nGoogle Trends data last refreshed ${TRENDS_META.fetchedAt}; the pages are rebuilt daily.\n`);
  return { title: c.data.title, summary: c.data.description, updated: c.data.updated, body: `${c.data.lead}\n\n${cleanBody(body)}` };
};

/** A localized tool or platform page, in its own language, pointing back to the English original. */
const localized = (locale, kind) => (params) => {
  const slug = kind === 'platforms' ? params.platform : params.slug;
  if (!localizedPage(locale, kind, slug)) return null;
  const c = rawLocalizedContent(locale, kind, slug);
  const meta = kind === 'platforms' ? PLATFORM_PAGES.find((p) => p.slug === slug) : null;
  const specs = meta ? localeData(locale).specs?.[slug] || meta.specs : null;
  const specTable = specs ? `## ${pageString(locale, 'atAGlance', { name: meta.name })}\n\n${table(['', ''], specs)}\n\n` : '';
  const english = hasTwin(kind, slug) ? ` English version: ${link(basePath(kind, slug), basePath(kind, slug))}.` : '';
  const note = `Language: ${localeData(locale).name} (${locale}).${english}\n\n`;
  const intro = c.data.lead || c.data.excerpt;
  return {
    title: c.data.title || c.data.h1 || slug,
    summary: c.data.description || c.data.lead || '',
    updated: c.data.updated || c.data.date,
    body: `${note}${intro ? `${intro}\n\n` : ''}${specTable}${cleanBody(c.body)}`,
  };
};

/** Markdown routes for every localized page, one pair of patterns per language. */
const localizedRoutes = () =>
  LOCALE_CODES.flatMap((locale) => [
    { pattern: `/${locale}/[platform]`, group: 'i18n', name: `Platform pages (${localeData(locale).name})`, list: () => PLATFORM_PAGES.filter((p) => localizedPage(locale, 'platforms', p.slug)).map((p) => ({ platform: p.slug })), render: localized(locale, 'platforms') },
    { pattern: `/${locale}/tools/[slug]`, group: 'i18n', name: `Free tool pages (${localeData(locale).name})`, list: () => TOOLS.filter((t) => localizedPage(locale, 'tools', t.slug)).map((t) => ({ slug: t.slug })), render: localized(locale, 'tools') },
    { pattern: `/${locale}/blog/[slug]`, group: 'i18n', name: `Guides (${localeData(locale).name})`, list: () => getLocalizedPages(locale, 'blog').map((p) => ({ slug: p.slug })), render: localized(locale, 'blog') },
  ]);

/** @type {{ path?: string, pattern?: string, group: string, name: string, list?: () => Record<string, string>[], render: (params: any) => any }[]} */

/* --- Programmatic families: best time to post, specs and limits, post ideas --- */

const bestTimeIndex = () => ({
  title: 'Best time to post on social media, by platform and country',
  summary: `Hour-by-hour best posting times for every platform, weekday and ${COUNTRIES.length} countries, from Google Trends and Wikipedia activity data (our own scheduling data where there is enough), updated daily.`,
  body: `${figureLines(bestTimeIndexFigures())}## Platforms\n\n${bullets(BEST_TIME_PLATFORMS.map((p) => link(`Best time to post on ${p.name}`, bestTimePath(p.slug))))}\n\n## Countries (all platforms)\n\n${REGIONS.map((r) => `### ${r.name}\n\n${bullets(r.countries.map((c) => link(`Best time to post on social media in ${countryLocal(c).name}`, socialPath(c))))}`).join('\n\n')}`,
});

/** The markdown twin uses the published baseline (the live grid needs the database; the HTML page has it). */
const bestTimeSocial = (countrySlug) => {
  const local = countryLocal(countrySlug);
  if (!local) return null;
  const perPlatform = BEST_TIME_PLATFORMS.map((p) => {
    const sg = staticGrid(p.id, local.code);
    const scores = scoreGrid(sg.grid);
    return { platform: p, scores, best: topSlots(scores, 1)[0], source: sg.source };
  });
  const scores = combineScores(perPlatform.map((x) => x.scores));
  const best = topSlots(scores, 5);
  const bestDay = bestWeekday(scores);
  const copy = socialCopy({ country: countrySlug, best, bestDay });
  const rows = perPlatform.map((x) => [link(`${x.platform.name} in ${local.short}`, bestTimePath(x.platform.slug, `in-${countrySlug}`)), `${WEEKDAY_NAMES[x.best.weekday]} ${formatHour(x.best.hour)}`]);
  return {
    title: copy.title,
    summary: copy.description,
    body: `${copy.answer} ${copy.intro}\n\n${figureLines(bestTimeFigures(SOCIAL, `in-${countrySlug}`))}## Best time by platform\n\n${table(['Platform', `Best time (${local.short} time)`], rows)}\n\n## Daily rhythm in ${local.short}\n\n${local.rhythm}\n\n${bullets(local.tips)}\n\nCities: ${local.cities.join(', ')}.\n\n## Frequently asked questions\n\n${faq(socialFaq({ country: countrySlug, best, bestDay, perPlatform, scores, fetchedAt: TRENDS_META.fetchedAt }).map((f) => [f.q, f.a]))}${related([['All countries', BEST_TIME_ROOT]])}`,
  };
};

const bestTime = ({ platform, segment = '' }) => {
  if (platform === SOCIAL) return segment.startsWith('in-') ? bestTimeSocial(segment.slice(3)) : null;
  const p = platformBySlug(platform);
  const seg = parseSegment(segment);
  if (!p || !seg) return null;
  const sg = staticGrid(p.id, seg.kind === 'country' ? seg.country.code : null);
  const scores = scoreGrid(sg.grid);
  const bestDay = bestWeekday(scores);
  const best = topSlots(scores, 5);
  const quiet = quietSlots(scores, 3);
  const trendsMeta = { trendsKind: sg.trendsKind, fetchedAt: TRENDS_META.fetchedAt, countryCount: TRENDS_META.countryCount };
  const copy = bestTimeCopy({ platform, segment, best, bestDay, source: sg.source, posts: 0, ...trendsMeta });
  const days = WEEKDAY_NAMES.map((n, d) => [n, topHoursOfDay(scores, d, 3).map((h) => formatHour(h.hour)).join(', ')]);
  const local = seg.kind === 'country' ? countryLocal(seg.country.slug) : null;
  const place = local ? `## Daily rhythm in ${local.short}\n\n${local.rhythm}\n\n${bullets(local.tips)}\n\n` : '';
  const more = local ? [[`Social media in ${local.short}`, socialPath(local.slug)]] : COUNTRIES.slice(0, 6).map((c) => [`${p.name} in ${c.short}`, bestTimePath(platform, `in-${c.slug}`)]);
  return {
    title: copy.title,
    summary: copy.description,
    body: `${copy.answer} ${copy.intro}\n\n${figureLines(bestTimeFigures(platform, segment))}The HTML page shows the full hour-by-hour heatmap; this text version lists the strongest hours.\n\n## Best hours by weekday\n\n${table(['Weekday', 'Best hours (local time)'], days)}\n\n${place}## Frequently asked questions\n\n${faq(bestTimeFaq({ platform, segment, best, bestDay, quiet, source: sg.source, ...trendsMeta }).map((f) => [f.q, f.a]))}${related([['All platforms', BEST_TIME_ROOT], ...more])}`,
  };
};

const specsIndex = () => ({
  title: 'Social media image sizes and character limits, all platforms',
  summary: `Image sizes, video specs and character limits for ${SPEC_PLATFORMS.map((p) => p.name).join(', ')}, verified ${SPECS_VERIFIED}.`,
  body: figureLines(specIndexFigures()) + SPEC_PLATFORMS.map((p) => `## ${p.name}\n\n${bullets(p.specs.map((s) => `${link(s.h1, specPath(p.slug, s.slug))}: ${s.answer}`))}`).join('\n\n'),
});
const specPlatform = ({ platform }) => {
  const p = specPlatformBySlug(platform);
  if (!p) return null;
  return { title: `${p.name} image sizes and character limits`, summary: `Every ${p.name} size and limit in one table, verified ${SPECS_VERIFIED}.`, updated: SPECS_VERIFIED, body: figureLines(specHubFigures(p.slug)) + table(['Spec', 'Value'], p.specs.map((s) => [link(s.h1, specPath(p.slug, s.slug)), s.answer])) + related([['All platforms', SPECS_ROOT]]) };
};
const spec = ({ platform, spec: slug }) => {
  const p = specPlatformBySlug(platform);
  const s = specBySlug(platform, slug);
  if (!p || !s) return null;
  return { title: `${s.h1}: ${s.answer}`, summary: `${s.h1} is ${s.answer}. ${s.detail}`, updated: SPECS_VERIFIED, body: `${s.h1} is **${s.answer}**. ${s.detail}\n\n${figureLines(specFigures(p.slug, s.slug))}${table(['What', 'Value'], s.rows.map((r) => [r[0], r[2] ? `${r[1]} ${r[2]}` : r[1]]))}\n\nVerified ${SPECS_VERIFIED} against ${p.name}'s help pages and the limits Schedule For You enforces.${related([[`All ${p.name} specs`, specPath(p.slug)], ['All platforms', SPECS_ROOT]])}` };
};

const postIdeasIndex = () => ({
  title: 'Social media post ideas by industry',
  summary: `Ready-to-schedule post ideas for ${INDUSTRIES.length} kinds of business, with a Monday-to-Sunday plan for each.`,
  body: `## What to post on each day of the week\n\n${table(['Day', 'Angle', 'Why it works'], WEEKDAYS.map((d, i) => [WEEKDAY_NAMES[i], WEEKDAY_ANGLES[d].hook, WEEKDAY_ANGLES[d].note]))}\n\n## By business\n\n${bullets(INDUSTRIES.map((i) => link(`Post ideas for ${industryPlural(i)}`, postIdeasPath(i.slug))))}`,
});
const postIdeas = ({ industry }) => {
  const ind = industryBySlug(industry);
  if (!ind) return null;
  const ideas = ideasFor(ind);
  const plan = table(['Day', 'Angle', 'Post to try'], weekPlan(ind).map((d) => [d.day, d.angle.hook, d.idea?.text || '']));
  return {
    title: `${ideas.length} social media post ideas for ${industryPlural(ind)}`,
    summary: `${ideas.length} post ideas for ${industryOne(ind)}, written for ${ind.people}, plus a Monday-to-Sunday plan.`,
    body: `${bullets(ideas.map((i) => `**${i.type}:** ${i.text}`))}\n\n## What to post each day of the week\n\n${plan}${related([['Post ideas for every business', POST_IDEAS_ROOT]])}`,
  };
};

/* --- Does it notify? --- */

const cap = (s) => s.replace(/^\w/, (c) => c.toUpperCase());

const notifyIndex = () => ({
  title: 'Does it notify? Social media privacy answers for every platform and action',
  summary: `Whether ${NOTIFY_PLATFORMS.map((p) => p.name).join(', ')} notify people about screenshots, story views, unfollows, blocks, saves and more, verified ${NOTIFY_VERIFIED}.`,
  body: figureLines(notifyIndexFigures()) + NOTIFY_PLATFORMS.map((p) => `## ${p.name}\n\n${bullets(notifyActionsFor(p.slug).map((a) => `${link(question(a, p), notifyPath(p.slug, a.slug))} ${answerLabel(notifyEntry(p.slug, a.slug).answer)}.`))}`).join('\n\n'),
});

const notifyPlatform = ({ platform }) => {
  const p = notifyPlatformBySlug(platform);
  if (!p) return null;
  const acts = notifyActionsFor(platform);
  return { title: `What does ${p.name} notify people about?`, summary: `${acts.length} ${p.name} actions with a yes/no answer and what the other person sees, verified ${NOTIFY_VERIFIED}.`, updated: NOTIFY_VERIFIED, body: figureLines(notifyHubFigures(platform)) + table(['When you…', 'Notifies?', 'Rule'], acts.map((a) => { const e = notifyEntry(platform, a.slug); return [link(cap(a.short), notifyPath(platform, a.slug)), answerLabel(e.answer), e.rule]; })) + related([['All platforms', NOTIFY_ROOT]]) };
};

const notify = ({ platform, action }) => {
  const p = notifyPlatformBySlug(platform); const a = notifyActionBySlug(action); const e = notifyEntry(platform, action);
  if (!p || !a || !e) return null;
  const others = notifyPlatformsFor(action).filter((x) => x.slug !== platform);
  const exceptions = e.except.length ? `## Exceptions\n\n${bullets(e.except)}\n\n` : '';
  const compare = others.length ? `## Same action on other platforms\n\n${table(['Platform', 'Notifies?', 'Rule'], others.map((x) => { const xe = notifyEntry(x.slug, action); return [link(x.name, notifyPath(x.slug, action)), answerLabel(xe.answer), xe.rule]; }))}\n\n` : '';
  return { title: `${question(a, p)} ${answerLabel(e.answer)}`, summary: `${e.rule} ${e.sees}`, updated: NOTIFY_VERIFIED, body: `**${e.rule}** ${e.detail}\n\n${figureLines(notifyFigures(platform, action))}## What the other person sees\n\n${e.sees}\n\n**How to be sure:** ${e.sure}\n\n${exceptions}${compare}Verified ${NOTIFY_VERIFIED} against ${p.name}'s help centre and the live app.${related([[`All ${p.name} privacy questions`, notifyPath(platform)], ['All platforms', NOTIFY_ROOT]])}` };
};

export const ROUTES = [
  { path: '/', group: 'core', name: 'Home', render: home },
  { path: '/pricing', group: 'core', name: 'Pricing', render: landing('pricing') },
  { path: '/api', group: 'core', name: 'API overview', render: landing('api') },
  { path: '/about', group: 'core', name: 'About', render: landing('about') },
  { path: '/methodology', group: 'core', name: 'Methodology', render: methodology },
  ...LANDING_PAGES.filter((p) => !['pricing', 'api', 'privacy', 'data-deletion', 'terms'].includes(p.slug)).map((p) => ({ path: `/${p.slug}`, group: 'core', name: p.name, render: landing(p.slug) })),
  { pattern: '/[platform]', group: 'core', name: 'Platform pages', list: () => PLATFORM_PAGES.map((p) => ({ platform: p.slug })), render: platform },
  { path: '/docs', group: 'docs', name: 'API reference', render: docs },
  { path: '/tools', group: 'tools', name: 'Free tools', render: toolsIndex },
  { pattern: '/tools/[slug]', group: 'tools', name: 'Free tool pages', list: () => TOOLS.filter((t) => getToolPages().some((p) => p.slug === t.slug)).map((t) => ({ slug: t.slug })), render: tool },
  { path: '/blog', group: 'blog', name: 'Guides', render: blogIndex },
  { pattern: '/blog/[slug]', group: 'blog', name: 'Guides', list: () => getPosts().map((p) => ({ slug: p.slug })), render: article('blog') },
  { path: BEST_TIME_ROOT, group: 'tools', name: 'Best time to post', render: bestTimeIndex },
  { pattern: `${BEST_TIME_ROOT}/[platform]`, group: 'tools', name: 'Best time to post, by platform', list: () => BEST_TIME_PLATFORMS.map((p) => ({ platform: p.slug })), render: bestTime },
  { pattern: `${BEST_TIME_ROOT}/[platform]/[segment]`, group: 'tools', name: 'Best time to post, by country (and all platforms per country)', list: () => allBestTimePages().filter((p) => p.segment).map((p) => ({ platform: p.platform, segment: p.segment })), render: bestTime },
  { path: SPECS_ROOT, group: 'tools', name: 'Specs and limits', render: specsIndex },
  { pattern: `${SPECS_ROOT}/[platform]`, group: 'tools', name: 'Specs and limits, by platform', list: () => SPEC_PLATFORMS.map((p) => ({ platform: p.slug })), render: specPlatform },
  { pattern: `${SPECS_ROOT}/[platform]/[spec]`, group: 'tools', name: 'Spec pages', list: () => allSpecPages(), render: spec },
  { path: NOTIFY_ROOT, group: 'tools', name: 'Does it notify?', render: notifyIndex },
  { pattern: `${NOTIFY_ROOT}/[platform]`, group: 'tools', name: 'Does it notify?, by platform', list: () => NOTIFY_PLATFORMS.map((p) => ({ platform: p.slug })), render: notifyPlatform },
  { pattern: `${NOTIFY_ROOT}/[platform]/[action]`, group: 'tools', name: 'Does it notify? pages', list: () => allNotifyPages(), render: notify },
  { path: POST_IDEAS_ROOT, group: 'tools', name: 'Post ideas', render: postIdeasIndex },
  { pattern: `${POST_IDEAS_ROOT}/[industry]`, group: 'tools', name: 'Post ideas, by industry', list: () => INDUSTRIES.map((i) => ({ industry: i.slug })), render: postIdeas },
  { path: '/compare', group: 'compare', name: 'Comparisons', render: compareIndex },
  { pattern: '/compare/[a]/[b]', group: 'compare', name: 'Comparisons', list: () => getComparisons().map((c) => ({ a: c.aSlug, b: c.bSlug })), render: article('compare') },
  ...localizedRoutes(),
  { path: '/privacy', group: 'legal', name: 'Privacy policy', render: landing('privacy') },
  { path: '/data-deletion', group: 'legal', name: 'Data deletion', render: landing('data-deletion') },
  { path: '/terms', group: 'legal', name: 'Terms of Service', render: landing('terms') },
];

const fill = (pattern, params) => pattern.replace(/\[(\w+)\]/g, (_, k) => params[k]);

/** Every addressable markdown route, in llms.txt order: { path, group, name, title?, summary? }. */
export function listMarkdownRoutes() {
  const out = [];
  for (const r of ROUTES) {
    if (r.path) out.push({ path: r.path, group: r.group, name: r.name, pattern: r.path });
    else for (const params of r.list()) out.push({ path: fill(r.pattern, params), group: r.group, name: r.name, pattern: r.pattern, params });
  }
  return out;
}

/** The page for an HTML path, or null when the path has no markdown version. */
export function resolve(path) {
  const clean = path === '' ? '/' : `/${path.replace(/^\/+|\/+$/g, '')}`;
  if (clean !== '/' && Object.keys(SKIPPED).some((s) => clean === s || clean.startsWith(`${s}/`))) return null;
  // Fixed paths first (/docs must not be read as the platform page "docs"), then patterns whose instance exists.
  const fixed = ROUTES.find((r) => r.path === clean);
  if (fixed) return { route: fixed, params: {} };
  for (const r of ROUTES) {
    if (!r.pattern) continue;
    const keys = [...r.pattern.matchAll(/\[(\w+)\]/g)].map((m) => m[1]);
    const re = new RegExp(`^${r.pattern.replace(/\[\w+\]/g, '([^/]+)')}$`);
    const m = re.exec(clean);
    if (!m) continue;
    const params = Object.fromEntries(keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
    if (r.list().some((p) => keys.every((k) => p[k] === params[k]))) return { route: r, params };
  }
  return null;
}

/** Full markdown document for an HTML path, or null. */
export function renderPath(path) {
  const hit = resolve(path);
  if (!hit) return null;
  const page = hit.route.render(hit.params);
  if (!page) return null;
  const canonical = path === '' || path === '/' ? '/' : `/${path.replace(/^\/+|\/+$/g, '')}`;
  return { ...page, path: canonical, markdown: `${header({ title: page.title, summary: page.summary, path: canonical, updated: page.updated })}\n${page.body.trim()}\n` };
}

/** Which HTML paths take `Accept: text/markdown` negotiation and the `.md` suffix (the allowlist proxy.ts uses). */
export const isMarkdownPath = (path) => resolve(path) !== null;
