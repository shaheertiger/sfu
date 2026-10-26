'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import s from './tools.module.css';
import { useToolText } from './locale';
import {
  MAX_ITEMS,
  MAX_TIERS,
  POOL,
  addItem,
  addTier,
  createTierList,
  findItem,
  itemCount,
  moveItem,
  moveTier,
  nudgeItem,
  parseTierList,
  removeItem,
  removeTier,
  renameTier,
  serializeTierList,
  setTierColor,
  setTitle,
  textColorFor,
} from '@/lib/tools/tierlist';

const T = {
  en: {
    heading: 'Tier list',
    title: 'Title',
    titlePlaceholder: 'e.g. Best convenience store snacks',
    tierName: 'Tier name',
    pool: 'Unranked',
    poolEmpty: 'Add text or images below, then drag them into a tier.',
    addText: 'Add text',
    textPlaceholder: 'Type an item and press Enter',
    addImages: 'Add images',
    save: 'Save as image',
    editTiers: 'Edit tiers',
    done: 'Done',
    addTier: 'Add tier',
    color: 'Colour',
    up: 'Move tier up',
    down: 'Move tier down',
    removeTier: 'Remove tier',
    reset: 'Reset',
    resetConfirm: 'Tap again to clear everything',
    selected: (n) => `Selected: ${n}. Tap a tier or “Move here” to place it.`,
    moveHere: 'Move here',
    moveTo: (n) => `Move to ${n}`,
    left: 'Move left',
    right: 'Move right',
    remove: 'Remove',
    cancel: 'Cancel',
    image: 'Image',
    itemLabel: (n, where) => `${n}, in ${where}`,
    help: 'Drag items with a finger or mouse, or tap an item and then tap where it goes. Your list is saved in this browser only; images never leave your device.',
    exportNote: 'The image shows the tiers; unranked items are left out.',
    badImages: (n) => `${n} file(s) could not be opened as images.`,
    full: `That is the limit of ${MAX_ITEMS} items.`,
    storageFull: 'This browser is out of space to save the list. Fewer images will help.',
  },
  ja: {
    heading: 'ティア表',
    title: 'タイトル',
    titlePlaceholder: '例：コンビニおやつランキング',
    tierName: 'ティア名',
    pool: '未分類',
    poolEmpty: '下からテキストや画像を追加して、ティアへドラッグしてください。',
    addText: 'テキストを追加',
    textPlaceholder: '項目を入力してEnter',
    addImages: '画像を追加',
    save: '画像として保存',
    editTiers: 'ティアを編集',
    done: '完了',
    addTier: 'ティアを追加',
    color: '色',
    up: 'ティアを上へ',
    down: 'ティアを下へ',
    removeTier: 'ティアを削除',
    reset: 'リセット',
    resetConfirm: 'もう一度タップですべて消去',
    selected: (n) => `選択中：${n}。移動先のティアか「ここへ移動」をタップしてください。`,
    moveHere: 'ここへ移動',
    moveTo: (n) => `${n}へ移動`,
    left: '左へ',
    right: '右へ',
    remove: '削除',
    cancel: 'キャンセル',
    image: '画像',
    itemLabel: (n, where) => `${n}（${where}）`,
    help: '指やマウスでドラッグするか、項目をタップしてから移動先をタップします。データはこのブラウザ内にだけ保存され、画像が外部に送られることはありません。',
    exportNote: '保存される画像にはティアのみが入り、未分類の項目は含まれません。',
    badImages: (n) => `${n}件のファイルを画像として開けませんでした。`,
    full: `項目は${MAX_ITEMS}個までです。`,
    storageFull: 'ブラウザの保存容量が足りません。画像を減らしてください。',
  },
};

const THUMB = 160;
const TILE = 64;
const FONT = 'system-ui, -apple-system, "Hiragino Sans", "Noto Sans JP", sans-serif';

/** Reads an image file into a square, centre-cropped thumbnail data URL. */
function thumbnail(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      const side = Math.min(im.width, im.height);
      const c = document.createElement('canvas');
      c.width = c.height = THUMB;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(im, (im.width - side) / 2, (im.height - side) / 2, side, side, 0, 0, THUMB, THUMB);
      URL.revokeObjectURL(url);
      resolve(/png|gif|webp/.test(file.type) ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.85));
    };
    im.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    im.src = url;
  });
}

