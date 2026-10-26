'use client';

import { useEffect, useRef, useState } from 'react';
import s from './tools.module.css';
import { Chips } from './CopyButton';
import { useToolText } from './locale';
import { blockStrips, clampRect, fitPixels, normalizeRect, pixelate, scaleRect, strengthPx } from '@/lib/tools/blur';

const T = {
  en: {
    choose: 'Choose a photo or drop it here',
    chooseAgain: 'Choose a different photo',
    local: 'Edited on your device. Nothing is uploaded.',
    badType: 'Choose an image file (JPG, PNG or WebP).',
    badImage: 'That image could not be opened in this browser.',
    effect: 'Effect',
    mosaic: 'Pixelate',
    blur: 'Blur',
    solid: 'Solid bar',
    shape: 'Shape',
    rect: 'Rectangle',
    ellipse: 'Ellipse',
    block: 'Block size',
    strength: 'Blur strength',
    color: 'Bar color',
    whole: 'Whole image',
    empty: 'Your photo appears here.',
    preview: 'Photo preview. Drag on it to add an area to hide.',
    drawHint: 'Drag on the photo to cover an area. Outlines and numbers only show here, not in the download.',
    wholeHint: 'The effect covers the whole photo.',
    noAreas: 'No areas yet: drag over faces, number plates or names to hide them.',
    areas: 'Areas to hide',
    area: 'Area {n}',
    del: 'Delete area {n}',
    undo: 'Undo',
    clear: 'Clear',
    format: 'Format',
    download: 'Download {w} × {h} {f}',
    saving: 'Saving…',
    downscaled: 'This photo is over 16 megapixels, so it downloads at {w} × {h}: the largest size phone browsers can draw.',
    safety: 'For names, number plates and other text, Solid bar is the safest choice: small text under a light mosaic or blur can sometimes still be guessed.',
    meta: 'The download is a newly drawn image, so EXIF data such as GPS location and camera details is not included.',
  },
  ja: {
    choose: '写真を選択、またはここにドロップ',
    chooseAgain: '別の写真を選ぶ',
    local: '端末内で処理します。アップロードはされません。',
    badType: '画像ファイル(JPG・PNG・WebP)を選んでください。',
    badImage: 'このブラウザではその画像を開けませんでした。',
    effect: '効果',
    mosaic: 'モザイク',
    blur: 'ぼかし',
    solid: '塗りつぶし',
    shape: '形',
    rect: '四角',
    ellipse: '楕円',
    block: 'モザイクの粗さ',
    strength: 'ぼかしの強さ',
    color: '塗りつぶしの色',
    whole: '画像全体にかける',
    empty: 'ここに写真が表示されます。',
    preview: '写真のプレビュー。ドラッグで隠す範囲を追加できます。',
    drawHint: '写真の上をドラッグして、隠したい範囲を囲みます。枠線と番号はここでの表示用で、保存する画像には入りません。',
    wholeHint: '写真全体に効果をかけます。',
    noAreas: 'まだ範囲がありません。顔・ナンバープレート・名前などをドラッグで囲んでください。',
    areas: '隠す範囲',
    area: '範囲 {n}',
    del: '範囲 {n} を削除',
    undo: '元に戻す',
    clear: 'すべて消去',
    format: '保存形式',
    download: '{w} × {h} の {f} をダウンロード',
    saving: '保存中…',
    downscaled: 'この写真は 1600 万画素を超えるため、スマートフォンのブラウザで扱える最大サイズの {w} × {h} で保存されます。',
    safety: '名前やナンバープレートなどの文字には「塗りつぶし」が最も確実です。弱いモザイクやぼかしでは、小さな文字が読み取れてしまうことがあります。',
    meta: '保存される画像は新しく描き直したものなので、位置情報(GPS)やカメラ情報などの EXIF データは含まれません。',
  },
};

const fmt = (str, vars) => str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k]));

/** Longest side of the on-screen preview; the download is drawn again at full size. */
const PREVIEW_MAX = 1400;

const newCanvas = (w, h) => {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
};

