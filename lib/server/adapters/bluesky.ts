import { AtpAgent, RichText } from '@atproto/api';
import type { PlatformAdapter, PublishInput, PublishResult, ConnectedAccountFields, SocialAccount } from './types';
import { PublishError } from './types';

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

  async publish({ account, caption, media }: PublishInput): Promise<PublishResult> {
    const agent = await agentFor(account);
    const rt = new RichText({ text: caption });
    await rt.detectFacets(agent);
    if (rt.graphemeLength > 300) throw new PublishError('Bluesky posts are limited to 300 characters', false);

    let embed: any = undefined;
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

    const post = await agent.post({
      text: rt.text,
      facets: rt.facets,
      embed,
      createdAt: new Date().toISOString(),
      langs: ['en'],
    });
    const rkey = post.uri.split('/').pop();
    return { externalId: post.uri, url: `https://bsky.app/profile/${account.username}/post/${rkey}` };
  },
};
