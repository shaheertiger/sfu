'use client';

import { useEffect, useRef, useState } from 'react';
import s from './tools.module.css';
import { Chips } from './CopyButton';
import { useToolText } from './locale';
import { coverRect } from '@/lib/tools/collage';
import { TEXT_IMAGE_SIZES, alignX, blockTop, contrastColor, fitText, originalSize } from '@/lib/tools/text-image';

const T = {
  en: {
    choose: 'Add a photo or drop it here (optional)',
    change: 'Choose a different photo',
    removePhoto: 'Use a solid color instead',
    local: 'Your photo stays on your device. Nothing is uploaded.',
    badType: 'Choose an image file (JPG, PNG, WebP or GIF).',
    badImage: 'That image could not be opened. HEIC photos may need converting to JPG first.',
    bg: 'Background color',
    text: 'Text',
    style: 'Style',
    styles: { plain: 'Plain', band: 'Band', outline: 'Outline', breaking: 'Breaking news' },
    font: 'Font',
    fonts: { sans: 'Sans', serif: 'Serif', rounded: 'Rounded' },
    bold: 'Bold',
    size: 'Font size · {n}',
    color: 'Text color',
    align: 'Alignment',
    aligns: { left: 'Left', center: 'Center', right: 'Right' },
    position: 'Position',
    positions: { top: 'Top', middle: 'Middle', bottom: 'Bottom' },
    shadow: 'Shadow',
    live: 'LIVE badge',
    time: 'Time stamp',
    timeInput: 'Time shown',
    out: 'Output size',
    original: 'Original · {w}×{h}',
    stories: 'Stories/Reels',
    format: 'Format',
    preview: 'Preview, {w} by {h} pixels',
    shrunk: 'The text was made smaller so it fits.',
    download: 'Download {w}×{h} {fmt}',
    label: 'BREAKING NEWS',
    note: 'For jokes and memes only. Don’t make fake news that could mislead people or pass for a real broadcast.',
    sample: 'Type your headline here',
    plainSample: 'Your text here',
  },
  ja: {
    choose: '写真を選ぶか、ここにドロップ（写真なしでもOK）',
    change: '別の写真を選ぶ',
    removePhoto: '写真を外して単色の背景にする',
    local: '写真は端末内で処理され、アップロードされません。',
    badType: '画像ファイル（JPG・PNG・WebP・GIF）を選んでください。',
    badImage: 'この画像は開けませんでした。HEICの場合はJPGに変換してからお試しください。',
    bg: '背景色',
    text: 'テキスト',
    style: 'スタイル',
    styles: { plain: 'シンプル', band: '帯', outline: '縁取り', breaking: 'ニュース速報' },
    font: 'フォント',
    fonts: { sans: 'ゴシック', serif: '明朝', rounded: '丸ゴシック' },
    bold: '太字',
    size: '文字の大きさ · {n}',
    color: '文字色',
    align: '文字揃え',
    aligns: { left: '左揃え', center: '中央', right: '右揃え' },
    position: '位置',
    positions: { top: '上', middle: '中央', bottom: '下' },
    shadow: '影をつける',
    live: '「LIVE」表示',
    time: '時刻を表示',
    timeInput: '表示する時刻',
    out: '出力サイズ',
    original: '元のサイズ · {w}×{h}',
    stories: 'ストーリーズ/リール',
    format: '形式',
    preview: 'プレビュー（{w}×{h}ピクセル）',
    shrunk: 'テキストが収まるように文字を小さくしました。',
    download: '{w}×{h}の{fmt}を保存',
    label: 'ニュース速報',
    note: 'ジョークやミーム用の機能です。本物のニュースや放送と誤解されるような偽ニュースは作らないでください。',
    sample: '速報テキストをここに入力',
    plainSample: 'ここにテキストを入力',
  },
};

const fill = (str, vars) => str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));

/** System font stacks only: nothing is downloaded. */
const FONTS = {
  sans: "system-ui, -apple-system, 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', 'Yu Gothic', Meiryo, sans-serif",
  serif: "'Hiragino Mincho ProN', 'Yu Mincho', 'Noto Serif JP', Georgia, 'Times New Roman', serif",
  rounded: "'Hiragino Maru Gothic ProN', 'M PLUS Rounded 1c', sans-serif",
};
const STYLES = ['plain', 'band', 'outline', 'breaking'];
const BG_SWATCHES = ['#1f2937', '#000000', '#ffffff', '#e63946', '#2a9d8f', '#ffb703', '#5865f2', '#f4a6c1'];
const RED = '#d7000f';

