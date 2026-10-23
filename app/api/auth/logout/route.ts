import { assertSameOrigin, errorResponse, json } from '@/lib/server/api';
import { neonAuth } from '@/lib/server/neon-auth';
import { setSignedInHint } from '@/lib/server/signed-in-hint';

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    await neonAuth().signOut();
    await setSignedInHint(false);
    return json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
