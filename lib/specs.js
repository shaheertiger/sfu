/**
 * Platform specs and limits for the /specs pages: image and video sizes, character and media
 * limits. One entry per platform; `specs` is the list of pages (each one URL). Values are the
 * platforms' published recommendations plus what Schedule For You itself enforces when
 * publishing (lib/server/platforms.ts). `verified` is when the numbers were last checked against
 * the platform's help pages: update it when you re-check, and change a value only with a source.
 */
import { SOCIAL_SIZES } from './tools/aspect';

export const SPECS_ROOT = '/specs';
export const SPECS_VERIFIED = '2026-11-01';

const px = (w, h) => `${w} × ${h} px`;

/** Shared spec definitions; `kind` groups them on the hub ('image' | 'video' | 'text' | 'media'). */
export const SPEC_PLATFORMS = [
  {
    slug: 'instagram', id: 'instagram', name: 'Instagram',
    specs: [
      { slug: 'post-image-size', kind: 'image', h1: 'Instagram post image size', answer: px(1080, 1350), detail: 'Portrait 4:5 shows largest in the feed; 1080 × 1080 (1:1) and 1080 × 566 (1.91:1) also work.', rows: [['Portrait (4:5)', px(1080, 1350)], ['Square (1:1)', px(1080, 1080)], ['Landscape (1.91:1)', px(1080, 566)], ['Max file size', '30 MB (photo)'], ['Formats', 'JPG, PNG; HEIC converts']] },
      { slug: 'story-size', kind: 'image', h1: 'Instagram Story size', answer: px(1080, 1920), detail: '9:16. Keep text out of the top 250 px and bottom 340 px, where the UI overlaps.', rows: [['Size', px(1080, 1920)], ['Ratio', '9:16'], ['Safe zone', '250 px top, 340 px bottom'], ['Video length', 'Up to 60 s per Story segment']] },
      { slug: 'reels-size', kind: 'video', h1: 'Instagram Reels size', answer: px(1080, 1920), detail: '9:16 vertical, 30 fps, H.264 MP4 or MOV.', rows: [['Size', px(1080, 1920)], ['Ratio', '9:16'], ['Length', 'Up to 3 minutes for most accounts'], ['Frame rate', '30 fps'], ['Cover', px(1080, 1920)]] },
      { slug: 'profile-picture-size', kind: 'image', h1: 'Instagram profile picture size', answer: px(320, 320), detail: 'Displayed as a circle at 110 × 110 px; upload a square at least 320 px.', rows: [['Upload', px(320, 320), 'or larger, square'], ['Displayed', '110 × 110 px, circle crop'], ['Formats', 'JPG, PNG']] },
      { slug: 'carousel-size', kind: 'image', h1: 'Instagram carousel size', answer: px(1080, 1350), detail: 'All slides share the ratio of the first; up to 20 photos or videos.', rows: [['Size', px(1080, 1350), 'or 1080 × 1080'], ['Slides', 'Up to 20'], ['Mixed', 'Photos and videos together']] },
      { slug: 'caption-character-limit', kind: 'text', h1: 'Instagram caption character limit', answer: '2,200 characters', detail: 'The feed truncates after about 125 characters with "more"; hashtags count toward the limit.', rows: [['Caption', '2,200 characters'], ['Shown before "more"', '~125 characters'], ['Hashtags', 'Up to 30; Instagram recommends 3–5'], ['Mentions', 'Up to 20 per caption']] },
      { slug: 'bio-character-limit', kind: 'text', h1: 'Instagram bio character limit', answer: '150 characters', detail: 'Name field 30 characters, username 30, up to 5 links.', rows: [['Bio', '150 characters'], ['Name', '30 characters'], ['Username', '30 characters'], ['Links', 'Up to 5']] },
      { slug: 'hashtag-limit', kind: 'text', h1: 'Instagram hashtag limit', answer: '30 hashtags', detail: 'A post with more than 30 fails to publish; Instagram\'s own guidance is 3–5 relevant tags.', rows: [['Per post', '30'], ['Recommended', '3–5'], ['Per Story', '10']] },
      { slug: 'video-length-limit', kind: 'video', h1: 'Instagram video length limit', answer: '3 minutes (Reels)', detail: 'Reels up to 3 minutes for most accounts; Instagram tests longer limits with some accounts, so check the upload screen. Stories 60 s per segment.', rows: [['Reels', 'Up to 3 min for most accounts'], ['Stories', '60 s per segment'], ['Live', 'Up to 4 hours'], ['Max file', '1 GB']] },
    ],
  },
  {
    slug: 'tiktok', id: 'tiktok', name: 'TikTok',
    specs: [
      { slug: 'video-size', kind: 'video', h1: 'TikTok video size', answer: px(1080, 1920), detail: '9:16 vertical; 1:1 and 16:9 are shown with bars.', rows: [['Size', px(1080, 1920)], ['Ratio', '9:16'], ['Formats', 'MP4, MOV, WebM'], ['Max file', '4 GB (app) / 287.6 MB (web)']] },
      { slug: 'video-length-limit', kind: 'video', h1: 'TikTok video length limit', answer: '10 minutes', detail: 'Recording in-app allows 15 s, 60 s, 3 min and 10 min; uploads up to 10 minutes (60 minutes for some accounts).', rows: [['Upload', 'Up to 10 min (60 min for some accounts)'], ['In-app recording', '15 s / 60 s / 3 min / 10 min'], ['Stories', 'Up to 15 s'], ['Photo mode', 'Up to 35 images']] },
      { slug: 'caption-character-limit', kind: 'text', h1: 'TikTok caption character limit', answer: '4,000 characters', detail: 'Raised from 300 to 2,200 and then 4,000 in the app. Posts published through TikTok\'s API, which schedulers including Schedule For You use, are capped at 2,200. The feed shows the first two lines.', rows: [['Caption (app)', '4,000 characters'], ['Caption (API and schedulers)', '2,200 characters'], ['Shown collapsed', '~2 lines'], ['Hashtags', 'Count toward the caption limit']] },
      { slug: 'bio-character-limit', kind: 'text', h1: 'TikTok bio character limit', answer: '80 characters', detail: 'Display name 30 characters, username 24.', rows: [['Bio', '80 characters'], ['Display name', '30'], ['Username', '24 (letters, numbers, underscores, periods)']] },
      { slug: 'profile-picture-size', kind: 'image', h1: 'TikTok profile picture size', answer: px(200, 200), detail: 'Minimum 20 × 20; shown as a circle.', rows: [['Recommended', px(200, 200)], ['Minimum', px(20, 20)], ['Formats', 'JPG, PNG']] },
      { slug: 'cover-image-size', kind: 'image', h1: 'TikTok cover image size', answer: px(1080, 1920), detail: 'The profile grid crops covers to 3:4, so centre the subject.', rows: [['Cover', px(1080, 1920)], ['Grid crop', '3:4 centre']] },
    ],
  },
  {
    slug: 'facebook', id: 'facebook', name: 'Facebook',
    specs: [
      { slug: 'post-image-size', kind: 'image', h1: 'Facebook post image size', answer: px(1200, 630), detail: '1.91:1 for links; 1080 × 1350 (4:5) for photo posts shows largest in the feed.', rows: [['Link / landscape', px(1200, 630)], ['Photo, portrait', px(1080, 1350)], ['Square', px(1080, 1080)], ['Max photos per post', '10 (via API)']] },
      { slug: 'cover-photo-size', kind: 'image', h1: 'Facebook cover photo size', answer: px(820, 312), detail: 'Displayed 820 × 312 on desktop and 640 × 360 on phones; keep the centre safe.', rows: [['Desktop', px(820, 312)], ['Mobile', px(640, 360)], ['Upload', px(1640, 624), 'for sharp display'], ['Min', px(400, 150)]] },
      { slug: 'profile-picture-size', kind: 'image', h1: 'Facebook profile picture size', answer: px(170, 170), detail: 'Displayed at 170 px on desktop and 128 px on phones; upload at least 320 px square.', rows: [['Desktop', px(170, 170)], ['Mobile', px(128, 128)], ['Upload', px(320, 320), 'or larger']] },
      { slug: 'story-size', kind: 'image', h1: 'Facebook Story size', answer: px(1080, 1920), detail: '9:16; keep 250 px top and bottom clear.', rows: [['Size', px(1080, 1920)], ['Ratio', '9:16'], ['Video length', '20 s per segment']] },
      { slug: 'event-cover-size', kind: 'image', h1: 'Facebook event cover photo size', answer: px(1920, 1005), detail: '1.91:1 landscape.', rows: [['Size', px(1920, 1005)], ['Ratio', '1.91:1']] },
      { slug: 'post-character-limit', kind: 'text', h1: 'Facebook post character limit', answer: '63,206 characters', detail: 'Posts collapse after about 477 characters with "See more".', rows: [['Post', '63,206 characters'], ['Shown before "See more"', '~477 characters'], ['Comment', '8,000 characters']] },
      { slug: 'video-size', kind: 'video', h1: 'Facebook video size', answer: px(1080, 1080), detail: 'Feed video 1:1 or 4:5; Reels 1080 × 1920.', rows: [['Feed', px(1080, 1080), 'or 1080 × 1350'], ['Reels', px(1080, 1920)], ['Length', 'Up to 240 min (feed), 90 s (Reels)'], ['Max file', '10 GB']] },
    ],
  },
  {
    slug: 'linkedin', id: 'linkedin', name: 'LinkedIn',
    specs: [
      { slug: 'post-image-size', kind: 'image', h1: 'LinkedIn post image size', answer: px(1080, 1350), detail: 'Portrait 4:5 fills the most of the mobile feed for photo posts; square 1080 × 1080 also works. Link previews use 1200 × 627 (1.91:1).', rows: [['Portrait (photo posts)', px(1080, 1350)], ['Square', px(1080, 1080)], ['Link preview', px(1200, 627)], ['Max images', '9 per post']] },
      { slug: 'banner-size', kind: 'image', h1: 'LinkedIn banner size', answer: px(1584, 396), detail: '4:1. Company Page banners are 1128 × 191.', rows: [['Personal profile', px(1584, 396)], ['Company Page', px(1128, 191)], ['Max file', '8 MB']] },
      { slug: 'profile-picture-size', kind: 'image', h1: 'LinkedIn profile picture size', answer: px(400, 400), detail: 'Square between 400 and 7,680 px, under 8 MB.', rows: [['Recommended', px(400, 400)], ['Max', px(7680, 7680)], ['Max file', '8 MB']] },
      { slug: 'post-character-limit', kind: 'text', h1: 'LinkedIn post character limit', answer: '3,000 characters', detail: 'The feed shows about 210 characters before "see more". Articles allow 110,000.', rows: [['Post', '3,000 characters'], ['Shown before "see more"', '~210 characters'], ['Comment', '1,250'], ['Article', '110,000'], ['Headline', '220']] },
      { slug: 'video-size', kind: 'video', h1: 'LinkedIn video size', answer: px(1920, 1080), detail: '16:9, 1:1 or 9:16; 3 s to 10 min; up to 5 GB.', rows: [['Landscape', px(1920, 1080)], ['Square', px(1080, 1080)], ['Vertical', px(1080, 1920)], ['Length', '3 s – 10 min'], ['Max file', '5 GB']] },
    ],
  },
  {
    slug: 'x', id: 'x', name: 'X',
    specs: [
      { slug: 'post-character-limit', kind: 'text', h1: 'X (Twitter) post character limit', answer: '280 characters', detail: 'Links count as 23, emoji and most non-Latin characters as 2. Premium subscribers get 25,000.', rows: [['Standard', '280 characters'], ['Premium', '25,000'], ['Links', 'Always 23 characters'], ['Emoji / CJK', '2 characters each']] },
      { slug: 'bio-character-limit', kind: 'text', h1: 'X bio character limit', answer: '160 characters', detail: 'Display name 50 characters, username 15.', rows: [['Bio', '160 characters'], ['Display name', '50'], ['Username', '15']] },
      { slug: 'image-size', kind: 'image', h1: 'X image size', answer: px(1600, 900), detail: '16:9 shows uncropped in the timeline; up to 4 images.', rows: [['Timeline', px(1600, 900)], ['Square', px(1080, 1080)], ['Max images', '4'], ['Max file', '5 MB (photo), 15 MB (GIF)']] },
      { slug: 'header-size', kind: 'image', h1: 'X header size', answer: px(1500, 500), detail: '3:1; the profile picture covers the bottom-left corner.', rows: [['Header', px(1500, 500)], ['Profile picture', px(400, 400)]] },
      { slug: 'video-size', kind: 'video', h1: 'X video size', answer: px(1280, 720), detail: '16:9 or 1:1, up to 2 min 20 s (longer with Premium), 512 MB.', rows: [['Size', px(1280, 720), 'or 1920 × 1080'], ['Length', '2 min 20 s (Premium: longer)'], ['Max file', '512 MB'], ['Formats', 'MP4, MOV']] },
    ],
  },
  {
    slug: 'threads', id: 'threads', name: 'Threads',
    specs: [
      { slug: 'post-character-limit', kind: 'text', h1: 'Threads character limit', answer: '500 characters', detail: 'Up to 20 photos or videos per post (Schedule For You takes up to 10 per Threads post); links are clickable.', rows: [['Post', '500 characters'], ['Media', 'Up to 20 per post (10 through Schedule For You)'], ['Video length', 'Up to 5 min']] },
      { slug: 'image-size', kind: 'image', h1: 'Threads image size', answer: px(1080, 1350), detail: '4:5 portrait or 1:1 square.', rows: [['Portrait', px(1080, 1350)], ['Square', px(1080, 1080)], ['Max images', '20 (10 through Schedule For You)']] },
    ],
  },
  {
    slug: 'youtube', id: 'youtube', name: 'YouTube',
    specs: [
      { slug: 'thumbnail-size', kind: 'image', h1: 'YouTube thumbnail size', answer: px(1280, 720), detail: '16:9, under 2 MB, JPG, PNG or GIF.', rows: [['Size', px(1280, 720)], ['Minimum width', '640 px'], ['Max file', '2 MB'], ['Formats', 'JPG, PNG, GIF']] },
      { slug: 'banner-size', kind: 'image', h1: 'YouTube banner size', answer: px(2560, 1440), detail: 'Only the centre 1,546 × 423 px is visible on every device.', rows: [['Upload', px(2560, 1440)], ['Safe area', px(1546, 423)], ['Max file', '6 MB']] },
      { slug: 'profile-picture-size', kind: 'image', h1: 'YouTube profile picture size', answer: px(800, 800), detail: 'Shown as a circle at 98 × 98.', rows: [['Upload', px(800, 800)], ['Displayed', px(98, 98)]] },
      { slug: 'shorts-size', kind: 'video', h1: 'YouTube Shorts size', answer: px(1080, 1920), detail: '9:16, up to 3 minutes.', rows: [['Size', px(1080, 1920)], ['Length', 'Up to 3 min'], ['Ratio', '9:16']] },
      { slug: 'video-size', kind: 'video', h1: 'YouTube video size', answer: px(1920, 1080), detail: '16:9; 4K is 3840 × 2160. Up to 12 hours or 256 GB once verified.', rows: [['1080p', px(1920, 1080)], ['4K', px(3840, 2160)], ['Length', '15 min (unverified) / 12 h (verified)'], ['Max file', '256 GB']] },
      { slug: 'title-character-limit', kind: 'text', h1: 'YouTube title character limit', answer: '100 characters', detail: 'Search results show about 70. Descriptions allow 5,000.', rows: [['Title', '100 characters'], ['Shown in search', '~70'], ['Description', '5,000'], ['Tags', '500 characters total']] },
    ],
  },
  {
    slug: 'pinterest', id: 'pinterest', name: 'Pinterest',
    specs: [
      { slug: 'pin-size', kind: 'image', h1: 'Pinterest pin size', answer: px(1000, 1500), detail: '2:3. Taller pins may be cropped in the feed.', rows: [['Standard', px(1000, 1500)], ['Square', px(1000, 1000)], ['Max file', '20 MB'], ['Formats', 'JPG, PNG']] },
      { slug: 'video-pin-size', kind: 'video', h1: 'Pinterest video pin size', answer: px(1080, 1920), detail: '9:16 or 2:3; 4 s to 15 min.', rows: [['Size', px(1080, 1920)], ['Length', '4 s – 15 min'], ['Max file', '2 GB']] },
      { slug: 'profile-picture-size', kind: 'image', h1: 'Pinterest profile picture size', answer: px(165, 165), detail: 'Square; shown as a circle.', rows: [['Size', px(165, 165)]] },
      { slug: 'description-character-limit', kind: 'text', h1: 'Pinterest pin description character limit', answer: '500 characters', detail: 'Title 100 characters; only the first 50–60 show in the feed.', rows: [['Description', '500 characters'], ['Title', '100'], ['Board name', '50'], ['Bio', '500']] },
    ],
  },
  {
    slug: 'bluesky', id: 'bluesky', name: 'Bluesky',
    specs: [
      { slug: 'post-character-limit', kind: 'text', h1: 'Bluesky character limit', answer: '300 characters', detail: 'Counted in graphemes; links can be shortened with link cards.', rows: [['Post', '300 characters'], ['Bio', '256'], ['Display name', '64'], ['Alt text', '2,000']] },
      { slug: 'image-size', kind: 'image', h1: 'Bluesky image size', answer: px(1600, 900), detail: 'Up to 4 images, 1 MB each after compression.', rows: [['Recommended', px(1600, 900)], ['Max images', '4'], ['Max file', '1 MB each']] },
      { slug: 'banner-size', kind: 'image', h1: 'Bluesky banner size', answer: px(3000, 1000), detail: '3:1.', rows: [['Banner', px(3000, 1000)], ['Avatar', px(1000, 1000)]] },
    ],
  },
  {
    slug: 'google-business', id: 'google', name: 'Google Business Profile',
    specs: [
      { slug: 'post-image-size', kind: 'image', h1: 'Google Business Profile post image size', answer: px(1200, 900), detail: '4:3; minimum 480 × 270, under 5 MB.', rows: [['Recommended', px(1200, 900)], ['Minimum', px(480, 270)], ['Max file', '5 MB'], ['Formats', 'JPG, PNG']] },
      { slug: 'post-character-limit', kind: 'text', h1: 'Google Business Profile post character limit', answer: '1,500 characters', detail: 'Only the first 100 or so show in the card.', rows: [['Post', '1,500 characters'], ['Shown in card', '~100'], ['Event title', '58']] },
      { slug: 'logo-size', kind: 'image', h1: 'Google Business Profile logo size', answer: px(720, 720), detail: 'Square; cover photo 1024 × 576.', rows: [['Logo', px(720, 720)], ['Cover', px(1024, 576)]] },
    ],
  },
];

