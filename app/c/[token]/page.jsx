import { loadCalendar, calendarUrls } from '@/lib/server/calendar';
import styles from '@/components/share/share.module.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Shared calendar', robots: { index: false, follow: false } };

const dayKey = (at, tz) => new Date(at).toLocaleDateString('en-CA', { timeZone: tz });
const dayTitle = (at, tz) => new Date(at).toLocaleDateString('en-US', { timeZone: tz, weekday: 'long', month: 'long', day: 'numeric' });
const timeOf = (at, tz) => new Date(at).toLocaleTimeString('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' });

function pill(p) {
  if (p.status === 'published') return ['Published', styles.pillGood];
  if (p.status === 'partial') return ['Partly published', styles.pillWarn];
  if (p.status === 'failed') return ['Failed', styles.pillWarn];
  if (p.approval === 'pending') return ['Waiting for approval', styles.pillWarn];
  return ['Scheduled', ''];
}

/** Read-only view of the workspace's schedule for anyone with the link. */
export default async function SharedCalendar({ params }) {
  const { token } = await params;
  const data = await loadCalendar(token).catch(() => null);
  const brand = (
    <a href="/" className={styles.brand}>
      <img src="/logos/schedule-for-you-glyph.svg" alt="" width="26" height="26" />
      <span>schedule for you</span>
    </a>
  );
  if (!data) {
    return (
      <main className={styles.page}>
        <div className={styles.wrap}>
          {brand}
          <div className={styles.card}>
            <h1 className={styles.title}>This calendar link was turned off</h1>
            <p className={styles.kicker}>Ask the person who shared it for a new link.</p>
          </div>
        </div>
      </main>
    );
  }
  const { workspace, posts } = data;
  const now = Date.now();
  const upcoming = posts.filter((p) => p.at >= now - 60_000 && p.status !== 'published' && p.status !== 'partial' && p.status !== 'failed');
  const recent = posts.filter((p) => !upcoming.includes(p)).sort((a, b) => b.at - a.at);
  const groups = [];
  for (const p of upcoming) {
    const k = dayKey(p.at, workspace.tz);
    const g = groups[groups.length - 1];
    if (g && g.key === k) g.posts.push(p);
    else groups.push({ key: k, title: dayTitle(p.at, workspace.tz), posts: [p] });
  }
  const { ics_url } = calendarUrls(token);
  const Post = ({ p }) => {
    const [label, cls] = pill(p);
    return (
      <div className={styles.comment}>
        <span>
          {timeOf(p.at, workspace.tz)} · {p.platforms.join(', ') || 'No accounts'}
          {p.labels.length ? ` · ${p.labels.join(', ')}` : ''}
        </span>
        <div className={styles.targets}>
          <span className={`${styles.pill} ${cls}`}>{label}</span>
          {p.targets.filter((t) => t.url).map((t, i) => (
            <a key={i} className={styles.pill} href={t.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
              {t.label}{t.username ? ` · @${t.username}` : ''} ↗
            </a>
          ))}
        </div>
        {p.media.length > 0 && (
          <div className={styles.media} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))' }}>
            {p.media.slice(0, 6).map((m, i) => (m.mime?.startsWith('video/') ? <video key={i} src={m.url} preload="metadata" muted /> : <img key={i} src={m.url} alt="" loading="lazy" />))}
          </div>
        )}
        <p>{p.caption || '(no caption)'}</p>
      </div>
    );
  };
  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        {brand}
        <div className={styles.card}>
          <p className={styles.kicker}>{workspace.name} · content calendar</p>
          <h1 className={styles.title}>{upcoming.length ? `${upcoming.length} post${upcoming.length === 1 ? '' : 's'} coming up` : 'Nothing scheduled right now'}</h1>
          <p className={styles.kicker}>
            Times are in {workspace.tz.replace(/_/g, ' ')}. Add it to your calendar app: <a href={ics_url} style={{ color: '#dcff2e' }}>subscribe (iCal)</a>, or in Google Calendar choose “From URL” and paste the link.
          </p>
        </div>
        {groups.map((g) => (
          <div key={g.key} className={styles.card}>
            <strong>{g.title}</strong>
            {g.posts.map((p) => <Post key={p.id} p={p} />)}
          </div>
        ))}
        {recent.length > 0 && (
          <div className={styles.card}>
            <strong>Recently published</strong>
            {recent.slice(0, 20).map((p) => <Post key={p.id} p={p} />)}
          </div>
        )}
        <p className={styles.foot}>Shared with <a href="/">Schedule For You</a>. Anyone with this link can see this calendar.</p>
      </div>
    </main>
  );
}