/** Does this browser apply ctx.filter? Older Safari has no canvas filters at all. */
let filterOk;
function canFilter() {
  if (filterOk !== undefined) return filterOk;
  try {
    const ctx = newCanvas(9, 9).getContext('2d');
    if (!ctx || !('filter' in ctx)) return (filterOk = false);
    ctx.filter = 'blur(2px)';
    ctx.fillStyle = '#fff';
    ctx.fillRect(4, 4, 1, 1);
    filterOk = ctx.getImageData(2, 4, 1, 1).data[3] > 0;
  } catch {
    filterOk = false;
  }
  return filterOk;
}

function clipShape(ctx, r, shape) {
  ctx.beginPath();
  if (shape === 'ellipse') ctx.ellipse(r.x + r.w / 2, r.y + r.h / 2, r.w / 2, r.h / 2, 0, 0, Math.PI * 2);
  else ctx.rect(r.x, r.y, r.w, r.h);
  ctx.clip();
}

/**
 * Copies the `outer` area of `src` into `dctx` (scaled by sx, sy), repeating the edge pixels
 * where `outer` reaches past the image, so a blur near the border doesn't fade to transparent.
 */
function drawClamped(dctx, src, outer, sx, sy) {
  const x0 = Math.max(0, outer.x);
  const y0 = Math.max(0, outer.y);
  const x1 = Math.min(src.width, outer.x + outer.w);
  const y1 = Math.min(src.height, outer.y + outer.h);
  const X1 = outer.x + outer.w;
  const Y1 = outer.y + outer.h;
  const d = (a, b, c, e, fx0, fy0, fx1, fy1) => {
    if (fx1 > fx0 && fy1 > fy0) dctx.drawImage(src, a, b, c, e, (fx0 - outer.x) * sx, (fy0 - outer.y) * sy, (fx1 - fx0) * sx, (fy1 - fy0) * sy);
  };
  const w = x1 - x0;
  const h = y1 - y0;
  d(x0, y0, w, h, x0, y0, x1, y1);
  d(x0, y0, 1, h, outer.x, y0, x0, y1);
  d(x1 - 1, y0, 1, h, x1, y0, X1, y1);
  d(x0, y0, w, 1, x0, outer.y, x1, y0);
  d(x0, y1 - 1, w, 1, x0, y1, x1, Y1);
  d(x0, y0, 1, 1, outer.x, outer.y, x0, y0);
  d(x1 - 1, y0, 1, 1, x1, outer.y, X1, y0);
  d(x0, y1 - 1, 1, 1, outer.x, y1, x0, Y1);
  d(x1 - 1, y1 - 1, 1, 1, x1, y1, X1, Y1);
}

/** Blur without ctx.filter: shrink, then enlarge again in smooth steps (twice). */
function scaleBlur(src, sigma) {
  const W = src.width;
  const H = src.height;
  let cur = src;
  for (let pass = 0; pass < 2; pass++) {
    const steps = [];
    let w = W;
    let h = H;
    const tw = Math.max(1, Math.round(W / Math.max(1, sigma * 2)));
    const th = Math.max(1, Math.round(H / Math.max(1, sigma * 2)));
    while (w / 2 > tw && h / 2 > th) steps.push([(w = Math.round(w / 2)), (h = Math.round(h / 2))]);
    steps.push([tw, th]);
    for (let i = steps.length - 2; i >= 0; i--) steps.push(steps[i]);
    steps.push([W, H]);
    for (const [sw, sh] of steps) {
      const next = newCanvas(sw, sh);
      const ctx = next.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(cur, 0, 0, next.width, next.height);
      cur = next;
    }
  }
  return cur;
}

/**
 * Applies one effect inside `shapeRect` (canvas pixels; `r` is the same rect clipped to the
 * canvas). Each effect reads the canvas as it is, so overlapping areas never reveal the original.
 */