const loadImage = (src) => new Promise((resolve) => { const im = new Image(); im.onload = () => resolve(im); im.onerror = () => resolve(null); im.src = src; });

/** Splits text into at most `max` lines of `width`, adding an ellipsis when it runs over. */
function wrap(ctx, text, width, max) {
  const lines = [];
  let line = '';
  for (const ch of Array.from(text)) {
    if (ctx.measureText(line + ch).width > width && line) {
      lines.push(line);
      line = ch.trim() ? ch : '';
      if (lines.length === max) break;
    } else line += ch;
  }
  if (lines.length < max && line) lines.push(line);
  else if (lines.length === max) lines[max - 1] = lines[max - 1].slice(0, -1) + '…';
  return lines;
}

/** Draws the tiers (not the pool) onto a canvas: title, coloured label cells and item tiles. */
async function renderPng(state) {
  const W = 1200, LW = 160, TS = 120, G = 8, TOP = state.title.trim() ? 84 : 0;
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  const images = new Map();
  for (const t of state.tiers) for (const it of t.items) if (it.type === 'image') images.set(it.id, await loadImage(it.src));
  ctx.font = `600 22px ${FONT}`;
  const area = W - LW - G * 2;
  const rows = state.tiers.map((t) => {
    let x = 0, y = 0;
    const placed = t.items.map((it) => {
      const w = it.type === 'image' ? TS : Math.min(360, Math.max(TS, ctx.measureText(it.text).width + 28));
      if (x + w > area && x > 0) { x = 0; y += TS + G; }
      const p = { it, x, y, w };
      x += w + G;
      return p;
    });
    return { t, placed, h: Math.max(TS + G * 2, y + TS + G * 2) };
  });
  const H = TOP + rows.reduce((n, r) => n + r.h + 2, 0) + 2;
  const k = Math.min(1, Math.sqrt(16e6 / (W * H)));
  c.width = Math.round(W * k);
  c.height = Math.round(H * k);
  ctx.scale(k, k);
  ctx.fillStyle = '#111214';
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  if (TOP) {
    ctx.fillStyle = '#f6f5f1';
    ctx.font = `700 40px ${FONT}`;
    ctx.fillText(wrap(ctx, state.title.trim(), W - 48, 1)[0], W / 2, TOP / 2 + 2);
  }
  let y = TOP + 2;
  for (const { t, placed, h } of rows) {
    ctx.fillStyle = t.color;
    ctx.fillRect(0, y, LW, h);
    ctx.fillStyle = '#1a1c20';
    ctx.fillRect(LW + 2, y, W - LW - 2, h);
    ctx.fillStyle = textColorFor(t.color);
    let size = 44;
    ctx.font = `700 ${size}px ${FONT}`;
    while (size > 18 && ctx.measureText(t.label).width > (LW - 20) * 2.5) ctx.font = `700 ${(size -= 2)}px ${FONT}`;
    const lines = wrap(ctx, t.label, LW - 20, 3);
    lines.forEach((ln, i) => ctx.fillText(ln, LW / 2, y + h / 2 + (i - (lines.length - 1) / 2) * size * 1.15));
    for (const p of placed) {
      const x = LW + 2 + G + p.x, iy = y + G + p.y;
      const im = images.get(p.it.id);
      if (im) ctx.drawImage(im, x, iy, TS, TS);
      else {
        ctx.fillStyle = '#2b2f36';
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(x, iy, p.w, TS, 12);
          ctx.fill();
        } else ctx.fillRect(x, iy, p.w, TS);
        ctx.fillStyle = '#f6f5f1';
        ctx.font = `600 22px ${FONT}`;
        const tl = wrap(ctx, p.it.text, p.w - 24, 4);
        tl.forEach((ln, i) => ctx.fillText(ln, x + p.w / 2, iy + TS / 2 + (i - (tl.length - 1) / 2) * 26));
      }
    }
    y += h + 2;
  }
  return c;
}

const itemName = (it, tx) => (it.type === 'text' ? it.text : it.text || tx.image);

