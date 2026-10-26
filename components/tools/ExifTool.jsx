'use client';

import { useRef, useState } from 'react';
import s from './tools.module.css';
import { useToolText } from './locale';
import { formatExifDate, hasAnyMetadata, readMetadata, stripJpegMetadata, stripPngMetadata } from '@/lib/tools/exif';
import { fitPixels } from '@/lib/tools/blur';
import { makeZip } from '@/lib/tools/zip';

const T = {
  en: {
    choose: 'Choose photos or drop them here',
    chooseMore: 'Add more photos',
    local: 'Read and cleaned on your device. Nothing is uploaded.',
    summary: '{n} photo(s) · {g} with a location',
    summaryNone: '{n} photo(s) · no location found',
    gpsFlag: 'This photo contains the location where it was taken',
    gps: 'Location (GPS)',
    gpsNone: 'None',
    camera: 'Camera',
    lens: 'Lens',
    date: 'Date taken',
    software: 'Software',
    author: 'Author / copyright',
    serial: 'Camera serial number',
    other: 'Other metadata',
    xmp: 'XMP',
    iptc: 'IPTC',
    comment: 'Comment',
    text: 'Text / time chunks',
    none: 'None found',
    rotated: 'Rotated by its EXIF orientation ({o}).',
    cantRead: 'This file type’s metadata can’t be listed here. Removing it re-saves the photo as a JPEG, which keeps no metadata.',
    damaged: 'This file looks damaged; it will be re-saved through the browser if possible.',
    clean: 'Remove location & metadata',
    cleaning: 'Cleaning…',
    zip: 'Download all as ZIP ({n})',
    cleanedN: '{n} cleaned file(s) ready to download.',
    zipping: 'Making ZIP…',
    clear: 'Clear list',
    remove: 'Remove {name} from the list',
    download: 'Download',
    lossless: 'Cleaned losslessly: the image data is untouched.',
    reencodedRotated: 'Re-saved as JPEG (95% quality) so the photo stays upright: removing the orientation tag losslessly would turn it sideways.',
    reencodedRotatedPng: 'Re-saved as PNG so the image stays upright.',
    reencoded: 'Re-saved as JPEG (95% quality): this format can’t be cleaned losslessly.',
    downscaled: 'Reduced to {w} × {h} to stay within the 16-megapixel limit browsers on phones can draw.',
    unsupported: 'Not supported: this browser can’t open this file type. Try a JPEG, PNG or WebP.',
    notImage: 'Not an image.',
    hint: 'JPEG and PNG files are cleaned without re-compressing: only the metadata blocks (EXIF with GPS, XMP, IPTC, comments) are removed; the color profile is kept. Extras such as HDR gain maps and motion-photo video embedded in some phone JPEGs are removed too.',
  },
  ja: {
    choose: '写真を選択、またはここにドロップ',
    chooseMore: '写真を追加',
    local: '読み取りも削除もすべて端末内で行います。アップロードはされません。',
    summary: '写真 {n} 枚 · 位置情報あり {g} 枚',
    summaryNone: '写真 {n} 枚 · 位置情報は見つかりませんでした',
    gpsFlag: 'この写真には撮影場所の位置情報が含まれています',
    gps: '位置情報 (GPS)',
    gpsNone: 'なし',
    camera: 'カメラ',
    lens: 'レンズ',
    date: '撮影日時',
    software: 'ソフトウェア',
    author: '作成者・著作権',
    serial: 'カメラのシリアル番号',
    other: 'その他のメタデータ',
    xmp: 'XMP',
    iptc: 'IPTC',
    comment: 'コメント',
    text: 'テキスト・日時チャンク',
    none: '見つかりませんでした',
    rotated: 'EXIF の向き情報で回転表示されています({o})。',
    cantRead: 'この形式のメタデータはここでは一覧表示できません。削除すると JPEG として保存し直すため、メタデータは残りません。',
    damaged: 'ファイルが破損しているようです。可能であればブラウザで保存し直します。',
    clean: '位置情報などを削除',
    cleaning: '削除中…',
    zip: 'ZIP でまとめてダウンロード({n})',
    cleanedN: '{n} 件の処理済みファイルをダウンロードできます。',
    zipping: 'ZIP を作成中…',
    clear: 'リストをクリア',
    remove: '{name} をリストから外す',
    download: 'ダウンロード',
    lossless: '画質を変えずに削除しました(画像データはそのままです)。',
    reencodedRotated: '向きを保つため JPEG(画質 95%)で保存し直しました。向き情報だけを無劣化で消すと写真が横向きになってしまうためです。',
    reencodedRotatedPng: '向きを保つため PNG で保存し直しました。',
    reencoded: 'この形式は無劣化で処理できないため、JPEG(画質 95%)で保存し直しました。',
    downscaled: 'スマートフォンのブラウザで扱える 1600 万画素以内に収めるため、{w} × {h} に縮小しました。',
    unsupported: '非対応: このブラウザではこの形式のファイルを開けません。JPEG・PNG・WebP をお試しください。',
    notImage: '画像ファイルではありません。',
    hint: 'JPEG と PNG は再圧縮せずに処理します。GPS を含む EXIF、XMP、IPTC、コメントなどのメタデータだけを取り除き、カラープロファイルは残します。一部のスマートフォンの JPEG に含まれる HDR ゲインマップやモーションフォトの動画も取り除かれます。',
  },
};

