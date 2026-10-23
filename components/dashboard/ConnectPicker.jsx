'use client';
import { useEffect, useMemo, useState } from 'react';

const LABEL = { facebook: 'Facebook Pages', instagram: 'Instagram accounts', threads: 'Threads profiles', linkedin: 'LinkedIn profiles', youtube: 'YouTube channels', google_business: 'Google Business locations', pinterest: 'Pinterest accounts' };

/**
 * After a login returns several new accounts, choose which ones to connect.
 * <ConnectPicker id onClose onConnected={(result) => …} />
 */
export default function ConnectPicker({ id, onClose, onConnected }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [picked, setPicked] = useState(() => new Set());
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`/api/connect/pick/${encodeURIComponent(id)}`, { credentials: 'same-origin' })
      .then(async (r) => ({ ok: r.ok, d: await r.json().catch(() => ({})) }))
      .then(({ ok, d }) => { if (!alive) return; if (!ok) setError(d.error || 'Could not load the accounts.'); else setData(d); })
      .catch(() => alive && setError('Could not load the accounts. Check your connection.'));
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { alive = false; window.removeEventListener('keydown', onKey); };
  }, [id, onClose]);

  const room = data ? Math.max(0, data.limit - data.used) : 0;
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (data?.accounts || []).filter((a) => !s || `${a.name} ${a.username}`.toLowerCase().includes(s));
  }, [data, q]);
  const toggle = (eid) => setPicked((p) => { const n = new Set(p); n.has(eid) ? n.delete(eid) : n.add(eid); return n; });
  const allShown = list.length > 0 && list.every((a) => picked.has(a.external_id));
  const toggleShown = () => setPicked((p) => { const n = new Set(p); list.forEach((a) => (allShown ? n.delete(a.external_id) : n.add(a.external_id))); return n; });
  const over = picked.size > room;

  async function connect() {
    setBusy(true);
    try {
      const r = await fetch(`/api/connect/pick/${encodeURIComponent(id)}`, { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ external_ids: [...picked] }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Could not connect those accounts.');
      onConnected(d);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  const what = LABEL[data?.platform] || 'accounts';
  return (
    <div role="dialog" aria-modal="true" aria-label={`Choose ${what}`} onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, zIndex: 96, display: 'grid', placeItems: 'center', padding: 16, background: 'rgba(20,22,25,.5)', fontFamily: 'Geist, system-ui, sans-serif' }}>
      <div style={{ width: 'min(520px, 100%)', maxHeight: 'calc(100vh - 32px)', display: 'grid', gridTemplateRows: 'auto auto 1fr auto', gap: 12, background: '#fff', borderRadius: 18, padding: 20, boxShadow: '0 24px 60px rgba(20,22,25,.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
          <div>
            <strong style={{ fontSize: 17, letterSpacing: '-0.02em' }}>Choose {what} to connect</strong>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#677184', lineHeight: 1.45 }}>
              {data ? `We found ${data.accounts.length} new ${what} on that login. Your plan has room for ${room} more.` : 'Loading…'}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={{ border: 0, background: 'transparent', fontSize: 20, cursor: 'pointer', color: '#677184' }}>×</button>
        </div>
        {data && data.accounts.length > 6 ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search accounts" style={{ flex: 1, padding: '8px 10px', border: '1px solid #e7e5df', borderRadius: 9, outline: 'none', fontSize: 13 }} />
            <button type="button" onClick={toggleShown} style={{ padding: '8px 10px', borderRadius: 9, border: '1px solid #e7e5df', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>{allShown ? 'Clear' : 'Select all'}</button>
          </div>
        ) : <span />}
        <div style={{ overflow: 'auto', minHeight: 80, display: 'flex', flexDirection: 'column', gap: 4, margin: '0 -4px', padding: '0 4px' }}>
          {error && <p role="alert" style={{ margin: 0, padding: '9px 11px', borderRadius: 9, background: '#fff5f5', border: '1px solid #f5c2c7', color: '#a1281f', fontSize: 13 }}>{error}</p>}
          {list.map((a) => {
            const on = picked.has(a.external_id);
            return (
              <label key={a.external_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, border: `1px solid ${on ? '#141619' : '#efefea'}`, background: on ? '#f6ffd9' : '#fff', cursor: 'pointer' }}>
                <input type="checkbox" checked={on} onChange={() => toggle(a.external_id)} style={{ width: 16, height: 16, accentColor: '#141619' }} />
                {a.avatar ? <img src={a.avatar} alt="" width="30" height="30" style={{ borderRadius: '50%', objectFit: 'cover', flex: 'none' }} /> : <span style={{ width: 30, height: 30, borderRadius: '50%', background: '#e7e5df', display: 'grid', placeItems: 'center', fontWeight: 700, color: '#4a4f57', flex: 'none' }}>{(a.name || '?')[0].toUpperCase()}</span>}
                <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</span>
                  {a.username && a.username !== a.name && <span style={{ fontSize: 12, color: '#677184' }}>@{a.username}</span>}
                </span>
              </label>
            );
          })}
          {data && !list.length && <p style={{ margin: 0, fontSize: 13, color: '#677184' }}>No matches.</p>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: over ? '#a1281f' : '#677184' }}>
            {over ? `Only ${room} fit on your plan; the rest will be skipped.` : `${picked.size} selected`}
          </span>
          <span style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid #e7e5df', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Cancel</button>
            <button type="button" disabled={!picked.size || busy || !data} onClick={connect} style={{ padding: '9px 16px', borderRadius: 10, border: 0, background: '#141619', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14, opacity: !picked.size || busy ? 0.5 : 1 }}>
              {busy ? 'Connecting…' : `Connect ${picked.size || ''}`.trim()}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
