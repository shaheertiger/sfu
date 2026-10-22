'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './share.module.css';

export default function ShareActions({ token, canDecide }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  // Remember the reviewer's name on this device.
  useEffect(() => {
    try { setName(localStorage.getItem('sfy-reviewer') || ''); } catch {}
  }, []);

  async function send(action) {
    setError('');
    setDone('');
    if (!name.trim()) return setError('Add your name so the team knows who this is from.');
    if (action !== 'approve' && !text.trim()) return setError(action === 'changes' ? 'Say what should change.' : 'Write a comment first.');
    setBusy(action);
    try {
      try { localStorage.setItem('sfy-reviewer', name.trim()); } catch {}
      const res = await fetch(`/api/share/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action, name: name.trim(), body: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.issues?.[0]?.message || data.error || 'Something went wrong');
      setText('');
      setDone(action === 'approve' ? 'Approved. The team has been told.' : action === 'changes' ? 'Sent. The team will update the post.' : 'Comment sent.');
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy('');
    }
  }

  return (
    <form className={styles.form} onSubmit={(e) => { e.preventDefault(); send('comment'); }}>
      <label>
        <span>Your name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} />
      </label>
      <label>
        <span>Comment</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} placeholder="Looks good, or what should change?" />
      </label>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {done && <p className={styles.ok} role="status">{done}</p>}
      <div className={styles.actions}>
        {canDecide && (
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} disabled={!!busy} onClick={() => send('approve')}>
            {busy === 'approve' ? 'Sending…' : 'Approve'}
          </button>
        )}
        {canDecide && (
          <button type="button" className={styles.btn} disabled={!!busy} onClick={() => send('changes')}>
            {busy === 'changes' ? 'Sending…' : 'Request changes'}
          </button>
        )}
        <button type="submit" className={styles.btn} disabled={!!busy}>{busy === 'comment' ? 'Sending…' : 'Comment'}</button>
      </div>
    </form>
  );
}