export const specPlatformBySlug = (slug) => SPEC_PLATFORMS.find((p) => p.slug === slug) || null;
export const specBySlug = (platformSlug, specSlug) => specPlatformBySlug(platformSlug)?.specs.find((s) => s.slug === specSlug) || null;
/**
 * Specs that answer the same question on different platforms, so "Same spec on other platforms" links
 * a Story size to other vertical sizes, not to whatever image spec a platform lists first.
 */
const SPEC_ROLES = [
  ['vertical', ['story-size', 'reels-size', 'shorts-size', 'video-size', 'video-pin-size']],
  ['feed-image', ['post-image-size', 'image-size', 'pin-size', 'carousel-size']],
  ['profile', ['profile-picture-size', 'logo-size']],
  ['banner', ['banner-size', 'header-size', 'cover-photo-size', 'event-cover-size']],
  ['video-cover', ['cover-image-size', 'thumbnail-size']],
  ['post-text', ['post-character-limit', 'caption-character-limit']],
  ['bio', ['bio-character-limit']],
  ['video-length', ['video-length-limit']],
];
const roleOf = (slug) => SPEC_ROLES.find(([, slugs]) => slugs.includes(slug))?.[0] || null;
/** The spec on `platform` that matches `spec`: the same slug, else the same role, else none. */
export function equivalentSpec(platform, spec) {
  const same = platform.specs.find((x) => x.slug === spec.slug);
  if (same) return same;
  const role = roleOf(spec.slug);
  if (!role) return null;
  const order = SPEC_ROLES.find(([r]) => r === role)[1];
  return order.map((slug) => platform.specs.find((x) => x.slug === slug)).find(Boolean) || null;
}
export const specPath = (platformSlug, specSlug = '') => `${SPECS_ROOT}/${platformSlug}${specSlug ? `/${specSlug}` : ''}`;
export function allSpecPages() {
  return SPEC_PLATFORMS.flatMap((p) => p.specs.map((s) => ({ platform: p.slug, spec: s.slug })));
}

/** The resizer preset that matches a spec, if one exists (links the spec page to the free tool). */
export function sizePresetFor(platformName, spec) {
  const m = /(\d+) × (\d+) px/.exec(spec.answer);
  if (!m) return null;
  return SOCIAL_SIZES.find((s) => s.platform === platformName && s.w === Number(m[1]) && s.h === Number(m[2])) || null;
}
