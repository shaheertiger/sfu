import { handler, json } from '@/lib/server/api';
import { query } from '@/lib/server/db';
import { getPost } from '@/lib/server/posts';

/** Comments and approvals left on the post's preview link. */
export const GET = handler(async ({ workspace, params }) => {
  const post = await getPost(workspace.id, params.id);
  if (!post) return json({ error: 'Not found' }, 404);
  const rows = await query('SELECT id, author, body, kind, source, created_at FROM post_comments WHERE post_id=$1 ORDER BY created_at', [post.id]);
  return { comments: rows.map((c) => ({ ...c, created_at: Number(c.created_at) })) };
});
