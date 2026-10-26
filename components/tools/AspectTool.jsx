'use client';

import { useRef, useState } from 'react';
import s from './tools.module.css';
import CopyButton, { Chips } from './CopyButton';
import { useToolText } from './locale';
import { RATIO_CHIPS, SOCIAL_SIZES, parseRatio, ratioFromSize, solveSide } from '@/lib/tools/aspect';

const T = {
  en: {
    modeRatio: 'Find the ratio',
    modeSize: 'Calculate a size',
    mode: 'Mode',
    width: 'Width',
    height: 'Height',
    px: 'px',
    swap: 'Swap width and height',
    swapShort: 'Swap ⇄',
    enterBoth: 'Enter a width and a height to see the aspect ratio.',
    ratio: 'Aspect ratio',
    decimal: 'Decimal',
    nearest: 'Closest common ratio',
    matches: 'matches',
    off: '{pct}% off',
    orientation: 'Orientation',
    landscape: 'Landscape',
    portrait: 'Portrait',
    square: 'Square',
    pickRatio: 'Ratio',
    custom: 'Custom',
    customRatio: 'Custom ratio (for example 2.35:1)',
    badRatio: 'Type a ratio like 16:9 or 1.91:1.',
    locked: 'Locked',
    computed: 'Calculated',
    lockSwap: 'Switch which side is locked',
    enterSide: 'Enter the side you know.',
    result: 'Size',
    rounded: 'Rounded to whole pixels (exactly {raw} px).',
    tableTitle: 'Recommended sizes for social media',
    tablePlatform: 'Platform',
    tableSize: 'Size (px)',
    tableRatio: 'Ratio',
    tableHint: 'Tap a size to check it above. Recommended sizes at the time of writing; platforms change them now and then.',
    fill: 'Use {w} × {h}',
    names: {
      square: 'square', portraitFeed: 'portrait feed post', portrait: 'portrait', pin: 'Pinterest pin', vertical: 'vertical video, Stories',
      print: 'print', classic: 'classic screen', photo: 'camera photo', laptop: 'laptop screen', widescreen: 'widescreen video',
      link: 'link preview, landscape post', banner: 'banner', ultrawide: 'ultrawide', header: 'header banner',
    },
    uses: {
      feedPortrait: 'Feed post, portrait', feedSquare: 'Feed post, square', feedLandscape: 'Feed post, landscape', storiesReels: 'Stories & Reels',
      video: 'Video', thumbnail: 'Thumbnail', shorts: 'Shorts', image: 'Image post', post: 'Post', postSquare: 'Post, square',
      postPortrait: 'Post, portrait', postLandscape: 'Post, landscape (link)', pin: 'Pin',
    },
  },
  ja: {
    modeRatio: '比率を調べる',
    modeSize: 'サイズを計算',
    mode: 'モード',
    width: '幅',
    height: '高さ',
    px: 'px',
    swap: '幅と高さを入れ替える',
    swapShort: '入れ替え ⇄',
    enterBoth: '幅と高さを入力すると縦横比が表示されます。',
    ratio: '縦横比',
    decimal: '小数',
    nearest: '近い一般的な比率',
    matches: '一致',
    off: '{pct}% のずれ',
    orientation: '向き',
    landscape: '横長',
    portrait: '縦長',
    square: '正方形',
    pickRatio: '比率',
    custom: 'カスタム',
    customRatio: 'カスタム比率(例: 2.35:1)',
    badRatio: '16:9 や 1.91:1 のように入力してください。',
    locked: '固定',
    computed: '計算結果',
    lockSwap: '固定する辺を切り替える',
    enterSide: '分かっている辺の長さを入力してください。',
    result: 'サイズ',
    rounded: '整数のピクセルに丸めています(正確には {raw} px)。',
    tableTitle: 'SNS の推奨サイズ',
    tablePlatform: 'サービス',
    tableSize: 'サイズ(px)',
    tableRatio: '比率',
    tableHint: 'サイズをタップすると上で確認できます。執筆時点の推奨サイズです。各サービスの仕様は変わることがあります。',
    fill: '{w} × {h} を使う',
    names: {
      square: '正方形', portraitFeed: '縦長フィード投稿', portrait: '縦長', pin: 'Pinterest ピン', vertical: '縦型動画・ストーリーズ',
      print: 'プリント', classic: '従来の画面', photo: 'カメラ写真', laptop: 'ノートPC画面', widescreen: 'ワイド動画',
      link: 'リンクプレビュー・横長投稿', banner: 'バナー', ultrawide: 'ウルトラワイド', header: 'ヘッダー',
    },
    uses: {
      feedPortrait: 'フィード投稿(縦長)', feedSquare: 'フィード投稿(正方形)', feedLandscape: 'フィード投稿(横長)', storiesReels: 'ストーリーズ・リール',
      video: '動画', thumbnail: 'サムネイル', shorts: 'ショート', image: '画像投稿', post: '投稿', postSquare: '投稿(正方形)',
      postPortrait: '投稿(縦長)', postLandscape: '投稿(横長・リンク)', pin: 'ピン',
    },
  },
};

