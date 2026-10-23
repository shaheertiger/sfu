/**
 * OAuth-based adapters. Each one needs the developer-app credentials from .env.local.
 * Endpoints follow each platform's current public API docs; treat the publish paths as
 * "wired but unverified until you plug in real keys" and check the README per platform.
 */
import type { PlatformAdapter, PublishInput, PublishResult, ConnectedAccountFields, SocialAccount } from './types';
import { PublishError, UPLOAD_TIMEOUT_MS, errorFromResponse, jsonFetch, sleep, timeLeft, timedFetch } from './types';
import { facebookMixProblem, metaFormat, metaFormatProblem, nonJpegImages } from '../meta-format';

const env = (k: string) => process.env[k] || '';
const q = (o: Record<string, string>) => new URLSearchParams(o).toString();

function splitTitle(caption: string, fallback = 'Untitled') {
  const [first, ...rest] = caption.split('\n');
  return { title: (first || fallback).slice(0, 100), body: rest.join('\n').trim() };
}

/* ───────────────────────── X / Twitter ───────────────────────── */
export const x: PlatformAdapter = {
  platform: 'x',
  getAuthUrl({ state, redirectUri, codeChallenge }) {
    return 'https://x.com/i/oauth2/authorize?' + q({
      response_type: 'code', client_id: env('X_CLIENT_ID'), redirect_uri: redirectUri,
      scope: 'tweet.read tweet.write users.read offline.access media.write', state,
      code_challenge: codeChallenge!, code_challenge_method: 'S256',
    });
  },
  async exchangeCode({ code, redirectUri, codeVerifier }) {
    const basic = Buffer.from(`${env('X_CLIENT_ID')}:${env('X_CLIENT_SECRET')}`).toString('base64');
    const tok = await jsonFetch('https://api.x.com/2/oauth2/token', {
      method: 'POST', headers: { authorization: `Basic ${basic}` },
      form: { grant_type: 'authorization_code', code, redirect_uri: redirectUri, code_verifier: codeVerifier!, client_id: env('X_CLIENT_ID') },
    });
    const me = await jsonFetch('https://api.x.com/2/users/me?user.fields=profile_image_url', { headers: { authorization: `Bearer ${tok.access_token}` } });
    return [{
      external_id: me.data.id, username: me.data.username, display_name: me.data.name, avatar_url: me.data.profile_image_url,
      access_token: tok.access_token, refresh_token: tok.refresh_token, token_expires_at: Date.now() + tok.expires_in * 1000,
    }];
  },
  async refresh(account) {
    const basic = Buffer.from(`${env('X_CLIENT_ID')}:${env('X_CLIENT_SECRET')}`).toString('base64');
    const tok = await jsonFetch('https://api.x.com/2/oauth2/token', {
      method: 'POST', headers: { authorization: `Basic ${basic}` },
      form: { grant_type: 'refresh_token', refresh_token: account.refresh_token!, client_id: env('X_CLIENT_ID') },
    });
    return { access_token: tok.access_token, refresh_token: tok.refresh_token, token_expires_at: Date.now() + tok.expires_in * 1000 };
  },
  async publish({ account, caption, media, sending }) {
    const auth = { authorization: `Bearer ${account.access_token}` };
    const mediaIds: string[] = [];
    for (const m of media.slice(0, 4)) {
      const bytes = (await m.bytes());
      const category = m.mime.startsWith('video/') ? 'tweet_video' : m.mime === 'image/gif' ? 'tweet_gif' : 'tweet_image';
      const fd = new FormData();
      fd.append('media', new Blob([new Uint8Array(bytes)], { type: m.mime }), m.filename);
      fd.append('media_category', category);
      const up = await jsonFetch('https://api.x.com/2/media/upload', { method: 'POST', headers: auth, body: fd });
      mediaIds.push(up.data?.id || up.media_id_string);
    }
    const body: any = { text: caption };
    if (mediaIds.length) body.media = { media_ids: mediaIds };
    await sending?.();
    const res = await jsonFetch('https://api.x.com/2/tweets', { method: 'POST', headers: { ...auth, 'content-type': 'application/json' }, body: JSON.stringify(body) });
    return { externalId: res.data.id, url: `https://x.com/${account.username}/status/${res.data.id}` };
  },
};

