/**
 * Every free tool page: its URL slug, the widget it shows and that widget's settings. Page copy
 * lives in content/tools/<slug>.md; this file decides what the tool does and how pages link up.
 */

/** Platforms the scheduler publishes to. Tool pages for other platforms must never imply it posts there. */
export const SCHEDULED_PLATFORMS = ['x', 'bluesky', 'instagram', 'linkedin', 'threads', 'tiktok', 'youtube', 'facebook', 'pinterest', 'google'];

export const PLATFORM_NAMES = {
  x: 'X',
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  pinterest: 'Pinterest',
  discord: 'Discord',
  telegram: 'Telegram',
  reddit: 'Reddit',
  slack: 'Slack',
  all: 'All platforms',
};

export const CATEGORIES = [
  { id: 'fonts', name: 'Font and text generators', blurb: 'Bold, cursive, gothic and 20+ more Unicode styles you can paste anywhere.' },
  { id: 'counters', name: 'Counters and formatting', blurb: 'Check character limits and keep your line breaks.' },
  { id: 'images', name: 'Image resizers and logo makers', blurb: 'Resize photos to the exact size each platform wants, or make a simple icon.' },
  { id: 'names', name: 'Name generators', blurb: 'Username, channel and Page name ideas that follow each platform’s rules.' },
  { id: 'bios', name: 'Bio generators', blurb: 'Short bios that fit each platform’s character limit.' },
  { id: 'comments', name: 'Comment ideas', blurb: 'Starting points for thoughtful replies you write and post yourself.' },
];

const font = (slug, platform, sample, group = 'all') => ({ slug, kind: 'font', category: 'fonts', platform, config: { group, sample } });
const name = (slug, platform, rule, sample) => ({ slug, kind: 'name', category: 'names', platform, config: { rule, sample } });
const bio = (slug, platform, sample) => ({ slug, kind: 'bio', category: 'bios', platform, config: { platform, ...sample } });
const comment = (slug, platform) => ({ slug, kind: 'comment', category: 'comments', platform, config: { platform } });
const resizer = (slug, platform, presets) => ({ slug, kind: 'resizer', category: 'images', platform, config: { presets } });
const logo = (slug, platform, size, label) => ({ slug, kind: 'logo', category: 'images', platform, config: { size, label } });

