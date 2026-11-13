/**
 * Which blog guide goes with which quick-reference page (a size or limit in /specs, a yes/no in
 * /does-it-notify). Each query has one owner: the reference page answers the number, the guide
 * explains it. Both sides link to each other from this one list, so they can't drift apart.
 */
import { specBySlug, specPath } from './specs';
import { notifyActionBySlug, notifyPath, notifyPlatformBySlug, question } from './notify';

/** blog slug → reference pages: ['specs', platform, spec] or ['notify', platform, action]. */
const GUIDES = {
  'instagram-post-size': [['specs', 'instagram', 'post-image-size']],
  'reel-size-instagram': [['specs', 'instagram', 'reels-size']],
  'instagram-carousel-limit': [['specs', 'instagram', 'carousel-size']],
  'instagram-caption-character-limit': [['specs', 'instagram', 'caption-character-limit']],
  'how-to-post-a-long-video-on-instagram': [['specs', 'instagram', 'video-length-limit']],
  'why-does-my-instagram-story-look-blurry': [['specs', 'instagram', 'story-size']],
  'how-to-change-profile-picture-on-instagram': [['specs', 'instagram', 'profile-picture-size']],
  'tiktok-video-size-ratio': [['specs', 'tiktok', 'video-size']],
  'tiktok-caption-character-limit': [['specs', 'tiktok', 'caption-character-limit']],
  'how-to-change-profile-picture-on-tiktok': [['specs', 'tiktok', 'profile-picture-size']],
  'image-sizes-for-linkedin-posts': [['specs', 'linkedin', 'post-image-size']],
  'linkedin-post-character-limit': [['specs', 'linkedin', 'post-character-limit']],
  'threads-character-limit': [['specs', 'threads', 'post-character-limit']],
  'bluesky-character-limit': [['specs', 'bluesky', 'post-character-limit']],
  'google-business-profile-post-character-limit': [['specs', 'google-business', 'post-character-limit']],
  'does-tiktok-notify-screenshots': [['notify', 'tiktok', 'screenshot-post'], ['notify', 'tiktok', 'screenshot-story'], ['notify', 'tiktok', 'screenshot-dm']],
  'how-to-archive-posts-instagram': [['notify', 'instagram', 'archive-post']],
  'how-to-block-someone-on-tiktok': [['notify', 'tiktok', 'block']],
  'how-to-unfollow-on-tiktok': [['notify', 'tiktok', 'unfollow']],
  'who-unfollowed-me-on-instagram': [['notify', 'instagram', 'unfollow']],
};

const refPath = ([kind, platform, page]) => (kind === 'specs' ? specPath(platform, page) : notifyPath(platform, page));

const refName = ([kind, platform, page]) => {
  if (kind !== 'specs') return question(notifyActionBySlug(page), notifyPlatformBySlug(platform));
  const h1 = specBySlug(platform, page)?.h1 || page;
  return h1.charAt(0).toUpperCase() + h1.slice(1);
};

/** Reference pages for a blog post: [{ href, name }]. */
export const referencesForGuide = (slug) => (GUIDES[slug] || []).map((r) => ({ href: refPath(r), name: refName(r) }));

/** The blog guide for a reference page path, or null. */
export function guideForReference(path) {
  const hit = Object.entries(GUIDES).find(([, refs]) => refs.some((r) => refPath(r) === path));
  return hit ? `/blog/${hit[0]}` : null;
}

/** Every pair, for tests. */
export const allGuideLinks = () => Object.entries(GUIDES).flatMap(([slug, refs]) => refs.map((r) => ({ guide: `/blog/${slug}`, ref: refPath(r), kind: r[0], platform: r[1], page: r[2] })));
