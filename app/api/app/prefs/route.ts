import { body, handler } from '@/lib/server/api';
import { exec, one } from '@/lib/server/db';
import { cleanPrefs } from '@/lib/server/prefs';

/**
 * Saves workspace settings (merged into prefs) and optionally renames the workspace. Text and lists
 * over their limits are shortened rather than refused, and a setting that can't be read is skipped,
 * so one bad value never blocks saving the others (such as pausing the queue).
 */
export const PATCH = handler(async ({ req, workspace }) => {
  const b = await body<any>(req);
  const { prefs, skipped } = cleanPrefs(b.prefs);
  if (Object.keys(prefs).length) await exec('UPDATE workspaces SET prefs = prefs || $1::jsonb WHERE id=$2', [JSON.stringify(prefs), workspace.id]);
  if (typeof b.name === 'string' && b.name.trim()) await exec('UPDATE workspaces SET name=$1 WHERE id=$2', [b.name.trim().slice(0, 80), workspace.id]);
  const saved = (await one('SELECT prefs FROM workspaces WHERE id=$1', [workspace.id])).prefs;
  return skipped.length ? { prefs: saved, skipped } : { prefs: saved };
}, { sessionOnly: true });
