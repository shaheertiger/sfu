import { errorResponse, json } from '@/lib/server/api';
import { neonAuth } from '@/lib/server/neon-auth';

export async function POST() {
  try {
    await neonAuth().signOut();
    return json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
