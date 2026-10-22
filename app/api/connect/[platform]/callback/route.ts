import { NextResponse } from 'next/server';
import { now, one } from '@/lib/server/db';
import { adapterFor } from '@/lib/server/adapters';
import { upsertAccount } from '@/lib/server/accounts';
import { requireWorkspace } from '@/lib/server/auth';
import { appUrl } from '@/lib/server/url';

export async function GET(req: Request, { params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const url = new URL(req.url);
  const base = appUrl(req);
  const fail = (msg: string) => NextResponse.redirect(`${base}/app?screen=accounts&error=${encodeURIComponent(msg)}`);
  if (url.searchParams.get('error')) return fail(url.searchParams.get('error_description') || url.searchParams.get('error')!);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code || !state) return fail('The platform did not return a login code. Try again.');
  const st = await one('DELETE FROM oauth_states WHERE state=$1 AND platform=$2 RETURNING *', [state, platform]);
  if (!st || st.created_at < now() - 15 * 60_000) return fail('That login took too long. Try connecting again.');
  // The person finishing the flow must be signed in and a member of the workspace that started it.
  let user;
  try {
    ({ user } = await requireWorkspace());
  } catch {
    return NextResponse.redirect(`${base}/login?next=/app`);
  }
  if (!user || !(await one('SELECT 1 FROM workspace_members WHERE user_id=$1 AND workspace_id=$2', [user.id, st.workspace_id]))) {
    return fail('You are signed in to a different account than the one that started this connection.');
  }
  try {
    const accounts = await adapterFor(platform).exchangeCode!({ code, redirectUri: `${base}/api/connect/${platform}/callback`, codeVerifier: st.code_verifier });
    if (!accounts.length) return fail(`No ${platform} accounts were found on that login. Check the account type and permissions.`);
    for (const f of accounts) await upsertAccount(st.workspace_id, platform, f);
    return NextResponse.redirect(`${base}/app?screen=accounts&connected=${platform}&n=${accounts.length}`);
  } catch (e: any) {
    return fail(e?.message || 'Connection failed');
  }
}
