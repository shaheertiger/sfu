import { handler, json } from '@/lib/server/api';
import { getPost } from '@/lib/server/posts';
import { createShare } from '@/lib/server/shares';
import { requirePaid } from '@/lib/server/billing';

/** Creates (or reuses) a client preview link for a post. */
export const POST = handler(async ({ req, workspace, user, params }) => {
  requirePaid(workspace, 'preview');
  const post = await getPost(workspace.id, params.id);
  if (!post) return json({ error: 'Save the post first' }, 404);
  return createShare(workspace.id, post.id, user?.id ?? null, req);
});