function applyEffect(canvas, r, shapeRect, shape, opts) {
  const ctx = canvas.getContext('2d');
  if (opts.effect === 'solid') {
    ctx.save();
    clipShape(ctx, shapeRect, shape);
    ctx.fillStyle = opts.color;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.restore();
    return;
  }
  if (opts.effect === 'mosaic') {
    const tmp = newCanvas(1, 1);
    for (const strip of blockStrips(r, opts.block)) {
      const data = ctx.getImageData(strip.x, strip.y, strip.w, strip.h);
      pixelate(data, opts.block);
      tmp.width = strip.w;
      tmp.height = strip.h;
      tmp.getContext('2d').putImageData(data, 0, 0);
      ctx.save();
      clipShape(ctx, shapeRect, shape);
      ctx.drawImage(tmp, strip.x, strip.y);
      ctx.restore();
    }
    return;
  }
  // Blur. A blurred picture has no fine detail, so it is computed at a reduced size (about 4 px
  // per blur radius) and enlarged back: much faster, and small enough for any phone's canvas limit.
  const radius = opts.radius;
  const pad = Math.ceil(radius * 3);
  const outer = { x: r.x - pad, y: r.y - pad, w: r.w + 2 * pad, h: r.h + 2 * pad };
  const k = Math.max(1, radius / 4);
  const small = newCanvas(outer.w / k, outer.h / k);
  const sx = small.width / outer.w;
  const sy = small.height / outer.h;
  const sctx = small.getContext('2d');
  sctx.imageSmoothingQuality = 'high';
  drawClamped(sctx, canvas, outer, sx, sy);
  let blurred;
  if (canFilter()) {
    blurred = newCanvas(small.width, small.height);
    const bctx = blurred.getContext('2d');
    bctx.filter = `blur(${radius * sx}px)`;
    bctx.drawImage(small, 0, 0);
  } else blurred = scaleBlur(small, radius * sx);
  ctx.save();
  clipShape(ctx, shapeRect, shape);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(blurred, outer.x, outer.y, outer.w, outer.h);
  ctx.restore();
}

/** Draws the photo at scale `k` into `canvas` and applies every area (given in photo pixels). */
function render(canvas, img, regions, settings, k, background) {
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, W, H);
  const long = Math.max(W, H);
  const opts = { ...settings, block: strengthPx(settings.block, long, 2), radius: strengthPx(settings.radius, long, 1) };
  const list = settings.whole ? [{ shape: 'rect', x: 0, y: 0, w: W / k, h: H / k }] : regions;
  for (const reg of list) {
    const shapeRect = scaleRect(reg, k);
    const r = clampRect(shapeRect, W, H);
    if (r) applyEffect(canvas, r, shapeRect, reg.shape, opts);
  }
}

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

