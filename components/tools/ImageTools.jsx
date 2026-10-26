'use client';

import { useEffect, useRef, useState } from 'react';
import s from './tools.module.css';
import { Chips } from './CopyButton';
import { useToolText } from './locale';
import { PLATFORM_NAMES } from '@/lib/tools/registry';
import { makeZip } from '@/lib/tools/zip';

function download(canvas, name, type) {
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

/** Draws `img` into a w×h canvas: `fill` crops to cover, `fit` letterboxes on a background colour. */
function drawResized(canvas, img, w, h, mode, bg, transparent) {
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, w, h);
  if (mode === 'fit' && !transparent) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
  }
  const scale = mode === 'fill' ? Math.max(w / img.width, h / img.height) : Math.min(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

export function ResizerTool({ config, platform }) {
  const presets = config.presets;
  const [preset, setPreset] = useState(0);
  const [mode, setMode] = useState('fill');
  const [bg, setBg] = useState('#ffffff');
  const [format, setFormat] = useState('png');
  const [img, setImg] = useState(null);
  const [fileName, setFileName] = useState('');
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState('');
  const canvas = useRef(null);
  const input = useRef(null);
  const p = presets[preset];

  useEffect(() => {
    if (img && canvas.current) drawResized(canvas.current, img, p.w, p.h, mode, bg, format === 'png' && mode === 'fit' && bg === 'transparent');
  }, [img, p, mode, bg, format]);

  function load(file) {
    setError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file (JPG, PNG, WebP or GIF).');
      return;
    }
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      setImg(im);
      setFileName(file.name.replace(/\.[^.]+$/, ''));
      URL.revokeObjectURL(url);
    };
    im.onerror = () => setError('That image could not be opened.');
    im.src = url;
  }

  const base = `${fileName || platform}-${p.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${p.w}x${p.h}`;
  return (
    <div className={s.widget}>
      <div
        className={`${s.drop} ${drag ? s.dropActive : ''}`}
        role="button"
        tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          load(e.dataTransfer.files?.[0]);
        }}
      >
        <strong style={{ color: '#f6f5f1' }}>{img ? 'Choose a different image' : 'Choose an image or drop it here'}</strong>
        <span>Stays on your device. Nothing is uploaded.</span>
        <input ref={input} type="file" accept="image/*" hidden onChange={(e) => load(e.target.files?.[0])} />
      </div>
      {error && <p className={`${s.hint} ${s.over}`}>{error}</p>}
      <Chips options={presets.map((x, i) => ({ id: i, label: `${x.label} · ${x.w}×${x.h}` }))} value={preset} onChange={setPreset} label="Size" />
      <div className={s.row}>
        <Chips options={[{ id: 'fill', label: 'Fill (crop)' }, { id: 'fit', label: 'Fit (add background)' }]} value={mode} onChange={setMode} label="Fit" />
        {mode === 'fit' && (
          <label className={s.toggle}>
            Background <input className={s.color} type="color" value={bg === 'transparent' ? '#ffffff' : bg} onChange={(e) => setBg(e.target.value)} />
          </label>
        )}
        <Chips options={[{ id: 'png', label: 'PNG' }, { id: 'jpg', label: 'JPG' }]} value={format} onChange={setFormat} label="Format" />
      </div>
      <div className={`${s.preview} ${p.round ? s.round : ''}`}>
        {img ? <canvas ref={canvas} aria-label={`Preview, ${p.w} by ${p.h} pixels`} /> : <p className={s.hint}>Your resized image appears here.</p>}
      </div>
      {p.round && img && <p className={s.hint}>Shown as a circle on {platform === 'all' ? 'most platforms' : 'the platform'}: keep the subject in the middle.</p>}
      <button
        type="button"
        className={`${s.btn} ${s.btnPrimary}`}
        disabled={!img}
        onClick={() => canvas.current && download(canvas.current, `${base}.${format}`, format === 'png' ? 'image/png' : 'image/jpeg')}
      >
        Download {p.w}×{p.h} {format.toUpperCase()}
      </button>
    </div>
  );
}

const GRADIENTS = [
  ['#5865f2', '#8b5cf6'],
  ['#ff4d6d', '#ff9e00'],
  ['#00b4d8', '#0077b6'],
  ['#dcff2e', '#7ae582'],
  ['#e63946', '#a4133c'],
  ['#25f4ee', '#fe2c55'],
  ['#2b2d42', '#000000'],
  ['#f8f9fa', '#dee2e6'],
];
const SHAPES = [
  { id: 'circle', label: 'Circle' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'square', label: 'Square' },
];

