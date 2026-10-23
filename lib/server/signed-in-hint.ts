import 'server-only';
import { cookies } from 'next/headers';
import { SIGNED_IN_HINT, SIGNED_IN_HINT_MAX_AGE } from '../signed-in-hint.js';

/** Route handlers only (cookies can't be set while rendering a page). */
export async function setSignedInHint(on: boolean) {
  const jar = await cookies();
  if (on) jar.set(SIGNED_IN_HINT, '1', { path: '/', maxAge: SIGNED_IN_HINT_MAX_AGE, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', httpOnly: false });
  else jar.set(SIGNED_IN_HINT, '', { path: '/', maxAge: 0 });
}
