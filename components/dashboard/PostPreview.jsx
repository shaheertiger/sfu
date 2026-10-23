'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Composer preview that looks like the real thing: Instagram and Facebook feed posts, Reels and
 * Stories, and a clean card for other platforms. Videos autoplay muted and loop; tap to pause,
 * the speaker button unmutes. Formats the browser can't decode (HEVC .mov from iPhones, mostly)
 * get a plain note instead of a black box.
 *
 * Props: account { name, handle, avatar, platform } | null, caption, media [{ kind: 'IMG'|'VIDEO', url }],
 *        format 'Post' | 'Reel' | 'Story', when (e.g. "Sat, Oct 31 5:00 PM").
 */

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const Icon = {
  heart: <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 5.3 3.1 1.7-1.9 3.2-3.1 5.3-3.1 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" />,
  comment: <path d="M20.7 16.2A9 9 0 1 0 17 19.6L21 21l-.3-4.8z" />,
  send: <path d="M22 3 9.2 10.6M22 3l-7 18-4-8.4L3 9.6 22 3z" />,
  save: <path d="M19 21 12 16 5 21V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1z" />,
  like: <path d="M7 10v11H3V10h4zm0 0 4-7c1.7 0 3 1.3 3 3v3h5.5a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 18.3 21H7" />,
  share: <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13" />,
  more: <g><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></g>,
  sound: <path d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z" />,
  muted: <path d="M4 9v6h4l5 4V5L8 9H4zm12 .5 5 5m0-5-5 5" />,
};
const Svg = ({ name, size = 22, fill = 'none', stroke = 'currentColor', sw = 1.9 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={name === 'more' ? 'currentColor' : fill} stroke={name === 'more' ? 'none' : stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{Icon[name]}</svg>
);

function Avatar({ src, name, size = 32, ring = false }) {
  const [broken, setBroken] = useState(false);
  const initial = (name || '?').trim()[0]?.toUpperCase() || '?';
  const inner = src && !broken
    ? <img src={src} alt="" onError={() => setBroken(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block' }} />
    : <span style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#d6d3cc', color: '#3d434d', fontWeight: 700, fontSize: size * 0.42 }}>{initial}</span>;
  return (
    <span style={{ width: size, height: size, flex: 'none', borderRadius: '50%', padding: ring ? 2 : 0, background: ring ? 'linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7)' : 'transparent', display: 'block' }}>
      <span style={{ display: 'block', width: '100%', height: '100%', borderRadius: '50%', border: ring ? '2px solid #fff' : 0, overflow: 'hidden' }}>{inner}</span>
    </span>
  );
}

/** One image or video, filling its box. Videos autoplay muted; tap pauses. */
function Media({ item, fit = 'cover', controlsTop = 10, onFail }) {
  const ref = useRef(null);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [bad, setBad] = useState(false);
  useEffect(() => { setBad(false); setPaused(false); }, [item?.url]);
  if (!item?.url) {
    return <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'linear-gradient(160deg,#9a7a58,#5d4a36)', color: '#f3e9d8', font: "600 12px 'Geist Mono', monospace" }}>{item?.kind === 'VIDEO' ? '▶ VIDEO' : 'IMAGE'}</div>;
  }
  if (item.kind !== 'VIDEO') return <img src={item.url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: fit, background: '#000' }} />;
  if (bad) {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: '#111', color: '#d9dbe0', textAlign: 'center', padding: 18, fontSize: 12, lineHeight: 1.45 }}>
        <span><strong style={{ display: 'block', color: '#fff', fontSize: 13, marginBottom: 4 }}>Can't preview this video here</strong>Your browser can't play this format (often an iPhone .mov). It will still publish. Export as MP4 to preview it.</span>
      </div>
    );
  }
  const toggle = () => { const v = ref.current; if (!v) return; if (v.paused) { v.play().catch(() => {}); setPaused(false); } else { v.pause(); setPaused(true); } };
  return (
    <>
      <video
        ref={ref}
        src={item.url}
        autoPlay
        muted={muted}
        loop
        playsInline
        preload="metadata"
        onClick={toggle}
        // A file the browser can't decode loads with no picture: say so instead of showing black.
        onLoadedMetadata={(e) => { if (!e.currentTarget.videoWidth) { setBad(true); onFail?.(); } }}
        onError={() => { setBad(true); onFail?.(); }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: fit, background: '#000', cursor: 'pointer' }}
      />
      {paused && <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}><span style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(0,0,0,.45)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 22, paddingLeft: 4 }}>▶</span></span>}
      <button type="button" aria-label={muted ? 'Unmute' : 'Mute'} onClick={(e) => { e.stopPropagation(); setMuted(!muted); }} style={{ position: 'absolute', right: 10, top: controlsTop, width: 30, height: 30, borderRadius: '50%', border: 0, background: 'rgba(0,0,0,.5)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
        <Svg name={muted ? 'muted' : 'sound'} size={16} fill="currentColor" sw={1.6} />
      </button>
    </>
  );
}