/* ───────────────────────── LinkedIn ───────────────────────── */
export const linkedin: PlatformAdapter = {
  platform: 'linkedin',
  getAuthUrl({ state, redirectUri }) {
    return 'https://www.linkedin.com/oauth/v2/authorization?' + q({
      response_type: 'code', client_id: env('LINKEDIN_CLIENT_ID'), redirect_uri: redirectUri, state,
      scope: 'openid profile w_member_social',
    });
  },
  async exchangeCode({ code, redirectUri }) {
    const tok = await jsonFetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST', form: { grant_type: 'authorization_code', code, redirect_uri: redirectUri, client_id: env('LINKEDIN_CLIENT_ID'), client_secret: env('LINKEDIN_CLIENT_SECRET') },
    });
    const me = await jsonFetch('https://api.linkedin.com/v2/userinfo', { headers: { authorization: `Bearer ${tok.access_token}` } });
    return [{
      external_id: me.sub, username: me.name, display_name: me.name, avatar_url: me.picture,
      access_token: tok.access_token, token_expires_at: Date.now() + tok.expires_in * 1000,
    }];
  },
  async publish({ account, caption, media, sending }) {
    const auth = { authorization: `Bearer ${account.access_token}`, 'content-type': 'application/json', 'LinkedIn-Version': '202501', 'X-Restli-Protocol-Version': '2.0.0' };
    const author = `urn:li:person:${account.external_id}`;
    let content: any = undefined;
    const images = media.filter((m) => m.mime.startsWith('image/'));
    if (images.length) {
      const urns: string[] = [];
      for (const img of images.slice(0, 9)) {
        const init = await jsonFetch('https://api.linkedin.com/rest/images?action=initializeUpload', {
          method: 'POST', headers: auth, body: JSON.stringify({ initializeUploadRequest: { owner: author } }),
        });
        const put = await timedFetch(init.value.uploadUrl, { method: 'PUT', headers: { authorization: `Bearer ${account.access_token}` }, body: new Uint8Array(await img.bytes()), timeoutMs: UPLOAD_TIMEOUT_MS });
        if (!put.ok) throw await errorFromResponse(init.value.uploadUrl, put);
        urns.push(init.value.image);
      }
      content = urns.length === 1 ? { media: { id: urns[0] } } : { multiImage: { images: urns.map((id) => ({ id })) } };
    }
    await sending?.();
    const postsUrl = 'https://api.linkedin.com/rest/posts';
    const res = await timedFetch(postsUrl, {
      method: 'POST', headers: auth,
      body: JSON.stringify({ author, commentary: caption, visibility: 'PUBLIC', distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] }, lifecycleState: 'PUBLISHED', isReshareDisabledByAuthor: false, ...(content ? { content } : {}) }),
    });
    if (!res.ok) throw await errorFromResponse(postsUrl, res);
    const id = res.headers.get('x-restli-id') || '';
    return { externalId: id, url: `https://www.linkedin.com/feed/update/${id}` };
  },
};

/* ───────────────────────── Facebook Pages ───────────────────────── */
const GRAPH = 'https://graph.facebook.com/v21.0';

/**
 * Meta login dialog. Apps set up with "Facebook Login for Business" can require a configuration
 * (FACEBOOK_CONFIG_ID, from Facebook Login for Business → Configurations) instead of a scope list;
 * when it is set it replaces the scope, so the permissions come from that configuration.
 */
function metaAuthUrl({ state, redirectUri }: { state: string; redirectUri: string }, scope: string) {
  const config = process.env.FACEBOOK_CONFIG_ID;
  return 'https://www.facebook.com/v21.0/dialog/oauth?' + q({
    client_id: env('FACEBOOK_APP_ID'), redirect_uri: redirectUri, state,
    ...(config ? { config_id: config } : { scope }),
  });
}

/** Meta's Page list is paged (25 per page by default); this follows `paging.next` so every Page is found. */
export async function metaPages(fields: string, userToken: string, maxPages = 20): Promise<any[]> {
  const out: any[] = [];
  let url: string | null = `${GRAPH}/me/accounts?` + q({ fields, limit: '100', access_token: userToken });
  for (let i = 0; url && i < maxPages; i++) {
    const page: any = await jsonFetch(url);
    out.push(...(page?.data || []));
    url = page?.paging?.next && page.data?.length ? page.paging.next : null;
  }
  return out;
}

/** A long-lived user token from a Meta login code. Only used during the connection; it is not stored. */
async function metaUserToken(code: string, redirectUri: string) {
  const tok = await jsonFetch(`${GRAPH}/oauth/access_token?` + q({ client_id: env('FACEBOOK_APP_ID'), client_secret: env('FACEBOOK_APP_SECRET'), redirect_uri: redirectUri, code }));
  const longLived = await jsonFetch(`${GRAPH}/oauth/access_token?` + q({ grant_type: 'fb_exchange_token', client_id: env('FACEBOOK_APP_ID'), client_secret: env('FACEBOOK_APP_SECRET'), fb_exchange_token: tok.access_token }));
  return longLived.access_token as string;
}

