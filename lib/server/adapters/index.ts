import type { PlatformId } from '../platforms';
import type { PlatformAdapter } from './types';
import { bluesky } from './bluesky';
import { x, linkedin, facebook, instagram, threads, tiktok, youtube, google_business, pinterest } from './oauth';

export const ADAPTERS: Record<PlatformId, PlatformAdapter> = {
  bluesky, x, linkedin, facebook, instagram, threads, tiktok, youtube, google_business, pinterest,
};

export function adapterFor(platform: string): PlatformAdapter {
  const a = ADAPTERS[platform as PlatformId];
  if (!a) throw new Error(`Unknown platform ${platform}`);
  return a;
}
