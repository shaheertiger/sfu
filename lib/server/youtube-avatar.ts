import 'server-only';

/**
 * Finds a YouTube channel's profile picture (and banner, when it has one) from a channel link,
 * an @handle, a channel ID or a video link, by reading the public channel page the same way a
 * browser would. Used by the free YouTube PFP downloader (/tools/youtube-pfp-downloader).
 */

export type ChannelImages = { title: string; channelUrl: string; avatar: string; banner: string | null };

/** Image hosts YouTube serves channel art from. Anything else is refused. */
export const YT_IMAGE_HOSTS = ['yt3.googleusercontent.com', 'yt3.ggpht.com'];

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  // Skips the EU cookie-consent interstitial, which would otherwise replace the page.
  Cookie: 'SOCS=CAI; CONSENT=YES+',
};

const HANDLE = /^@?([\p{L}\p{N}._·-]{3,30})$/u;
const CHANNEL_ID = /^UC[\w-]{22}$/;

/** Turns what someone pasted into a YouTube URL to fetch, or null when it isn't recognisable. */
export function toFetchUrl(input: string): { url: string; isVideo: boolean } | null {
  const raw = String(input || '').trim();
  if (!raw) return null;
  if (CHANNEL_ID.test(raw)) return { url: `https://www.youtube.com/channel/${raw}`, isVideo: false };
  if (!/[/.]/.test(raw) && HANDLE.test(raw)) return { url: `https://www.youtube.com/@${raw.replace(/^@/, '')}`, isVideo: false };
  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^(www|m|music)\./, '');
  if (host === 'youtu.be') {
    const id = u.pathname.slice(1).split('/')[0];
    return /^[\w-]{11}$/.test(id) ? { url: `https://www.youtube.com/watch?v=${id}`, isVideo: true } : null;
  }
  if (host !== 'youtube.com') return null;
  const v = u.searchParams.get('v');
  if (u.pathname === '/watch' && v && /^[\w-]{11}$/.test(v)) return { url: `https://www.youtube.com/watch?v=${v}`, isVideo: true };
  const shorts = /^\/(shorts|live|embed)\/([\w-]{11})/.exec(u.pathname);
  if (shorts) return { url: `https://www.youtube.com/watch?v=${shorts[2]}`, isVideo: true };
  const ch = /^\/(@[^/]+|channel\/UC[\w-]{22}|c\/[^/]+|user\/[^/]+)/.exec(u.pathname);
  if (ch) return { url: `https://www.youtube.com/${decodeURIComponent(ch[1])}`, isVideo: false };
  return null;
}

/** Drops YouTube's size suffix ("=s900-c-k-…") so any size can be requested. */
export function baseImage(url: string) {
  // Banner URLs carry two '=' ("=w1060-fcrop64=1,…"), so strip from the first '=' after the last '/'.
  return url.replace(/=[^/]*$/, '');
}

export function isYouTubeImage(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && YT_IMAGE_HOSTS.includes(u.hostname);
  } catch {
    return false;
  }
}

async function fetchPage(url: string) {
  const res = await fetch(url, { headers: HEADERS, redirect: 'follow', signal: AbortSignal.timeout(8000), cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`YouTube answered ${res.status}`);
  return res.text();
}

const decode = (s: string) => s.replace(/&amp;/g, '&').replace(/&#39;/g, '\'').replace(/&quot;/g, '"').replace(/\\u0026/g, '&');

export async function findChannelImages(input: string): Promise<ChannelImages | null> {
  const target = toFetchUrl(input);
  if (!target) return null;
  let pageUrl = target.url;
  if (target.isVideo) {
    // YouTube's public oEmbed endpoint names the uploader's channel without loading the watch page.
    const res = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(pageUrl)}`, { headers: HEADERS, signal: AbortSignal.timeout(8000), cache: 'no-store' });
    if (res.status === 400 || res.status === 401 || res.status === 403 || res.status === 404) return null;
    if (!res.ok) throw new Error(`YouTube answered ${res.status}`);
    const author = String((await res.json())?.author_url || '');
    const channel = toFetchUrl(author);
    if (!channel || channel.isVideo) return null;
    pageUrl = channel.url;
  }
  const html = await fetchPage(pageUrl);
  if (!html) return null;
  const og = /<meta property="og:image" content="([^"]+)"/.exec(html)?.[1];
  if (!og || !isYouTubeImage(decode(og))) return null;
  const title = decode(/<meta property="og:title" content="([^"]*)"/.exec(html)?.[1] || 'YouTube channel');
  const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1] || pageUrl;
  const bannerRaw = /"banner":\{"imageBannerViewModel":\{"image":\{"sources":\[\{"url":"([^"]+)"/.exec(html)?.[1];
  const banner = bannerRaw && isYouTubeImage(decode(bannerRaw)) ? baseImage(decode(bannerRaw)) : null;
  return { title, channelUrl: decode(canonical), avatar: baseImage(decode(og)), banner };
}