export const facebook: PlatformAdapter = {
  platform: 'facebook',
  getAuthUrl: (a) => metaAuthUrl(a, 'pages_show_list,pages_manage_posts,pages_read_engagement,business_management'),
  async exchangeCode({ code, redirectUri }) {
    const userToken = await metaUserToken(code, redirectUri);
    // Page tokens obtained from a long-lived user token don't expire, so nothing else is kept.
    const pages = await metaPages('id,name,access_token,picture.type(large)', userToken);
    return pages.filter((p: any) => p.access_token).map((p: any) => ({
      external_id: p.id, username: p.name, display_name: p.name, avatar_url: p.picture?.data?.url,
      access_token: p.access_token, meta: { token_kind: 'page' },
    }));
  },
  async publish({ account, caption, media, options, sending }) {
    const token = account.access_token!;
    const pageId = account.external_id;
    const images = media.filter((m) => m.mime.startsWith('image/'));
    const video = media.find((m) => m.mime.startsWith('video/'));
    const format = metaFormat(options);
    const problem = metaFormatProblem(format, media) ?? (format === 'post' ? facebookMixProblem(media) : null);
    if (problem) throw new PublishError(problem, false);
    if (format === 'reel') {
      const start = await jsonFetch(`${GRAPH}/${pageId}/video_reels`, { method: 'POST', form: { upload_phase: 'start', access_token: token } });
      await fbHostedUpload(start.video_id, token, video!.url);
      await sending?.();
      await jsonFetch(`${GRAPH}/${pageId}/video_reels`, {
        method: 'POST', form: { upload_phase: 'finish', video_id: start.video_id, video_state: 'PUBLISHED', description: caption, access_token: token },
      });
      return { externalId: start.video_id, url: `https://www.facebook.com/reel/${start.video_id}` };
    }
    if (format === 'story') {
      // Stories have no caption on Facebook.
      if (video) {
        const start = await jsonFetch(`${GRAPH}/${pageId}/video_stories`, { method: 'POST', form: { upload_phase: 'start', access_token: token } });
        await fbHostedUpload(start.video_id, token, video.url);
        await sending?.();
        const done = await jsonFetch(`${GRAPH}/${pageId}/video_stories`, { method: 'POST', form: { upload_phase: 'finish', video_id: start.video_id, access_token: token } });
        return { externalId: done.post_id || start.video_id, url: `https://www.facebook.com/${done.post_id || start.video_id}` };
      }
      const photo = await jsonFetch(`${GRAPH}/${pageId}/photos`, { method: 'POST', form: { url: images[0].url, published: 'false', access_token: token } });
      await sending?.();
      const done = await jsonFetch(`${GRAPH}/${pageId}/photo_stories`, { method: 'POST', form: { photo_id: photo.id, access_token: token } });
      return { externalId: done.post_id || photo.id, url: `https://www.facebook.com/${done.post_id || photo.id}` };
    }
    if (video) {
      // Facebook fetches the file from its URL, so the video is never loaded into this function's memory.
      await sending?.();
      const res = await jsonFetch(`https://graph-video.facebook.com/v21.0/${pageId}/videos`, {
        method: 'POST', form: { file_url: video.url, description: caption, access_token: token }, timeoutMs: UPLOAD_TIMEOUT_MS,
      });
      return { externalId: res.id, url: `https://www.facebook.com/${res.id}` };
    }
    if (images.length) {
      const ids: string[] = [];
      for (const img of images.slice(0, 10)) {
        const fd = new FormData();
        fd.append('published', 'false');
        fd.append('access_token', token);
        fd.append('source', new Blob([new Uint8Array(await img.bytes())], { type: img.mime }), img.filename);
        const r = await jsonFetch(`${GRAPH}/${pageId}/photos`, { method: 'POST', body: fd });
        ids.push(r.id);
      }
      await sending?.();
      const res = await jsonFetch(`${GRAPH}/${pageId}/feed`, {
        method: 'POST', form: { message: caption, access_token: token, attached_media: JSON.stringify(ids.map((id) => ({ media_fbid: id }))) },
      });
      return { externalId: res.id, url: `https://www.facebook.com/${res.id}` };
    }
    await sending?.();
    const res = await jsonFetch(`${GRAPH}/${pageId}/feed`, { method: 'POST', form: { message: caption, access_token: token } });
    return { externalId: res.id, url: `https://www.facebook.com/${res.id}` };
  },
};

