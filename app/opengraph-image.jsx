import { ImageResponse } from 'next/og';

// Social preview card (Open Graph). Rendered on the server; the same image serves Twitter/X cards.
export const alt = 'Schedule For You: write it once, post it everywhere.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const PLATFORMS = ['X', 'Bluesky', 'Instagram', 'LinkedIn', 'Threads', 'TikTok', 'YouTube', 'Facebook', 'Pinterest', 'Google Business'];

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, background: '#0f1012', color: '#f6f5f1', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#dcff2e', display: 'flex' }} />
          schedule for you
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ fontSize: 92, fontWeight: 800, lineHeight: 1, letterSpacing: -4, display: 'flex', flexDirection: 'column' }}>
            <span>Write it once.</span>
            <span style={{ color: '#dcff2e' }}>Post it everywhere.</span>
          </div>
          <div style={{ fontSize: 30, color: '#a7abb2', lineHeight: 1.3, maxWidth: 980 }}>One composer for every social account you run. Schedule, tailor per platform, and let the queue publish.</div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {PLATFORMS.map((p) => (
            <div key={p} style={{ padding: '10px 18px', borderRadius: 999, border: '2px solid #2a2e34', fontSize: 22, color: '#d7d9dd', display: 'flex' }}>{p}</div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