export const TOOLS = [
  font('facebook-font-generator', 'facebook', 'Fresh bread every Saturday'),
  font('instagram-font-generator', 'instagram', 'Golden hour club'),
  font('discord-font-generator', 'discord', 'Night Owls Lounge'),
  font('tiktok-font-generator', 'tiktok', 'Wait for the ending'),
  font('pinterest-font-generator', 'pinterest', 'Cozy reading nook ideas'),
  font('telegram-font-generator', 'telegram', 'Daily market notes'),
  font('linkedin-font-generator', 'linkedin', 'Three lessons from my first year'),
  font('font-generator', 'all', 'Write it once, post it everywhere'),
  font('instagram-bold-text-generator', 'instagram', 'Link in bio', 'bold'),
  font('discord-bold-text-generator', 'discord', 'Server rules', 'bold'),
  font('youtube-bold-text-generator', 'youtube', 'Chapters below', 'bold'),
  font('facebook-bold-text-generator', 'facebook', 'Grand opening this Friday', 'bold'),
  font('telegram-bold-text-generator', 'telegram', 'Important update', 'bold'),
  font('strikethrough-text-generator', 'all', 'Was $40, now $25', 'strike'),

  { slug: 'x-character-counter', kind: 'counter', category: 'counters', platform: 'x', config: { mode: 'x' } },
  { slug: 'discord-character-counter', kind: 'counter', category: 'counters', platform: 'discord', config: { mode: 'discord' } },
  { slug: 'instagram-line-break-generator', kind: 'linebreak', category: 'counters', platform: 'instagram', config: {} },

  resizer('discord-photo-resizer', 'discord', [
    { label: 'Avatar', w: 512, h: 512, round: true },
    { label: 'Server icon', w: 512, h: 512, round: true },
    { label: 'Server banner', w: 960, h: 540 },
    { label: 'Profile banner', w: 680, h: 240 },
    { label: 'Emoji', w: 128, h: 128 },
    { label: 'Sticker', w: 320, h: 320 },
  ]),
  resizer('instagram-photo-resizer', 'instagram', [
    { label: 'Square post', w: 1080, h: 1080 },
    { label: 'Portrait post', w: 1080, h: 1350 },
    { label: 'Landscape post', w: 1080, h: 566 },
    { label: 'Story / Reel', w: 1080, h: 1920 },
    { label: 'Profile photo', w: 320, h: 320, round: true },
  ]),
  resizer('slack-photo-resizer', 'slack', [
    { label: 'Custom emoji', w: 128, h: 128 },
    { label: 'Profile photo', w: 512, h: 512 },
    { label: 'Workspace icon', w: 512, h: 512 },
  ]),
  resizer('tiktok-photo-resizer', 'tiktok', [
    { label: 'Video / photo post', w: 1080, h: 1920 },
    { label: 'Square', w: 1080, h: 1080 },
    { label: 'Profile photo', w: 200, h: 200, round: true },
  ]),
  resizer('reddit-photo-resizer', 'reddit', [
    { label: 'Community banner', w: 1920, h: 384 },
    { label: 'Community icon', w: 256, h: 256, round: true },
    { label: 'Avatar', w: 256, h: 256, round: true },
    { label: 'Post image', w: 1200, h: 628 },
  ]),
  resizer('discord-banner-resizer', 'discord', [
    { label: 'Server banner', w: 960, h: 540 },
    { label: 'Profile banner', w: 680, h: 240 },
    { label: 'Invite background', w: 1920, h: 1080 },
  ]),

  name('youtube-name-generator', 'youtube', 'youtube', 'travel vlog'),
  name('name-generator', 'all', 'generic', 'coffee'),
  name('reddit-name-generator', 'reddit', 'reddit', 'houseplants'),
  name('facebook-page-name-generator', 'facebook', 'facebookPage', 'bakery'),
  name('x-page-name-generator', 'x', 'xPage', 'design studio'),
  name('x-name-generator', 'x', 'x', 'pixel'),
  name('tiktok-name-generator', 'tiktok', 'tiktok', 'skincare'),
  name('telegram-name-generator', 'telegram', 'telegram', 'crypto news'),
  name('discord-name-generator', 'discord', 'discord', 'midnight'),
  name('youtube-page-name-generator', 'youtube', 'youtubeBrand', 'fitness'),
  name('facebook-name-generator', 'facebook', 'facebook', 'sam'),

  bio('instagram-bio-generator', 'instagram', { role: 'photographer', topic: 'street photos' }),
  bio('telegram-bio-generator', 'telegram', { role: 'analyst', topic: 'market news' }),
  bio('discord-bio-generator', 'discord', { role: 'gamer', topic: 'indie games' }),
  bio('youtube-bio-generator', 'youtube', { role: 'home cook', topic: 'quick weeknight dinners' }),
  bio('x-bio-generator', 'x', { role: 'product designer', topic: 'design systems' }),
  bio('tiktok-bio-generator', 'tiktok', { role: 'baker', topic: 'sourdough' }),

  comment('comment-generator', 'all'),
  comment('tiktok-comment-generator', 'tiktok'),
  comment('youtube-comment-generator', 'youtube'),
  comment('instagram-comment-generator', 'instagram'),

  logo('discord-logo-generator', 'discord', 512, 'Server icon'),
  logo('pinterest-logo-generator', 'pinterest', 512, 'Profile picture'),
  logo('tiktok-logo-generator', 'tiktok', 512, 'Profile picture'),
];

export const toolBySlug = (slug) => TOOLS.find((t) => t.slug === slug);

/** Up to `n` tools of the same kind (siblings), then the same category, excluding the tool itself. */
export function relatedTools(tool, n = 6) {
  const others = TOOLS.filter((t) => t.slug !== tool.slug);
  const kind = others.filter((t) => t.kind === tool.kind);
  const cat = others.filter((t) => t.category === tool.category && t.kind !== tool.kind);
  return [...kind, ...cat].slice(0, n);
}

/** Tools for the same platform, in other categories: the "Check also" links. */
export function samePlatformTools(tool, n = 6) {
  return TOOLS.filter((t) => t.slug !== tool.slug && t.platform === tool.platform && t.category !== tool.category).slice(0, n);
}
