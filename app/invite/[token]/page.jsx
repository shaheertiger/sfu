import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/server/auth';
import { exec, now, one } from '@/lib/server/db';
import styles from '@/components/auth/auth.module.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Join workspace', robots: { index: false, follow: false } };

export default async function Invite({ params }) {
  const { token } = await params;
  const inv = await one('SELECT i.*, w.name AS ws_name FROM invites i JOIN workspaces w ON w.id=i.workspace_id WHERE i.token=$1', [token]);
  const user = await currentUser();
  if (inv && user && !inv.accepted_at) {
    await exec('INSERT INTO workspace_members (workspace_id,user_id,role) VALUES ($1,$2,$3) ON CONFLICT (workspace_id,user_id) DO NOTHING', [inv.workspace_id, user.id, inv.role]);
    await exec('UPDATE invites SET accepted_at=$1 WHERE id=$2', [now(), inv.id]);
    redirect('/app');
  }
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1>{!inv ? 'Invite not found' : inv.accepted_at ? 'Invite already used' : `Join ${inv.ws_name}`}</h1>
        {inv && !inv.accepted_at ? (
          <>
            <p className={styles.sub}>Sign up or sign in as <b>{inv.email}</b> to join.</p>
            <a href={`/signup?next=/invite/${token}`} style={{ textAlign: 'center', padding: 13, borderRadius: 12, background: '#dcff2e', color: '#15171a', fontWeight: 600, textDecoration: 'none' }}>Create account</a>
            <p className={styles.switch}>Have an account? <a href={`/login?next=/invite/${token}`}>Sign in</a></p>
          </>
        ) : (
          <p className={styles.sub}>Ask the workspace owner for a new link.</p>
        )}
      </div>
    </main>
  );
}
