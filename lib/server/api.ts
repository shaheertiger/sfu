import 'server-only';
import { NextResponse } from 'next/server';
import { HttpError, requireWorkspace, type User, type Workspace } from './auth';
import { assertSameOrigin } from './origin';

export { assertSameOrigin };

export const json = (data: any, status = 200) => NextResponse.json(data, { status });

type Ctx = { req: Request; workspace: Workspace; user: User | null; params: any };

/** Wraps a route: resolves the workspace (session or API key) and turns errors into JSON. */
export function handler(fn: (ctx: Ctx) => Promise<any>, opts: { sessionOnly?: boolean } = {}) {
  return async (req: Request, routeCtx: { params: Promise<any> }) => {
    try {
      if (!req.headers.get('authorization')?.startsWith('Bearer ')) assertSameOrigin(req);
      const { workspace, user } = await requireWorkspace(req);
      if (opts.sessionOnly && !user) throw new HttpError(403, 'This action is only available from the dashboard');
      const params = (await routeCtx?.params) ?? {};
      const result = await fn({ req, workspace, user, params });
      return result instanceof Response ? result : json(result);
    } catch (e: any) {
      return errorResponse(e);
    }
  };
}

/**
 * Errors → JSON. HttpError messages are written for the person making the request; anything
 * else (database, network, programming errors) is logged and answered with a generic message so
 * internals never leak into responses.
 */
export function errorResponse(e: any) {
  if (e instanceof HttpError) return json({ error: e.message }, e.status);
  if (e?.name === 'ZodError') return json({ error: firstIssue(e) || 'Invalid request', issues: e.issues }, 400);
  if (e?.name === 'AbortError' || e?.name === 'TimeoutError') return json({ error: 'That took too long. Try again.' }, 504);
  console.error('[api]', e);
  return json({ error: 'Something went wrong on our side. Try again in a moment.' }, 500);
}

function firstIssue(e: any): string | null {
  const i = e?.issues?.[0];
  if (!i) return null;
  const path = Array.isArray(i.path) && i.path.length ? `${i.path.join('.')}: ` : '';
  return `${path}${i.message}`;
}

/** Parses a JSON body. Non-JSON and non-object bodies answer 400 rather than crashing the route. */
export async function body<T = any>(req: Request): Promise<T> {
  let data: unknown;
  try {
    data = await req.json();
  } catch {
    throw new HttpError(400, 'Expected a JSON body');
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) throw new HttpError(400, 'Expected a JSON object');
  return data as T;
}