const hexA = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
const nowHHMM = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/** Draws the whole image at output size and reports whether the text had to shrink. */
function render(canvas, o) {
  const { W, H } = o;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = o.bg;
  ctx.fillRect(0, 0, W, H);
  if (o.photo) {
    const r = coverRect(o.photo.w, o.photo.h, W, H);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(o.photo.src, r.dx, r.dy, r.dw, r.dh);
  }
  const u = Math.min(W, H) / 1080; // sizes are set on a 1080px reference
  const fs = o.fontSize * u;
  const weight = o.bold ? 700 : 400;
  const fontAt = (px, w = weight, family = FONTS[o.font]) => `${w} ${px}px ${family}`;
  const measure = (str, px) => {
    ctx.font = fontAt(px);
    return ctx.measureText(str).width;
  };
  const text = o.text.trim() ? o.text : ' ';
  ctx.textBaseline = 'middle';
  ctx.textAlign = o.align;

  if (o.style === 'breaking') {
    const mx = W * 0.04;
    const bandW = W - 2 * mx;
    const padX = fs * 0.5;
    const padY = fs * 0.32;
    const fit = fitText(text, { maxWidth: bandW - 2 * padX, maxHeight: H * 0.45, fontSize: fs, minFontSize: 14 * u, lineHeight: 1.22 }, measure);
    const bandH = fit.height + 2 * padY;
    const bandTop = H - H * 0.07 - bandH;
    // Red label tab sitting on the band's top-left corner.
    const lf = Math.max(fs * 0.6, 26 * u);
    ctx.font = fontAt(lf, 800, FONTS.sans);
    const lw = ctx.measureText(o.label).width + lf * 0.9;
    const lh = lf * 1.6;
    ctx.fillStyle = RED;
    ctx.fillRect(mx, bandTop - lh, lw, lh);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText(o.label, mx + lf * 0.45, bandTop - lh / 2);
    // White band with dark text and a thin red rule along the bottom.
    const g = ctx.createLinearGradient(0, bandTop, 0, bandTop + bandH);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(1, '#e6e8eb');
    ctx.fillStyle = g;
    ctx.fillRect(mx, bandTop, bandW, bandH);
    ctx.fillStyle = RED;
    ctx.fillRect(mx, bandTop + bandH - Math.max(3, fs * 0.07), bandW, Math.max(3, fs * 0.07));
    ctx.fillStyle = '#111111';
    ctx.textAlign = o.align;
    ctx.font = fontAt(fit.fontSize);
    const x = alignX(o.align, mx + padX, bandW - 2 * padX);
    fit.lines.forEach((line, i) => ctx.fillText(line, x, bandTop + padY + i * fit.lineHeight + fit.lineHeight / 2));
    // Top-right corner: LIVE bug and/or time stamp.
    const bf = 34 * u;
    const by = H * 0.045;
    let right = W - W * 0.04;
    ctx.font = fontAt(bf, 800, FONTS.sans);
    ctx.textAlign = 'left';
    if (o.live) {
      const tw = ctx.measureText('LIVE').width;
      const w = tw + bf * 1.6;
      ctx.fillStyle = RED;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(right - w, by, w, bf * 1.5, bf * 0.2) : ctx.rect(right - w, by, w, bf * 1.5);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(right - w + bf * 0.55, by + bf * 0.75, bf * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText('LIVE', right - w + bf * 0.95, by + bf * 0.78);
      right -= w + bf * 0.3;
    }
    if (o.showTime && o.time) {
      const tw = ctx.measureText(o.time).width;
      const w = tw + bf * 0.8;
      ctx.fillStyle = 'rgba(0,0,0,.6)';
      ctx.fillRect(right - w, by, w, bf * 1.5);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(o.time, right - w + bf * 0.4, by + bf * 0.78);
    }
    return fit.shrunk;
  }

  const mx = W * 0.07;
  const my = H * 0.07;
  const band = o.style === 'band';
  const padY = band ? fs * 0.45 : 0;
  const fit = fitText(text, { maxWidth: W - 2 * mx, maxHeight: H - 2 * my - 2 * padY, fontSize: fs, minFontSize: 14 * u, lineHeight: 1.3 }, measure);
  const top = blockTop(o.position, H, fit.height + 2 * padY, band ? Math.min(my, H * 0.05) : my);
  const contrast = contrastColor(o.color);
  if (band) {
    ctx.fillStyle = hexA(contrast, 0.55);
    ctx.fillRect(0, top, W, fit.height + 2 * padY);
  }
  ctx.font = fontAt(fit.fontSize);
  ctx.fillStyle = o.color;
  const x = alignX(o.align, mx, W - 2 * mx);
  if (o.style === 'plain' && o.shadow) {
    ctx.shadowColor = hexA(contrast, 0.6);
    ctx.shadowBlur = fit.fontSize * 0.2;
    ctx.shadowOffsetY = fit.fontSize * 0.05;
  }
  if (o.style === 'outline') {
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.lineWidth = fit.fontSize * 0.16;
    ctx.strokeStyle = contrast;
  }
  fit.lines.forEach((line, i) => {
    const y = top + padY + i * fit.lineHeight + fit.lineHeight / 2;
    if (o.style === 'outline') ctx.strokeText(line, x, y);
    ctx.fillText(line, x, y);
  });
  ctx.shadowColor = 'transparent';
  return fit.shrunk;
}

export function TextImageTool({ config = {} }) {
  const { locale } = useToolText();
  const tx = T[locale] || T.en;
  const breakingStart = config.preset === 'breaking';
  const [photo, setPhoto] = useState(null);
  const [bg, setBg] = useState('#1f2937');
  const [text, setText] = useState(breakingStart ? tx.sample : tx.plainSample);
  const [style, setStyle] = useState(breakingStart ? 'breaking' : 'plain');
  const [fontSize, setFontSize] = useState(breakingStart ? 64 : 88);
  const [color, setColor] = useState('#ffffff');
  const [align, setAlign] = useState(breakingStart ? 'left' : 'center');
  const [position, setPosition] = useState('middle');
  const [font, setFont] = useState('sans');
  const [bold, setBold] = useState(true);
  const [shadow, setShadow] = useState(true);
  const [live, setLive] = useState(true);
  const [showTime, setShowTime] = useState(true);
  const [time, setTime] = useState('');
  const [size, setSize] = useState('1:1');
  const [format, setFormat] = useState('png');
  const [error, setError] = useState('');
  const [over, setOver] = useState(false);
  const [shrunk, setShrunk] = useState(false);
  const canvas = useRef(null);
  const input = useRef(null);

  // Set after mount so the server render and the first client render agree.
  useEffect(() => setTime(nowHHMM()), []);

  const orig = photo && originalSize(photo.w, photo.h);
  const preset = TEXT_IMAGE_SIZES.find((x) => x.id === size);
  const { w: W, h: H } = size === 'original' && orig ? orig : preset || TEXT_IMAGE_SIZES[0];
  const breaking = style === 'breaking';
  const label = tx.label;

  useEffect(() => {
    if (!canvas.current) return;
    const sh = render(canvas.current, { W, H, photo, bg, text, style, fontSize, color, align, position, font, bold, shadow, live, showTime, time, label });
    setShrunk(sh);
  }, [W, H, photo, bg, text, style, fontSize, color, align, position, font, bold, shadow, live, showTime, time, label]);

  function load(file) {
    setError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError(tx.badType);
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      URL.revokeObjectURL(url);
      const d = originalSize(im.naturalWidth, im.naturalHeight);
      const c = document.createElement('canvas');
      c.width = d.w;
      c.height = d.h;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(im, 0, 0, d.w, d.h);
      setPhoto({ src: c, w: d.w, h: d.h });
      setSize('original');
    };
    im.onerror = () => {
      URL.revokeObjectURL(url);
      setError(tx.badImage);
    };
    im.src = url;
  }

  function download() {
    const c = canvas.current;
    if (!c) return;
    const type = format === 'png' ? 'image/png' : 'image/jpeg';
    c.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${breaking ? 'breaking-news' : 'text-image'}-${W}x${H}.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
      type,
      0.92,
    );
  }

  const sizes = [...(orig ? [{ id: 'original', label: fill(tx.original, orig) }] : []), ...TEXT_IMAGE_SIZES.map((x) => ({ id: x.id, label: `${x.id} · ${x.w}×${x.h}${x.id === '9:16' ? ` · ${tx.stories}` : ''}` }))];

  return (
    <div className={s.widget}>
      <div
        className={`${s.drop} ${over ? s.dropActive : ''}`}
        role="button"
        tabIndex={0}
        style={{ padding: 16 }}
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
          load(e.dataTransfer.files?.[0]);
        }}
      >
        <strong style={{ color: '#f6f5f1' }}>{photo ? tx.change : tx.choose}</strong>
        <span>{tx.local}</span>
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
      {photo ? (
        <button
          type="button"
          className={s.btn}
          style={{ alignSelf: 'flex-start' }}
          onClick={() => {
            setPhoto(null);
            if (size === 'original') setSize('1:1');
          }}
        >
          {tx.removePhoto}
        </button>
      ) : (
        <div className={s.row}>
          <span className={s.hint}>{tx.bg}</span>
          <div className={s.swatches} role="group" aria-label={tx.bg}>
            {BG_SWATCHES.map((c) => (
              <button key={c} type="button" className={s.swatch} aria-pressed={bg === c} aria-label={c} style={{ background: c, borderColor: bg === c ? undefined : '#2a2e34' }} onClick={() => setBg(c)} />
            ))}
          </div>
          <input className={s.color} type="color" aria-label={tx.bg} value={bg} onChange={(e) => setBg(e.target.value)} />
        </div>
      )}

      <label className={s.label}>
        {tx.text}
        <textarea className={s.textarea} style={{ minHeight: 90 }} value={text} onChange={(e) => setText(e.target.value)} />
      </label>

      <Chips label={tx.style} value={style} onChange={setStyle} options={STYLES.map((id) => ({ id, label: tx.styles[id] }))} />
      {breaking && (
        <p className={s.hint} role="note" style={{ padding: '10px 12px', borderRadius: 10, background: '#2a1416', border: '1px solid #5a2328', color: '#ffb4b8' }}>
          {tx.note}
        </p>
      )}

      <div className={s.row}>
        <Chips label={tx.font} value={font} onChange={setFont} options={Object.keys(FONTS).map((id) => ({ id, label: tx.fonts[id] }))} />
        <label className={s.toggle}>
          <input type="checkbox" checked={bold} onChange={(e) => setBold(e.target.checked)} /> {tx.bold}
        </label>
      </div>

      <label className={s.label}>
        {fill(tx.size, { n: fontSize })}
        <input type="range" min={24} max={220} step={2} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} />
      </label>

      <div className={s.row}>
        <Chips label={tx.align} value={align} onChange={setAlign} options={['left', 'center', 'right'].map((id) => ({ id, label: tx.aligns[id] }))} />
        {!breaking && <Chips label={tx.position} value={position} onChange={setPosition} options={['top', 'middle', 'bottom'].map((id) => ({ id, label: tx.positions[id] }))} />}
      </div>

      <div className={s.row}>
        {breaking ? (
          <>
            <label className={s.toggle}>
              <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} /> {tx.live}
            </label>
            <label className={s.toggle}>
              <input type="checkbox" checked={showTime} onChange={(e) => setShowTime(e.target.checked)} /> {tx.time}
            </label>
            {showTime && <input className={s.input} style={{ width: 130 }} type="time" aria-label={tx.timeInput} value={time} onChange={(e) => setTime(e.target.value)} />}
          </>
        ) : (
          <>
            <label className={s.toggle}>
              {tx.color} <input className={s.color} type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            </label>
            {style === 'plain' && (
              <label className={s.toggle}>
                <input type="checkbox" checked={shadow} onChange={(e) => setShadow(e.target.checked)} /> {tx.shadow}
              </label>
            )}
          </>
        )}
      </div>

      <div className={s.row}>
        <Chips label={tx.out} value={size} onChange={setSize} options={sizes} />
        <Chips label={tx.format} value={format} onChange={setFormat} options={[{ id: 'png', label: 'PNG' }, { id: 'jpg', label: 'JPG' }]} />
      </div>

      <div className={s.preview}>
        <div style={{ width: '100%', maxWidth: Math.round((520 * W) / H) }}>
          <canvas ref={canvas} style={{ width: '100%', height: 'auto', maxHeight: 'none' }} aria-label={fill(tx.preview, { w: W, h: H })} />
        </div>
      </div>
      <p className={s.hint} aria-live="polite">{shrunk ? tx.shrunk : ''}</p>

      <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={download}>
        {fill(tx.download, { w: W, h: H, fmt: format.toUpperCase() })}
      </button>
    </div>
  );
}
