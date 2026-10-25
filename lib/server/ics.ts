/*
 * iCalendar (RFC 5545) feed of a workspace's posts. Pure: no database, no `server-only`, so the
 * output can be tested as text. Lines are CRLF-terminated and folded at 75 octets as the spec asks.
 */
export type IcsPost = {
  id: string;
  caption: string;
  at: number;
  status: string;
  approval?: string | null;
  platforms: string[];
  url?: string | null;
};

const pad = (n: number) => String(n).padStart(2, '0');
/** 20261102T140000Z */
export function icsDate(ms: number): string {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

/** Escapes text for an iCalendar property value. */
export const icsText = (s: string) => String(s ?? '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\;').replace(/,/g, '\\,');

/** Folds a content line at 75 octets (continuation lines start with a space). */
export function fold(line: string): string {
  const bytes = Buffer.from(line, 'utf8');
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let start = 0;
  let limit = 75;
  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length);
    // Never split a multi-byte character.
    while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
    out.push((start ? ' ' : '') + bytes.subarray(start, end).toString('utf8'));
    start = end;
    limit = 74;
  }
  return out.join('\r\n');
}

const snippet = (s: string, n = 70) => {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1) + '…' : t || '(no caption)';
};

/** The whole feed. `stamp` is the generation time (fixed in tests). */
export function buildIcs(opts: { name: string; tz: string; posts: IcsPost[]; domain: string; stamp?: number }): string {
  const stamp = icsDate(opts.stamp ?? Date.now());
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Schedule For You//Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${icsText(opts.name)} · Schedule For You`,
    `X-WR-TIMEZONE:${icsText(opts.tz)}`,
    'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
    'X-PUBLISHED-TTL:PT1H',
  ];
  for (const p of opts.posts) {
    const where = p.platforms.length ? p.platforms.join(', ') : 'No accounts';
    const state = p.status === 'published' ? 'Published' : p.status === 'partial' ? 'Partly published' : p.status === 'failed' ? 'Failed' : p.approval === 'pending' ? 'Waiting for approval' : 'Scheduled';
    lines.push(
      'BEGIN:VEVENT',
      `UID:${p.id}@${opts.domain}`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${icsDate(p.at)}`,
      `DTEND:${icsDate(p.at + 15 * 60_000)}`,
      `SUMMARY:${icsText(`${where}: ${snippet(p.caption)}`)}`,
      `DESCRIPTION:${icsText(`${state}\n\n${p.caption || '(no caption)'}`)}`,
      `STATUS:${p.approval === 'pending' ? 'TENTATIVE' : p.status === 'failed' ? 'CANCELLED' : 'CONFIRMED'}`,
      `CATEGORIES:${icsText(state)}`,
      ...(p.url ? [`URL:${p.url}`] : []),
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}