/** Facebook's resumable upload: hands it the file's URL, so the bytes never pass through us. */
async function fbHostedUpload(videoId: string, token: string, fileUrl: string) {
  const url = `https://rupload.facebook.com/video-upload/v21.0/${videoId}`;
  const res = await timedFetch(url, { method: 'POST', headers: { authorization: `OAuth ${token}`, file_url: fileUrl }, timeoutMs: UPLOAD_TIMEOUT_MS });
  if (!res.ok) throw await errorFromResponse(url, res);
}

/**
 * A current profile picture URL for a Facebook Page or Instagram account. Meta's picture URLs are
 * signed and stop working after a few days, so the stored one is refreshed with this.
 */
export async function freshMetaAvatar(account: { platform: string; external_id: string | null; access_token: string | null }): Promise<string | null> {
  if (!account.external_id || !account.access_token) return null;
  const token = encodeURIComponent(account.access_token);
  const id = encodeURIComponent(account.external_id);
  if (account.platform === 'facebook') {
    const r = await jsonFetch(`${GRAPH}/${id}/picture?redirect=0&type=large&access_token=${token}`, { timeoutMs: 4000 });
    return r?.data?.url || null;
  }
  if (account.platform === 'instagram') {
    const r = await jsonFetch(`${GRAPH}/${id}?fields=profile_picture_url&access_token=${token}`, { timeoutMs: 4000 });
    return r?.profile_picture_url || null;
  }
  return null;
}

/* ───────────────────────── Instagram (via Facebook login) ───────────────────────── */
export const instagram: PlatformAdapter = {
  platform: 'instagram',
  getAuthUrl: (a) => metaAuthUrl(a, 'pages_show_list,pages_read_engagement,instagram_basic,instagram_content_publish,business_management'),
  async exchangeCode({ code, redirectUri }) {
    const userToken = await metaUserToken(code, redirectUri);
    const pages = await metaPages('id,name,access_token,instagram_business_account{id,username,name,profile_picture_url}', userToken);
    // Publishing uses the linked Page's token: unlike the user token (about 60 days) it doesn't expire.
    return pages.filter((p: any) => p.instagram_business_account && p.access_token).map((p: any) => {
      const ig = p.instagram_business_account;
      return { external_id: ig.id, username: ig.username, display_name: ig.name || ig.username, avatar_url: ig.profile_picture_url, access_token: p.access_token, meta: { page_id: p.id, token_kind: 'page' } };
    });
  },
  /**
   * Accounts connected before Page tokens were used hold a user token that expires after about 60
   * days. This swaps it for the linked Page's token, which doesn't.
   */
  async refresh(account) {
    const pageId = account.meta?.page_id;
    if (!pageId) throw new PublishError('Reconnect this Instagram account.', false, { auth: true });
    const page = await jsonFetch(`${GRAPH}/${encodeURIComponent(pageId)}?` + q({ fields: 'access_token', access_token: account.access_token! }));
    if (!page?.access_token) throw new PublishError('Reconnect this Instagram account: its Facebook Page token is not available.', false, { auth: true });
    return { access_token: page.access_token, token_expires_at: undefined, meta: { ...account.meta, token_kind: 'page' } };
  },
  async publish({ account, caption, media, options, progress, save, sending }) {
    const token = account.access_token!;
    const igId = account.external_id;
    if (!media.length) throw new PublishError('Instagram requires an image or video', false);
    const format = metaFormat(options);
    const problem = metaFormatProblem(format, media);
    if (problem) throw new PublishError(problem, false);
    const notJpeg = nonJpegImages(media);
    if (notJpeg.length) throw new PublishError(`Instagram only accepts JPEG images. Convert ${notJpeg.map((m) => m.filename).join(', ')} to JPEG.`, false);
    const mk = async (params: Record<string, string>) =>
      (await jsonFetch(`${GRAPH}/${igId}/media`, { method: 'POST', form: { ...params, access_token: token } })).id as string;

    // Containers made by an earlier attempt are reused (they last 24 hours), so a retry after a slow
    // video never uploads the media again.
    const saved = progress?.ig && Date.now() - Number(progress.ig.at || 0) < IG_CONTAINER_TTL_MS ? progress.ig : null;
    const keep = async (ig: Record<string, any> | null) => { await save?.({ ig }); };
    let creationId: string | undefined = saved?.container;
    if (!creationId) {
      let at = Date.now();
      const video = media.find((m) => m.mime.startsWith('video/'));
      if (format === 'story') {
        // Stories have no caption on Instagram.
        creationId = video
          ? await mk({ media_type: 'STORIES', video_url: video.url })
          : await mk({ media_type: 'STORIES', image_url: media[0].url });
      } else if (format === 'reel') {
        creationId = await mk({ media_type: 'REELS', video_url: video!.url, caption, share_to_feed: 'true' });
      } else if (media.length === 1) {
        creationId = video
          ? await mk({ media_type: 'REELS', video_url: video.url, caption })
          : await mk({ image_url: media[0].url, caption });
      } else {
        const items = media.slice(0, 10);
        let children: string[] | undefined = saved?.children;
        if (children) at = Number(saved.at);
        else {
          children = [];
          for (const m of items) {
            children.push(await mk(m.mime.startsWith('video/') ? { media_type: 'VIDEO', video_url: m.url, is_carousel_item: 'true' } : { image_url: m.url, is_carousel_item: 'true' }));
          }
          await keep({ children, at });
        }
        // Video items must be FINISHED before the carousel container is made. Images are ready at once.
        const videoItems = children.filter((_, i) => items[i]?.mime.startsWith('video/'));
        if (videoItems.length && (await igWait(videoItems, token, IG_WAIT_MS, keep)).length) throw igStillProcessing();
        creationId = await mk({ media_type: 'CAROUSEL', children: children.join(','), caption });
      }
      await keep({ container: creationId, at });
    }
    const waiting = await igWait([creationId], token, IG_WAIT_MS, keep);
    if (waiting.length) throw igStillProcessing();
    await sending?.();
    const pub = await jsonFetch(`${GRAPH}/${igId}/media_publish`, { method: 'POST', form: { creation_id: creationId, access_token: token } });
    // Stories may not return a permalink; the post is still published.
    const info = await jsonFetch(`${GRAPH}/${pub.id}?fields=permalink&access_token=${encodeURIComponent(token)}`).catch(() => ({} as any));
    return { externalId: pub.id, url: info.permalink || (format === 'story' ? `https://www.instagram.com/stories/${account.username}/` : undefined) };
  },
};

