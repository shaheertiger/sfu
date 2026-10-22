import { z } from 'zod';
import { body, errorResponse, json } from '@/lib/server/api';
import { actOnShare } from '@/lib/server/shares';

// Simple abuse guard per link: at most 20 actions per 10 minutes.
const WINDOW = 10 * 60_000, MAX = 20;
const hits = new Map<string, number[]>();

/** Public: comment on, approve or request changes to a shared post. No account needed. */
export async function POST(req: Request, ctx: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await ctx.params;
    const recent = (hits.get(token) || []).filter((t) => t > Date.now() - WINDOW);
    if (recent.length >= MAX) return json({ error: 'Too many requests. Try again in a few minutes.' }, 429);
    hits.set(token, [...recent, Date.now()]);
    const b = z.object({
      action: z.enum(['comment', 'approve', 'changes']),
      name: z.string().trim().min(1, 'Add your name').max(80),
      body: z.string().max(2000).default(''),
    }).parse(await body(req));
    const r = await actOnShare(token, b.action, b.name, b.body);
    return 'error' in r ? json({ error: r.error }, r.status) : json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
