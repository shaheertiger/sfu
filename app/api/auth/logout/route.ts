import { assertSameOrigin, errorResponse, json } from '@/lib/server/api';
import { neonAuth } from '@/lib/server/neon-auth';

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    await neonAuth().signOut();
    return json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