/** Instagram media containers expire after 24 hours; older saved ones are made again. */
const IG_CONTAINER_TTL_MS = 23 * 3600_000;
/** How long one attempt waits for Instagram to process media before handing over to a later attempt. */
export const IG_WAIT_MS = 20_000;
const IG_POLL_MS = 3_000;

const igStillProcessing = () =>
  new PublishError('Instagram is still processing the media. Publishing continues in a couple of minutes.', true, { processing: true });

/**
 * Waits up to `ms` (and never past the run's deadline) for Instagram containers to finish
 * processing. Returns the ids still processing. A container that failed throws.
 */
async function igWait(ids: string[], token: string, ms: number, keep: (ig: Record<string, any> | null) => Promise<void>): Promise<string[]> {
  const until = Date.now() + Math.max(0, Math.min(ms, timeLeft() - 15_000));
  let pending = ids;
  for (;;) {
    const still: string[] = [];
    for (const id of pending) {
      const st = await jsonFetch(`${GRAPH}/${id}?fields=status_code,status&access_token=${encodeURIComponent(token)}`);
      if (st.status_code === 'FINISHED' || st.status_code === 'PUBLISHED') continue;
      if (st.status_code === 'ERROR') {
        console.error('[instagram] container failed:', id, st.status);
        await keep(null);
        throw new PublishError('Instagram could not process the media. Check the file’s format, size and length.', false);
      }
      if (st.status_code === 'EXPIRED') {
        await keep(null);
        throw new PublishError('Instagram’s upload expired before it was published. It will be uploaded again.', true);
      }
      still.push(id);
    }
    pending = still;
    if (!pending.length || Date.now() + IG_POLL_MS > until) return pending;
    await sleep(IG_POLL_MS);
  }
}

