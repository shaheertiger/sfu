'use client';
import { useEffect } from 'react';

const page = { minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f6f6f3', color: '#15171a', fontFamily: 'Geist, -apple-system, Segoe UI, Helvetica, Arial, sans-serif' };
const card = { width: '100%', maxWidth: 440, background: '#fff', border: '1px solid #e7e7e2', borderRadius: 16, padding: 28, display: 'grid', gap: 12 };
const btn = { padding: '11px 16px', borderRadius: 10, border: 0, background: '#dcff2e', color: '#15171a', fontWeight: 600, cursor: 'pointer', font: 'inherit' };
const link = { padding: '11px 16px', borderRadius: 10, border: '1px solid #dcdad3', color: '#15171a', textDecoration: 'none', fontWeight: 600 };

/** Shown when a page throws while rendering. Nothing you typed is lost: the dashboard keeps unsaved work in the browser until it is sent. */
export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('[page error]', error);
  }, [error]);
  return (
    <main style={page}>
      <div style={card} role="alert">
        <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>schedule for you</p>
        <h1 style={{ margin: 0, fontSize: 22, lineHeight: 1.25 }}>Something went wrong</h1>
        <p style={{ margin: 0, color: '#677184', lineHeight: 1.5 }}>
          This page hit an error. Trying again usually fixes it. If it keeps happening, reload the page or come back in a minute.
        </p>
        {error?.digest && <p style={{ margin: 0, fontSize: 12, color: '#9aa0a8' }}>Reference: {error.digest}</p>}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
          <button type="button" onClick={() => reset()} style={btn}>Try again</button>
          <a href="/app" style={link}>Go to dashboard</a>
        </div>
      </div>
    </main>
  );
}
