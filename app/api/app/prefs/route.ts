import { z } from 'zod';
import { body, handler } from '@/lib/server/api';
import { exec, one } from '@/lib/server/db';

const Prefs = z.object({
  tz: z.string().max(60),
  remind: z.object({ on: z.boolean(), lead: z.number().int().min(0).max(10080) }),
  alerts: z.object({ fail: z.boolean(), digest: z.boolean() }),
  slots: z.array(z.string().regex(/^\d{2}:\d{2}$/)).max(48),
  slotDays: z.array(z.number().int().min(0).max(6)).max(7),
  paused: z.boolean(),
  labels: z.array(z.string().max(40)).max(100),
  folders: z.array(z.string().max(60)).max(100),
  templates: z.array(z.object({ name: z.string().max(60), text: z.string().max(5000) })).max(100),
  tagGroups: z.array(z.object({ name: z.string().max(60), tags: z.string().max(2000) })).max(100),
  notes: z.record(z.string().max(40), z.string().max(500)),
  tzSet: z.boolean(),
}).partial();

/** Saves workspace settings (merged into prefs) and optionally renames the workspace. */
export const PATCH = handler(async ({ req, workspace }) => {
  const b = await body<any>(req);
  const prefs = Prefs.parse(b.prefs || {});
  if (Object.keys(prefs).length) await exec('UPDATE workspaces SET prefs = prefs || $1::jsonb WHERE id=$2', [JSON.stringify(prefs), workspace.id]);
  if (typeof b.name === 'string' && b.name.trim()) await exec('UPDATE workspaces SET name=$1 WHERE id=$2', [b.name.trim().slice(0, 80), workspace.id]);
  return { prefs: (await one('SELECT prefs FROM workspaces WHERE id=$1', [workspace.id])).prefs };
}, { sessionOnly: true });
