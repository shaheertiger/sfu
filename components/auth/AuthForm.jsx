'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './auth.module.css';
import { FREE_PLAN } from '@/lib/plan-limits';

export default function AuthForm({ mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  // Set once Neon Auth wants the email confirmed: the form swaps to the 6-digit code step.
  const [verifyEmail, setVerifyEmail] = useState('');
  const signup = mode === 'signup';
  const next = params.get('next') || '/app';
  const referred = signup && !!params.get('ref');

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: f.get('email'), password: f.get('password'), name: f.get('name') || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.verify && data.email) {
        setVerifyEmail(data.email);
        setNotice(data.message || `We sent a 6-digit code to ${data.email}.`);
        setBusy(false);
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      go();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  function go() {
    router.replace(next.startsWith('/') ? next : '/app');
    router.refresh();
  }

  async function confirm(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const code = String(new FormData(e.currentTarget).get('code') || '');
    try {
      const res = await fetch('/api/auth/confirm-email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: verifyEmail, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      if (data.signIn) {
        // Confirmed, but no session came back: sign in with the password as usual.
        router.replace(`/login?email=${encodeURIComponent(verifyEmail)}${next !== '/app' ? `&next=${encodeURIComponent(next)}` : ''}`);
        return;
      }
      go();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  async function resend() {
    setError('');
    setResending(true);
    try {
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: verifyEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not send a new code');
      setNotice(`New code sent to ${verifyEmail}. It works for 15 minutes.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  }

  if (verifyEmail) {
    return (
      <main className={styles.page}>
        <a href="/" className={styles.brand}>
          <img src="/logos/schedule-for-you-glyph.svg" alt="" width="30" height="30" />
          <span>schedule for you</span>
        </a>
        <form className={styles.card} onSubmit={confirm}>
          <h1>Check your email</h1>
          <p className={styles.sub} role="status">{notice}</p>
          <label>
            <span>Confirmation code</span>
            <input
              name="code"
              className={styles.code}
              required
              autoFocus
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9 ]{4,12}"
              maxLength={12}
              placeholder="123456"
            />
          </label>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <button type="submit" disabled={busy}>{busy ? 'One moment…' : 'Confirm email'}</button>
          <p className={styles.switch}>
            No email? Check spam, or{' '}
            <button type="button" className={styles.link} onClick={resend} disabled={resending}>
              {resending ? 'sending…' : 'send a new code'}
            </button>
            .
          </p>
          <p className={styles.switch}>
            Wrong address?{' '}
            <button type="button" className={styles.link} onClick={() => { setVerifyEmail(''); setNotice(''); setError(''); }}>
              Go back
            </button>
          </p>
        </form>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <a href="/" className={styles.brand}>
        <img src="/logos/schedule-for-you-glyph.svg" alt="" width="30" height="30" />
        <span>schedule for you</span>
      </a>
      <form className={styles.card} onSubmit={submit}>
        <h1>{signup ? 'Create your free account' : 'Welcome back'}</h1>
        {/* Every workspace starts on Free (no card). A card is only asked for when starting a paid trial from Billing. */}
        <p className={styles.sub}>
          {referred
            ? `Free for ${FREE_PLAN.accountLimit} accounts, no card needed. Your invite also doubles the Solo and Studio trial to 14 days whenever you upgrade.`
            : signup
              ? `Free for ${FREE_PLAN.accountLimit} accounts and up to ${FREE_PLAN.queueLimit} scheduled posts. No card needed. Upgrade anytime.`
              : 'Sign in to your workspace.'}
        </p>
        {signup && (
          <label>
            <span>Name</span>
            <input name="name" autoComplete="name" placeholder="Maya Chen" />
          </label>
        )}
        <label>
          <span>Email</span>
          <input name="email" type="email" required autoComplete="email" placeholder="you@company.com" defaultValue={params.get('email') || ''} />
        </label>
        <label>
          <span>Password</span>
          <input name="password" type="password" required minLength={signup ? 8 : undefined} autoComplete={signup ? 'new-password' : 'current-password'} placeholder={signup ? 'At least 8 characters' : ''} />
        </label>
        {!signup && (
          <p className={styles.forgot}>
            <a href="/forgot-password">Forgot password?</a>
          </p>
        )}
        {error && <p className={styles.error} role="alert">{error}</p>}
        {notice && <p className={styles.sub} role="status">{notice}</p>}
        <button type="submit" disabled={busy}>{busy ? 'One moment…' : signup ? 'Create account' : 'Sign in'}</button>
        <p className={styles.switch}>
          {signup ? <>Have an account? <a href={`/login${params.toString() ? `?${params}` : ''}`}>Sign in</a></> : <>New here? <a href={`/signup${params.toString() ? `?${params}` : ''}`}>Create an account</a></>}
        </p>
      </form>
      <p className={styles.demo}>Just looking? <a href="/demo">Try the demo</a> with sample data.</p>
    </main>
  );
}