export function TierListTool({ config = {} }) {
  const { locale } = useToolText();
  const tx = T[locale] || T.en;
  const key = config.storageKey || 'sfu-tierlist-v1';
  const [state, setState] = useState(() => createTierList());
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [drag, setDrag] = useState(null); // { id, listId, index } while dragging
  const dragRef = useRef(null);
  const lastDrag = useRef(0); // when the last drag ended, so its trailing click doesn't select
  const ghost = useRef(null);
  const fileInput = useRef(null);
  const update = (fn) => setState((st) => fn(st));

  useEffect(() => {
    try {
      const saved = parseTierList(localStorage.getItem(key) || '');
      if (saved) setState(saved);
    } catch {}
    setLoaded(true);
  }, [key]);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(key, serializeTierList(state));
    } catch {
      setMsg(tx.storageFull);
    }
  }, [state, loaded, key, tx.storageFull]);

  const lists = [...state.tiers.map((t) => ({ id: t.id, name: t.label || '—', items: t.items, tier: t })), { id: POOL, name: tx.pool, items: state.pool }];
  const sel = selected && findItem(state, selected);
  const listName = (id) => lists.find((l) => l.id === id)?.name || '';

  function place(listId, index) {
    if (!sel) return;
    update((st) => moveItem(st, sel.item.id, listId, index));
    setSelected(null);
  }

  /* Pointer dragging: works for mouse, pen and touch. A short move is a tap (select). */
  function onPointerDown(e, it) {
    lastDrag.current = 0;
    if (e.button !== 0) return;
    dragRef.current = { id: it.id, x: e.clientX, y: e.clientY, active: false, target: null, w: e.currentTarget.offsetWidth };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function hitTest(x, y, id) {
    const el = document.elementFromPoint(x, y)?.closest('[data-list]');
    if (!el) return null;
    const items = [...el.querySelectorAll('[data-item]')].filter((n) => n.getAttribute('data-item') !== id);
    let index = items.length;
    for (let i = 0; i < items.length; i++) {
      const r = items[i].getBoundingClientRect();
      if (y < r.top || (y <= r.bottom && x < r.left + r.width / 2)) { index = i; break; }
    }
    return { listId: el.getAttribute('data-list'), index };
  }
  function onPointerMove(e) {
    const d = dragRef.current;
    if (!d) return;
    if (!d.active) {
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 6) return;
      d.active = true;
      setSelected(null);
    }
    d.px = e.clientX;
    d.py = e.clientY;
    if (ghost.current) ghost.current.style.transform = `translate(${e.clientX - d.w / 2}px, ${e.clientY - TILE / 2}px)`;
    if (e.clientY < 48) window.scrollBy(0, -12);
    else if (e.clientY > window.innerHeight - 48) window.scrollBy(0, 12);
    const target = hitTest(e.clientX, e.clientY, d.id);
    if (target?.listId !== d.target?.listId || target?.index !== d.target?.index) {
      d.target = target;
      setDrag({ id: d.id, ...(target || {}) });
    } else if (!drag) setDrag({ id: d.id });
  }
  function onPointerUp() {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d?.active) return;
    if (d.target) update((st) => moveItem(st, d.id, d.target.listId, d.target.index));
    setDrag(null);
    lastDrag.current = Date.now();
  }
  useLayoutEffect(() => {
    const d = dragRef.current;
    if (drag && ghost.current && d) ghost.current.style.transform = `translate(${(d.px ?? d.x) - d.w / 2}px, ${(d.py ?? d.y) - TILE / 2}px)`;
  }, [drag]);

  async function addImages(files) {
    setMsg('');
    let bad = 0;
    for (const f of files) {
      const src = f.type.startsWith('image/') ? await thumbnail(f) : null;
      if (!src) bad++;
      else update((st) => addItem(st, { src, text: f.name.replace(/\.[^.]+$/, '') }));
    }
    if (bad) setMsg(tx.badImages(bad));
  }

  async function exportPng() {
    const c = await renderPng(state);
    const name = (state.title.trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 60) || 'tier-list') + '.png';
    c.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  }

  function renderItem(it, list) {
    let shadow;
    if (drag && drag.listId === list.id && drag.id !== it.id) {
      const others = list.items.filter((x) => x.id !== drag.id);
      const pos = others.indexOf(it);
      if (drag.index === pos) shadow = '-4px 0 0 #dcff2e';
      else if (drag.index === others.length && pos === others.length - 1) shadow = '4px 0 0 #dcff2e';
    }
    const isSel = selected === it.id;
    const base = { height: TILE, minWidth: TILE, borderRadius: 10, border: isSel ? '2px solid #dcff2e' : '1px solid #2a2e34', padding: 0, cursor: 'grab', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', boxShadow: shadow, opacity: drag?.id === it.id ? 0.35 : 1, overflow: 'hidden', flex: 'none' };
    return (
      <button
        key={it.id}
        type="button"
        data-item={it.id}
        aria-pressed={isSel}
        aria-label={tx.itemLabel(itemName(it, tx), list.name)}
        onPointerDown={(e) => onPointerDown(e, it)}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { dragRef.current = null; setDrag(null); }}
        onClick={() => {
          if (Date.now() - lastDrag.current < 400) return;
          setSelected(isSel ? null : it.id);
        }}
        style={it.type === 'image' ? { ...base, width: TILE, background: '#0c0d0f' } : { ...base, maxWidth: 200, padding: '0 12px', background: '#2b2f36', color: '#f6f5f1', font: 'inherit', fontSize: 14, fontWeight: 600, lineHeight: 1.2, overflowWrap: 'anywhere' }}
      >
        {it.type === 'image' ? <img src={it.src} alt="" draggable={false} width={TILE} height={TILE} style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} /> : it.text}
      </button>
    );
  }

  function renderCell(list) {
    const hot = drag?.listId === list.id;
    return (
      <div
        data-list={list.id}
        onClick={(e) => e.target === e.currentTarget && sel && place(list.id)}
        style={{ flex: 1, minWidth: 0, minHeight: TILE + 8, display: 'flex', flexWrap: 'wrap', gap: 4, padding: 4, alignContent: 'flex-start', background: hot ? '#22262c' : '#1a1c20', outline: hot ? '2px solid #dcff2e' : 'none', outlineOffset: -2 }}
      >
        {list.items.map((it) => renderItem(it, list))}
        {list.id === POOL && !list.items.length && !sel && <p className={s.hint} style={{ padding: 8 }}>{tx.poolEmpty}</p>}
        {sel && (
          <button type="button" className={s.chip} onClick={() => place(list.id)} aria-label={tx.moveTo(list.name)} style={{ height: TILE, borderStyle: 'dashed', background: 'transparent' }}>
            {tx.moveHere}
          </button>
        )}
      </div>
    );
  }

  const iconBtn = { minHeight: 32, minWidth: 32, padding: '2px 8px', fontSize: 14 };
  const total = itemCount(state);
  return (
    <div className={s.widget}>
      <label className={s.label}>
        {tx.title}
        <input className={s.input} value={state.title} onChange={(e) => update((st) => setTitle(st, e.target.value))} placeholder={tx.titlePlaceholder} maxLength={80} />
      </label>

      <div role="region" aria-label={tx.heading} style={{ display: 'flex', flexDirection: 'column', gap: 2, background: '#0c0d0f', borderRadius: 14, overflow: 'hidden', border: '1px solid #22252a' }}>
        {state.tiers.map((t, ti) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'stretch' }}>
            <div style={{ width: 76, flex: 'none', background: t.color, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, padding: 4 }}>
              <input
                value={t.label}
                onChange={(e) => update((st) => renameTier(st, t.id, e.target.value))}
                aria-label={`${tx.tierName} ${ti + 1}`}
                maxLength={24}
                style={{ width: '100%', background: 'transparent', border: 0, textAlign: 'center', font: 'inherit', fontSize: t.label.length > 3 ? 14 : 22, fontWeight: 800, color: textColorFor(t.color), outline: 'none', padding: 2 }}
              />
              {editing && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                  <input type="color" value={t.color} onChange={(e) => update((st) => setTierColor(st, t.id, e.target.value))} aria-label={`${tx.color}: ${t.label}`} style={{ width: 32, height: 28, padding: 0, border: 0, background: 'none' }} />
                  <button type="button" className={s.btn} style={iconBtn} onClick={() => update((st) => moveTier(st, t.id, -1))} disabled={ti === 0} aria-label={tx.up}>↑</button>
                  <button type="button" className={s.btn} style={iconBtn} onClick={() => update((st) => moveTier(st, t.id, 1))} disabled={ti === state.tiers.length - 1} aria-label={tx.down}>↓</button>
                  <button type="button" className={s.btn} style={iconBtn} onClick={() => update((st) => removeTier(st, t.id))} disabled={state.tiers.length <= 1} aria-label={`${tx.removeTier}: ${t.label}`}>✕</button>
                </div>
              )}
            </div>
            {renderCell(lists[ti])}
          </div>
        ))}
      </div>

      <div className={s.row}>
        <button type="button" className={s.btn} aria-pressed={editing} onClick={() => setEditing((v) => !v)}>{editing ? tx.done : tx.editTiers}</button>
        {editing && <button type="button" className={s.btn} onClick={() => update((st) => addTier(st))} disabled={state.tiers.length >= MAX_TIERS}>+ {tx.addTier}</button>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <strong style={{ fontSize: 14, color: '#d6d9de' }}>{tx.pool}</strong>
        <div style={{ display: 'flex', borderRadius: 14, overflow: 'hidden', border: '1px solid #22252a' }}>{renderCell(lists[lists.length - 1])}</div>
      </div>

      {sel && (
        <div className={s.limit} aria-live="polite" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ flex: '1 1 200px' }}>{tx.selected(itemName(sel.item, tx))}</span>
          <span className={s.row} style={{ gap: 6 }}>
            <button type="button" className={s.btn} style={iconBtn} onClick={() => update((st) => nudgeItem(st, sel.item.id, -1))} disabled={sel.index === 0} aria-label={tx.left}>←</button>
            <button type="button" className={s.btn} style={iconBtn} onClick={() => update((st) => nudgeItem(st, sel.item.id, 1))} disabled={sel.index === lists.find((l) => l.id === sel.listId).items.length - 1} aria-label={tx.right}>→</button>
            <button type="button" className={s.btn} style={iconBtn} onClick={() => { update((st) => removeItem(st, sel.item.id)); setSelected(null); }}>{tx.remove}</button>
            <button type="button" className={s.btn} style={iconBtn} onClick={() => setSelected(null)}>{tx.cancel}</button>
          </span>
        </div>
      )}

      <form
        className={s.row}
        onSubmit={(e) => {
          e.preventDefault();
          if (total >= MAX_ITEMS) return setMsg(tx.full);
          update((st) => addItem(st, { text }));
          setText('');
        }}
      >
        <label className={s.label}>
          {tx.addText}
          <input className={s.input} value={text} onChange={(e) => setText(e.target.value)} placeholder={tx.textPlaceholder} maxLength={60} enterKeyHint="done" />
        </label>
        <button type="submit" className={s.btn} disabled={!text.trim()} style={{ alignSelf: 'flex-end' }}>+</button>
        <button type="button" className={s.btn} onClick={() => fileInput.current?.click()} style={{ alignSelf: 'flex-end' }} disabled={total >= MAX_ITEMS}>{tx.addImages}</button>
        <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(e) => { addImages([...(e.target.files || [])]); e.target.value = ''; }} />
      </form>
      {msg && <p className={`${s.hint} ${s.over}`} aria-live="polite">{msg}</p>}

      <div className={s.row}>
        <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={exportPng}>{tx.save}</button>
        <button
          type="button"
          className={s.btn}
          onClick={() => {
            if (!confirmReset) {
              setConfirmReset(true);
              setTimeout(() => setConfirmReset(false), 4000);
              return;
            }
            setConfirmReset(false);
            setSelected(null);
            setMsg('');
            setState(createTierList());
          }}
        >
          {confirmReset ? tx.resetConfirm : tx.reset}
        </button>
      </div>
      <p className={s.hint}>{tx.exportNote} {tx.help}</p>

      {drag && (() => {
        const it = findItem(state, drag.id)?.item;
        if (!it) return null;
        return (
          <div ref={ghost} aria-hidden="true" style={{ position: 'fixed', left: 0, top: 0, zIndex: 50, pointerEvents: 'none', height: TILE, minWidth: TILE, maxWidth: 200, borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,.5)', background: '#2b2f36', color: '#f6f5f1', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', padding: it.type === 'image' ? 0 : '0 12px' }}>
            {it.type === 'image' ? <img src={it.src} alt="" width={TILE} height={TILE} style={{ display: 'block', objectFit: 'cover' }} /> : it.text}
          </div>
        );
      })()}
    </div>
  );
}