/* ───────────────────────── Threads ───────────────────────── */
const THREADS = 'https://graph.threads.net/v1.0';
export const threads: PlatformAdapter = {
  platform: 'threads',
  getAuthUrl({ state, redirectUri }) {
    return 'https://threads.net/oauth/authorize?' + q({
      client_id: env('THREADS_APP_ID'), redirect_uri: redirectUri, state, response_type: 'code',
      scope: 'threads_basic,threads_content_publish',
    });
  },
  async exchangeCode({ code, redirectUri }) {
    const tok = await jsonFetch(`${THREADS}/oauth/access_token`, { method: 'POST', form: { client_id: env('THREADS_APP_ID'), client_secret: env('THREADS_APP_SECRET'), grant_type: 'authorization_code', redirect_uri: redirectUri, code } });
    const ll = await jsonFetch(`${THREADS}/access_token?` + q({ grant_type: 'th_exchange_token', client_secret: env('THREADS_APP_SECRET'), access_token: tok.access_token }));
    const me = await jsonFetch(`${THREADS}/me?fields=id,username,name,threads_profile_picture_url&access_token=${ll.access_token}`);
    return [{ external_id: me.id, username: me.username, display_name: me.name || me.username, avatar_url: me.threads_profile_picture_url, access_token: ll.access_token, token_expires_at: Date.now() + ll.expires_in * 1000 }];
  },
  /**
   * Threads long-lived tokens last 60 days and have no refresh token: the token itself is exchanged
   * for a new one (th_refresh_token), which works once it is a day old and until it expires.
   */
  async refresh(account) {
    const r = await jsonFetch('https://graph.threads.net/refresh_access_token?' + q({ grant_type: 'th_refresh_token', access_token: account.access_token! }));
    return { access_token: r.access_token, token_expires_at: Date.now() + Number(r.expires_in || 60 * 86400) * 1000 };
  },
  async publish({ account, caption, media, sending }) {
    const token = account.access_token!;
    const uid = account.external_id;
    const mk = async (params: Record<string, string>) =>
      (await jsonFetch(`${THREADS}/${uid}/threads`, { method: 'POST', form: { ...params, access_token: token } })).id as string;
    let creationId: string;
    if (!media.length) creationId = await mk({ media_type: 'TEXT', text: caption });
    else if (media.length === 1) {
      const m = media[0];
      creationId = m.mime.startsWith('video/') ? await mk({ media_type: 'VIDEO', video_url: m.url, text: caption }) : await mk({ media_type: 'IMAGE', image_url: m.url, text: caption });
    } else {
      const children: string[] = [];
      for (const m of media.slice(0, 10)) children.push(await mk(m.mime.startsWith('video/') ? { media_type: 'VIDEO', video_url: m.url, is_carousel_item: 'true' } : { media_type: 'IMAGE', image_url: m.url, is_carousel_item: 'true' }));
      creationId = await mk({ media_type: 'CAROUSEL', children: children.join(','), text: caption });
    }
    await sleep(media.length ? 15000 : 2000);
    await sending?.();
    const pub = await jsonFetch(`${THREADS}/${uid}/threads_publish`, { method: 'POST', form: { creation_id: creationId, access_token: token } });
    // Published either way; a missing link must not turn it into a failure that would be sent again.
    const info = await jsonFetch(`${THREADS}/${pub.id}?fields=permalink&access_token=${encodeURIComponent(token)}`).catch(() => ({} as any));
    return { externalId: pub.id, url: info.permalink || `https://www.threads.net/@${account.username}` };
  },
};

/* ───────────────────────── TikTok ───────────────────────── */
export const tiktok: PlatformAdapter = {
  platform: 'tiktok',
  getAuthUrl({ state, redirectUri, codeChallenge }) {
    return 'https://www.tiktok.com/v2/auth/authorize/?' + q({
      client_key: env('TIKTOK_CLIENT_KEY'), response_type: 'code', scope: 'user.info.basic,video.publish,video.upload', redirect_uri: redirectUri, state,
      code_challenge: codeChallenge!, code_challenge_method: 'S256',
    });
  },
  async exchangeCode({ code, redirectUri, codeVerifier }) {
    const tok = await jsonFetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST', form: { client_key: env('TIKTOK_CLIENT_KEY'), client_secret: env('TIKTOK_CLIENT_SECRET'), code, grant_type: 'authorization_code', redirect_uri: redirectUri, code_verifier: codeVerifier! },
    });
    const me = await jsonFetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url,username', { headers: { authorization: `Bearer ${tok.access_token}` } });
    const u = me.data.user;
    return [{ external_id: tok.open_id, username: u.username || u.display_name, display_name: u.display_name, avatar_url: u.avatar_url, access_token: tok.access_token, refresh_token: tok.refresh_token, token_expires_at: Date.now() + tok.expires_in * 1000 }];
  },
  async refresh(account) {
    const tok = await jsonFetch('https://open.tiktokapis.com/v2/oauth/token/', { method: 'POST', form: { client_key: env('TIKTOK_CLIENT_KEY'), client_secret: env('TIKTOK_CLIENT_SECRET'), grant_type: 'refresh_token', refresh_token: account.refresh_token! } });
    return { access_token: tok.access_token, refresh_token: tok.refresh_token, token_expires_at: Date.now() + tok.expires_in * 1000 };
  },
  async publish({ account, caption, media, options, sending }) {
    const auth = { authorization: `Bearer ${account.access_token}`, 'content-type': 'application/json; charset=UTF-8' };
    const video = media.find((m) => m.mime.startsWith('video/'));
    const privacy = options.privacy || 'SELF_ONLY';
    if (video) {
      const size = video.size;
      const init = await jsonFetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
        method: 'POST', headers: auth,
        body: JSON.stringify({ post_info: { title: caption.slice(0, 2200), privacy_level: privacy }, source_info: { source: 'FILE_UPLOAD', video_size: size, chunk_size: size, total_chunk_count: 1 } }),
      });
      const bytes = new Uint8Array(await video.bytes());
      // TikTok posts the video once the upload completes.
      await sending?.();
      const up = await timedFetch(init.data.upload_url, { method: 'PUT', headers: { 'content-type': video.mime, 'content-range': `bytes 0-${size - 1}/${size}` }, body: bytes, timeoutMs: UPLOAD_TIMEOUT_MS });
      if (!up.ok) throw await errorFromResponse(init.data.upload_url, up);
      return { externalId: init.data.publish_id };
    }
    const images = media.filter((m) => m.mime.startsWith('image/'));
    if (!images.length) throw new PublishError('TikTok requires a video or images', false);
    await sending?.();
    const init = await jsonFetch('https://open.tiktokapis.com/v2/post/publish/content/init/', {
      method: 'POST', headers: auth,
      body: JSON.stringify({ post_info: { title: caption.slice(0, 90), description: caption, privacy_level: privacy }, source_info: { source: 'PULL_FROM_URL', photo_cover_index: 0, photo_images: images.map((i) => i.url) }, post_mode: 'DIRECT_POST', media_type: 'PHOTO' }),
    });
    return { externalId: init.data.publish_id };
  },
};

