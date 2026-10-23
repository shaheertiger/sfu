export type PlatformId =
  | 'bluesky' | 'x' | 'instagram' | 'linkedin' | 'facebook'
  | 'tiktok' | 'youtube' | 'threads' | 'pinterest' | 'google_business';

export type PlatformMeta = {
  id: PlatformId;
  label: string;
  color: string;
  authMode: 'oauth' | 'credentials';
  maxChars: number;
  maxImages: number;
  video: boolean;
  requiresMedia: 'none' | 'image' | 'video' | 'any';
  envKeys: string[];
  notes: string;
  /** extra per-target fields rendered in the composer */
  fields?: { key: string; label: string; type: 'text' | 'select'; options?: string[]; required?: boolean }[];
};

export const PLATFORMS: Record<PlatformId, PlatformMeta> = {
  bluesky: {
    id: 'bluesky', label: 'Bluesky', color: '#1185fe', authMode: 'credentials',
    maxChars: 300, maxImages: 4, video: true, requiresMedia: 'none', envKeys: [],
    notes: 'Connect with your handle and an app password (Settings → App Passwords in Bluesky). No developer approval needed.',
  },
  x: {
    id: 'x', label: 'X / Twitter', color: '#000000', authMode: 'oauth',
    maxChars: 280, maxImages: 4, video: true, requiresMedia: 'none', envKeys: ['X_CLIENT_ID', 'X_CLIENT_SECRET'],
    notes: 'Create a project + app at developer.x.com. Enable OAuth 2.0 (confidential client), add the callback URL, request tweet.write.',
  },
  instagram: {
    id: 'instagram', label: 'Instagram', color: '#e1306c', authMode: 'oauth',
    maxChars: 2200, maxImages: 10, video: true, requiresMedia: 'any', envKeys: ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET'],
    notes: 'Requires an Instagram Business/Creator account linked to a Facebook Page. Media must be reachable at a public URL (APP_URL must be public).',
  },
  linkedin: {
    id: 'linkedin', label: 'LinkedIn', color: '#0a66c2', authMode: 'oauth',
    maxChars: 3000, maxImages: 9, video: true, requiresMedia: 'none', envKeys: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET'],
    notes: 'Add the "Share on LinkedIn" and "Sign In with LinkedIn using OpenID Connect" products to your LinkedIn app.',
  },
  facebook: {
    id: 'facebook', label: 'Facebook', color: '#1877f2', authMode: 'oauth',
    maxChars: 63206, maxImages: 10, video: true, requiresMedia: 'none', envKeys: ['FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET'],
    notes: 'Posts to Facebook Pages you manage. Needs pages_manage_posts + pages_read_engagement permissions.',
  },
  tiktok: {
    id: 'tiktok', label: 'TikTok', color: '#000000', authMode: 'oauth',
    maxChars: 2200, maxImages: 35, video: true, requiresMedia: 'any', envKeys: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET'],
    notes: 'Apply for the Content Posting API at developers.tiktok.com. Unaudited apps can only post privately.',
    fields: [{ key: 'privacy', label: 'Privacy', type: 'select', options: ['PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIENDS', 'SELF_ONLY'] }],
  },
  youtube: {
    id: 'youtube', label: 'YouTube', color: '#ff0000', authMode: 'oauth',
    maxChars: 5000, maxImages: 0, video: true, requiresMedia: 'video', envKeys: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    notes: 'Enable YouTube Data API v3 in Google Cloud. The first line of the caption becomes the title.',
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'privacy', label: 'Privacy', type: 'select', options: ['public', 'unlisted', 'private'] },
    ],
  },
  threads: {
    id: 'threads', label: 'Threads', color: '#000000', authMode: 'oauth',
    maxChars: 500, maxImages: 10, video: true, requiresMedia: 'none', envKeys: ['THREADS_APP_ID', 'THREADS_APP_SECRET'],
    notes: 'Threads uses its own app under your Meta developer account. Media must be at a public URL.',
  },
  pinterest: {
    id: 'pinterest', label: 'Pinterest', color: '#e60023', authMode: 'oauth',
    maxChars: 500, maxImages: 1, video: false, requiresMedia: 'image', envKeys: ['PINTEREST_APP_ID', 'PINTEREST_APP_SECRET'],
    notes: 'Pins require a board. Select a board per account after connecting.',
    fields: [
      { key: 'title', label: 'Pin title', type: 'text' },
      { key: 'board_id', label: 'Board ID', type: 'text', required: true },
      { key: 'link', label: 'Destination link', type: 'text' },
    ],
  },
  google_business: {
    id: 'google_business', label: 'Google Business', color: '#4285f4', authMode: 'oauth',
    maxChars: 1500, maxImages: 1, video: false, requiresMedia: 'none', envKeys: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    notes: 'Enable the Business Profile APIs (quota request required) in Google Cloud.',
    fields: [{ key: 'cta_url', label: 'Button link (optional)', type: 'text' }],
  },
};

export const PLATFORM_LIST = Object.values(PLATFORMS);

export function platformConfigured(p: PlatformMeta) {
  return p.envKeys.every((k) => !!process.env[k]);
}
