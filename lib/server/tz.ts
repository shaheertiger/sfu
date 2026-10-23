/** Timezone arithmetic on epoch milliseconds, with IANA zone names (no dependencies). */

/** A usable IANA zone name: `tz` when the runtime knows it, otherwise UTC. */
export function safeTz(tz: unknown): string {
  if (typeof tz !== 'string' || !tz) return 'UTC';
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return tz;
  } catch {
    return 'UTC';
  }
}

type Parts = { y: number; mo: number; d: number; h: number; mi: number; s: number };

/** Wall-clock date and time of an instant in a timezone (month is 0-based). */
export function localParts(tz: string, at: number): Parts {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(new Date(at));
  const g = (t: string) => Number(p.find((x) => x.type === t)!.value);
  return { y: g('year'), mo: g('month') - 1, d: g('day'), h: g('hour'), mi: g('minute'), s: g('second') };
}

/** The timezone's offset from UTC at an instant, in milliseconds (positive east of Greenwich). */
export function tzOffset(tz: string, at: number) {
  const l = localParts(tz, at);
  return Date.UTC(l.y, l.mo, l.d, l.h, l.mi, l.s) - Math.floor(at / 1000) * 1000;
}

/**
 * The instant a wall-clock time happens in a timezone. Out-of-range fields roll over the way
 * Date.UTC does (day 32 is the 1st of the next month). A time skipped by a DST jump lands an hour later.
 */
export function zonedToUtc(tz: string, y: number, mo: number, d: number, h: number, mi: number, s = 0, ms = 0) {
  const guess = Date.UTC(y, mo, d, h, mi, s, ms);
  let at = guess - tzOffset(tz, guess);
  // The offset at the result can differ from the one at the guess near a DST change; settle on it.
  const off2 = tzOffset(tz, at);
  if (guess - off2 !== at) at = guess - off2;
  return at;
}

const daysIn = (y: number, mo: number) => new Date(Date.UTC(y, mo + 1, 0)).getUTCDate();

/**
 * Occurrence `n` of a repeating series that started at `anchor` (n = 0 is the anchor itself), at the
 * anchor's wall-clock time in `tz`. Weekly keeps the weekday and local time across DST changes;
 * monthly keeps the anchor's day of the month, using the month's last day when it is shorter (an
 * anchor on the 31st goes out on Feb 28/29, then on Mar 31 again).
 */
export function occurrence(anchor: number, n: number, repeat: 'weekly' | 'monthly', tzName: string) {
  const tz = safeTz(tzName);
  const l = localParts(tz, anchor);
  const ms = anchor % 1000;
  if (repeat === 'weekly') return zonedToUtc(tz, l.y, l.mo, l.d + 7 * n, l.h, l.mi, l.s, ms);
  const total = l.mo + n;
  const y = l.y + Math.floor(total / 12);
  const mo = ((total % 12) + 12) % 12;
  return zonedToUtc(tz, y, mo, Math.min(l.d, daysIn(y, mo)), l.h, l.mi, l.s, ms);
}

/**
 * The first occurrence after `after` that comes later in the series than occurrence `n`. Occurrences
 * missed meanwhile (a paused queue, say) are skipped, not caught up.
 */
export function nextOccurrence(anchor: number, n: number, repeat: 'weekly' | 'monthly', tz: string, after: number) {
  for (let k = n + 1; k < n + 5000; k++) {
    const at = occurrence(anchor, k, repeat, tz);
    if (at > after) return { at, n: k };
  }
  return null;
}

/** Epoch ms for "the day `dayOffset` days after `from`, at HH:MM" in a timezone. */
export function zonedTime(tz: string, dayOffset: number, hhmm: string, from: number) {
  const [h, m] = hhmm.split(':').map(Number);
  const l = localParts(tz, from + dayOffset * 864e5);
  return zonedToUtc(tz, l.y, l.mo, l.d, h, m);
}