/** Swipeable-looking carousel: one item at a time with dots. */
function Carousel({ media, ratio }) {
  const [i, setI] = useState(0);
  const n = media.length;
  useEffect(() => { if (i >= n) setI(0); }, [n, i]);
  return (
    <div style={{ position: 'relative', aspectRatio: ratio, background: '#000', overflow: 'hidden' }}>
      <Media item={media[Math.min(i, n - 1)]} />
      {n > 1 && (
        <>
          <span style={{ position: 'absolute', top: 10, right: 10, padding: '2px 8px', borderRadius: 999, background: 'rgba(0,0,0,.6)', color: '#fff', fontSize: 11, fontWeight: 600 }}>{i + 1}/{n}</span>
          {i > 0 && <button type="button" aria-label="Previous" onClick={() => setI(i - 1)} style={arrow('left')}>‹</button>}
          {i < n - 1 && <button type="button" aria-label="Next" onClick={() => setI(i + 1)} style={arrow('right')}>›</button>}
        </>
      )}
    </div>
  );
}
const arrow = (side) => ({ position: 'absolute', top: '50%', [side]: 8, transform: 'translateY(-50%)', width: 26, height: 26, borderRadius: '50%', border: 0, background: 'rgba(255,255,255,.85)', color: '#141619', fontSize: 18, lineHeight: '24px', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,.25)' });
const Dots = ({ n }) => (n > 1 ? <span style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>{Array.from({ length: Math.min(n, 10) }, (_, k) => <i key={k} style={{ width: 6, height: 6, borderRadius: '50%', background: k === 0 ? '#0095f6' : '#c7c7c7' }} />)}</span> : null);

function Clamp({ text, lines = 2, color = 'inherit', prefix = null }) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  const long = text.length > 110 || text.split('\n').length > lines;
  return (
    <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color, ...(open || !long ? {} : { display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical', overflow: 'hidden' }) }}>
      {prefix}{text}
      {long && !open && <button type="button" onClick={() => setOpen(true)} style={{ border: 0, background: 'transparent', padding: 0, marginLeft: 4, color: '#8e8e8e', cursor: 'pointer', font: 'inherit' }}>… more</button>}
    </div>
  );
}

/** Reels and Stories: a phone-shaped 9:16 frame. */
function Vertical({ account, caption, media, format }) {
  const item = media[0];
  const story = format === 'Story';
  const fb = account.platform === 'facebook';
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 270, margin: '0 auto', aspectRatio: '9 / 16', borderRadius: 18, overflow: 'hidden', background: '#000', color: '#fff', fontFamily: FONT, boxShadow: '0 10px 30px -12px rgba(0,0,0,.5)' }}>
      {item ? <Media item={item} controlsTop={story ? 34 : 12} /> : <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#9aa0a8', fontSize: 13, textAlign: 'center', padding: 20 }}>Add a video{story ? ' or image' : ''} to see your {format.toLowerCase()}</div>}
      {story ? (
        <>
          <div style={{ position: 'absolute', left: 8, right: 8, top: 8, height: 2.5, borderRadius: 2, background: 'rgba(255,255,255,.35)' }}><div style={{ width: '35%', height: '100%', borderRadius: 2, background: '#fff' }} /></div>
          <div style={{ position: 'absolute', left: 10, right: 46, top: 18, display: 'flex', alignItems: 'center', gap: 8, textShadow: '0 1px 2px rgba(0,0,0,.5)', pointerEvents: 'none' }}>
            <Avatar src={account.avatar} name={account.name} size={28} />
            <strong style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{account.handle}</strong>
            <span style={{ fontSize: 12, opacity: 0.8 }}>now</span>
          </div>
          <div style={{ position: 'absolute', left: 10, right: 10, bottom: 12, display: 'flex', gap: 8, alignItems: 'center', pointerEvents: 'none' }}>
            <span style={{ flex: 1, height: 36, borderRadius: 999, border: '1px solid rgba(255,255,255,.7)', fontSize: 12, display: 'flex', alignItems: 'center', padding: '0 14px', opacity: 0.9 }}>Send message</span>
            <Svg name="heart" size={22} />
            <Svg name="send" size={22} />
          </div>
        </>
      ) : (
        <>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '45%', background: 'linear-gradient(transparent, rgba(0,0,0,.65))', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 8, bottom: 70, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, fontSize: 11, textShadow: '0 1px 2px rgba(0,0,0,.5)', pointerEvents: 'none' }}>
            {(fb ? ['like', 'comment', 'share'] : ['heart', 'comment', 'send']).map((n) => <span key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}><Svg name={n} size={24} />{n === 'heart' || n === 'like' ? '0' : ''}</span>)}
            <Svg name="more" size={20} />
          </div>
          <div style={{ position: 'absolute', left: 12, right: 52, bottom: 16, display: 'flex', flexDirection: 'column', gap: 7, fontSize: 13, textShadow: '0 1px 2px rgba(0,0,0,.6)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar src={account.avatar} name={account.name} size={28} />
              <strong style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{account.handle}</strong>
              <span style={{ border: '1px solid rgba(255,255,255,.8)', borderRadius: 6, padding: '1px 7px', fontSize: 11, fontWeight: 600 }}>Follow</span>
            </span>
            <Clamp text={caption} lines={2} />
            <span style={{ fontSize: 11, opacity: 0.85 }}>♫ Original audio</span>
          </div>
        </>
      )}
    </div>
  );
}

