/** Cross-links between blog posts and tools, by platform. */

const CATEGORY_PLATFORM = {
  Instagram: 'instagram',
  TikTok: 'tiktok',
  Facebook: 'facebook',
  YouTube: 'youtube',
  LinkedIn: 'linkedin',
  X: 'x',
  Discord: 'discord',
  Reddit: 'reddit',
};

export const platformOfPost = (post) => CATEGORY_PLATFORM[post.category] || 'all';

/** Posts about a platform first; for cross-platform tools, the general strategy posts. */
export function postsForPlatform(posts, platform, n = 3) {
  const own = posts.filter((p) => platformOfPost(p) === platform);
  if (own.length) return own.slice(0, n);
  return posts.filter((p) => p.category === 'Strategy').slice(0, n);
}

/** Related articles: same category first, then the rest, newest first. */
export function relatedPosts(posts, post, n = 3) {
  const others = posts.filter((p) => p.slug !== post.slug);
  return [...others.filter((p) => p.category === post.category), ...others.filter((p) => p.category !== post.category)].slice(0, n);
}
