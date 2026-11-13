import test from 'node:test';
import assert from 'node:assert/strict';
import { INDUSTRIES, ideasFor, industryOne, industryPlural, pluralize } from '../lib/post-ideas.js';

test('industry names pluralize and take the right article', () => {
  assert.equal(pluralize('bakery'), 'bakeries');
  assert.equal(pluralize('small business'), 'small businesses');
  assert.equal(pluralize('marketing agency'), 'marketing agencies');
  assert.equal(pluralize('gym'), 'gyms');
  assert.equal(pluralize('church'), 'churches');
  assert.equal(industryOne(INDUSTRIES.find((i) => i.slug === 'accountants')), 'an accounting firm');
  assert.equal(industryOne(INDUSTRIES.find((i) => i.slug === 'hvac')), 'an HVAC company');
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
