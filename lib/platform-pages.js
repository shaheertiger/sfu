/**
 * The platform landing pages (/instagram, /facebook, …). Specs mirror lib/server/platforms.ts and
 * the publishers in lib/server/adapters: keep them in step when a platform's support changes.
 */
export const PLATFORM_PAGES = [
  {
    slug: 'instagram', id: 'instagram', name: 'Instagram', toolPlatform: 'instagram',
    specs: [
      ['Caption', 'Up to 2,200 characters'],
      ['Post types', 'Photo posts, Reels, and carousels of up to 10 photos or videos'],
      ['Account', 'Instagram Business or Creator account linked to a Facebook Page'],
      ['Not supported', 'Stories and first comments'],
    ],
  },
  {
    slug: 'facebook', id: 'facebook', name: 'Facebook', toolPlatform: 'facebook',
    specs: [
      ['Post text', 'Up to 63,206 characters'],
      ['Media', 'Up to 10 photos, or a video'],
      ['Account', 'Facebook Pages you manage'],
      ['Not supported', 'Personal profiles and Groups'],
    ],
  },
  {
    slug: 'x', id: 'x', name: 'X', toolPlatform: 'x',
    specs: [
      ['Post text', 'Up to 280 characters, counted the way X counts them'],
      ['Media', 'Up to 4 images, a GIF, or a video'],
      ['Account', 'Your X account, connected with X’s own sign-in'],
    ],
  },
  {
    slug: 'linkedin', id: 'linkedin', name: 'LinkedIn', toolPlatform: 'linkedin',
    specs: [
      ['Post text', 'Up to 3,000 characters'],
      ['Media', 'Up to 9 images, or a video'],
      ['Account', 'Your LinkedIn account, connected with LinkedIn’s own sign-in'],
    ],
  },
  {
    slug: 'threads', id: 'threads', name: 'Threads', toolPlatform: 'threads',
    specs: [
      ['Post text', 'Up to 500 characters'],
      ['Post types', 'Text posts, a photo or video, or a carousel of up to 10'],
      ['Account', 'Your Threads profile, connected with Meta’s sign-in'],
    ],
  },
  {
    slug: 'bluesky', id: 'bluesky', name: 'Bluesky', toolPlatform: 'bluesky',
    specs: [
      ['Post text', 'Up to 300 characters'],
      ['Media', 'Up to 4 images, or a video'],
      ['Account', 'Your handle and a Bluesky app password'],
    ],
  },
  {
    slug: 'tiktok', id: 'tiktok', name: 'TikTok', toolPlatform: 'tiktok',
    specs: [
      ['Caption', 'Up to 2,200 characters'],
      ['Post types', 'Videos, and photo posts with multiple images'],
      ['Privacy', 'Public, friends or only me, per post'],
    ],
  },
  {
    slug: 'youtube', id: 'youtube', name: 'YouTube', toolPlatform: 'youtube',
    specs: [
      ['Title', 'Up to 100 characters'],
      ['Description', 'Up to 5,000 characters'],
      ['Media', 'One video per post (YouTube decides whether it’s a Short)'],
      ['Privacy', 'Public, unlisted or private'],
    ],
  },
  {
    slug: 'pinterest', id: 'pinterest', name: 'Pinterest', toolPlatform: 'pinterest',
    specs: [
      ['Pin description', 'Up to 500 characters'],
      ['Media', 'One image per pin'],
      ['Extras', 'Board, pin title and destination link'],
    ],
  },
  {
    slug: 'google-business-profile', id: 'google_business', name: 'Google Business Profile', toolPlatform: 'google',
    specs: [
      ['Update text', 'Up to 1,500 characters'],
      ['Media', 'One image (no video)'],
      ['Extras', 'Optional button link'],
      ['Account', 'Owner or manager of a verified Business Profile'],
    ],
  },
];

export const platformPage = (slug) => PLATFORM_PAGES.find((p) => p.slug === slug);
