import { loadShare } from '@/lib/server/shares';
import ShareActions from '@/components/share/ShareActions';
import styles from '@/components/share/share.module.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Post preview · Schedule For You', robots: { index: false, follow: false } };

function when(at, tz) {
  try {
    return new Date(at).toLocaleString('en-US', { timeZone: tz, dateStyle: 'full', timeStyle: 'short' });
  } catch {
    return new Date(at).toUTCString();
  }
}

export default async function SharedPost({ params }) {
  const { token } = await params;
  const data = await loadShare(token);
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
            <h1 className={styles.title}>This link has expired</h1>
            <p className={styles.kicker}>Ask the person who shared it for a new link.</p>
          </div>
        </div>
      </main>
    );
  }
  const { post, targets, media, comments } = data;
  const status =
    post.status === 'published' ? ['Published', styles.pillGood]
    : post.approval === 'approved' ? ['Approved', styles.pillGood]
    : post.approval === 'pending' ? ['Waiting for approval', styles.pillWarn]
    : post.status === 'scheduled' ? ['Scheduled', '']
    : ['Draft', ''];
  const variants = targets.filter((t) => t.caption && t.caption !== post.caption);
  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        {brand}
        <div className={styles.card}>
          <p className={styles.kicker}>{data.workspaceName} shared a post for your review</p>
          <h1 className={styles.title}>{post.scheduled_at ? `Goes out ${when(post.scheduled_at, data.tz)}` : 'Not scheduled yet'}</h1>
          <div className={styles.targets}>
            <span className={`${styles.pill} ${status[1]}`}>{status[0]}</span>
            {targets.map((t, i) => (
              <span key={i} className={styles.pill}>{t.label}{t.username ? ` · @${t.username}` : ''}</span>
            ))}
          </div>
        </div>
        <div className={styles.card}>
          {media.length > 0 && (
            <div className={styles.media}>
              {media.map((m, i) => (m.mime?.startsWith('video/') ? <video key={i} src={m.url} controls preload="metadata" /> : <img key={i} src={m.url} alt={m.filename || ''} />))}
            </div>
          )}
          <p className={styles.caption}>{post.caption || '(no caption)'}</p>
          {variants.map((t, i) => (
            <div key={i} className={styles.variant}>
              <strong>{t.label}{t.username ? ` · @${t.username}` : ''} version</strong>
              <p className={styles.caption}>{t.caption}</p>
            </div>
          ))}
        </div>
        <div className={styles.card}>
          <strong>Feedback</strong>
          {comments.length === 0 && <p className={styles.kicker}>No comments yet.</p>}
          {comments.map((c, i) => (
            <div key={i} className={styles.comment}>
              <span>
                {c.author}{c.source === 'team' ? ' (team)' : ''} · {c.kind === 'approved' ? 'approved' : c.kind === 'changes' ? 'asked for changes' : 'commented'} · {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <p>{c.body}</p>
            </div>
          ))}
          <ShareActions token={token} canDecide={post.status !== 'published'} />
        </div>
        <p className={styles.foot}>Shared with <a href="/">Schedule For You</a>. Anyone with this link can see this post.</p>
      </div>
    </main>
  );
}
