import { z } from 'zod';
import { safeTz } from './tz';

/** A string cut to `max` characters instead of being refused. */
const clip = (max: number) => z.string().transform((s) => s.slice(0, max));

/** A list cut to `max` items; items that can't be read are dropped instead of refusing the list. */
function list<T extends z.ZodTypeAny>(item: T, max: number) {
  return z.array(z.unknown()).transform((items) => {
    const out: z.output<T>[] = [];
    for (const x of items) {
      if (out.length >= max) break;
      const r = item.safeParse(x);
      if (r.success) out.push(r.data);
    }
    return out;
  });
}

const PREF_FIELDS = {
  tz: z.string().max(100).refine((tz) => safeTz(tz) === tz, 'Unknown timezone'),
  remind: z.object({ on: z.boolean(), lead: z.number().int().transform((n) => Math.min(Math.max(n, 0), 10080)) }),
  alerts: z.object({ fail: z.boolean(), digest: z.boolean() }),
  slots: list(z.string().regex(/^\d{2}:\d{2}$/), 48),
  slotDays: list(z.number().int().min(0).max(6), 7),
  paused: z.boolean(),
  labels: list(clip(40), 100),
  folders: list(clip(60), 100),
  templates: list(z.object({ name: clip(60), text: clip(5000) }), 100),
  tagGroups: list(z.object({ name: clip(60), tags: clip(2000) }), 100),
  notes: z.record(z.string(), z.unknown()).transform((o) => {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(o)) if (k.length <= 40 && typeof v === 'string') out[k] = v.slice(0, 500);
    return out;
  }),
  tzSet: z.boolean(),
  /** Swap links in captions and first comments for short links that count clicks (Analytics). */
  trackLinks: z.boolean(),
  /** Saved sets of accounts the composer can select in one click. */
  accountGroups: list(z.object({ id: clip(40), name: clip(40), ids: list(z.string().max(64), 200) }), 50),
} as const;

export type Prefs = { [K in keyof typeof PREF_FIELDS]?: z.output<(typeof PREF_FIELDS)[K]> };

/**
 * Workspace settings from the dashboard, cleaned: over-long text and lists are shortened, and each
 * setting is read on its own, so one that can't be read is skipped (listed in `skipped`) instead of
 * refusing all of them. Unknown keys are dropped.
 */
export function cleanPrefs(raw: unknown): { prefs: Prefs; skipped: string[] } {
  const prefs: Record<string, unknown> = {};
  const skipped: string[] = [];
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { prefs, skipped };
  for (const [key, value] of Object.entries(raw)) {
    const field = (PREF_FIELDS as Record<string, z.ZodTypeAny>)[key];
    if (!field) continue;
    const r = field.safeParse(value);
    if (r.success) prefs[key] = r.data;
    else skipped.push(key);
  }
  return { prefs: prefs as Prefs, skipped };
}
