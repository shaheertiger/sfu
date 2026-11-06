import Link from 'next/link';
import m from '@/components/marketing/marketing.module.css';
import s from '@/components/marketing/best-time.module.css';
import { WEEKDAY_NAMES, formatHour } from '@/lib/best-time';
import { abbrLabel, convertSlot, convertedLabel, currentAbbr, formatClock, formatHour24, formatOffset, nearbyCountries, offsetMinutes, referenceZones } from '@/lib/best-time-countries';
import { zoneSentence } from '@/lib/best-time-pages';

/**
 * Sections shared by the platform-in-a-country pages and the social-media-in-a-country pages.
 * These carry what is different about each country: its time zone, its cities and its daily rhythm.
 */

const Table = ({ head, rows }) => (
  <div className="table-wrap">
    <table>
      <thead><tr>{head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
    </table>
  </div>
);
export { Table };

const cap = (t) => t.replace(/^./, (ch) => ch.toUpperCase());

/** Time zone, the same slot across the country's zones, and the slots converted for people abroad. */
export function TimezoneSection({ local, best, at }) {
  const offset = formatOffset(offsetMinutes(local.tz, at));
  const abbr = currentAbbr(local, at);
  const refs = referenceZones(local.tz, 5, at);
  const top = best.slice(0, 3);
  return (
    <section className={m.section}>
      <h2 id="time-zone">What Time Zone Should You Use for {local.name}? ({abbrLabel(local)}, {offset})</h2>
      <p>{zoneSentence(local, at)} Every time on this page is {local.adj} local time, so 8 PM means 8 PM on a phone in {local.cities[0]}.</p>
      {local.zones.length > 1 && (
        <>
          <h3>The #1 Slot Across All {local.zones.length} {local.adj} Time Zones</h3>
          <p>The best slot ({WEEKDAY_NAMES[best[0].weekday]} at {formatHour(best[0].hour)} {abbr}) reaches each zone at a different local hour. If most of your followers live outside the main zone, schedule for theirs instead.</p>
          <Table
            head={['Zone', 'UTC offset now', `When ${formatHour(best[0].hour)} ${abbr} lands`]}
            rows={local.zones.map(([label, tz]) => [label, formatOffset(offsetMinutes(tz, at)), convertedLabel(convertSlot(best[0], local.tz, tz, at), best[0])])}
          />
        </>
      )}
      <h3>Scheduling From Another Country? The Top Slots in Your Time</h3>
      <p>Managing a {local.adj} audience from abroad is common for agencies and creators. Here are the top three {local.adj} slots converted to other time zones (today's offsets, daylight saving included):</p>
      <Table
        head={[`${local.short} (${abbr})`, ...refs.map(([label]) => label)]}
        rows={top.map((b) => [`${WEEKDAY_NAMES[b.weekday].slice(0, 3)} ${formatHour(b.hour)} (${formatHour24(b.hour)})`, ...refs.map(([, tz]) => convertedLabel(convertSlot(b, local.tz, tz, at), b))])}
      />
    </section>
  );
}

/** Cities, daily rhythm, local tips and the quietest hours. */
export function PlaceSection({ local, subject, quiet }) {
  const what = local.citiesLabel === 'areas' ? 'Areas' : 'Cities';
  return (
    <>
      <section className={m.section}>
        <h2 id="cities">Which {what} in {local.name} Do These Times Cover?</h2>
        <p>
          {local.zones.length > 1
            ? <>These times are for {local.zones[0][0]}. The same local hours work in the other zones too, since people keep the same routines on their own clocks: {local.cities.join(', ')}.</>
            : <>One clock covers the whole country, so these times work the same in {local.cities.slice(0, -1).join(', ')} and {local.cities[local.cities.length - 1]}.</>}
        </p>
      </section>
      <section className={m.section}>
        <h2 id="local-rhythm">How Daily Life in {local.name} Shapes {subject} Activity</h2>
        <p>{local.rhythm}</p>
        <h3>{local.tips.length} Local Factors That Shift Your Best Time</h3>
        <ul>{local.tips.map((t) => <li key={t}>{t}</li>)}</ul>
        {quiet?.length > 0 && (
          <>
            <h3>When Not to Post in {local.name}</h3>
            <p>The weakest waking hours in the data are {quiet.map((q) => `${WEEKDAY_NAMES[q.weekday]} at ${formatClock(q.hour)} (${q.score}/100)`).join(', ')}. A post that goes out then waits longer for its first reactions, and early reactions are what most feeds use to decide whether to show it to more people.</p>
          </>
        )}
      </section>
    </>
  );
}

/** Same page type in nearby countries. `href(c)` builds each link, `label(c)` its text. */
export function NearbySection({ local, heading, intro, href, label, at }) {
  const near = nearbyCountries(local.slug, 4, at);
  return (
    <section className={m.section}>
      <h2 id="nearby">{heading}</h2>
      <p>{intro}</p>
      <ul>{near.map((c) => <li key={c.slug}><Link href={href(c)}>{label(c)}</Link> ({formatOffset(offsetMinutes(c.tz, at))})</li>)}</ul>
    </section>
  );
}

/** A one-line answer in the brand colour, the first thing under the H1. */
export const AnswerBanner = ({ children }) => <p className={s.banner}>{children}</p>;

export { cap };