export function BlurTool({ config = {} }) {
  const { locale } = useToolText();
  const t = T[locale] || T.en;
  const [img, setImg] = useState(null);
  const [name, setName] = useState('photo');
  const [error, setError] = useState('');
  const [effect, setEffect] = useState(config.effect || 'mosaic');
  const [shape, setShape] = useState('rect');
  const [block, setBlock] = useState(20);
  const [radius, setRadius] = useState(15);
  const [color, setColor] = useState('#000000');
  const [whole, setWhole] = useState(false);
  const [regions, setRegions] = useState([]);
  const [history, setHistory] = useState([]);
  const [format, setFormat] = useState('jpg');
  const [saving, setSaving] = useState(false);
  const canvas = useRef(null);
  const composite = useRef(null);
  const input = useRef(null);
  const drag = useRef(null);
  const draft = useRef(null);
  const nextId = useRef(1);

  const W = img?.naturalWidth || 0;
  const H = img?.naturalHeight || 0;
  const kPreview = W ? Math.min(1, PREVIEW_MAX / Math.max(W, H)) : 1;
  const settings = { effect, block, radius, color, whole };
  const out = fitPixels(W || 1, H || 1);

  /** Paints the cached result plus outlines, area numbers and the area being drawn. */
  function paint() {
    const c = canvas.current;
    const comp = composite.current;
    if (!c || !comp) return;
    const ctx = c.getContext('2d');
    ctx.drawImage(comp, 0, 0);
    const px = c.width / Math.max(1, c.getBoundingClientRect().width || c.width); // canvas px per CSS px
    ctx.lineWidth = 2 * px;
    const outline = (reg, stroke, dash) => {
      const r = scaleRect(reg, kPreview);
      ctx.save();
      ctx.setLineDash(dash ? [6 * px, 4 * px] : []);
      ctx.strokeStyle = stroke;
      ctx.beginPath();
      if (reg.shape === 'ellipse') ctx.ellipse(r.x + r.w / 2, r.y + r.h / 2, r.w / 2, r.h / 2, 0, 0, Math.PI * 2);
      else ctx.rect(r.x, r.y, r.w, r.h);
      ctx.stroke();
      ctx.restore();
      return r;
    };
    if (!whole) {
      regions.forEach((reg, i) => {
        const r = outline(reg, 'rgba(255,255,255,.9)', true);
        const label = String(i + 1);
        ctx.font = `700 ${12 * px}px ui-sans-serif, system-ui, sans-serif`;
        const bw = ctx.measureText(label).width + 10 * px;
        const bh = 18 * px;
        ctx.fillStyle = 'rgba(0,0,0,.7)';
        ctx.fillRect(r.x, r.y, bw, bh);
        ctx.fillStyle = '#dcff2e';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, r.x + 5 * px, r.y + bh / 2);
      });
      if (draft.current) outline({ ...draft.current, shape }, '#dcff2e', false);
    }
  }

  // Re-render the effects whenever the photo, the areas or the settings change.
  useEffect(() => {
    if (!img || !canvas.current) return;
    const w = Math.max(1, Math.round(W * kPreview));
    const h = Math.max(1, Math.round(H * kPreview));
    if (!composite.current) composite.current = document.createElement('canvas');
    composite.current.width = w;
    composite.current.height = h;
    canvas.current.width = w;
    canvas.current.height = h;
    render(composite.current, img, regions, settings, kPreview, null);
    paint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img, regions, effect, block, radius, color, whole]);

  function load(file) {
    setError('');
    if (!file) return;
    if (file.type && !file.type.startsWith('image/')) return setError(t.badType);
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      URL.revokeObjectURL(url);
      setImg(im);
      setName(file.name.replace(/\.[^.]+$/, '') || 'photo');
      setFormat(file.type === 'image/png' ? 'png' : 'jpg');
      setRegions([]);
      setHistory([]);
    };
    im.onerror = () => {
      URL.revokeObjectURL(url);
      setError(t.badImage);
    };
    im.src = url;
  }

  const change = (next) => {
    setHistory((h) => [...h.slice(-49), regions]);
    setRegions(next);
  };
  const undo = () => {
    if (!history.length) return;
    setRegions(history[history.length - 1]);
    setHistory(history.slice(0, -1));
  };

  const toPhoto = (e) => {
    const b = canvas.current.getBoundingClientRect();
    return {
      x: Math.min(W, Math.max(0, ((e.clientX - b.left) / b.width) * W)),
      y: Math.min(H, Math.max(0, ((e.clientY - b.top) / b.height) * H)),
    };
  };
  function onPointerDown(e) {
    if (!img || whole || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = toPhoto(e);
    draft.current = null;
  }
  function onPointerMove(e) {
    if (!drag.current) return;
    const p = toPhoto(e);
    draft.current = normalizeRect(drag.current.x, drag.current.y, p.x, p.y);
    paint();
  }
  function onPointerUp() {
    const d = draft.current;
    drag.current = null;
    draft.current = null;
    // Ignore taps: an area must be at least ~6 screen pixels each way.
    const b = canvas.current?.getBoundingClientRect();
    const min = b ? (6 * W) / b.width : 1;
    if (d && d.w >= min && d.h >= min) change([...regions, { id: nextId.current++, shape, ...d }]);
    else paint();
  }

  async function save() {
    if (!img) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 30)); // let "Saving…" paint before the heavy work
    try {
      const c = newCanvas(out.width, out.height);
      render(c, img, regions, settings, out.scale, format === 'jpg' ? '#ffffff' : null);
      const type = format === 'png' ? 'image/png' : 'image/jpeg';
      const blob = await new Promise((resolve) => c.toBlob(resolve, type, 0.92));
      c.width = c.height = 0;
      if (blob) saveBlob(blob, `${name}-blurred.${format}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={s.widget}>
      <div
        className={s.drop}
        role="button"
        tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          load(e.dataTransfer.files?.[0]);
        }}
      >
        <strong style={{ color: '#f6f5f1' }}>{img ? t.chooseAgain : t.choose}</strong>
        <span>{t.local}</span>
        <input
          ref={input}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            load(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>
      {error && <p className={`${s.hint} ${s.over}`} role="alert">{error}</p>}

      <Chips options={[{ id: 'mosaic', label: t.mosaic }, { id: 'blur', label: t.blur }, { id: 'solid', label: t.solid }]} value={effect} onChange={setEffect} label={t.effect} />
      <div className={s.row}>
        {effect === 'mosaic' && (
          <label className={s.label}>
            {t.block} · {block}
            <input type="range" min={5} max={60} value={block} onChange={(e) => setBlock(Number(e.target.value))} />
          </label>
        )}
        {effect === 'blur' && (
          <label className={s.label}>
            {t.strength} · {radius}
            <input type="range" min={2} max={50} value={radius} onChange={(e) => setRadius(Number(e.target.value))} />
          </label>
        )}
        {effect === 'solid' && (
          <label className={s.toggle}>
            {t.color} <input className={s.color} type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          </label>
        )}
      </div>
      <div className={s.row}>
        <Chips options={[{ id: 'rect', label: t.rect }, { id: 'ellipse', label: t.ellipse }]} value={shape} onChange={setShape} label={t.shape} />
        <label className={s.toggle}>
          <input type="checkbox" checked={whole} onChange={(e) => setWhole(e.target.checked)} /> {t.whole}
        </label>
      </div>

      <div className={s.preview} style={{ padding: img ? 8 : 14 }}>
        {img ? (
          <div style={{ width: '100%', maxWidth: `calc(70vh * ${W / H})`, margin: '0 auto' }}>
            <canvas
              ref={canvas}
              role="img"
              aria-label={t.preview}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              style={{ width: '100%', height: 'auto', maxHeight: 'none', touchAction: whole ? 'auto' : 'none', cursor: whole ? 'default' : 'crosshair' }}
            />
          </div>
        ) : (
          <p className={s.hint}>{t.empty}</p>
        )}
      </div>

      {img && (
        <>
          <p className={s.hint}>{whole ? t.wholeHint : t.drawHint}</p>
          {!whole && (
            <div aria-live="polite">
              {regions.length ? (
                <div className={s.limits} role="list" aria-label={t.areas}>
                  {regions.map((reg, i) => (
                    <div key={reg.id} className={s.limit} role="listitem" style={{ alignItems: 'center' }}>
                      <span>
                        {fmt(t.area, { n: i + 1 })} · {reg.shape === 'ellipse' ? t.ellipse : t.rect} · {Math.round(reg.w * out.scale)} × {Math.round(reg.h * out.scale)}
                      </span>
                      <button type="button" className={s.copy} aria-label={fmt(t.del, { n: i + 1 })} onClick={() => change(regions.filter((r) => r.id !== reg.id))}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={s.hint}>{t.noAreas}</p>
              )}
            </div>
          )}
          <div className={s.row}>
            <button type="button" className={s.btn} onClick={undo} disabled={!history.length}>
              {t.undo}
            </button>
            <button type="button" className={s.btn} onClick={() => change([])} disabled={!regions.length}>
              {t.clear}
            </button>
            <Chips options={[{ id: 'jpg', label: 'JPG' }, { id: 'png', label: 'PNG' }]} value={format} onChange={setFormat} label={t.format} />
          </div>
          {out.downscaled && <p className={s.hint}>{fmt(t.downscaled, { w: out.width, h: out.height })}</p>}
          <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={save} disabled={saving || (!whole && !regions.length)}>
            {saving ? t.saving : fmt(t.download, { w: out.width, h: out.height, f: format.toUpperCase() })}
          </button>
          <p className={s.hint}>{t.safety}</p>
          <p className={s.hint}>{t.meta}</p>
        </>
      )}
    </div>
  );
}
