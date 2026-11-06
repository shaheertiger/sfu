'use client';

import { useEffect, useState } from 'react';
import s from '@/components/marketing/best-time.module.css';
import { WEEKDAY_NAMES, formatHour } from '@/lib/best-time';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Weekday, hour and minute right now in a zone (the viewer's own zone when tz is null). */
function nowIn(tz) {
  const parts = new Intl.DateTimeFormat('en-US', { ...(tz ? { timeZone: tz } : {}), weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const g = (t) => parts.find((x) => x.type === t)?.value;
  return { weekday: DAYS.indexOf(g('weekday')), hour: Number(g('hour')) % 24, minute: Number(g('minute')) };
}

/**
 * "Is now a good time to post?" for the page's grid, in the page's country time. Rendered on the
 * client because the page itself is cached for a day; the server sends a neutral placeholder.
 */
export default function BestTimeNow({ scores, tz = null, place = null, platform }) {
  const [now, setNow] = useState(null);
  useEffect(() => {
    const tick = () => setNow(nowIn(tz));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [tz]);

  const where = place ? ` in ${place}` : '';
  if (!now || now.weekday < 0) {
    return <div className={s.now}><strong>Is now a good time to post{where}?</strong> <span>Checking the local time…</span></div>;
  }
  const score = scores[now.weekday][now.hour];
  const verdict = score >= 75 ? 'one of the best times to post' : score >= 45 ? 'a decent time to post' : 'a quiet time to post';
  let next = null;
  for (let i = 1; i <= 168; i++) {
    const t = now.weekday * 24 + now.hour + i;
    const d = Math.floor(t / 24) % 7;
    const h = t % 24;
    if (scores[d][h] >= 80) { next = { d, h, inHours: i }; break; }
  }
  const time = `${formatHour(now.hour).replace(' ', `:${String(now.minute).padStart(2, '0')} `)}`;
  return (
    <div className={s.now} aria-live="polite">
      <strong>Is now a good time to post{where}?</strong>{' '}
      <span>
        It's {WEEKDAY_NAMES[now.weekday]} {time}{place ? ` in ${place}` : ' where you are'}. This hour scores <b>{score}/100</b> for {platform}: {verdict}.
        {score < 75 && next ? ` The next strong slot is ${WEEKDAY_NAMES[next.d]} at ${formatHour(next.h)}, in ${next.inHours} hour${next.inHours === 1 ? '' : 's'}.` : ''}
      </span>
    </div>
  );
}
