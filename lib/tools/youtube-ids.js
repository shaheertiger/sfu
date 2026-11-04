/**
 * Pulls IDs out of YouTube links in the browser (no network): video IDs from watch, youtu.be,
 * Shorts, live and embed links, plus channel IDs, @handles and playlist IDs when present.
 */
const VIDEO_ID = /^[\w-]{11}$/;

export function parseYouTubeLink(raw) {
  const text = String(raw || '').trim();
  if (!text) return null;
  if (VIDEO_ID.test(text)) return { videoId: text, kind: 'id' };
  let u;
  try {
    u = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^(www|m|music)\./, '');
  const out = { videoId: null, channelId: null, handle: null, playlistId: u.searchParams.get('list') || null, start: null, kind: null };
  const t = u.searchParams.get('t') || u.searchParams.get('start');
  if (t) out.start = t;
  if (host === 'youtu.be') {
    const id = u.pathname.slice(1).split('/')[0];
    if (VIDEO_ID.test(id)) { out.videoId = id; out.kind = 'short link'; }
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const v = u.searchParams.get('v');
    const path = /^\/(shorts|live|embed|v)\/([\w-]{11})/.exec(u.pathname);
    const channel = /^\/channel\/(UC[\w-]{22})/.exec(u.pathname);
    const handle = /^\/(@[^/?#]+)/.exec(u.pathname);
    if (v && VIDEO_ID.test(v)) { out.videoId = v; out.kind = 'watch link'; }
    else if (path) { out.videoId = path[2]; out.kind = `${path[1]} link`; }
    if (channel) { out.channelId = channel[1]; out.kind = out.kind || 'channel link'; }
    if (handle) { out.handle = decodeURIComponent(handle[1]); out.kind = out.kind || 'channel link'; }
    if (!out.kind && out.playlistId) out.kind = 'playlist link';
  } else {
    return null;
  }
  return out.kind ? out : null;
}

/** Thumbnail URLs YouTube serves for every public video. maxres only exists for HD uploads. */
export function thumbnails(videoId) {
  const b = `https://i.ytimg.com/vi/${videoId}`;
  return [
    { label: 'Max resolution (1280×720, HD videos only)', url: `${b}/maxresdefault.jpg` },
    { label: 'High (480×360)', url: `${b}/hqdefault.jpg` },
    { label: 'Medium (320×180)', url: `${b}/mqdefault.jpg` },
  ];
}
