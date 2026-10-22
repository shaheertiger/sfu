'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './auth.module.css';

export default function AuthForm({ mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const signup = mode === 'signup';
  const next = params.get('next') || '/app';

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
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      if (data.verify) {
        setNotice(data.message);
        setBusy(false);
        return;
      }
      router.replace(next.startsWith('/') ? next : '/app');
      router.refresh();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <main className={styles.page}>
      <a href="/" className={styles.brand}>
        <img src="/logos/schedule-for-you-glyph.svg" alt="" width="30" height="30" />
        <span>schedule for you</span>
      </a>
      <form className={styles.card} onSubmit={submit}>
        <h1>{signup ? 'Start posting free' : 'Welcome back'}</h1>
        <p className={styles.sub}>{signup ? '7-day trial. No card to start.' : 'Sign in to your workspace.'}</p>
        {signup && (
          <label>
            <span>Name</span>
            <input name="name" autoComplete="name" placeholder="Maya Chen" />
          </label>
        )}
        <label>
          <span>Email</span>
          <input name="email" type="email" required autoComplete="email" placeholder="you@company.com" />
        </label>
        <label>
          <span>Password</span>
          <input name="password" type="password" required minLength={signup ? 8 : undefined} autoComplete={signup ? 'new-password' : 'current-password'} placeholder={signup ? 'At least 8 characters' : ''} />
        </label>
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
