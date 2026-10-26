'use client';

import { useEffect, useRef, useState } from 'react';
import s from './tools.module.css';
import { Chips } from './CopyButton';
import { useToolText } from './locale';
import { COLLAGE_LAYOUTS, COLLAGE_SHAPES, MAX_PHOTOS, cellAt, collageCells, coverRect, layoutById, layoutsFor, moveItem, panBy } from '@/lib/tools/collage';

const T = {
  en: {
    choose: 'Choose photos or drop them here (2–9)',
    addMore: 'Add more photos ({n}/9)',
    local: 'Your photos stay on your device. Nothing is uploaded.',
    badType: 'Choose image files (JPG, PNG, WebP or GIF).',
    badImage: 'One photo could not be opened. HEIC photos may need converting to JPG first.',
    tooMany: 'Up to 9 photos. The extra ones were left out.',
    photos: 'Photo order',
    photo: 'Photo {n}',
    left: 'Move photo {n} left',
    right: 'Move photo {n} right',
    remove: 'Remove photo {n}',
    layout: 'Layout',
    showAll: 'Show all layouts',
    shape: 'Output size',
    stories: 'Stories/Reels',
    gap: 'Gap',
    padding: 'Outer padding',
    radius: 'Corner radius',
    bg: 'Background',
    white: 'White',
    black: 'Black',
    custom: 'Custom',
    format: 'Format',
    preview: 'Collage preview, {w} by {h} pixels',
    previewEmpty: 'Your collage preview appears here.',
    dragHint: 'Drag a photo in the preview to choose which part shows in its cell.',
    reset: 'Re-center photos',
    empty: 'Add {n} more to fill every cell. Empty cells are saved in the background color.',
    extra: 'This layout uses the first {n} photos.',
    download: 'Download {w}×{h} {fmt}',
    layouts: { '2-side': 'Side by side', '2-stack': 'Stacked', '3-left': '1 + 2', '3-cols': '3 columns', '4-grid': '2×2', '4-top': '1 + 3', 5: '2 + 3', 6: '3×2', 7: '3 + 4', 8: '4×2', 9: '3×3' },
  },
  ja: {
    choose: '写真を選ぶか、ここにドロップ（2〜9枚）',
    addMore: '写真を追加（{n}/9枚）',
    local: '写真は端末内で処理され、アップロードされません。',
    badType: '画像ファイル（JPG・PNG・WebP・GIF）を選んでください。',
    badImage: '開けない写真がありました。HEICの場合はJPGに変換してからお試しください。',
    tooMany: '写真は最大9枚までです。超えた分は追加されていません。',
    photos: '写真の並び順',
    photo: '{n}枚目',
    left: '{n}枚目を左へ移動',
    right: '{n}枚目を右へ移動',
    remove: '{n}枚目を削除',
    layout: 'レイアウト',
    showAll: 'すべてのレイアウトを表示',
    shape: '出力サイズ',
    stories: 'ストーリーズ/リール',
    gap: 'すき間',
    padding: '外側の余白',
    radius: '角の丸み',
    bg: '背景色',
    white: '白',
    black: '黒',
    custom: 'カスタム',
    format: '形式',
    preview: 'コラージュのプレビュー（{w}×{h}ピクセル）',
    previewEmpty: 'ここにコラージュのプレビューが表示されます。',
    dragHint: 'プレビューの写真をドラッグすると、枠の中で見せる位置を調整できます。',
    reset: '位置を中央に戻す',
    empty: 'あと{n}枚追加すると全マスが埋まります。空きマスは背景色のまま保存されます。',
    extra: 'このレイアウトでは最初の{n}枚を使います。',
    download: '{w}×{h}の{fmt}を保存',
    layouts: { '2-side': '横並び', '2-stack': '縦並び', '3-left': '大1＋小2', '3-cols': '3列', '4-grid': '2×2', '4-top': '大1＋小3', 5: '2＋3', 6: '3×2', 7: '3＋4', 8: '4×2', 9: '3×3' },
  },
};

