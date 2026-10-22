import 'server-only';
import { NextResponse } from 'next/server';
import { HttpError, requireWorkspace, type User, type Workspace } from './auth';

export const json = (data: any, status = 200) => NextResponse.json(data, { status });

type Ctx = { req: Request; workspace: Workspace; user: User | null; params: any };

/** Wraps a route: resolves the workspace (session or API key) and turns errors into JSON. */
export function handler(fn: (ctx: Ctx) => Promise<any>, opts: { sessionOnly?: boolean } = {}) {
  return async (req: Request, routeCtx: { params: Promise<any> }) => {
    try {
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

export function errorResponse(e: any) {
  if (e instanceof HttpError) return json({ error: e.message }, e.status);
  if (e?.name === 'ZodError') return json({ error: 'Invalid request', issues: e.issues }, 400);
  console.error('[api]', e);
  return json({ error: e?.message || 'Request failed' }, 500);
}

export async function body<T = any>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new HttpError(400, 'Expected a JSON body');
  }
}