/* ───────────────────────── Google (YouTube + Business Profile) ───────────────────────── */
function googleAuthUrl(scope: string, { state, redirectUri }: { state: string; redirectUri: string }) {
  return 'https://accounts.google.com/o/oauth2/v2/auth?' + q({ client_id: env('GOOGLE_CLIENT_ID'), redirect_uri: redirectUri, response_type: 'code', scope, state, access_type: 'offline', prompt: 'consent' });
}
async function googleToken(form: Record<string, string>) {
  return jsonFetch('https://oauth2.googleapis.com/token', { method: 'POST', form: { client_id: env('GOOGLE_CLIENT_ID'), client_secret: env('GOOGLE_CLIENT_SECRET'), ...form } });
}
async function googleRefresh(account: SocialAccount) {
  const tok = await googleToken({ grant_type: 'refresh_token', refresh_token: account.refresh_token! });
  return { access_token: tok.access_token, token_expires_at: Date.now() + tok.expires_in * 1000 };
}

export const youtube: PlatformAdapter = {
  platform: 'youtube',
  getAuthUrl: (a) => googleAuthUrl('https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly', a),
  async exchangeCode({ code, redirectUri }) {
    const tok = await googleToken({ grant_type: 'authorization_code', code, redirect_uri: redirectUri });
    const ch = await jsonFetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', { headers: { authorization: `Bearer ${tok.access_token}` } });
    return (ch.items || []).map((c: any) => ({
      external_id: c.id, username: c.snippet.customUrl || c.snippet.title, display_name: c.snippet.title, avatar_url: c.snippet.thumbnails?.default?.url,
      access_token: tok.access_token, refresh_token: tok.refresh_token, token_expires_at: Date.now() + tok.expires_in * 1000,
    }));
  },
  refresh: googleRefresh,
  async publish({ account, caption, media, options, sending }) {
    const video = media.find((m) => m.mime.startsWith('video/'));
    if (!video) throw new PublishError('YouTube requires a video', false);
    const { title, body } = splitTitle(caption, 'Untitled video');
    const meta = { snippet: { title: options.title || title, description: options.title ? caption : body }, status: { privacyStatus: options.privacy || 'public', selfDeclaredMadeForKids: false } };
    const initUrl = 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status';
    const init = await timedFetch(initUrl, {
      method: 'POST', headers: { authorization: `Bearer ${account.access_token}`, 'content-type': 'application/json', 'x-upload-content-type': video.mime }, body: JSON.stringify(meta),
    });
    if (!init.ok) throw await errorFromResponse(initUrl, init);
    const loc = init.headers.get('location');
    if (!loc) throw new PublishError('YouTube did not return an upload URL', true);
    const bytes = new Uint8Array(await video.bytes());
    await sending?.();
    const up = await jsonFetch(loc, { method: 'PUT', headers: { 'content-type': video.mime }, body: bytes, timeoutMs: UPLOAD_TIMEOUT_MS });
    return { externalId: up.id, url: `https://www.youtube.com/watch?v=${up.id}` };
  },
};

