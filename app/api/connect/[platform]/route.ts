import { NextResponse } from 'next/server';
import { requireWorkspace } from '@/lib/server/auth';
import { exec, now } from '@/lib/server/db';
import { randomToken } from '@/lib/server/crypto';
import { adapterFor } from '@/lib/server/adapters';
import { pkceChallenge } from '@/lib/server/adapters/types';
import { PLATFORMS, platformConfigured } from '@/lib/server/platforms';
import { appUrl } from '@/lib/server/url';

/** Starts an OAuth connection: redirects to the platform's consent screen. */
export async function GET(req: Request, { params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const base = appUrl(req);
  const back = (msg: string) => NextResponse.redirect(`${base}/app?screen=accounts&error=${encodeURIComponent(msg)}`);
  const meta = PLATFORMS[platform as keyof typeof PLATFORMS];
  if (!meta || meta.authMode !== 'oauth') return back('Unknown platform');
  if (!platformConfigured(meta)) return back(`${meta.label} isn't available yet.`);
  let workspace;
  try { ({ workspace } = await requireWorkspace()); } catch { return NextResponse.redirect(`${base}/login?next=/app`); }
  if (!['owner', 'editor'].includes(workspace.role)) return back('Only the workspace owner or an editor can connect accounts.');
  const state = randomToken(16);
  const verifier = randomToken(32);
  await exec('DELETE FROM oauth_states WHERE created_at < $1', [now() - 60 * 60_000]);
  await exec('INSERT INTO oauth_states (state,workspace_id,platform,code_verifier,created_at) VALUES ($1,$2,$3,$4,$5)', [state, workspace.id, platform, verifier, now()]);
  const url = adapterFor(platform).getAuthUrl!({ state, redirectUri: `${base}/api/connect/${platform}/callback`, codeChallenge: pkceChallenge(verifier) });
  return NextResponse.redirect(url);
}