const fmt = (str, vars) => str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k]));
const toNum = (v) => {
  const n = Number(String(v).replace(/[,\s]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

function NumberField({ label, value, onChange, readOnly, badge }) {
  return (
    <label className={s.label} style={{ flex: '1 1 130px' }}>
      <span>
        {label}
        {badge && <span style={{ marginLeft: 6, fontSize: 11, color: '#8a8f97' }}>· {badge}</span>}
      </span>
      <input
        className={s.input}
        type="number"
        inputMode="numeric"
        min={1}
        step={1}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        style={readOnly ? { color: '#dcff2e', borderStyle: 'dashed' } : undefined}
      />
    </label>
  );
}

export function AspectTool({ config = {} }) {
  const { locale, num } = useToolText();
  const t = T[locale] || T.en;
  const [mode, setMode] = useState(config.mode === 'size' ? 'size' : 'ratio');
  const [w, setW] = useState('1920');
  const [h, setH] = useState('1080');
  const [chip, setChip] = useState('16:9');
  const [custom, setCustom] = useState('2.35:1');
  const [locked, setLocked] = useState('width');
  const [side, setSide] = useState('1080');
  const results = useRef(null);

  const info = ratioFromSize(toNum(w), toNum(h));
  const ratio = parseRatio(chip === 'custom' ? custom : chip);
  const known = toNum(side);
  const solved = solveSide(ratio, locked === 'width' ? { width: known } : { height: known });
  const raw = ratio && known ? (locked === 'width' ? (known * ratio.h) / ratio.w : (known * ratio.w) / ratio.h) : 0;

  function pickSize(row) {
    setMode('ratio');
    setW(String(row.w));
    setH(String(row.h));
    requestAnimationFrame(() => results.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  }

  return (
    <div className={s.widget}>
      <Chips options={[{ id: 'ratio', label: t.modeRatio }, { id: 'size', label: t.modeSize }]} value={mode} onChange={setMode} label={t.mode} />

      {mode === 'ratio' ? (
        <>
          <div className={s.row} style={{ alignItems: 'flex-end' }}>
            <NumberField label={`${t.width} (${t.px})`} value={w} onChange={setW} />
            <NumberField label={`${t.height} (${t.px})`} value={h} onChange={setH} />
            <button type="button" className={s.btn} aria-label={t.swap} onClick={() => { setW(h); setH(w); }}>
              {t.swapShort}
            </button>
          </div>
          <div ref={results} aria-live="polite">
            {info ? (
              <div className={s.stats}>
                <div className={s.stat}>
                  <div className={s.statNum}>{info.label}</div>
                  <div className={s.statLabel}>{t.ratio}</div>
                </div>
                <div className={s.stat}>
                  <div className={s.statNum}>{num(Math.round(info.decimal * 1000) / 1000)}</div>
                  <div className={s.statLabel}>{t.decimal} ({t.width} ÷ {t.height})</div>
                </div>
                {info.nearest && (
                  <div className={s.stat}>
                    <div className={s.statNum}>
                      {info.nearest.exact ? '' : '≈ '}
                      {info.nearest.id}
                    </div>
                    <div className={s.statLabel}>
                      {t.nearest}: {t.names[info.nearest.key]} ·{' '}
                      <span className={info.nearest.exact ? s.good : undefined}>
                        {info.nearest.exact ? t.matches : fmt(t.off, { pct: num(Math.round(Math.abs(info.nearest.off) * 1000) / 10) })}
                      </span>
                    </div>
                  </div>
                )}
                <div className={s.stat}>
                  <div className={s.statNum}>{t[info.orientation]}</div>
                  <div className={s.statLabel}>{t.orientation}</div>
                </div>
              </div>
            ) : (
              <p className={s.hint}>{t.enterBoth}</p>
            )}
          </div>
        </>
      ) : (
        <>
          <Chips options={[...RATIO_CHIPS.map((id) => ({ id, label: id })), { id: 'custom', label: t.custom }]} value={chip} onChange={setChip} label={t.pickRatio} />
          {chip === 'custom' && (
            <label className={s.label}>
              {t.customRatio}
              <input className={s.input} value={custom} onChange={(e) => setCustom(e.target.value)} inputMode="decimal" placeholder="2.35:1" />
            </label>
          )}
          {chip === 'custom' && !ratio && <p className={`${s.hint} ${s.over}`}>{t.badRatio}</p>}
          <div className={s.row} style={{ alignItems: 'flex-end' }}>
            {locked === 'width' ? (
              <>
                <NumberField label={`${t.width} (${t.px})`} badge={`🔒 ${t.locked}`} value={side} onChange={setSide} />
                <NumberField label={`${t.height} (${t.px})`} badge={t.computed} value={solved ? solved.height : ''} readOnly />
              </>
            ) : (
              <>
                <NumberField label={`${t.width} (${t.px})`} badge={t.computed} value={solved ? solved.width : ''} readOnly />
                <NumberField label={`${t.height} (${t.px})`} badge={`🔒 ${t.locked}`} value={side} onChange={setSide} />
              </>
            )}
            <button
              type="button"
              className={s.btn}
              aria-label={t.lockSwap}
              title={t.lockSwap}
              onClick={() => setLocked(locked === 'width' ? 'height' : 'width')}
            >
              🔒 ⇄
            </button>
          </div>
          <div aria-live="polite">
            {solved ? (
              <>
                <div className={s.result}>
                  <span className={s.resultText}>
                    <span className={s.resultMeta}>
                      {t.result} · {chip === 'custom' ? custom : chip}
                    </span>
                    {solved.width} × {solved.height}
                  </span>
                  <CopyButton text={`${solved.width}x${solved.height}`} />
                </div>
                {!solved.exact && <p className={s.hint} style={{ marginTop: 8 }}>{fmt(t.rounded, { raw: num(Math.round(raw * 100) / 100) })}</p>}
              </>
            ) : (
              ratio && <p className={s.hint}>{t.enterSide}</p>
            )}
          </div>
        </>
      )}

      <div>
        <h3 style={{ margin: '4px 0 10px', fontSize: 16, color: '#f6f5f1' }}>{t.tableTitle}</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, color: '#d6d9de' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#8a8f97', fontSize: 12 }}>
                <th style={{ padding: '6px 8px 6px 0', fontWeight: 500 }}>{t.tablePlatform}</th>
                <th style={{ padding: '6px 8px', fontWeight: 500 }}>{t.tableSize}</th>
                <th style={{ padding: '6px 0 6px 8px', fontWeight: 500 }}>{t.tableRatio}</th>
              </tr>
            </thead>
            <tbody>
              {SOCIAL_SIZES.map((row) => {
                const active = mode === 'ratio' && toNum(w) === row.w && toNum(h) === row.h;
                return (
                  <tr key={row.id} style={{ borderTop: '1px solid #1f2226' }}>
                    <td style={{ padding: '8px 8px 8px 0' }}>
                      <strong style={{ color: '#f6f5f1', fontWeight: 600 }}>{row.platform}</strong>
                      <span style={{ display: 'block', fontSize: 12, color: '#8a8f97' }}>{t.uses[row.use]}</span>
                    </td>
                    <td style={{ padding: '8px' }}>
                      <button
                        type="button"
                        className={s.chip}
                        aria-pressed={active}
                        aria-label={fmt(t.fill, { w: row.w, h: row.h })}
                        onClick={() => pickSize(row)}
                        style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
                      >
                        {row.w} × {row.h}
                      </button>
                    </td>
                    <td style={{ padding: '8px 0 8px 8px', whiteSpace: 'nowrap' }}>{row.ratio}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className={s.hint} style={{ marginTop: 10 }}>{t.tableHint}</p>
      </div>
    </div>
  );
}