export const google_business: PlatformAdapter = {
  platform: 'google_business',
  getAuthUrl: (a) => googleAuthUrl('https://www.googleapis.com/auth/business.manage', a),
  async exchangeCode({ code, redirectUri }) {
    const tok = await googleToken({ grant_type: 'authorization_code', code, redirect_uri: redirectUri });
    const h = { authorization: `Bearer ${tok.access_token}` };
    const accounts = await jsonFetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', { headers: h });
    const out: ConnectedAccountFields[] = [];
    for (const acc of accounts.accounts || []) {
      const locs = await jsonFetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${acc.name}/locations?readMask=name,title`, { headers: h });
      for (const loc of locs.locations || []) {
        out.push({ external_id: `${acc.name}/${loc.name}`, username: loc.title, display_name: loc.title, access_token: tok.access_token, refresh_token: tok.refresh_token, token_expires_at: Date.now() + tok.expires_in * 1000, meta: { account: acc.name, location: loc.name } });
      }
    }
    return out;
  },
  refresh: googleRefresh,
  async publish({ account, caption, media, options, sending }) {
    const image = media.find((m) => m.mime.startsWith('image/'));
    const body: any = { languageCode: 'en', summary: caption.slice(0, 1500), topicType: 'STANDARD' };
    if (image) body.media = [{ mediaFormat: 'PHOTO', sourceUrl: image.url }];
    if (options.cta_url) body.callToAction = { actionType: 'LEARN_MORE', url: options.cta_url };
    await sending?.();
    const res = await jsonFetch(`https://mybusiness.googleapis.com/v4/${account.external_id}/localPosts`, {
      method: 'POST', headers: { authorization: `Bearer ${account.access_token}`, 'content-type': 'application/json' }, body: JSON.stringify(body),
    });
    return { externalId: res.name, url: res.searchUrl };
  },
};

/* ───────────────────────── Pinterest ───────────────────────── */
export const pinterest: PlatformAdapter = {
  platform: 'pinterest',
  getAuthUrl({ state, redirectUri }) {
    return 'https://www.pinterest.com/oauth/?' + q({ client_id: env('PINTEREST_APP_ID'), redirect_uri: redirectUri, response_type: 'code', scope: 'boards:read,pins:read,pins:write,user_accounts:read', state });
  },
  async exchangeCode({ code, redirectUri }) {
    const basic = Buffer.from(`${env('PINTEREST_APP_ID')}:${env('PINTEREST_APP_SECRET')}`).toString('base64');
    const tok = await jsonFetch('https://api.pinterest.com/v5/oauth/token', { method: 'POST', headers: { authorization: `Basic ${basic}` }, form: { grant_type: 'authorization_code', code, redirect_uri: redirectUri } });
    const me = await jsonFetch('https://api.pinterest.com/v5/user_account', { headers: { authorization: `Bearer ${tok.access_token}` } });
    const boards = await jsonFetch('https://api.pinterest.com/v5/boards', { headers: { authorization: `Bearer ${tok.access_token}` } });
    return [{ external_id: me.id || me.username, username: me.username, display_name: me.business_name || me.username, avatar_url: me.profile_image, access_token: tok.access_token, refresh_token: tok.refresh_token, token_expires_at: Date.now() + tok.expires_in * 1000, meta: { boards: (boards.items || []).map((b: any) => ({ id: b.id, name: b.name })) } }];
  },
  async refresh(account) {
    const basic = Buffer.from(`${env('PINTEREST_APP_ID')}:${env('PINTEREST_APP_SECRET')}`).toString('base64');
    const tok = await jsonFetch('https://api.pinterest.com/v5/oauth/token', { method: 'POST', headers: { authorization: `Basic ${basic}` }, form: { grant_type: 'refresh_token', refresh_token: account.refresh_token! } });
    return { access_token: tok.access_token, token_expires_at: Date.now() + tok.expires_in * 1000 };
  },
  async publish({ account, caption, media, options, sending }) {
    const image = media.find((m) => m.mime.startsWith('image/'));
    if (!image) throw new PublishError('Pinterest requires an image', false);
    const boardId = options.board_id || account.meta.boards?.[0]?.id;
    if (!boardId) throw new PublishError('Pinterest needs a board_id', false);
    const { title } = splitTitle(caption, 'Pin');
    const body = JSON.stringify({ board_id: boardId, title: options.title || title, description: caption.slice(0, 500), link: options.link || undefined, media_source: { source_type: 'image_base64', content_type: image.mime, data: (await image.bytes()).toString('base64') } });
    await sending?.();
    const res = await jsonFetch('https://api.pinterest.com/v5/pins', {
      method: 'POST', headers: { authorization: `Bearer ${account.access_token}`, 'content-type': 'application/json' }, body,
    });
    return { externalId: res.id, url: `https://www.pinterest.com/pin/${res.id}/` };
  },
};
