'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './auth.module.css';
import { resetErrorMessage } from '@/lib/auth-errors';

/*
 * Both steps call Neon Auth's own endpoints through our /api/auth proxy, the same way Neon's
 * ForgotPasswordForm / ResetPasswordForm components do. Neon sends the email; its link returns to
 * /reset-password?token=… (or ?error=INVALID_TOKEN). Links expire after 15 minutes.
 */

function Shell({ children }) {
  return (
    <main className={styles.page}>
      <a href="/" className={styles.brand}>
        <img src="/logos/schedule-for-you-glyph.svg" alt="" width="30" height="30" />
        <span>schedule for you</span>
      </a>
      {children}
    </main>
  );
}

async function post(path, payload) {
  const res = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(resetErrorMessage(data));
  return data;
}

const SENT = 'If an account uses that email, a reset link is on its way. It works for 15 minutes; check your spam folder too.';

/** Step 1: ask for the email and send the reset link. */
export function ForgotPasswordForm() {
  const params = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const email = String(new FormData(e.currentTarget).get('email') || '').trim().toLowerCase();
      await post('/api/auth/request-password-reset', { email, redirectTo: `${window.location.origin}/reset-password` });
      setSent(SENT);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  return (
    <Shell>
      <form className={styles.card} onSubmit={submit}>
        <h1>Reset your password</h1>
        <p className={styles.sub}>Enter the email you sign in with and we’ll send you a link to choose a new password.</p>
        {sent ? (
          <p className={styles.notice} role="status">{sent}</p>
        ) : (
          <>
            <label>
              <span>Email</span>
              <input name="email" type="email" required autoComplete="email" placeholder="you@company.com" defaultValue={params.get('email') || ''} />
            </label>
            {error && <p className={styles.error} role="alert">{error}</p>}
            <button type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button>
          </>
        )}
        <p className={styles.switch}><a href="/login">Back to sign in</a></p>
      </form>
    </Shell>
  );
}

/** Step 2: the link from the email lands here with ?token=…; choose a new password. */
export function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const linkError = params.get('error');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    const f = new FormData(e.currentTarget);
    const password = String(f.get('password') || '');
    if (password !== f.get('confirm')) {
      setError('The two passwords don’t match.');
      return;
    }
    setBusy(true);
    try {
      await post('/api/auth/reset-password', { token, newPassword: password });
      setDone(true);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  if (linkError || !token) {
    return (
      <Shell>
        <div className={styles.card}>
          <h1>Link expired</h1>
          <p className={styles.sub}>This reset link has expired or was already used. Request a new one; it only takes a moment.</p>
          <a className={styles.button} href="/forgot-password">Send a new link</a>
          <p className={styles.switch}><a href="/login">Back to sign in</a></p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <form className={styles.card} onSubmit={submit}>
        <h1>{done ? 'Password updated' : 'Choose a new password'}</h1>
        {done ? (
          <>
            <p className={styles.sub}>You can now sign in with your new password.</p>
            <a className={styles.button} href="/login">Sign in</a>
          </>
        ) : (
          <>
            <p className={styles.sub}>Use at least 8 characters.</p>
            <label>
              <span>New password</span>
              <input name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" />
            </label>
            <label>
              <span>Confirm new password</span>
              <input name="confirm" type="password" required minLength={8} autoComplete="new-password" />
            </label>
            {error && <p className={styles.error} role="alert">{error}</p>}
            <button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save new password'}</button>
          </>
        )}
      </form>
    </Shell>
  );
}
