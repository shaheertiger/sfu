import { neonAuth } from '@/lib/server/neon-auth';

// Proxies the Neon Auth client API (session refresh, password reset, OAuth callbacks, …) on our own origin.
// The app's own routes next to this one (login, signup, logout, me, workspace) take precedence.
type Ctx = { params: Promise<{ path: string[] }> };
export const GET = (req: Request, ctx: Ctx) => neonAuth().handler().GET(req, ctx);
export const POST = (req: Request, ctx: Ctx) => neonAuth().handler().POST(req, ctx);
export const PUT = (req: Request, ctx: Ctx) => neonAuth().handler().PUT(req, ctx);
export const DELETE = (req: Request, ctx: Ctx) => neonAuth().handler().DELETE(req, ctx);
export const PATCH = (req: Request, ctx: Ctx) => neonAuth().handler().PATCH(req, ctx);