export function LogoTool({ config, platform }) {
  const size = config.size || 512;
  const [text, setText] = useState('SF');
  const [shape, setShape] = useState('circle');
  const [grad, setGrad] = useState(0);
  const [solid, setSolid] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [weight, setWeight] = useState('800');
  const canvas = useRef(null);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.beginPath();
    if (shape === 'circle') ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    else if (shape === 'rounded') ctx.roundRect(0, 0, size, size, size * 0.22);
    else ctx.rect(0, 0, size, size);
    ctx.clip();
    const [a, b] = GRADIENTS[grad];
    if (solid) ctx.fillStyle = a;
    else {
      const g = ctx.createLinearGradient(0, 0, size, size);
      g.addColorStop(0, a);
      g.addColorStop(1, b);
      ctx.fillStyle = g;
    }
    ctx.fillRect(0, 0, size, size);
    const label = Array.from(text.trim()).slice(0, 3).join('');
    const n = Array.from(label).length;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${weight} ${size * (n <= 1 ? 0.5 : n === 2 ? 0.42 : 0.32)}px Geist, ui-sans-serif, system-ui, sans-serif`;
    ctx.fillText(label, size / 2, size / 2 + size * 0.02);
    ctx.restore();
  }, [text, shape, grad, solid, color, weight, size]);

  return (
    <div className={s.widget}>
      <div className={s.row}>
        <label className={s.label}>
          1–3 letters or an emoji
          <input className={s.input} value={text} onChange={(e) => setText(e.target.value)} maxLength={8} placeholder="SF" />
        </label>
        <label className={s.label} style={{ flex: '0 1 160px' }}>
          Weight
          <select className={s.select} value={weight} onChange={(e) => setWeight(e.target.value)}>
            <option value="500">Regular</option>
            <option value="700">Bold</option>
            <option value="800">Heavy</option>
          </select>
        </label>
      </div>
      <Chips options={SHAPES} value={shape} onChange={setShape} label="Shape" />
      <div className={s.row}>
        <div className={s.swatches} role="group" aria-label="Background">
          {GRADIENTS.map(([a, b], i) => (
            <button
              key={i}
              type="button"
              className={s.swatch}
              aria-pressed={grad === i}
              aria-label={`Background ${i + 1}`}
              style={{ background: solid ? a : `linear-gradient(135deg, ${a}, ${b})` }}
              onClick={() => setGrad(i)}
            />
          ))}
        </div>
        <label className={s.toggle}>
          <input type="checkbox" checked={solid} onChange={(e) => setSolid(e.target.checked)} /> Solid color
        </label>
        <label className={s.toggle}>
          Text <input className={s.color} type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </label>
      </div>
      <div className={s.preview}>
        <canvas ref={canvas} style={{ width: 220, height: 220 }} aria-label="Icon preview" />
      </div>
      <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={() => canvas.current && download(canvas.current, `${platform}-${config.label.toLowerCase().replace(/\s+/g, '-')}-${size}.png`, 'image/png')}>
        Download {size}×{size} PNG
      </button>
      <p className={s.hint}>Makes your own simple icon. It is not, and should not imitate, the {PLATFORM_NAMES[platform] || 'platform'} logo.</p>
    </div>
  );
}

/* Grid maker and carousel splitter: one image cut into equal tiles ------------------------------- */

/**
 * Tile shapes. 3:4 matches the profile grid at the time of writing, so a 3:4 grid lines up with no
 * cropping at the seams; 4:5 and square are the classic feed sizes.
 */
const TILE_SIZES = [
  { id: 'tall', key: 'sliceTall', w: 1080, h: 1440 },
  { id: 'portrait', key: 'slicePortrait', w: 1080, h: 1350 },
  { id: 'square', key: 'sliceSquare', w: 1080, h: 1080 },
];

/** Longest side of the on-screen preview. Exports are drawn tile by tile at full size. */
const PREVIEW_MAX = 1600;

/**
 * Draws one window of the framed image: the image covers a W×H frame, enlarged by `zoom`
 * (1 = just covers), and `fx`/`fy` (0–1) pick which part of the overflow shows (0 = left/top
 * edge, 0.5 = centred). The window starting at (x, y) of size w×h lands in a canvas scaled by
 * `k`. Drawing tiles one at a time keeps every canvas small: iPhones refuse canvases above about
 * 16.7 megapixels, and a 3×4 grid at full size is larger than that.
 */
function drawFrame(canvas, img, { W, H, zoom, fx, fy, x = 0, y = 0, w = W, h = H, k = 1 }) {
  canvas.width = Math.round(w * k);
  canvas.height = Math.round(h * k);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const scale = Math.max(W / img.width, H / img.height) * zoom;
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, (-(dw - W) * fx - x) * k, (-(dh - H) * fy - y) * k, dw * k, dh * k);
}

const toBytes = (canvas, type) =>
  new Promise((resolve) => canvas.toBlob((b) => (b ? b.arrayBuffer().then((buf) => resolve(new Uint8Array(buf))) : resolve(null)), type, 0.92));

function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));

export function SliceTool({ config }) {
  const { t: tr } = useToolText();
  const grid = config.mode === 'grid';
  const [img, setImg] = useState(null);
  const [error, setError] = useState('');
  // 4:5 by default: it posts from the app and through schedulers alike. 3:4 matches the profile
  // grid but, at the time of writing, Instagram's publishing API only takes 4:5 to 1.91:1.
  const [size, setSize] = useState('portrait');
  const [rows, setRows] = useState(grid ? 3 : 1);
  const [cols, setCols] = useState(3);
  const [format, setFormat] = useState('jpg');
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });
  const [zipping, setZipping] = useState(false);
  const canvas = useRef(null);
  const input = useRef(null);
  const drag = useRef(null);
  const t = TILE_SIZES.find((x) => x.id === size);
  const W = cols * t.w;
  const H = rows * t.h;

  useEffect(() => {
    if (img && canvas.current) drawFrame(canvas.current, img, { W, H, zoom, fx: pos.x, fy: pos.y, k: Math.min(1, PREVIEW_MAX / Math.max(W, H)) });
  }, [img, W, H, zoom, pos]);

  function load(file) {
    setError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError(tr('sliceBadType'));
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      setImg(im);
      setZoom(1);
      setPos({ x: 0.5, y: 0.5 });
      URL.revokeObjectURL(url);
    };
    im.onerror = () => setError(tr('sliceBadImage'));
    im.src = url;
  }

  // Dragging the preview moves the image inside the frame. The overflow (how far the image sticks
  // out past the frame) converts a drag in screen pixels into the 0–1 position.
  function overflow() {
    const scale = Math.max(W / img.width, H / img.height) * zoom;
    return { x: img.width * scale - W, y: img.height * scale - H };
  }
  function onPointerDown(e) {
    if (!img) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, pos, width: e.currentTarget.getBoundingClientRect().width };
  }
  function onPointerMove(e) {
    const d = drag.current;
    if (!d) return;
    const ratio = W / d.width; // canvas pixels per screen pixel
    const o = overflow();
    setPos({
      x: o.x > 0 ? clamp01(d.pos.x - ((e.clientX - d.x) * ratio) / o.x) : 0.5,
      y: o.y > 0 ? clamp01(d.pos.y - ((e.clientY - d.y) * ratio) / o.y) : 0.5,
    });
  }
  const onPointerUp = () => {
    drag.current = null;
  };

  // Tiles in reading order (top-left first). For a grid, the posting order is the reverse:
  // the bottom-right tile goes up first so the newest post (top-left) completes the picture.
  const tiles = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) tiles.push({ r, c, i: r * cols + c });
  const order = (i) => (grid ? tiles.length - i : i + 1);
  const type = format === 'png' ? 'image/png' : 'image/jpeg';
  const fileName = (tile) => `${grid ? 'grid' : 'slide'}-${String(order(tile.i)).padStart(2, '0')}.${format}`;
  const tileCanvas = (tile) => {
    const c = document.createElement('canvas');
    drawFrame(c, img, { W, H, zoom, fx: pos.x, fy: pos.y, x: tile.c * t.w, y: tile.r * t.h, w: t.w, h: t.h });
    return c;
  };
  const sorted = [...tiles].sort((a, b) => order(a.i) - order(b.i));
  const save = (tile) => tileCanvas(tile).toBlob((b) => b && saveBlob(b, fileName(tile)), type, 0.92);
  const saveAll = async () => {
    for (const tile of sorted) {
      save(tile);
      await new Promise((r) => setTimeout(r, 350));
    }
  };
  const saveZip = async () => {
    setZipping(true);
    try {
      const files = [];
      for (const tile of sorted) files.push({ name: fileName(tile), data: await toBytes(tileCanvas(tile), type) });
      saveBlob(new Blob([makeZip(files.filter((f) => f.data))], { type: 'application/zip' }), `${grid ? 'instagram-grid' : 'instagram-carousel'}-${cols}x${rows}.zip`);
    } finally {
      setZipping(false);
    }
  };

  return (
    <div className={s.widget}>
      <div className={s.drop} role="button" tabIndex={0} onClick={() => input.current?.click()} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); load(e.dataTransfer.files?.[0]); }}>
        <strong style={{ color: '#f6f5f1' }}>{img ? tr('sliceChooseAgain') : grid ? tr('sliceChooseGrid') : tr('sliceChooseWide')}</strong>
        <span>{tr('sliceLocal')}</span>
        <input ref={input} type="file" accept="image/*" hidden onChange={(e) => load(e.target.files?.[0])} />
      </div>
      {error && <p className={`${s.hint} ${s.over}`}>{error}</p>}
      {grid ? (
        <Chips options={[1, 2, 3, 4].map((n) => ({ id: n, label: tr('sliceGridOption', { rows: n, n: 3 * n }) }))} value={rows} onChange={setRows} label={tr('sliceGrid')} />
      ) : (
        <Chips options={[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({ id: n, label: tr('sliceSlidesOption', { n }) }))} value={cols} onChange={setCols} label={tr('sliceSlides')} />
      )}
      <div className={s.row}>
        <Chips options={TILE_SIZES.map((x) => ({ id: x.id, label: tr(x.key) }))} value={size} onChange={setSize} label={tr('sliceTileSize')} />
        <Chips options={[{ id: 'jpg', label: 'JPG' }, { id: 'png', label: 'PNG' }]} value={format} onChange={setFormat} label={tr('sliceFormat')} />
      </div>
      {size === 'tall' && <p className={s.hint}>{tr('sliceTallNote')}</p>}
      {img && (
        <div className={s.row}>
          <label className={s.label} style={{ flex: 1 }}>
            {tr('sliceZoom')} · {Math.round(zoom * 100)}%
            <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
          </label>
          <button type="button" className={s.btn} onClick={() => { setZoom(1); setPos({ x: 0.5, y: 0.5 }); }}>{tr('sliceReset')}</button>
        </div>
      )}
      <div className={s.preview}>
        {img ? (
          <div
            style={{ position: 'relative', width: '100%', maxWidth: grid ? 420 : '100%', cursor: 'grab', touchAction: 'none' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <canvas ref={canvas} style={{ width: '100%', height: 'auto', maxHeight: 'none' }} aria-label={tr('slicePreview')} />
            <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)`, pointerEvents: 'none' }}>
              {tiles.map((tile) => (
                <div key={tile.i} style={{ border: '1px solid rgba(255,255,255,.7)', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', padding: 4 }}>
                  <span style={{ background: 'rgba(0,0,0,.65)', color: '#fff', fontSize: 12, fontWeight: 700, borderRadius: 6, padding: '2px 6px' }}>{order(tile.i)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className={s.hint}>{tr(grid ? 'slicePreviewGrid' : 'slicePreviewSlides')}</p>
        )}
      </div>
      {img && (
        <>
          <p className={s.hint}>{tr('sliceDragHint')}</p>
          <div className={s.row}>
            <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={saveZip} disabled={zipping}>
              {zipping ? tr('sliceZipBusy') : tr('sliceZip', { n: tiles.length })}
            </button>
            <button type="button" className={s.btn} onClick={saveAll}>
              {tr(grid ? 'sliceDownloadTiles' : 'sliceDownloadSlides', { n: tiles.length })}
            </button>
          </div>
          <div className={s.chips}>
            {sorted.map((tile) => (
              <button key={tile.i} type="button" className={s.chip} onClick={() => save(tile)}>
                {tr(grid ? 'sliceTile' : 'sliceSlide', { n: order(tile.i) })}
              </button>
            ))}
          </div>
          <p className={s.hint}>
            {tr(grid ? 'sliceHintGrid' : 'sliceHintSlides')}
          </p>
        </>
      )}
    </div>
  );
}