const fmt = (str, vars) => str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k]));
const sizeLabel = (n) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`);

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

/** Decodes a file upright (EXIF orientation applied). */
async function decode(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      /* fall back to an <img>, which also applies the orientation */
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      URL.revokeObjectURL(url);
      resolve(im);
    };
    im.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('decode'));
    };
    im.src = url;
  });
}

/** Re-encodes through a canvas (which writes no metadata), capped at 16 MP. */
async function reencode(file, type) {
  const img = await decode(file);
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const fit = fitPixels(w, h);
  const c = document.createElement('canvas');
  c.width = fit.width;
  c.height = fit.height;
  const ctx = c.getContext('2d');
  if (type === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, fit.width, fit.height);
  }
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, fit.width, fit.height);
  if ('close' in img) img.close();
  const blob = await new Promise((resolve) => c.toBlob(resolve, type, 0.95));
  c.width = c.height = 0;
  if (!blob) throw new Error('encode');
  return { blob, fit };
}

const baseName = (name) => name.replace(/\.[^.]+$/, '') || 'photo';
const extOf = (name) => (/\.([^.]+)$/.exec(name)?.[1] || '').toLowerCase();

/** Cleans one item: lossless where possible, a re-encode where the format or orientation requires it. */
async function cleanItem(item) {
  const { file, bytes, meta } = item;
  const format = meta?.format;
  const rotated = meta && meta.orientation !== 1;
  const ext = extOf(file.name);
  try {
    if (format === 'jpeg' && !rotated) {
      const out = stripJpegMetadata(bytes);
      return { how: 'lossless', blob: new Blob([out], { type: 'image/jpeg' }), name: `${baseName(file.name)}-clean.${ext === 'jpeg' ? 'jpeg' : 'jpg'}` };
    }
    if (format === 'png' && !rotated) {
      const out = stripPngMetadata(bytes);
      return { how: 'lossless', blob: new Blob([out], { type: 'image/png' }), name: `${baseName(file.name)}-clean.png` };
    }
  } catch {
    /* damaged file: try the browser below */
  }
  const png = format === 'png';
  try {
    const { blob, fit } = await reencode(file, png ? 'image/png' : 'image/jpeg');
    return {
      how: rotated ? (png ? 'reencodedRotatedPng' : 'reencodedRotated') : 'reencoded',
      blob,
      fit,
      name: `${baseName(file.name)}-clean.${png ? 'png' : 'jpg'}`,
    };
  } catch {
    return { how: 'unsupported' };
  }
}

function MetaTable({ meta, t }) {
  const camera = meta.model && meta.make && !meta.model.toLowerCase().startsWith(meta.make.toLowerCase().split(' ')[0]) ? `${meta.make} ${meta.model}` : meta.model || meta.make;
  const other = [meta.hasXmp && t.xmp, meta.hasIptc && t.iptc, meta.hasComment && t.comment, meta.hasText && t.text].filter(Boolean).join(', ');
  const rows = [
    [t.gps, meta.gps ? `${meta.gps.lat.toFixed(3)}, ${meta.gps.lon.toFixed(3)}` : t.gpsNone, !!meta.gps],
    [t.camera, camera || '—'],
    meta.lens && [t.lens, meta.lens],
    [t.date, formatExifDate(meta.dateTime) || '—'],
    [t.software, meta.software || '—'],
    (meta.artist || meta.copyright) && [t.author, [meta.artist, meta.copyright].filter(Boolean).join(' · ')],
    meta.serial && [t.serial, meta.serial],
    [t.other, other || '—'],
  ].filter(Boolean);
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
      <tbody>
        {rows.map(([k, v, flag]) => (
          <tr key={k} style={{ borderTop: '1px solid #1f2226' }}>
            <th scope="row" style={{ textAlign: 'left', fontWeight: 500, color: '#8a8f97', padding: '7px 10px 7px 0', width: '40%', verticalAlign: 'top' }}>{k}</th>
            <td style={{ padding: '7px 0', color: flag ? '#ff8a8f' : '#d6d9de', fontWeight: flag ? 700 : 400, wordBreak: 'break-word' }}>{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

let nextId = 1;

export function ExifTool({ config = {} }) {
  const { locale, num } = useToolText();
  const t = T[locale] || T.en;
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [drag, setDrag] = useState(false);
  const input = useRef(null);

  async function load(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const loaded = [];
    for (const file of files.slice(0, config.maxFiles || 50)) {
      const item = { id: nextId++, file, bytes: null, meta: null, error: '', out: null };
      if (file.type && !file.type.startsWith('image/') && !/\.(hei[cf]|avif)$/i.test(file.name)) item.error = 'notImage';
      else {
        item.bytes = new Uint8Array(await file.arrayBuffer());
        try {
          item.meta = readMetadata(item.bytes);
          if (!item.meta.format) item.error = 'cantRead';
        } catch {
          item.error = 'damaged';
        }
        if (item.meta && item.meta.format === 'heif') item.error = 'cantRead';
      }
      loaded.push(item);
    }
    setItems((prev) => [...prev, ...loaded]);
  }

  async function cleanAll() {
    setBusy(true);
    try {
      const done = [];
      for (const item of items) done.push(item.out || item.error === 'notImage' ? item : { ...item, out: await cleanItem(item) });
      setItems(done);
    } finally {
      setBusy(false);
    }
  }

  const cleaned = items.filter((i) => i.out?.blob);
  async function saveZip() {
    setZipping(true);
    try {
      const used = new Set();
      const files = [];
      for (const i of cleaned) {
        let name = i.out.name;
        for (let n = 2; used.has(name); n++) name = i.out.name.replace(/(\.[^.]+)$/, `-${n}$1`);
        used.add(name);
        files.push({ name, data: new Uint8Array(await i.out.blob.arrayBuffer()) });
      }
      saveBlob(new Blob([makeZip(files)], { type: 'application/zip' }), 'photos-clean.zip');
    } finally {
      setZipping(false);
    }
  }

  const withGps = items.filter((i) => i.meta?.gps).length;
  const pending = items.some((i) => !i.out && i.error !== 'notImage');

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
          load(e.dataTransfer.files);
        }}
      >
        <strong style={{ color: '#f6f5f1' }}>{items.length ? t.chooseMore : t.choose}</strong>
        <span>{t.local}</span>
        <input
          ref={input}
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          hidden
          onChange={(e) => {
            load(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {items.length > 0 && (
        <>
          <p aria-live="polite" style={{ margin: 0, fontSize: 15, fontWeight: 600, color: withGps ? '#ff8a8f' : '#dcff2e' }}>
            {fmt(withGps ? t.summary : t.summaryNone, { n: num(items.length), g: num(withGps) })}
          </p>
          <div className={s.row}>
            <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={cleanAll} disabled={busy || !pending}>
              {busy ? t.cleaning : t.clean}
            </button>
            {cleaned.length > 1 && (
              <button type="button" className={s.btn} onClick={saveZip} disabled={zipping}>
                {zipping ? t.zipping : fmt(t.zip, { n: cleaned.length })}
              </button>
            )}
            <button type="button" className={s.btn} onClick={() => setItems([])}>
              {t.clear}
            </button>
          </div>
          <p className={s.hint} aria-live="polite" style={{ margin: 0 }}>
            {cleaned.length > 0 && fmt(t.cleanedN, { n: num(cleaned.length) })}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map((item) => {
              const { meta, out } = item;
              return (
                <div key={item.id} style={{ padding: 14, borderRadius: 14, background: '#0f1012', border: `1px solid ${meta?.gps ? '#5a2329' : '#1f2226'}`, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ color: '#f6f5f1', wordBreak: 'break-all' }}>{item.file.name}</strong>
                      <span style={{ display: 'block', fontSize: 12, color: '#6b7079' }}>
                        {sizeLabel(item.file.size)}
                        {meta?.format ? ` · ${meta.format.toUpperCase()}` : ''}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={s.copy}
                      aria-label={fmt(t.remove, { name: item.file.name })}
                      onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                    >
                      ✕
                    </button>
                  </div>
                  {meta?.gps && (
                    <p style={{ margin: 0, padding: '8px 10px', borderRadius: 10, background: '#2a1215', color: '#ff8a8f', fontSize: 14, fontWeight: 600 }}>
                      📍 {t.gpsFlag}
                    </p>
                  )}
                  {item.error ? (
                    <p className={s.hint} style={item.error === 'notImage' ? { color: '#ff8a8f' } : undefined}>{t[item.error]}</p>
                  ) : (
                    meta && (
                      <>
                        {hasAnyMetadata(meta) ? <MetaTable meta={meta} t={t} /> : <p className={`${s.hint} ${s.good}`}>{t.none}</p>}
                        {meta.orientation !== 1 && <p className={s.hint}>{fmt(t.rotated, { o: meta.orientation })}</p>}
                      </>
                    )
                  )}
                  {out && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
                      <p className={`${s.hint} ${out.how === 'unsupported' ? s.over : out.how === 'lossless' ? s.good : ''}`} style={{ flex: '1 1 200px' }}>
                        {t[out.how]}
                        {out.fit?.downscaled ? ` ${fmt(t.downscaled, { w: out.fit.width, h: out.fit.height })}` : ''}
                      </p>
                      {out.blob && (
                        <button type="button" className={s.btn} onClick={() => saveBlob(out.blob, out.name)}>
                          {t.download} · {sizeLabel(out.blob.size)}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
      <p className={s.hint}>{t.hint}</p>
    </div>
  );
}
