export const metadata = { title: 'Page not found' };

const page = { minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f6f6f3', color: '#15171a', fontFamily: 'Geist, -apple-system, Segoe UI, Helvetica, Arial, sans-serif' };
const card = { width: '100%', maxWidth: 440, background: '#fff', border: '1px solid #e7e7e2', borderRadius: 16, padding: 28, display: 'grid', gap: 12 };
const link = { padding: '11px 16px', borderRadius: 10, color: '#15171a', textDecoration: 'none', fontWeight: 600 };

export default function NotFound() {
  return (
    <main style={page}>
      <div style={card}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>schedule for you</p>
        <h1 style={{ margin: 0, fontSize: 22, lineHeight: 1.25 }}>That page doesn&apos;t exist</h1>
        <p style={{ margin: 0, color: '#677184', lineHeight: 1.5 }}>The link may be old or mistyped. Preview links also stop working after 30 days.</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
          <a href="/" style={{ ...link, background: '#dcff2e' }}>Home</a>
          <a href="/app" style={{ ...link, border: '1px solid #dcdad3' }}>Dashboard</a>
        </div>
      </div>
    </main>
  );
}
