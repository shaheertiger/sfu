'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { RATIOS, coverLayout, sourceRect } from '@/lib/crop';

/**
 * Crop images to a social aspect ratio before they're uploaded.
 * Runs in the browser on the picked files (no upload, no CORS), outputs JPEG, which Instagram
 * requires. GIFs pass through untouched (cropping would drop the animation).
 *
 * <ImageCropper files={File[]} onDone={(files) => …} onCancel={() => …} />
 */

const cropKind = (f) => f.type.startsWith('image/') && f.type !== 'image/gif';

export default function ImageCropper({ files, onDone, onCancel }) {
  const items = useMemo(() => files.filter(cropKind), [files]);
  const [i, setI] = useState(0);
  const [ratio, setRatio] = useState('4:5');
  const [busy, setBusy] = useState(false);
  // Per-image pan and zoom, so a carousel can share one ratio but each photo is framed on its own.
  const [view, setView] = useState(() => items.map(() => ({ zoom: 1, offX: null, offY: null })));
  const [imgs, setImgs] = useState([]);
  const frameRef = useRef(null);
  const drag = useRef(null);
  const [maxW, setMaxW] = useState(360);

  useEffect(() => {
    const urls = items.map((f) => URL.createObjectURL(f));
    let alive = true;
    Promise.all(urls.map((u) => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = u; })))
      .then((loaded) => alive && setImgs(loaded));
    return () => { alive = false; urls.forEach((u) => URL.revokeObjectURL(u)); };
  }, [items]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    const measure = () => setMaxW(Math.min(380, Math.max(220, (frameRef.current?.parentElement?.clientWidth || 380) - 24)));
    measure();
    window.addEventListener('resize', measure);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('resize', measure); };
  }, [onCancel]);

  // Nothing to crop (only GIFs or videos): hand the files straight back.
  useEffect(() => { if (!items.length) onDone(files); }, [items, files, onDone]);
  if (!items.length) return null;

  const r = RATIOS.find((x) => x.id === ratio);
  const img = imgs[i];
  const natural = img ? img.naturalHeight / img.naturalWidth : 1;
  // The frame keeps the chosen ratio and fits within 380×460, so tall 9:16 frames stay on screen.
  const ar = r.w ? r.h / r.w : natural;
  const frameW = Math.round(Math.min(maxW, 460 / ar));
  const frameH = Math.round(frameW * ar);
  const v = view[i] || { zoom: 1, offX: null, offY: null };
  const layout = img
    ? coverLayout(img.naturalWidth, img.naturalHeight, frameW, frameH, ratio === 'original' ? 1 : v.zoom,
      v.offX ?? (frameW - img.naturalWidth * Math.max(frameW / img.naturalWidth, frameH / img.naturalHeight) * v.zoom) / 2,
      v.offY ?? (frameH - img.naturalHeight * Math.max(frameW / img.naturalWidth, frameH / img.naturalHeight) * v.zoom) / 2)
    : null;
  const setV = (patch) => setView((all) => all.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  const onDown = (e) => {
    if (!layout || ratio === 'original') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: layout.x, oy: layout.y };
  };
  const onMove = (e) => {
    if (!drag.current) return;
    setV({ offX: drag.current.ox + (e.clientX - drag.current.x), offY: drag.current.oy + (e.clientY - drag.current.y) });
  };
  const onUp = () => { drag.current = null; };
  const setZoom = (z) => {
    if (!layout) return setV({ zoom: z });
    // Zoom around the frame's centre.
    const cx = frameW / 2, cy = frameH / 2, k = z / v.zoom;
    setV({ zoom: z, offX: cx - (cx - layout.x) * k, offY: cy - (cy - layout.y) * k });
  };

  async function finish() {
    if (ratio === 'original') return onDone(files);
    setBusy(true);
    try {
      const out = [];
      let k = 0;
      for (const f of files) {
        if (!cropKind(f)) { out.push(f); continue; }
        const im = imgs[k], vv = view[k] || { zoom: 1 };
        k++;
        if (!im) { out.push(f); continue; }
        const base = Math.max(frameW / im.naturalWidth, frameH / im.naturalHeight) * vv.zoom;
        const lay = coverLayout(im.naturalWidth, im.naturalHeight, frameW, frameH, vv.zoom,
          vv.offX ?? (frameW - im.naturalWidth * base) / 2, vv.offY ?? (frameH - im.naturalHeight * base) / 2);
        const { sx, sy, sw, sh } = sourceRect(lay, frameW, frameH);
        // Never upscale past the source: a small photo stays its real size rather than a blurry 1080.
        const scaleDown = Math.min(1, sw / r.w);
        const c = document.createElement('canvas');
        c.width = Math.round(r.w * scaleDown);
        c.height = Math.round(r.h * scaleDown);
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(im, sx, sy, sw, sh, 0, 0, c.width, c.height);
        const blob = await new Promise((res) => c.toBlob(res, 'image/jpeg', 0.92));
        const name = f.name.replace(/\.[^.]+$/, '') + `-${ratio.replace(':', 'x')}.jpg`;
        out.push(new File([blob], name, { type: 'image/jpeg' }));
      }
      onDone(out);
    } finally {
      setBusy(false);
    }
  }

  const btn = (on) => ({ padding: '7px 11px', borderRadius: 9, border: `1px solid ${on ? '#141619' : '#e5e3dc'}`, background: on ? '#141619' : '#fff', color: on ? '#fff' : '#141619', cursor: 'pointer', fontWeight: 600, fontSize: 13 });
  return (
    <div role="dialog" aria-modal="true" aria-label="Crop images" onClick={(e) => e.target === e.currentTarget && onCancel()} style={{ position: 'fixed', inset: 0, zIndex: 96, display: 'grid', placeItems: 'center', padding: 16, background: 'rgba(20,22,25,.55)', fontFamily: 'Geist, system-ui, sans-serif' }}>
      <div style={{ width: 'min(560px, 100%)', maxHeight: 'calc(100vh - 32px)', overflow: 'auto', background: '#fff', borderRadius: 18, padding: 20, display: 'grid', gap: 14, boxShadow: '0 24px 60px rgba(20,22,25,.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <strong style={{ fontSize: 17, letterSpacing: '-0.02em' }}>Crop {items.length > 1 ? `photo ${i + 1} of ${items.length}` : 'photo'}</strong>
          <button type="button" onClick={onCancel} aria-label="Close" style={{ border: 0, background: 'transparent', fontSize: 20, cursor: 'pointer', color: '#677184' }}>×</button>
        </div>
        <div role="group" aria-label="Aspect ratio" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {RATIOS.map((x) => (
            <button key={x.id} type="button" title={x.hint} aria-pressed={ratio === x.id} onClick={() => setRatio(x.id)} style={btn(ratio === x.id)}>{x.label}</button>
          ))}
        </div>
        <span style={{ fontSize: 12, color: '#677184', marginTop: -6 }}>{r.hint}{r.w ? ` · ${r.w}×${r.h}` : ''}{ratio !== 'original' ? ' · drag to reposition' : ''}</span>
        <div style={{ display: 'grid', placeItems: 'center', background: '#f1f1ec', borderRadius: 12, padding: 12 }}>
          <div
            ref={frameRef}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            style={{ position: 'relative', width: frameW, height: frameH, overflow: 'hidden', borderRadius: 6, background: '#2a2e34', cursor: ratio === 'original' ? 'default' : 'grab', touchAction: 'none', boxShadow: '0 0 0 1px rgba(0,0,0,.08)' }}
          >
            {img && layout && (
              <img src={img.src} alt="" draggable={false} style={{ position: 'absolute', left: layout.x, top: layout.y, width: layout.w, height: layout.h, maxWidth: 'none', userSelect: 'none', pointerEvents: 'none' }} />
            )}
          </div>
        </div>
        {ratio !== 'original' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#3d434d' }}>
            Zoom
            <input type="range" min="1" max="3" step="0.01" value={v.zoom} onChange={(e) => setZoom(Number(e.target.value))} style={{ flex: 1 }} />
          </label>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', gap: 6 }}>
            {items.length > 1 && <button type="button" disabled={i === 0} onClick={() => setI(i - 1)} style={{ ...btn(false), opacity: i === 0 ? 0.4 : 1 }}>← Previous</button>}
            {items.length > 1 && <button type="button" disabled={i === items.length - 1} onClick={() => setI(i + 1)} style={{ ...btn(false), opacity: i === items.length - 1 ? 0.4 : 1 }}>Next →</button>}
          </span>
          <span style={{ display: 'flex', gap: 6 }}>
            <button type="button" onClick={() => onDone(files)} style={btn(false)}>Skip</button>
            <button type="button" disabled={busy || !imgs.length} onClick={finish} style={{ ...btn(true), background: '#d9ff35', color: '#141619', border: '1px solid #d9ff35' }}>
              {busy ? 'Saving…' : items.length > 1 ? `Use ${items.length} photos` : 'Use photo'}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