function InstagramPost({ account, caption, media, when }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e7e5df', overflow: 'hidden', fontFamily: FONT, color: '#000', fontSize: 13.5 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px' }}>
        <Avatar src={account.avatar} name={account.name} size={32} ring />
        <strong style={{ flex: 1, minWidth: 0, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{account.handle}</strong>
        <Svg name="more" size={18} />
      </div>
      {media.length ? <Carousel media={media} ratio="4 / 5" /> : <div style={{ aspectRatio: '4 / 5', display: 'grid', placeItems: 'center', background: '#fafafa', color: '#8e8e8e', fontSize: 13, textAlign: 'center', padding: 20, borderTop: '1px solid #efefef', borderBottom: '1px solid #efefef' }}>Instagram posts need an image or video</div>}
      <div style={{ padding: '9px 11px 11px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Svg name="heart" /><Svg name="comment" /><Svg name="send" /><span style={{ flex: 1 }}><Dots n={media.length} /></span><Svg name="save" />
        </span>
        <strong style={{ fontSize: 13 }}>0 likes</strong>
        <Clamp text={caption} lines={2} prefix={<strong style={{ marginRight: 5 }}>{account.handle}</strong>} />
        <span style={{ color: '#8e8e8e', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.02em' }}>{when}</span>
      </div>
    </div>
  );
}

function FacebookPost({ account, caption, media, when }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e4e6eb', overflow: 'hidden', fontFamily: FONT, color: '#050505', fontSize: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 12px 8px' }}>
        <Avatar src={account.avatar} name={account.name} size={38} />
        <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
          <strong style={{ fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{account.name}</strong>
          <span style={{ color: '#65676b', fontSize: 12 }}>{when} · 🌐</span>
        </span>
        <span style={{ color: '#65676b' }}><Svg name="more" size={18} /></span>
      </div>
      {caption && <div style={{ padding: '0 12px 10px' }}><Clamp text={caption} lines={5} /></div>}
      {media.length > 0 && <Carousel media={media} ratio={media.length === 1 && media[0].kind === 'VIDEO' ? '16 / 9' : '1 / 1'} />}
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '6px 6px', borderTop: '1px solid #e4e6eb', color: '#65676b', fontWeight: 600, fontSize: 13 }}>
        {[['like', 'Like'], ['comment', 'Comment'], ['share', 'Share']].map(([n, l]) => <span key={n} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px' }}><Svg name={n} size={18} />{l}</span>)}
      </div>
    </div>
  );
}

function GenericPost({ account, caption, media, when }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e7e5df', padding: 14, display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'Geist, system-ui, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar src={account.avatar} name={account.name} size={36} />
        <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, lineHeight: 1.3 }}>
          <strong style={{ fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{account.name}</strong>
          <span style={{ fontSize: 12, color: '#677184' }}>{account.handle} · {when}</span>
        </span>
      </div>
      {caption ? <Clamp text={caption} lines={8} /> : <span style={{ color: '#9aa0a8', fontSize: 14 }}>Your post will appear here.</span>}
      {media.length > 0 && <div style={{ borderRadius: 12, overflow: 'hidden' }}><Carousel media={media} ratio={media.length === 1 && media[0].kind === 'VIDEO' ? '16 / 9' : '1 / 1'} /></div>}
    </div>
  );
}

export default function PostPreview({ account, caption = '', media = [], format = 'Post', when = '' }) {
  if (!account) {
    return (
      <div style={{ border: '1px dashed #d9d6cd', borderRadius: 12, padding: 18, background: '#fff', color: '#677184', fontSize: 13, textAlign: 'center', fontFamily: 'Geist, system-ui, sans-serif', display: 'grid', gap: 10 }}>
        {media.length > 0 && <div style={{ position: 'relative', width: '100%', maxWidth: format === 'Post' ? '100%' : 220, margin: '0 auto', aspectRatio: format === 'Post' ? '1 / 1' : '9 / 16', borderRadius: 10, overflow: 'hidden', background: '#000' }}><Media item={media[0]} /></div>}
        Pick an account to see exactly how the post will look.
      </div>
    );
  }
  const meta = account.platform === 'instagram' || account.platform === 'facebook';
  if (meta && format !== 'Post') return <Vertical account={account} caption={caption} media={media} format={format} />;
  if (account.platform === 'tiktok') return <Vertical account={account} caption={caption} media={media} format="Reel" />;
  if (account.platform === 'instagram') return <InstagramPost account={account} caption={caption} media={media} when={when} />;
  if (account.platform === 'facebook') return <FacebookPost account={account} caption={caption} media={media} when={when} />;
  return <GenericPost account={account} caption={caption} media={media} when={when} />;
}
