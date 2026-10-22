import { z } from 'zod';
import { createSession, createUser, setSessionCookie } from '@/lib/server/auth';
import { body, errorResponse, json } from '@/lib/server/api';
import { one } from '@/lib/server/db';

const Input = z.object({ email: z.string().email().max(200), password: z.string().min(8).max(200), name: z.string().max(80).optional() });

export async function POST(req: Request) {
  try {
    const parsed = Input.safeParse(await body(req));
    if (!parsed.success) return json({ error: 'Enter a valid email and a password of at least 8 characters' }, 400);
    const { email, password, name } = parsed.data;
    if (await one('SELECT 1 FROM users WHERE email=$1', [email.toLowerCase()])) return json({ error: 'That email already has an account. Sign in instead.' }, 409);
    const u = await createUser(email, password, name);
    await setSessionCookie(await createSession(u.id, u.workspaceId));
    return json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
