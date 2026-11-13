import test from 'node:test';
import assert from 'node:assert/strict';
import { INDUSTRIES, ideasFor, industryOne, industryPlural, pluralize } from '../lib/post-ideas.js';

test('industry names pluralize and take the right article', () => {
  assert.equal(pluralize('bakery'), 'bakeries');
  assert.equal(pluralize('small business'), 'small businesses');
  assert.equal(pluralize('marketing agency'), 'marketing agencies');
  assert.equal(pluralize('gym'), 'gyms');
  assert.equal(pluralize('church'), 'churches');
  assert.equal(industryOne({ name: 'accounting firm' }), 'an accounting firm');
  assert.equal(industryOne({ name: 'HVAC company', one: 'an HVAC company' }), 'an HVAC company');
  assert.equal(industryPlural(INDUSTRIES.find((i) => i.slug === 'real-estate')), 'real estate agents');
  for (const ind of INDUSTRIES) {
    assert.doesNotMatch(industryPlural(ind), /([^aeiou]ys|sss|ss)$/i, ind.slug);
    for (const idea of ideasFor(ind)) assert.doesNotMatch(idea.text, /\ba (?!usage)[aeiou]/i, `${ind.slug}: ${idea.text}`);
  }
});

test('"same spec on other platforms" links matching specs, not the first spec of the same kind', async () => {
  const { SPEC_PLATFORMS, equivalentSpec } = await import('../lib/specs.js');
  const p = (slug: string): any => SPEC_PLATFORMS.find((x) => x.slug === slug);
  const story = p('instagram').specs.find((x: any) => x.slug === 'story-size');
  assert.equal(equivalentSpec(p('tiktok'), story)?.slug, 'video-size');
  assert.equal(equivalentSpec(p('facebook'), story)?.slug, 'story-size');
  assert.equal(equivalentSpec(p('youtube'), story)?.slug, 'shorts-size');
  const caption = p('tiktok').specs.find((x: any) => x.slug === 'caption-character-limit');
  assert.equal(equivalentSpec(p('x'), caption)?.slug, 'post-character-limit');
  assert.equal(equivalentSpec(p('instagram'), p('youtube').specs.find((x: any) => x.slug === 'title-character-limit')), null);
});

test('best-time country pages with only the baseline, or for low-demand platforms, stay out of the index', async () => {
  const { bestTimeIndexable, TRENDS_META } = await import('../lib/best-time-trends.js');
  const { allBestTimePages } = await import('../lib/best-time-pages.js');
  assert.equal(bestTimeIndexable('instagram', ''), true);
  assert.equal(bestTimeIndexable('instagram', 'in-usa'), true);
  assert.equal(bestTimeIndexable('bluesky', 'in-usa'), false);
  assert.equal(bestTimeIndexable('bluesky', ''), true, 'platform hubs stay indexed');
  for (const code of TRENDS_META.baseline) {
    const slug = (await import('../lib/best-time.js')).COUNTRIES.find((c: any) => c.code === code)!.slug;
    assert.equal(bestTimeIndexable('instagram', `in-${slug}`), false, `${code} has only the baseline`);
    assert.equal(bestTimeIndexable('social-media', `in-${slug}`), false);
  }
  const indexed = allBestTimePages().filter((p: any) => bestTimeIndexable(p.platform, p.segment)).length;
  assert.ok(indexed < allBestTimePages().length && indexed > 100, `${indexed} indexed`);
});

test('the sitemap is split by family and language, with no utility pages and honest lastmod', async () => {
  process.env.APP_URL = 'https://scheduleforyou.com';
  const { sitemapFamilies, familyXml, indexXml } = await import('../lib/sitemap.js');
  const fam: Record<string, any[]> = sitemapFamilies();
  for (const name of ['core', 'tools', 'blog', 'best-time', 'specs', 'does-it-notify', 'post-ideas']) assert.ok(fam[name]?.length, `${name} family`);
  assert.ok(Object.keys(fam).some((k) => k.startsWith('lang-')), 'one file per language');
  const all = Object.values(fam).flat() as any[];
  assert.equal(new Set(all.map((e) => e.url)).size, all.length, 'no URL in two families');
  for (const bad of ['/signup', '/demo', '/login']) assert.ok(!all.some((e) => e.url.endsWith(bad)), `${bad} is listed`);
  assert.ok(fam.specs.every((e: any) => e.lastModified), 'specs carry their verified date');
  assert.ok(fam['best-time'].every((e: any) => e.changeFrequency !== 'daily'));
  const index = indexXml(fam);
  for (const name of Object.keys(fam)) assert.match(index, new RegExp(`/sitemaps/${name}\\.xml</loc>`));
  const xml = familyXml(fam.blog);
  assert.match(xml, /^<\?xml/);
  assert.match(xml, /<image:image><image:loc>https:\/\/scheduleforyou\.com\/images\/blog\//);
  assert.doesNotMatch(xml, /&(?!amp;|lt;|gt;|quot;)/);
});
