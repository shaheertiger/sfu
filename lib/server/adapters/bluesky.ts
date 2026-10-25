import { AtpAgent, RichText } from '@atproto/api';
import type { PlatformAdapter, PublishInput, PublishResult, ConnectedAccountFields, SocialAccount } from './types';
import { PublishError } from './types';
import { threadParts } from '../thread';

const SERVICE = 'https://bsky.social';

async function agentFor(account: SocialAccount) {
  const agent = new AtpAgent({ service: account.meta.service || SERVICE });
  // Bluesky app-password sessions are short-lived; re-login with stored app password is the simplest durable approach.
  await agent.login({ identifier: account.meta.identifier, password: account.access_token! });
  return agent;
}

export const bluesky: PlatformAdapter = {
  platform: 'bluesky',

  async connectWithCredentials(creds): Promise<ConnectedAccountFields> {
    const identifier = (creds.identifier || '').trim().replace(/^@/, '');
    const password = creds.password || '';
    if (!identifier || !password) throw new PublishError('Handle and app password are required', false);
    const agent = new AtpAgent({ service: SERVICE });
    try {
      await agent.login({ identifier, password });
    } catch (e: any) {
      throw new PublishError(`Bluesky login failed: ${e?.message || e}`, false);
    }
    const profile = await agent.getProfile({ actor: agent.session!.did });
    return {
      external_id: agent.session!.did,
      username: profile.data.handle,
      display_name: profile.data.displayName || profile.data.handle,
      avatar_url: profile.data.avatar,
      access_token: password, // app password, stored so we can re-authenticate
      meta: { identifier, service: SERVICE },
    };
  },

  async publish({ account, caption, media, sending, progress, save }: PublishInput): Promise<PublishResult> {
    const agent = await agentFor(account);
    const parts = threadParts(caption, 'bluesky');
    // Every part is checked before anything is posted, so a thread is never left half-published over a length rule.
    const texts: RichText[] = [];
    for (const [i, part] of parts.entries()) {
      const rt = new RichText({ text: part });
      await rt.detectFacets(agent);
      if (rt.graphemeLength > 300) throw new PublishError(parts.length > 1 ? `Bluesky posts are limited to 300 characters (part ${i + 1} of the thread is longer)` : 'Bluesky posts are limited to 300 characters', false);
      texts.push(rt);
    }

    // Parts an earlier attempt already posted (the run was cut off mid-thread) are not posted again.
    type Ref = { uri: string; cid: string };
    const saved = progress?.thread && progress.thread.root && progress.thread.parent ? progress.thread : null;
    let root: Ref | null = saved?.root || null;
    let parent: Ref | null = saved?.parent || null;
    let done: number = saved ? Number(saved.n || 0) : 0;

    let embed: any = undefined;
    if (!done) {
      const images = media.filter((m) => m.mime.startsWith('image/')).slice(0, 4);
      const video = media.find((m) => m.mime.startsWith('video/'));
      if (images.length) {
        const uploaded = [];
        for (const img of images) {
          const bytes = (await img.bytes());
          if (bytes.length > 1_000_000) throw new PublishError(`Image ${img.filename} exceeds Bluesky's 1MB limit`, false);
          const res = await agent.uploadBlob(bytes, { encoding: img.mime });
          uploaded.push({ image: res.data.blob, alt: '' });
        }
        embed = { $type: 'app.bsky.embed.images', images: uploaded };
      } else if (video) {
        const bytes = (await video.bytes());
        const res = await agent.uploadBlob(bytes, { encoding: video.mime });
        embed = { $type: 'app.bsky.embed.video', video: res.data.blob };
      }
    }

    for (let i = done; i < texts.length; i++) {
      const rt = texts[i];
      if (i === 0) await sending?.();
      const post = await agent.post({
        text: rt.text,
        facets: rt.facets,
        embed: i === 0 ? embed : undefined,
        ...(root && parent ? { reply: { root, parent } } : {}),
        createdAt: new Date().toISOString(),
        langs: ['en'],
      });
      const ref: Ref = { uri: post.uri, cid: post.cid };
      root ||= ref;
      parent = ref;
      done = i + 1;
      // The first post is live: from here a retry continues the thread instead of starting over.
      if (texts.length > 1) await save?.({ thread: { root, parent, n: done }, sending: null });
    }
    const rkey = root!.uri.split('/').pop();
    return { externalId: root!.uri, url: `https://bsky.app/profile/${account.username}/post/${rkey}` };
  },

  async comment({ account, externalId, text }) {
    const agent = await agentFor(account);
    const found = await agent.getPosts({ uris: [externalId] });
    const target = found.data.posts[0];
    if (!target) throw new PublishError('The published post could not be found on Bluesky, so the first comment was not added.', false);
    const rt = new RichText({ text });
    await rt.detectFacets(agent);
    if (rt.graphemeLength > 300) throw new PublishError('Bluesky comments are limited to 300 characters', false);
    const ref = { uri: target.uri, cid: target.cid };
    const post = await agent.post({ text: rt.text, facets: rt.facets, reply: { root: ref, parent: ref }, createdAt: new Date().toISOString(), langs: ['en'] });
    return { externalId: post.uri };
  },
};
