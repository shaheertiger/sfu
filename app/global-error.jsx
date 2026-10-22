'use client';

/** Last resort when the root layout itself fails. Must render its own <html> and <body>. */
export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f6f6f3', color: '#15171a', fontFamily: '-apple-system, Segoe UI, Helvetica, Arial, sans-serif' }}>
        <div role="alert" style={{ width: '100%', maxWidth: 440, background: '#fff', border: '1px solid #e7e7e2', borderRadius: 16, padding: 28, display: 'grid', gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>Something went wrong</h1>
          <p style={{ margin: 0, color: '#677184', lineHeight: 1.5 }}>Schedule For You could not load this page. Reload to try again.</p>
          {error?.digest && <p style={{ margin: 0, fontSize: 12, color: '#9aa0a8' }}>Reference: {error.digest}</p>}
          <button type="button" onClick={() => reset()} style={{ justifySelf: 'start', padding: '11px 16px', borderRadius: 10, border: 0, background: '#dcff2e', color: '#15171a', fontWeight: 600, cursor: 'pointer', font: 'inherit' }}>Reload</button>
        </div>
      </body>
    </html>
  );
}