const fill = (str, vars) => str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));

/** Photos are shrunk on load: the largest cell is at most 1920px, and 9 full-size phone photos would exhaust mobile memory. */
const LOAD_MAX = 2048;
let nextId = 1;

function loadPhoto(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      URL.revokeObjectURL(url);
      const k = Math.min(1, LOAD_MAX / Math.max(im.naturalWidth, im.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(im.naturalWidth * k));
      c.height = Math.max(1, Math.round(im.naturalHeight * k));
      const ctx = c.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(im, 0, 0, c.width, c.height);
      const tk = 160 / Math.max(c.width, c.height);
      const t = document.createElement('canvas');
      t.width = Math.max(1, Math.round(c.width * tk));
      t.height = Math.max(1, Math.round(c.height * tk));
      t.getContext('2d').drawImage(c, 0, 0, t.width, t.height);
      resolve({ id: nextId++, src: c, w: c.width, h: c.height, thumb: t.toDataURL('image/jpeg', 0.8), pos: { x: 0.5, y: 0.5 } });
    };
    im.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('decode'));
    };
    im.src = url;
  });
}

function drawCollage(canvas, { W, H, cells, photos, bg, radius, placeholder }) {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.imageSmoothingQuality = 'high';
  cells.forEach((c, i) => {
    const p = photos[i];
    if (!p && !placeholder) return;
    const r = Math.max(0, Math.min(radius, c.w / 2, c.h / 2));
    ctx.save();
    ctx.beginPath();
    if (r > 0 && ctx.roundRect) ctx.roundRect(c.x, c.y, c.w, c.h, r);
    else ctx.rect(c.x, c.y, c.w, c.h);
    ctx.clip();
    if (p) {
      const cr = coverRect(p.w, p.h, c.w, c.h, p.pos.x, p.pos.y);
      ctx.drawImage(p.src, c.x + cr.dx, c.y + cr.dy, cr.dw, cr.dh);
    } else {
      ctx.fillStyle = 'rgba(128,128,128,.28)';
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.fillStyle = 'rgba(128,128,128,.9)';
      ctx.font = `600 ${Math.round(Math.min(c.w, c.h) * 0.22)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), c.x + c.w / 2, c.y + c.h / 2);
    }
    ctx.restore();
  });
}

function saveCanvas(canvas, name, type) {
  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    type,
    0.92,
  );
}

function LayoutIcon({ id }) {
  const cells = collageCells(id, 30, 30, 3, 0);
  return (
    <svg width="22" height="22" viewBox="0 0 30 30" aria-hidden="true" style={{ flex: 'none' }}>
      {cells.map((c, i) => <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} rx="2" fill="currentColor" opacity={0.85} />)}
    </svg>
  );
}

const thumbBtn = { minHeight: 32, minWidth: 32, padding: '2px 8px', fontSize: 14, borderRadius: 8 };

export function CollageTool({ config = {} }) {
  const { locale } = useToolText();
  const tx = T[locale] || T.en;
  const [photos, setPhotos] = useState([]);
  const [layout, setLayout] = useState('2-side');
  const [showAll, setShowAll] = useState(false);
  const [shape, setShape] = useState(COLLAGE_SHAPES.some((x) => x.id === config.defaultShape) ? config.defaultShape : '1:1');
  const [gap, setGap] = useState(12);
  const [padding, setPadding] = useState(12);
  const [radius, setRadius] = useState(0);
  const [bgMode, setBgMode] = useState('white');
  const [custom, setCustom] = useState('#f3e9dc');
  const [format, setFormat] = useState('jpg');
  const [error, setError] = useState('');
  const [over, setOver] = useState(false);
  const canvas = useRef(null);
  const input = useRef(null);
  const drag = useRef(null);

  const size = COLLAGE_SHAPES.find((x) => x.id === shape) || COLLAGE_SHAPES[0];
  const { w: W, h: H } = size;
  const cells = collageCells(layout, W, H, gap, padding);
  const bg = bgMode === 'white' ? '#ffffff' : bgMode === 'black' ? '#000000' : custom;

  // When the photo count changes, jump to the first layout that holds exactly that many.
  useEffect(() => {
    const n = photos.length;
    if (layoutById(layout).n !== n && COLLAGE_LAYOUTS.some((l) => l.n === n)) setLayout(layoutsFor(n)[0].id);
  }, [photos.length]);

  useEffect(() => {
    if (photos.length && canvas.current) drawCollage(canvas.current, { W, H, cells, photos, bg, radius, placeholder: true });
  });

  async function add(fileList) {
    setError('');
    const files = Array.from(fileList || []);
    const images = files.filter((f) => f.type.startsWith('image/'));
    const room = MAX_PHOTOS - photos.length;
    let msg = images.length < files.length ? tx.badType : '';
    if (images.length > room) msg = tx.tooMany;
    const results = await Promise.allSettled(images.slice(0, Math.max(0, room)).map(loadPhoto));
    const loaded = results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));
    if (loaded.length < results.length) msg = tx.badImage;
    if (loaded.length) setPhotos((prev) => [...prev, ...loaded].slice(0, MAX_PHOTOS));
    setError(msg);
  }

  // Dragging inside a cell pans that cell's photo. Positions are 0–1 of the overflow, so they
  // survive layout and size changes.
  function onPointerDown(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = W / rect.width;
    const i = cellAt(cells, (e.clientX - rect.left) * ratio, (e.clientY - rect.top) * ratio);
    const p = photos[i];
    if (!p) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { i, x: e.clientX, y: e.clientY, pos: p.pos, ratio, ov: coverRect(p.w, p.h, cells[i].w, cells[i].h) };
  }
  function onPointerMove(e) {
    const d = drag.current;
    if (!d) return;
    const pos = panBy(d.pos, (e.clientX - d.x) * d.ratio, (e.clientY - d.y) * d.ratio, d.ov);
    setPhotos((prev) => prev.map((p, j) => (j === d.i ? { ...p, pos } : p)));
  }
  const onPointerUp = () => {
    drag.current = null;
  };

  function download() {
    const c = document.createElement('canvas');
    drawCollage(c, { W, H, cells, photos, bg, radius, placeholder: false });
    saveCanvas(c, `collage-${shape.replace(':', 'x')}-${W}x${H}.${format}`, format === 'png' ? 'image/png' : 'image/jpeg');
  }

  const exact = COLLAGE_LAYOUTS.some((l) => l.n === photos.length);
  const shown = showAll || !exact ? COLLAGE_LAYOUTS : COLLAGE_LAYOUTS.filter((l) => l.n === photos.length || l.id === layout);
  const missing = cells.length - photos.length;

  return (
    <div className={s.widget}>
      {photos.length < MAX_PHOTOS && (
        <div
          className={`${s.drop} ${over ? s.dropActive : ''}`}
          role="button"
          tabIndex={0}
          style={photos.length ? { padding: '16px' } : undefined}
          onClick={() => input.current?.click()}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), input.current?.click())}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            add(e.dataTransfer.files);
          }}
        >
          <strong style={{ color: '#f6f5f1' }}>{photos.length ? fill(tx.addMore, { n: photos.length }) : tx.choose}</strong>
          <span>{tx.local}</span>
          <input
            ref={input}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              add(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
      )}
      {error && <p className={`${s.hint} ${s.over}`} role="alert">{error}</p>}

      {photos.length > 0 && (
        <ol aria-label={tx.photos} style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {photos.map((p, i) => (
            <li key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', padding: 6, borderRadius: 12, background: '#0f1012', border: '1px solid #1f2226' }}>
              <div style={{ position: 'relative' }}>
                <img src={p.thumb} alt={fill(tx.photo, { n: i + 1 })} width={72} height={72} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, display: 'block' }} />
                <span style={{ position: 'absolute', top: 3, left: 3, background: 'rgba(0,0,0,.7)', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '1px 5px' }}>{i + 1}</span>
              </div>
              <div style={{ display: 'flex', gap: 2 }}>
                <button type="button" className={s.btn} style={thumbBtn} disabled={i === 0} aria-label={fill(tx.left, { n: i + 1 })} onClick={() => setPhotos((prev) => moveItem(prev, i, -1))}>←</button>
                <button type="button" className={s.btn} style={thumbBtn} disabled={i === photos.length - 1} aria-label={fill(tx.right, { n: i + 1 })} onClick={() => setPhotos((prev) => moveItem(prev, i, 1))}>→</button>
                <button type="button" className={s.btn} style={thumbBtn} aria-label={fill(tx.remove, { n: i + 1 })} onClick={() => setPhotos((prev) => prev.filter((x) => x.id !== p.id))}>×</button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className={s.row} style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 8 }}>
        <Chips
          label={tx.layout}
          value={layout}
          onChange={setLayout}
          options={shown.map((l) => ({
            id: l.id,
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <LayoutIcon id={l.id} />
                {tx.layouts[l.id]}
              </span>
            ),
          }))}
        />
        {exact && (
          <label className={s.toggle}>
            <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} /> {tx.showAll}
          </label>
        )}
      </div>

      <Chips label={tx.shape} value={shape} onChange={setShape} options={COLLAGE_SHAPES.map((x) => ({ id: x.id, label: `${x.id} · ${x.w}×${x.h}${x.id === '9:16' ? ` · ${tx.stories}` : ''}` }))} />

      <div className={s.row}>
        <label className={s.label}>
          {tx.gap} · {gap}px
          <input type="range" min={0} max={40} step={1} value={gap} onChange={(e) => setGap(Number(e.target.value))} />
        </label>
        <label className={s.label}>
          {tx.padding} · {padding}px
          <input type="range" min={0} max={80} step={1} value={padding} onChange={(e) => setPadding(Number(e.target.value))} />
        </label>
        <label className={s.label}>
          {tx.radius} · {radius}px
          <input type="range" min={0} max={40} step={1} value={radius} onChange={(e) => setRadius(Number(e.target.value))} />
        </label>
      </div>

      <div className={s.row}>
        <Chips label={tx.bg} value={bgMode} onChange={setBgMode} options={[{ id: 'white', label: tx.white }, { id: 'black', label: tx.black }, { id: 'custom', label: tx.custom }]} />
        {bgMode === 'custom' && <input className={s.color} type="color" aria-label={tx.bg} value={custom} onChange={(e) => setCustom(e.target.value)} />}
        <Chips label={tx.format} value={format} onChange={setFormat} options={[{ id: 'jpg', label: 'JPG' }, { id: 'png', label: 'PNG' }]} />
      </div>

      <div className={s.preview}>
        {photos.length ? (
          <div style={{ width: '100%', maxWidth: Math.round((520 * W) / H), touchAction: 'none', cursor: 'grab' }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
            <canvas ref={canvas} style={{ width: '100%', height: 'auto', maxHeight: 'none' }} aria-label={fill(tx.preview, { w: W, h: H })} />
          </div>
        ) : (
          <p className={s.hint}>{tx.previewEmpty}</p>
        )}
      </div>

      {photos.length > 0 && (
        <>
          <div className={s.row}>
            <p className={s.hint} style={{ flex: '1 1 220px' }} aria-live="polite">
              {missing !== 0 && <span style={{ display: 'block', color: '#f6c56b' }}>{missing > 0 ? fill(tx.empty, { n: missing }) : fill(tx.extra, { n: cells.length })}</span>}
              {tx.dragHint}
            </p>
            <button type="button" className={s.btn} onClick={() => setPhotos((prev) => prev.map((p) => ({ ...p, pos: { x: 0.5, y: 0.5 } })))}>{tx.reset}</button>
          </div>
          <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={download}>
            {fill(tx.download, { w: W, h: H, fmt: format.toUpperCase() })}
          </button>
        </>
      )}
    </div>
  );
}
