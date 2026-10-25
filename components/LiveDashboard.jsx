'use client';
/**
 * The real dashboard: the generated design (./Dashboard) running on your workspace's data.
 *
 * - Loads everything from /api/app/state.
 * - Watches state changes and saves them: posts (create/update/delete/publish), settings,
 *   media folders and disconnected accounts. Saving is diff-based, so the design's own
 *   actions (drag to reschedule, approve, duplicate, undo, bulk tools…) persist untouched.
 * - Replaces the demo-only actions with real ones: connecting accounts, uploads to R2,
 *   API keys, invites, workspaces, signing out.
 */
import PostPreview from './dashboard/PostPreview';
import ImageCropper from './dashboard/ImageCropper';
import ConnectPicker from './dashboard/ConnectPicker';
import React from 'react';
import Base from './Dashboard';
import { splitThread, THREAD_PLATFORMS } from '@/lib/server/thread';
import { captionFromFilename } from '@/lib/bulk-caption';
import { isShare, shareCaption } from '@/lib/share-caption';
import { DEFAULT_COOLDOWN_DAYS, matchesUsage, mediaState } from '@/lib/media-usage';

const P = Base.P;
const PLATFORM_IDS = Object.keys(P);
// First comment (hashtags, a link, a call to action) posted right after the post goes live. The
// composer renders one text field per account for platforms that take it.
for (const id of ['x', 'bluesky', 'instagram', 'linkedin', 'facebook', 'threads']) {
  const p = P[id];
  if (p && !(p.fields || []).some((f) => f.key === 'first_comment')) p.fields = [...(p.fields || []), { key: 'first_comment', label: 'First comment' }];
}
const kindOf = (mime) => (mime && mime.startsWith('video/') ? 'VIDEO' : 'IMG');
const TONES = ['#8a6d4f', '#6e5a42', '#7a6148', '#4f3f2e', '#5d6b4a', '#5d4a36', '#3e4a55', '#7d7a5c'];
const hashTone = (id) => TONES[Base.hash(id || '') % TONES.length];
const TIKTOK_PRIVACY = { Public: 'PUBLIC_TO_EVERYONE', Friends: 'MUTUAL_FOLLOW_FRIENDS', 'Only me': 'SELF_ONLY' };

/** A still from a video file (a data URL), for thumbnails before the upload exists. '' when the browser can't decode it. */
function videoFrame(file, { width = 256, timeoutMs = 8000 } = {}) {
  return new Promise((resolve) => {
    let url;
    try {
      url = URL.createObjectURL(file);
    } catch {
      return resolve('');
    }
    const v = document.createElement('video');
    let settled = false;
    const done = (out) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { URL.revokeObjectURL(url); } catch {}
      v.removeAttribute('src');
      resolve(out);
    };
    const timer = setTimeout(() => done(''), timeoutMs);
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.onerror = () => done('');
    v.onloadedmetadata = () => {
      // A frame a little way in: the first frame of many clips is black.
      try { v.currentTime = Math.min(0.5, Math.max(0.05, (v.duration || 1) / 10)); } catch { done(''); }
    };
    v.onseeked = () => {
      try {
        const w = width, h = Math.max(1, Math.round(((v.videoHeight || 1) / (v.videoWidth || 1)) * w));
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        c.getContext('2d').drawImage(v, 0, 0, w, h);
        done(c.toDataURL('image/jpeg', 0.82));
      } catch {
        done('');
      }
    };
    v.src = url;
  });
}
/** A data URL from videoFrame() as a JPEG Blob, or null. */
async function posterBlob(dataUrl) {
  if (!dataUrl || !dataUrl.startsWith('data:image/jpeg')) return null;
  try {
    const blob = await (await fetch(dataUrl)).blob();
    return blob.size > 0 && blob.size <= 2_000_000 ? blob : null;
  } catch {
    return null;
  }
}
/**
 * A still from a video that is already in storage (for videos uploaded before posters existed).
 * Needs the bucket to allow cross-origin reads; when it doesn't, the canvas is tainted and this gives null.
 */
function posterFromUrl(url, { width = 640, timeoutMs = 20000 } = {}) {
  return new Promise((resolve) => {
    const v = document.createElement('video');
    let settled = false;
    const done = (out) => { if (settled) return; settled = true; clearTimeout(timer); v.removeAttribute('src'); resolve(out); };
    const timer = setTimeout(() => done(null), timeoutMs);
    v.crossOrigin = 'anonymous';
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.onerror = () => done(null);
    v.onloadedmetadata = () => { try { v.currentTime = Math.min(0.5, Math.max(0.05, (v.duration || 1) / 10)); } catch { done(null); } };
    v.onseeked = () => {
      try {
        const h = Math.max(1, Math.round(((v.videoHeight || 1) / (v.videoWidth || 1)) * width));
        const c = document.createElement('canvas');
        c.width = width;
        c.height = h;
        c.getContext('2d').drawImage(v, 0, 0, width, h);
        c.toBlob((b) => done(b && b.size <= 2_000_000 ? b : null), 'image/jpeg', 0.82);
      } catch {
        done(null);
      }
    };
    v.src = url;
  });
}
/** Platforms whose access tokens renew on their own (used when the server doesn't say `has_refresh`). */
const AUTO_REFRESH = new Set(['x', 'youtube', 'google_business', 'tiktok', 'pinterest', 'threads', 'facebook', 'instagram']);
/** How long a deleted post waits before it's deleted on the server: the toast's Undo window (6 s) plus a margin. */
const UNDO_MS = 6500;
let tokSeq = 0;
/** A local identity for one composer session, so uploads land only in the draft they were started from. */
const newTok = () => `d${Date.now().toString(36)}${(tokSeq++).toString(36)}`;

/**
 * Refreshes the session cache cookie through the Neon Auth proxy. True when the session is still
 * valid. Shared so several requests failing at once only check once.
 */
let refreshing = null;
function refreshSession() {
  refreshing ||= fetch('/api/auth/get-session', { credentials: 'same-origin', cache: 'no-store' })
    .then(async (r) => (r.ok ? !!(await r.json().catch(() => null))?.session : null))
    .catch(() => null)
    .finally(() => setTimeout(() => { refreshing = null; }, 1000));
  return refreshing;
}

/** PUT a file to a presigned URL, reporting progress (0–100). fetch can't report upload progress, XHR can. */
function putWithProgress(url, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('content-type', file.type);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(Math.min(99, Math.round((e.loaded / e.total) * 100))); };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload of ${file.name} failed (${xhr.status}). Try again.`)));
    xhr.onerror = () => reject(new Error(`Upload of ${file.name} failed. Check your connection and try again.`));
    xhr.send(file);
  });
}

async function api(path, { method = 'GET', body } = {}, retried = false) {
  const res = await fetch(path, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    // Only leave for the login page when the session is really gone; a stale cache cookie is
    // refreshed and the request tried again.
    const ok = retried ? false : await refreshSession();
    if (ok) return api(path, { method, body }, true);
    if (ok === false) {
      window.location.href = '/login?next=/app';
      throw new Error('Signed out');
    }
    throw new Error("Couldn't reach the server. Check your connection and try again.");
  }
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/* ---------- server ⇄ design data shapes ---------- */

function mapAccount(a) {
  // With a refresh token the access token renews by itself, so its short expiry is no reason to reconnect.
  // The server sends token_expires_at only when the account will need reconnecting; older servers send it always.
  const known = typeof a.has_refresh === 'boolean';
  const refresh = known ? a.has_refresh : AUTO_REFRESH.has(a.platform);
  const soon = !refresh && !!a.token_expires_at && (known || a.token_expires_at < Date.now() + 3 * 864e5);
  return {
    id: a.id, platform: a.platform, username: a.username || a.display_name || a.platform, display: a.display_name || a.username,
    health: a.over_limit ? 'over' : a.status === 'error' ? 'error' : soon ? 'expiring' : undefined,
    avatar: a.avatar_url || '', error: a.last_error || '', expires: a.token_expires_at || null, refresh, boards: a.meta?.boards || [],
  };
}

/**
 * A library item. `usage` is the server's per-file record (posts, drafts, last, platforms); `ctx` is
 * the workspace's cooldown and connected platforms, which turn it into the state, filter keys and
 * text the library shows. withUsage() re-derives those when the cooldown changes.
 */
function mapMedia(m, usage = {}, ctx = {}) {
  const u = usage[m.id] || null;
  // Cards, tiles and queue previews use the small cached thumbnail (for a video, its poster still); the
  // preview dialog loads the full image over it, or plays the video. A video without a poster yet keeps
  // the <video> thumbnail until backfillPosters() makes one.
  const image = m.mime.startsWith('image/');
  const video = m.mime.startsWith('video/');
  return withUsage({ id: m.id, name: m.filename, mime: m.mime, kind: kindOf(m.mime), tone: hashTone(m.id), folder: m.folder || '', used: u ? u.posts + u.drafts : 0, u, url: image ? m.thumb_url || m.url : video && m.thumb_url ? m.thumb_url : '', fullUrl: image ? m.url : '', videoUrl: video ? m.url : '', poster: !!m.poster }, ctx);
}
function withUsage(item, ctx) {
  const st = mediaState(item.u, { cooldownDays: ctx.cooldownDays, platforms: ctx.platforms || [], labels: PLATFORM_LABELS });
  return { ...item, state: st.state, unusedOn: st.unusedOn, usage: st.line, usageLong: st.long, usageColor: st.color, last: st.last };
}
const PLATFORM_LABELS = Object.fromEntries(Object.entries(P).map(([id, p]) => [id, p.label]));
/** The library's usage context from the dashboard state. */
const usageCtx = (s) => ({ cooldownDays: s.cooldown ?? DEFAULT_COOLDOWN_DAYS, platforms: [...new Set((s.accounts || []).map((a) => a.platform))] });

function mapPost(sp, mediaById) {
  // A post the server is sending right now shows as "publishing…" (with its targets pending), never as scheduled.
  const publishing = sp.status === 'publishing';
  const status = publishing ? 'published' : sp.status;
  const ov = {};
  for (const t of sp.targets) {
    const o = {};
    if (t.caption_override != null) o.caption = t.caption_override;
    if (t.options && t.options.ui && Object.keys(t.options.ui).length) o.opts = t.options.ui;
    if (Object.keys(o).length) ov[t.account_id] = o;
  }
  return {
    id: sp.id, status, at: sp.scheduled_at, caption: sp.caption, ov,
    media: (sp.media || []).map((id) => kindOf(mediaById[id]?.mime)), mediaIds: [...(sp.media || [])],
    targets: sp.targets.map((t) => ({
      acc: t.account_id,
      status: t.status === 'published' ? 'published' : t.status === 'failed' ? 'failed' : publishing ? 'pending' : status === 'draft' ? 'draft' : 'scheduled',
      error: t.status === 'failed' ? t.error || 'Failed' : '',
      url: t.external_url || '',
      clicks: Number(t.stats?.clicks || 0),
    })),
    labels: sp.labels || [], repeat: sp.repeat || 'none', evergreen: !!sp.evergreen, approval: sp.approval || null,
    remind: sp.remind !== false, note: sp.note || '', batch: sp.batch || null,
    updated: Number(sp.updated_at || sp.created_at || 0),
    ...(publishing ? { publishing: true } : {}),
  };
}

/** Platform-specific fields from the composer → what the publishing adapters expect. */
function adapterOptions(account, ui = {}) {
  const o = { ui };
  if (!account) return o;
  if (typeof ui.first_comment === 'string' && ui.first_comment.trim()) o.first_comment = ui.first_comment.trim();
  if (account.platform === 'tiktok' && ui.privacy) o.privacy = TIKTOK_PRIVACY[ui.privacy] || ui.privacy;
  if (account.platform === 'youtube') { if (ui.title) o.title = ui.title; if (ui.privacy) o.privacy = ui.privacy; }
  if ((account.platform === 'instagram' || account.platform === 'facebook') && ui.format) o.format = String(ui.format).toLowerCase();
  if (account.platform === 'pinterest') {
    const b = (account.boards || []).find((x) => x.name === ui.board) || (account.boards || [])[0];
    if (b) o.board_id = b.id;
    if (ui.link) o.link = ui.link;
  }
  return o;
}

export default class LiveDashboard extends Base {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      loading: true, posts: [], accounts: [], library: [], keys: [], invites: [], notes: {}, templates: [], tagGroups: [],
      folders: [], labelList: [], bulkAccs: [], csv: 'date,time,accounts,caption\n', bulkFiles: [],
      wsId: null, wsList: [], members: [], pendingInvites: [], platforms: {}, storage: false, plan: 'trial', accountLimit: 15, modal: null, billing: null, planPicker: false, shareLink: null,
    };
    this._srv = new Map(); // post id → JSON of what the server has
    this._srvStatus = new Map(); // post id → server status
    this._queue = new Map(); // post id → promise chain (keeps saves for one post in order)
    this._uploads = new Map(); // bulk file id → Promise<media id>
    this._busy = 0;
    this._onServer = new Set(); // post ids the server has saved
    this._pendingDel = new Map(); // post id → timer: deleted here, deleted on the server once Undo can't bring it back
    this._drafts = new Map(); // post id → the composer draft it came from, until its first save succeeds
    this._rescued = new Set(); // post ids already turned into drafts after a refused first save
    this._accSeen = new Map(); // account id → account, so a refused disconnect can put it back
  }

  /* ---------- lifecycle ---------- */
  componentDidMount() {
    super.componentDidMount();
    this.load(true).then(() => this.backfillPosters());
    // Keyboard shortcuts: N new post, Ctrl/Cmd+Enter submit the composer, Esc leave the composer.
    // One key handler: the base class's would also open a new post on N.
    window.removeEventListener('keydown', this._key);
    this._keys = (e) => {
      if (e.key === 'Escape' && this.closeTopLayer()) { e.preventDefault(); return; }
      const el = e.target, typing = el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
      const dialogOpen = !!document.querySelector('[role="dialog"]');
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && this.state.screen === 'compose') {
        const btn = document.querySelector('[data-sfy="submit"]');
        if (btn && !btn.disabled) { e.preventDefault(); btn.click(); }
        return;
      }
      if (typing || dialogOpen || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape' && this.state.screen === 'compose') document.querySelector('[data-sfy="cancel"]')?.click();
      else if ((e.key === 'n' || e.key === 'N') && this.state.screen !== 'compose' && !this.state.loading) { e.preventDefault(); this.newPost(); }
    };
    window.addEventListener('keydown', this._keys);
    this._poll = setInterval(() => { if (document.visibilityState === 'visible') this.load(false); }, 30_000);
    // Coming back to the tab: refresh the session cache first, then reload.
    this._vis = () => { if (document.visibilityState === 'visible') refreshSession().finally(() => this.load(false)); };
    document.addEventListener('visibilitychange', this._vis);
    // Leaving the page during an Undo window: send the waiting deletes now (keepalive outlives the page).
    this._onHide = () => {
      for (const [id, t] of this._pendingDel) {
        clearTimeout(t);
        if (this.state.posts.some((p) => p.id === id)) continue;
        this._srv.delete(id);
        this._srvStatus.delete(id);
        fetch(`/api/app/posts/${id}`, { method: 'DELETE', credentials: 'same-origin', keepalive: true }).catch(() => {});
      }
      this._pendingDel.clear();
    };
    window.addEventListener('pagehide', this._onHide);
  }
  /** Esc closes the top-most popup first (the cropper and Page picker close themselves). */
  closeTopLayer() {
    const s = this.state;
    if (s.cropFiles || s.pickId) return true;
    if (s.modal) { super.setState({ modal: null }); return true; }
    if (s.shareLink) { super.setState({ shareLink: null }); return true; }
    if (s.planPicker) { super.setState({ planPicker: false }); return true; }
    return super.closeTopLayer();
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    window.removeEventListener('keydown', this._keys);
    clearInterval(this._poll);
    clearTimeout(this._prefsT);
    document.removeEventListener('visibilitychange', this._vis);
    window.removeEventListener('pagehide', this._onHide);
    this._onHide();
  }

  setState(update, cb) {
    super.setState(update, () => { this._sync(); if (cb) cb(); });
  }

  async load(first) {
    // Don't overwrite unsaved work, or bring back a post whose delete is waiting out its Undo window.
    const busy = () => this._busy > 0 || this._queue.size > 0 || this._pendingDel.size > 0;
    if (!first && busy()) return;
    try {
      const d = await api('/api/app/state');
      if (!first && busy()) return;
      this.applyServer(d, first);
      if (first) this.handleReturnParams(d);
      // New workspace without a card: offer the free trial right away (owners only, once per page load).
      if (first && d.billing?.enabled && d.billing.state === 'needs_card' && d.workspace.role === 'owner' && !/billing=/.test(window.location.search)) super.setState({ planPicker: true });
    } catch (e) {
      if (first) this.flash(e.message || 'Could not load your workspace', true);
    }
  }

  applyServer(d, first) {
    const prefs = d.workspace.prefs || {};
    const mediaById = Object.fromEntries(d.media.map((m) => [m.id, m]));
    const posts = d.posts.map((p) => mapPost(p, mediaById));
    const accounts = d.accounts.map(mapAccount);
    this.userEmail = d.user.email;
    this.userName = (d.user.name || d.user.email.split('@')[0]).split(' ')[0];
    this._srv = new Map(posts.map((p) => [p.id, JSON.stringify(this.toInput(p, accounts))]));
    this._srvStatus = new Map(posts.map((p) => [p.id, p.status]));
    this._onServer = new Set(posts.map((p) => p.id));
    for (const a of accounts) this._accSeen.set(a.id, a);
    const tz = prefs.tz || Base.localTz();
    const patch = {
      loading: false, posts, accounts,
      library: d.media.map((m) => mapMedia(m, d.mediaUsage, { cooldownDays: prefs.reuseCooldownDays ?? DEFAULT_COOLDOWN_DAYS, platforms: [...new Set(accounts.map((a) => a.platform))] })),
      cooldown: prefs.reuseCooldownDays ?? DEFAULT_COOLDOWN_DAYS,
      keys: d.keys.map((k) => ({ id: k.id, name: k.name, prefix: k.prefix, meta: `Created ${new Date(k.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${k.last_used_at ? 'last used ' + new Date(k.last_used_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'never used'}` })),
      members: d.members, wsId: d.workspace.id, wsList: d.workspaces, plan: d.workspace.plan, accountLimit: d.workspace.account_limit,
      platforms: Object.fromEntries(d.platforms.map((p) => [p.id, p])), storage: d.storage, billing: d.billing || null,
      tz, remind: prefs.remind || { on: true, lead: 60 }, alerts: prefs.alerts || { fail: true, digest: true },
      slots: prefs.slots || [], slotDays: prefs.slotDays || [], paused: !!prefs.paused, labelList: prefs.labels || [], trackLinks: prefs.trackLinks === true,
      folders: prefs.folders || [], templates: prefs.templates || [], tagGroups: prefs.tagGroups || [], notes: prefs.notes || {}, accGroups: prefs.accountGroups || [],
    };
    // Pending invites (server field `invites`: [{ email, role }]). Older servers don't send it: ask the team API once.
    const toInvites = (list) => (list || []).map((i) => (typeof i === 'string' ? { email: i, role: 'member' } : { id: i.id, email: i.email, role: i.role || 'member' }));
    if (Array.isArray(d.invites)) patch.invites = toInvites(d.invites);
    else if (first) api('/api/v1/team').then((r) => { if (Array.isArray(r.invites)) super.setState({ invites: toInvites(r.invites) }); }).catch(() => {});
    if (first) {
      patch.bulkAccs = accounts.slice(0, 3).map((a) => a.id);
      patch.folder = 'All';
      // Open the calendar on the workspace's current month and week, not the browser's.
      const now = new Date(Date.now() + Base.shift(Date.now(), tz));
      patch.cursor = [now.getFullYear(), now.getMonth()];
      now.setHours(0, 0, 0, 0);
      now.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      patch.weekStart = now.getTime();
    }
    this._lastPosts = posts;
    this._prefsKey = JSON.stringify(this.prefsOf({ ...this.state, ...patch }));
    this._libKey = JSON.stringify(patch.library.map((m) => [m.id, m.folder]));
    this._accKey = accounts.map((a) => a.id).join(',');
    super.setState(patch);
    // New workspaces start in the browser's timezone.
    if (first && !prefs.tzSet) api('/api/app/prefs', { method: 'PATCH', body: { prefs: { tz: Base.localTz(), tzSet: true } } }).then(() => super.setState({ tz: Base.localTz() })).catch(() => {});
  }

  handleReturnParams() {
    const q = new URLSearchParams(window.location.search);
    if (!q.toString()) return;
    // Shared from another app (Share sheet or bookmarklet): open the composer with the text and link.
    if (isShare(q)) {
      const caption = shareCaption(q);
      this.newPost();
      if (caption) this.upd({ caption });
      this.flash(caption ? 'Shared text added. Pick your accounts and a time.' : 'Nothing to share was received. Start your post below.', !caption);
    }
    if (q.get('screen')) super.setState({ screen: q.get('screen') });
    if (q.get('pick')) super.setState({ pickId: q.get('pick') });
    if (q.get('refreshed')) this.flash(`Refreshed ${q.get('refreshed')} connected account${q.get('refreshed') === '1' ? '' : 's'}`);
    if (q.get('connected')) {
      const n = Number(q.get('n') || 1);
      const skipped = Number(q.get('skipped') || 0);
      const label = P[q.get('connected')]?.label || q.get('connected');
      if (skipped) this.flash(`Connected ${n} ${label} account${n === 1 ? '' : 's'}. ${skipped} more didn't fit: your plan allows ${q.get('limit')} accounts. Upgrade to add them.`, true);
      else this.flash(`Connected ${n} ${label} account${n === 1 ? '' : 's'}`);
    }
    if (q.get('error')) this.flash(q.get('error'), true);
    if (q.get('billing') === 'success') {
      this.flash('Thanks! Your plan is active.');
      // Stripe's webhook can land a moment after the redirect.
      setTimeout(() => this.load(false), 4000);
    }
    if (q.get('billing') === 'cancel') this.flash('Checkout cancelled. Nothing was charged.');
    window.history.replaceState(null, '', '/app');
  }

  /* ---------- saving ---------- */
  /** Settings as saved, cut to the server's limits (app/api/app/prefs) so one long value can't make the whole save fail. */
  prefsOf(s) {
    const name = (v, n) => String(v ?? '').trim().slice(0, n);
    const names = (list, n) => [...new Set((list || []).map((x) => name(x, n)).filter(Boolean))].slice(0, 100);
    return {
      tz: s.tz, remind: s.remind, alerts: s.alerts, slots: (s.slots || []).slice(0, 48), slotDays: s.slotDays, paused: s.paused, reuseCooldownDays: s.cooldown ?? DEFAULT_COOLDOWN_DAYS,
      labels: names(s.labelList, 40), folders: names(s.folders, 60),
      templates: (s.templates || []).slice(0, 100).map((t) => ({ name: name(t.name, 60), text: String(t.text ?? '').slice(0, 5000) })),
      tagGroups: (s.tagGroups || []).slice(0, 100).map((g) => ({ name: name(g.name, 60), tags: String(g.tags ?? '').slice(0, 2000) })),
      notes: Object.fromEntries(Object.entries(s.notes || {}).filter(([k]) => k.length <= 40).map(([k, v]) => [k, String(v ?? '').slice(0, 500)])),
      accountGroups: (s.accGroups || []).slice(0, 50).map((g) => ({ id: name(g.id, 40), name: name(g.name, 40), ids: (g.ids || []).slice(0, 200) })),
    };
  }

  toInput(p, accounts = this.state.accounts) {
    const byId = Object.fromEntries(accounts.map((a) => [a.id, a]));
    return {
      caption: p.caption || '', media: p.mediaIds || [], scheduled_at: p.at ?? null,
      status: p.status === 'draft' ? 'draft' : 'scheduled',
      // Accounts disconnected since the post was written are left out; the server would refuse the whole save.
      targets: p.targets.filter((t) => byId[t.acc]).map((t) => ({ account_id: t.acc, caption: p.ov?.[t.acc]?.caption ?? null, options: adapterOptions(byId[t.acc], p.ov?.[t.acc]?.opts || {}) })),
      labels: (p.labels || []).slice(0, 50), repeat: p.repeat || 'none', evergreen: !!p.evergreen, approval: p.approval || null,
      remind: p.remind !== false, note: (p.note || '').slice(0, 2000), batch: p.batch || null,
    };
  }

  enqueue(id, job) {
    const prev = this._queue.get(id) || Promise.resolve();
    const next = prev.then(job).catch((e) => {
      // A post the server never accepted would vanish on the next reload: give it back instead.
      if (e.firstSave && e.post && this.rescue(e.post, e.message || 'The server refused this post')) return;
      this.flash(e.message || 'Could not save', true);
      this._srv.delete(id);
      setTimeout(() => this.load(false), 500); // resync with the server
    }).finally(() => {
      if (this._queue.get(id) === next) this._queue.delete(id);
      // (Not while a delete waits for its Undo window: load would skip; the DELETE's own save brings us back here.)
      if (!this._queue.size && this._reloadAfter && !this._pendingDel.size) { this._reloadAfter = false; this.load(false); }
    });
    this._queue.set(id, next);
  }

  _sync() {
    const s = this.state;
    if (s.loading) return;
    if (s.posts !== this._lastPosts) {
      const prevById = new Map((this._lastPosts || []).map((p) => [p.id, p]));
      this._lastPosts = s.posts;
      const seen = new Set(), starting = new Map();
      for (const p of s.posts) {
        seen.add(p.id);
        if (p.virtual) continue;
        // Back from Undo: cancel the delete. Its server copy was never touched, so nothing else to do.
        if (this._pendingDel.has(p.id)) { clearTimeout(this._pendingDel.get(p.id)); this._pendingDel.delete(p.id); }
        this.attachMedia(p);
        const srvStatus = this._srvStatus.get(p.id), prev = prevById.get(p.id);
        if (p.status === 'published' && srvStatus !== 'published') {
          // Only a change made here (Publish now, Retry, a new post sent now) publishes. A post that comes back
          // already "published" (Undo, reload) is never sent again.
          const isNew = !prev && !this._onServer.has(p.id);
          if ((prev && prev.status !== 'published') || isNew) {
            this._srvStatus.set(p.id, 'published');
            starting.set(p.id, prev);
            const before = this._onServer.has(p.id) && prev && prev.status !== 'published' ? prev : null;
            this.enqueue(p.id, () => this.publish(p, before));
          }
          continue;
        }
        if (srvStatus === 'published' || p.status === 'partial' || (p.status === 'failed' && srvStatus === 'failed')) continue;
        const ser = JSON.stringify(this.toInput(p));
        if (ser === this._srv.get(p.id)) continue;
        this._srv.set(p.id, ser);
        this.enqueue(p.id, () => this.save(p));
      }
      // Being published: say so, with each new target pending, until the server answers (see showPublished).
      if (starting.size) {
        super.setState((st) => ({
          posts: st.posts.map((x) => {
            if (!starting.has(x.id)) return x;
            const done = new Set((starting.get(x.id)?.targets || []).filter((t) => t.status === 'published').map((t) => t.acc));
            return { ...x, publishing: true, targets: x.targets.map((t) => (done.has(t.acc) ? { ...t, status: 'published' } : { ...t, status: 'pending', error: '' })) };
          }),
        }));
      }
      for (const id of [...this._srv.keys()]) {
        if (seen.has(id) || this._pendingDel.has(id)) continue;
        // Deleted here: wait out the Undo window before deleting on the server (Undo cancels this above).
        this._pendingDel.set(id, setTimeout(() => this.commitDelete(id), UNDO_MS));
      }
    }
    const prefs = this.prefsOf(s), pk = JSON.stringify(prefs);
    if (pk !== this._prefsKey) {
      this._prefsKey = pk;
      clearTimeout(this._prefsT);
      this._prefsT = setTimeout(() => api('/api/app/prefs', { method: 'PATCH', body: { prefs } })
        // `skipped`: settings the server couldn't read (the rest saved).
        .then((r) => { if (r?.skipped?.length) this.flash(`Some settings couldn't be saved (${r.skipped.join(', ')}). Check them and try again.`, true); })
        .catch((e) => this.flash(e.message, true)), 500);
    }
    const lk = JSON.stringify(s.library.map((m) => [m.id, m.folder]));
    if (lk !== this._libKey) {
      const before = new Map(JSON.parse(this._libKey || '[]'));
      this._libKey = lk;
      for (const m of s.library) if (before.has(m.id) && before.get(m.id) !== m.folder) api(`/api/v1/media/${m.id}`, { method: 'PATCH', body: { folder: m.folder || null } }).catch((e) => this.flash(e.message, true));
    }
    if (s.accounts !== this._accRef) { this._accRef = s.accounts; for (const a of s.accounts) this._accSeen.set(a.id, a); }
    const ak = s.accounts.map((a) => a.id).join(',');
    if (ak !== this._accKey) {
      const now = new Set(s.accounts.map((a) => a.id));
      for (const id of (this._accKey || '').split(',').filter(Boolean)) {
        if (now.has(id)) continue;
        const acc = this._accSeen.get(id);
        api(`/api/v1/accounts/${id}`, { method: 'DELETE' })
          .then(() => this.load(false)) // the server also drops its unpublished targets
          .catch((e) => {
            // Refused (members can't disconnect accounts) or failed: put the account back now, not at the next refresh.
            if (acc) super.setState((st) => (st.accounts.some((a) => a.id === id) ? null : { accounts: [...st.accounts, acc] }), () => { this._accKey = this.state.accounts.map((a) => a.id).join(','); });
            this.flash(e.message || "Couldn't disconnect the account", true);
          });
      }
      this._accKey = ak;
    }
  }

  /** The Undo window for a deleted post has closed: delete it on the server (unless it came back). */
  commitDelete(id) {
    clearTimeout(this._pendingDel.get(id));
    this._pendingDel.delete(id);
    if (this.state.posts.some((p) => p.id === id)) return;
    this._srv.delete(id);
    this._srvStatus.delete(id);
    this._onServer.delete(id);
    this.enqueue(id, () => api(`/api/app/posts/${id}`, { method: 'DELETE' }));
  }

  /**
   * The server refused a post's first save (422 and the like). Nothing was stored, so a reload would lose it.
   * From the composer, and with the composer free: reopen it there with the error. Otherwise keep it as a draft.
   * True when handled.
   */
  rescue(p0, msg) {
    const p = this.state.posts.find((x) => x.id === p0.id) || p0;
    this._srv.delete(p.id);
    this._srvStatus.delete(p.id);
    const snap = this._drafts.get(p.id);
    this._drafts.delete(p.id);
    const d = this.state.draft || {};
    const composerFree = this.state.screen !== 'compose' || (!d.caption && !(d.media || []).length && !(d.targets || []).length && !(this.state.uploads || []).length);
    if (snap && composerFree) {
      super.setState((st) => ({ posts: st.posts.filter((x) => x.id !== p.id), screen: 'compose', uploads: [], draft: { ...snap, id: null, serverError: msg, tok: newTok() } }));
      this.flash(`Not saved: ${msg}`, true);
      return true;
    }
    if (this._rescued.has(p.id)) return false;
    this._rescued.add(p.id);
    // Drafts aren't validated, so this save goes through and nothing is lost.
    this.setState((st) => ({ posts: st.posts.map((x) => (x.id === p.id ? { ...x, status: 'draft', at: null, publishing: undefined, targets: x.targets.map((t) => (t.status === 'published' ? t : { ...t, status: 'draft', error: '' })) } : x)) }));
    this.flash(`Couldn't schedule “${(p.caption || 'a post').slice(0, 40)}”: ${msg} It's in Drafts so you can fix it.`, true);
    return true;
  }

  /** Posts created by the design carry media "kinds" only; attach the uploaded media ids. */
  attachMedia(p) {
    if (p.mediaIds) return;
    if (this._submitFor && (this._submitFor.id ? p.id === this._submitFor.id : !this._srv.has(p.id))) {
      p.mediaIds = this._submitFor.mediaIds;
      // Keep the draft until the server accepts the post, so a refused first save can reopen it (see rescue).
      if (!this._onServer.has(p.id)) this._drafts.set(p.id, this._submitFor.draft);
      this._submitFor = null;
      return;
    }
    if (p.fileId && this._uploads.has(p.fileId)) p.mediaIds = [];
    else p.mediaIds = [];
  }

  async save(p) {
    if (p.fileId && this._uploads.has(p.fileId) && !p.mediaIds.length) {
      const id = await this._uploads.get(p.fileId);
      if (id) p.mediaIds = [id];
    }
    const first = !this._onServer.has(p.id);
    let res;
    try {
      res = await api(`/api/app/posts/${p.id}`, { method: 'PUT', body: this.toInput(p) });
    } catch (e) {
      e.firstSave = first;
      e.post = p;
      throw e;
    }
    this._onServer.add(p.id);
    this._drafts.delete(p.id);
    this._srvStatus.set(p.id, res.post.status === 'publishing' ? 'published' : res.post.status);
    this._srv.set(p.id, JSON.stringify(this.toInput(p)));
  }

  /**
   * Sends the post now: one PUT with publish_now (the server checks the plan first; a 402 saves nothing). The post
   * shows "publishing…" until this returns, then the real per-account result. `before` is the post as it was on
   * the server (null for a post the server doesn't have yet).
   */
  async publish(p, before = null) {
    this._busy++;
    try {
      let post;
      try {
        post = await this.publishRequest(p);
      } catch (e) {
        if (e.status === 402) return before ? this.unpublish(p.id, before, e.message) : await this.backToDraft(p.id, e.message);
        e.firstSave = !this._onServer.has(p.id);
        e.post = p;
        throw e;
      }
      this._drafts.delete(p.id);
      this.showPublished(p.id, post);
    } finally {
      this._busy--;
      this._reloadAfter = true; // pick up links and anything else once saves settle
    }
  }

  /** The server call behind Publish now; returns the post as the server has it afterwards ({ status, post }). */
  async publishRequest(p) {
    const r = await api(`/api/app/posts/${p.id}`, { method: 'PUT', body: { ...this.toInput(p), publish_now: true } });
    this._onServer.add(p.id);
    return r.post;
  }

  /** Publishing an existing post was refused for billing (402). The server left it untouched: show it as it was. */
  unpublish(id, before, msg) {
    this._srvStatus.set(id, before.status);
    this._srv.set(id, JSON.stringify(this.toInput(before)));
    super.setState((st) => ({ posts: st.posts.map((x) => (x.id === id ? { ...before, mediaIds: x.mediaIds } : x)) }));
    this.flash(msg || 'Publishing is off on your plan.', true);
  }

  /** Publishing a new post was refused for billing (402) and nothing was saved: keep it as a draft, here and on the server. */
  async backToDraft(id, msg) {
    const cur = this.state.posts.find((x) => x.id === id);
    if (!cur) return;
    const asDraft = (x) => ({ ...x, status: 'draft', at: null, publishing: undefined, targets: x.targets.map((t) => (t.status === 'published' ? t : { ...t, status: 'draft', error: '' })) });
    const body = this.toInput(asDraft(cur));
    this._srvStatus.set(id, 'draft');
    this._srv.set(id, JSON.stringify(body));
    super.setState((st) => ({ posts: st.posts.map((x) => (x.id === id ? asDraft(x) : x)) }));
    this.flash(`${msg || 'Publishing is off on your plan.'} The post is saved in Drafts.`, true);
    await api(`/api/app/posts/${id}`, { method: 'PUT', body });
    this._onServer.add(id);
  }

  /** Replaces the optimistic "publishing…" state with what the server reports, and says how it went. */
  showPublished(id, sp) {
    const cur = this.state.posts.find((x) => x.id === id);
    if (!sp || !cur) return;
    const m = mapPost(sp, {});
    const next = { ...cur, status: m.status, at: m.at, targets: m.targets, publishing: m.publishing };
    this._srvStatus.set(id, m.status);
    this._srv.set(id, JSON.stringify(this.toInput(next)));
    super.setState((st) => ({ posts: st.posts.map((x) => (x.id === id ? { ...x, status: next.status, at: next.at, targets: next.targets, publishing: next.publishing } : x)) }));
    const n = m.targets.length, failed = m.targets.filter((t) => t.status === 'failed');
    const acc = (k) => `${k} account${k === 1 ? '' : 's'}`;
    if (m.publishing) this.flash(`Still publishing to ${acc(n)}. This updates when it's done.`);
    else if (failed.length === n && n) this.flash(`Couldn't publish: ${failed[0].error}. See the Failed tab.`, true);
    else if (failed.length) this.flash(`Published to ${acc(n - failed.length)}. ${failed.length} failed. See the Failed tab.`, true);
    else this.flash(`Published to ${acc(n)}`);
  }

  /* ---------- overrides of design actions ---------- */
  publishNow(p) {
    // The server handles evergreen re-queueing, so skip the design's local copy. The targets show as pending
    // ("publishing…") until the server answers; see _sync and showPublished.
    if (p.approval === 'pending') return this.flash('Approve this post before publishing it', true);
    if (p.publishing) return;
    this.setPost(p.id, (x) => ({ ...x, status: 'published', at: Date.now() }));
    this.flash(`Publishing to ${p.targets.length} account${p.targets.length === 1 ? '' : 's'}…`);
  }

  editPost(p) {
    const src = p.src ? this.state.posts.find((x) => x.id === p.src) || p : p;
    super.editPost(src);
    // Drop accounts disconnected since; start a fresh composer session (uploads still running finish into the library).
    const known = new Set(this.state.accounts.map((a) => a.id));
    super.setState((st) => ({ uploads: [], draft: { ...st.draft, targets: (st.draft.targets || []).filter((id) => known.has(id)), mediaIds: [...(src.mediaIds || [])], tok: newTok() } }));
  }

  submit() {
    if ((this.state.uploads || []).length) return this.flash('Wait for your uploads to finish first', true);
    const d = this.state.draft;
    const { serverError, ...draft } = d;
    this._submitFor = { id: d.id, mediaIds: [...(d.mediaIds || [])], draft: { ...draft, mediaIds: [...(d.mediaIds || [])], ov: JSON.parse(JSON.stringify(d.ov || {})) } };
    super.submit();
    if (d.mode === 'now') this.flash(`Publishing to ${d.targets.length} account${d.targets.length === 1 ? '' : 's'}…`);
  }

  /** The post's first image as a CSS background. Videos keep the placeholder (CSS can't show a video frame). */
  mediaThumb(p, dim) {
    const lib = this.state.library || [];
    if (this._thumbLib !== lib) { this._thumbLib = lib; this._thumbById = new Map(lib.map((m) => [m.id, m])); }
    const m = (p.mediaIds || []).map((id) => this._thumbById.get(id)).find((x) => x?.url);
    if (!m) return null;
    const url = `url("${String(m.url).replace(/["\\\n]/g, encodeURIComponent)}") center/cover no-repeat #2a2e34`;
    return dim ? `linear-gradient(180deg, rgba(0,0,0,.2), rgba(0,0,0,.55)), ${url}` : url;
  }

  newPost(when) {
    super.newPost(when);
    super.setState((st) => ({ uploads: [], draft: { ...st.draft, mediaIds: [], tok: newTok() } }));
  }

  /** Pinterest's Board select lists the account's real boards. */
  fieldOptions(a, f) {
    if (a.platform === 'pinterest' && f.key === 'board') return (a.boards || []).map((b) => b.name).filter(Boolean);
    return super.fieldOptions(a, f);
  }

  addFiles(list) {
    // Captions start from the file name only when a person wrote it; camera and app names start empty.
    const items = list.map((f, i) => ({ id: 'f' + Date.now() + i, name: f.name, kind: f.kind, url: f.url || '', tone: f.tone || '#7a6148', caption: captionFromFilename(f.name), at: null }));
    list.forEach((f, i) => { if (f.file) this._uploads.set(items[i].id, this.upload(f.file).then((m) => m.id).catch((e) => { this.flash(e.message, true); return null; })); });
    // Videos get a real still as their thumbnail, like images, once the browser has decoded a frame.
    list.forEach((f, i) => {
      if (!f.file || f.kind !== 'VIDEO' || f.url) return;
      videoFrame(f.file).then((url) => { if (url) super.setState((st) => ({ bulkFiles: st.bulkFiles.map((x) => (x.id === items[i].id ? { ...x, url } : x)) })); });
    });
    super.setState((st) => ({ bulkFiles: [...st.bulkFiles, ...items], bulkStep: 2 }), () => this.respace(false));
  }

  bulkCreate(asDraft) {
    const s = this.state, accs = s.bulkAccs;
    if (!accs.length) return this.flash('Pick at least one account', true);
    const posts = s.bulkFiles.map((f, i) => ({ id: 'p' + Date.now() + i, fileId: f.id, labels: [], status: asDraft ? 'draft' : 'scheduled', at: asDraft ? null : f.at, caption: f.caption, media: [f.kind], ov: {}, targets: accs.map((a) => ({ acc: a, status: asDraft ? 'draft' : 'scheduled', error: '' })) }));
    this.setState({ posts: [...s.posts, ...posts], bulkFiles: [], screen: 'queue', tab: asDraft ? 'drafts' : 'upcoming' });
    this.flash(asDraft ? `Saved ${posts.length} drafts` : `Scheduled ${posts.length} posts`);
  }

  /* ---------- uploads ---------- */
  /**
   * Videos uploaded before posters existed get one made in this browser, one at a time, so from the
   * next load on they show a still instead of loading the video. Stops at the first failure (usually
   * a bucket that doesn't allow cross-origin reads) rather than downloading every video for nothing.
   */
  async backfillPosters() {
    if (this._backfilling) return;
    this._backfilling = true;
    try {
      const todo = (this.state.library || []).filter((m) => m.videoUrl && !m.poster && !m.url);
      for (const m of todo) {
        const blob = await posterFromUrl(m.videoUrl);
        if (!blob) return;
        const r = await api(`/api/v1/media/${m.id}`, { method: 'PATCH', body: { poster_size: blob.size } });
        if (!r.poster_upload_url) return;
        await putWithProgress(r.poster_upload_url, blob, null);
        const done = await api(`/api/v1/media/${m.id}`, { method: 'PATCH', body: { poster: true } });
        const fresh = mapMedia(done.media, {}, usageCtx(this.state));
        super.setState((st) => ({ library: st.library.map((x) => (x.id === m.id ? { ...x, url: fresh.url, poster: true } : x)) }));
      }
    } catch {
      /* best effort */
    } finally {
      this._backfilling = false;
    }
  }

  async upload(file, folder = null, onProgress = null) {
    if (!this.state.storage) throw new Error("Media storage isn't available right now. Try again later.");
    // Videos bring a JPEG still along, so the library never has to load the video to show a thumbnail.
    const poster = file.type.startsWith('video/') ? await posterBlob(await videoFrame(file, { width: 640 })) : null;
    const r = await api('/api/v1/media', { method: 'POST', body: { filename: file.name, mime: file.type, size: file.size, folder, ...(poster ? { poster_size: poster.size } : {}) } });
    await putWithProgress(r.upload_url, file, onProgress);
    let withPoster = false;
    if (poster && r.poster_upload_url) withPoster = await putWithProgress(r.poster_upload_url, poster, null).then(() => true, () => false);
    const done = await api(`/api/v1/media/${r.id}`, { method: 'PATCH', body: { uploaded: true, ...(withPoster ? { poster: true } : {}) } });
    const item = mapMedia(done.media, {}, usageCtx(this.state));
    this._libKey = JSON.stringify([[item.id, item.folder], ...JSON.parse(this._libKey || '[]')]);
    super.setState((st) => ({ library: [item, ...st.library] }));
    return done.media;
  }

  pickFiles(accept, multiple, onFiles) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.multiple = multiple;
    input.onchange = () => onFiles([...(input.files || [])]);
    input.click();
  }

  /** Photos go through the cropper (1:1, 4:5, 9:16…) first; videos and GIFs upload as they are. */
  cropThenAdd(files) {
    const photos = files.filter((f) => f.type.startsWith('image/') && f.type !== 'image/gif');
    const rest = files.filter((f) => !photos.includes(f));
    if (rest.length) this.addToDraft(rest);
    if (photos.length) super.setState({ cropFiles: photos });
  }

  /** Uploads files into the draft. Each file shows as a tile with its progress until it's added. */
  addToDraft(files) {
    if (!files.length) return;
    // Each upload belongs to the draft it was started from. If you switch posts meanwhile, the file still lands in
    // the library but is not added to whatever post is open by then.
    let tok = this.state.draft?.tok || this._lazyTok;
    if (!tok) { tok = this._lazyTok = newTok(); super.setState((st) => ({ draft: { ...st.draft, tok } }), () => { this._lazyTok = null; }); }
    const mine = (st) => (st.draft?.tok || null) === tok;
    const jobs = files.map((f, i) => ({ key: `up${Date.now()}_${i}`, name: f.name, kind: kindOf(f.type), pct: 0, file: f }));
    super.setState((st) => ({ uploads: [...(st.uploads || []), ...jobs.map(({ file, ...j }) => j)] }));
    const setPct = (key, pct) => super.setState((st) => ({ uploads: (st.uploads || []).map((u) => (u.key === key ? { ...u, pct } : u)) }));
    const drop = (key) => super.setState((st) => ({ uploads: (st.uploads || []).filter((u) => u.key !== key) }));
    this._busy++;
    let added = 0, elsewhere = 0;
    Promise.allSettled(jobs.map((j) => this.upload(j.file, null, (pct) => setPct(j.key, pct))
      .then((m) => {
        drop(j.key);
        if (!mine(this.state)) { elsewhere++; return; }
        added++;
        super.setState((st) => (mine(st) ? { draft: { ...st.draft, media: [...st.draft.media, kindOf(m.mime)], mediaIds: [...(st.draft.mediaIds || []), m.id] } } : null));
      })
      .catch((e) => { drop(j.key); this.flash(`${j.name}: ${e.message}`, true); throw e; })))
      .then((rs) => {
        if (elsewhere) this.flash(`${elsewhere} file${elsewhere === 1 ? '' : 's'} finished uploading after you switched posts. Find ${elsewhere === 1 ? 'it' : 'them'} in the Media library.`);
        else if (added && rs.every((r) => r.status === 'fulfilled')) this.flash(`Added ${added} file${added === 1 ? '' : 's'}`);
      })
      .finally(() => { this._busy--; });
  }

  /* ---------- accounts ---------- */
  connect(platform, { reconnect = false } = {}) {
    const s = this.state;
    // Reconnecting an existing account never needs a free slot.
    if (!reconnect && s.accounts.length >= s.accountLimit) {
      this.flash(`Your plan allows ${s.accountLimit} connected accounts. Upgrade or disconnect an account to add more.`, true);
      if (s.billing?.enabled && s.wsList.find((w) => w.id === s.wsId)?.role === 'owner') this.openBilling();
      return;
    }
    if (platform === 'bluesky') return this.openBluesky();
    if (!s.platforms[platform]?.configured) return this.flash(`${P[platform].label} isn't available yet.`, true);
    window.location.href = `/api/connect/${platform}`;
  }

  openBluesky() {
    super.setState({
      modal: {
        title: 'Connect Bluesky',
        body: <>Use your handle and an <a href="https://bsky.app/settings/app-passwords" target="_blank" rel="noopener noreferrer">app password</a>, not your main password.</>,
        fields: [{ name: 'identifier', label: 'Handle', placeholder: 'you.bsky.social' }, { name: 'password', label: 'App password', type: 'password', placeholder: 'xxxx-xxxx-xxxx-xxxx' }],
        cta: 'Connect',
        submit: async (v) => {
          const r = await api('/api/connect/bluesky', { method: 'POST', body: v });
          const acc = mapAccount(r.account);
          this._accKey = [...this.state.accounts.filter((a) => a.id !== acc.id).map((a) => a.id), acc.id].join(',');
          super.setState((st) => ({ accounts: [...st.accounts.filter((a) => a.id !== acc.id), acc] }));
          this.flash(`Connected Bluesky @${acc.username}`);
        },
      },
    });
  }

  /* ---------- workspaces ---------- */
  async switchWorkspace(id) {
    await this.flushSaves();
    await api('/api/auth/workspace', { method: 'PUT', body: { id } });
    super.setState({ wsOpen: false, loading: true, screen: 'home', draft: Base.blank(), selected: [], selecting: false, labelFilter: null, bulkFiles: [] });
    await this.load(true);
  }

  newWorkspace() {
    super.setState({
      wsOpen: false,
      modal: {
        title: 'New workspace', body: 'A separate space for a client or brand, with its own accounts and queue.',
        fields: [{ name: 'name', label: 'Name', placeholder: 'Northside Coffee' }], cta: 'Create workspace',
        submit: async (v) => {
          await this.flushSaves();
          await api('/api/auth/workspace', { method: 'POST', body: { name: v.name } });
          super.setState({ loading: true, screen: 'home', draft: Base.blank(), bulkFiles: [] });
          await this.load(true);
          this.flash(`Created ${v.name}`);
        },
      },
    });
  }

  /* ---------- client preview link ---------- */
  async shareDraft() {
    const id = this.state.draft?.id;
    if (!id) return;
    try {
      // Save pending edits first so the client sees the latest version.
      await Promise.all([...this._queue.values()]);
      const r = await api(`/api/v1/posts/${id}/share`, { method: 'POST' });
      super.setState({ shareLink: r });
    } catch (e) {
      this.flash(e.message, true);
    }
  }

  /* ---------- billing ---------- */
  openBilling() {
    const b = this.state.billing;
    if (b && ['trial', 'active', 'past_due'].includes(b.state) && b.hasCustomer) return this.goBilling('/api/billing/portal');
    super.setState({ planPicker: true });
  }

  async goBilling(path, body) {
    try {
      const { url } = await api(path, { method: 'POST', body });
      window.location.href = url;
    } catch (e) {
      this.flash(e.message, true);
      throw e;
    }
  }

  async signOut() {
    await this.flushSaves();
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  async flushSaves() {
    clearTimeout(this._prefsT);
    // Leaving this workspace: deletes waiting for their Undo window go out now, and Undo no longer applies.
    this._undo = null;
    for (const id of [...this._pendingDel.keys()]) this.commitDelete(id);
    await Promise.all([...this._queue.values()]);
    await api('/api/app/prefs', { method: 'PATCH', body: { prefs: this.prefsOf(this.state) } }).catch(() => {});
  }

  /* ---------- design values → real actions ---------- */
  renderVals() {
    const v = super.renderVals();
    const s = this.state, d = s.draft;
    const accBy = (pred) => s.accounts.find(pred);
    const cur = s.wsList.find((w) => w.id === s.wsId);

    // Workspace switcher, with "new workspace" and "sign out".
    const wsTone = (id) => (id === s.wsId ? '#d9ff35' : hashTone(id));
    v.workspaces = [
      ...s.wsList.map((w) => ({ name: w.name, sub: w.role === 'owner' ? 'Owner' : 'Member', tone: wsTone(w.id), mark: w.id === s.wsId ? '✓' : '', bg: w.id === s.wsId ? '#22252a' : 'transparent', pick: () => (w.id === s.wsId ? super.setState({ wsOpen: false }) : this.switchWorkspace(w.id).catch((e) => this.flash(e.message, true))) })),
      { name: '+ New workspace', sub: 'For a client or brand', tone: '#2a2e34', mark: '', bg: 'transparent', pick: () => this.newWorkspace() },
      { name: 'Automations', sub: 'Signature, RSS, webhooks', tone: '#2a2e34', mark: '', bg: 'transparent', pick: () => { window.location.href = '/app/automations'; } },
      ...(s.billing?.enabled && cur?.role === 'owner'
        ? [{ name: 'Billing', sub: billingLine(s.billing), tone: '#2a2e34', mark: '', bg: 'transparent', pick: () => { super.setState({ wsOpen: false }); this.openBilling(); } }]
        : []),
      { name: 'Sign out', sub: this.userEmail || '', tone: '#2a2e34', mark: '', bg: 'transparent', pick: () => this.signOut() },
    ];
    v.wsName = cur?.name || 'Workspace';
    v.wsSub = `${s.billing?.enabled ? stateName(s.billing) : planName(s.plan)} · ${s.accounts.length} account${s.accounts.length === 1 ? '' : 's'}`;
    v.wsTone = '#d9ff35';
    v.greetName = this.userName || '';
    if (typeof v.greeting === 'string') v.greeting = v.greeting.replace(/, [^,]*$/, `, ${this.userName || 'there'}`);

    // Accounts: real connect / reconnect.
    // Platforms we haven't set up yet show "Coming soon" with a disabled button, listed after the rest.
    v.platformCards = v.platformCards.map((c, i) => {
      const id = PLATFORM_IDS[i];
      const configured = id === 'bluesky' || !!s.platforms[id]?.configured;
      return { ...c, needsKeys: !configured, cursor: configured ? 'pointer' : 'not-allowed', btnOpacity: configured ? '1' : '.5', hasCount: c.hasCount || (configured && s.accounts.some((a) => a.platform === id)), connect: configured ? () => this.connect(id) : () => {} };
    }).sort((x, y) => x.needsKeys - y.needsKeys);
    v.connected = v.connected.map((c) => {
      const a = accBy((x) => x.id === c.id);
      // Tokens that renew by themselves have no date worth showing.
      const detail = a?.health === 'error' ? a.error || 'Connection error' : a?.expires && !a.refresh ? `Token valid until ${new Date(a.expires).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'Connected';
      return { ...c, healthDetail: c.needsFix ? c.healthDetail : detail, reconnect: a?.health === 'over' ? () => this.openBilling() : () => this.connect(a?.platform || 'bluesky', { reconnect: true }) };
    });
    const fixFor = (a) => (a.health === 'over' ? () => this.openBilling() : () => this.connect(a.platform, { reconnect: true }));
    // Matched by account id: names can contain spaces and one username can exist on several platforms.
    for (const t of v.healthTiles || []) {
      const a = accBy((x) => x.id === t.accId);
      if (a) t.fix = fixFor(a);
    }
    for (const item of v.attention || []) {
      for (const act of item.actions || []) {
        const a = act.accId && accBy((x) => x.id === act.accId);
        if (a) act.go = fixFor(a);
      }
    }

    // Threads: on X, Bluesky and Threads a caption split by `---` lines is several posts, each with
    // the platform's limit. The counter says so, and the design's "over the limit" problem is lifted
    // when every part fits.
    const lifted = [];
    for (const va of v.variants || []) {
      const a = accBy((x) => x.id === va.id);
      if (!a || !THREAD_PLATFORMS.has(a.platform)) continue;
      const parts = splitThread(va.text || '');
      if (parts.length < 2) continue;
      const max = P[a.platform].max;
      const longest = Math.max(...parts.map((x) => x.length));
      va.countText = `${parts.length}-post thread · longest ${longest}/${max}`;
      va.countColor = longest > max ? '#dc3545' : '#677184';
      if (longest <= max) lifted.push(`Your ${P[a.platform].label} caption is ${(va.text || '').length - max} characters over the ${max.toLocaleString()} limit. Shorten it in the ${P[a.platform].label} tab.`);
    }
    if (lifted.length) {
      v.problems = (v.problems || []).filter((m) => !lifted.includes(m));
      v.hasProblems = v.problems.length > 0;
      v.submitDisabled = d.targets.length === 0 || (v.hasProblems && d.mode !== 'draft');
      v.submitOpacity = v.submitDisabled ? 0.45 : 1;
    }

    // Composer media: real uploads.
    v.addImage = () => this.pickFiles('image/jpeg,image/png,image/gif,image/webp', true, (fs) => this.cropThenAdd(fs));
    v.mediaDrop = (e) => {
      e.preventDefault();
      super.setState({ mediaHover: false });
      const fl = [...(e.dataTransfer.files || [])].filter((f) => /^(image|video)\//.test(f.type));
      if (fl.length) this.cropThenAdd(fl);
    };
    v.addVideo = () => this.pickFiles('video/mp4,video/quicktime,video/webm', false, (fs) => this.addToDraft(fs));
    // Show the real image or video frame in the composer tiles, preview and queue; anything not in
    // the library yet keeps the placeholder.
    const libById = new Map((s.library || []).map((m) => [m.id, m]));
    const look = (kind, i, ids = d.mediaIds) => {
      const m = libById.get((ids || [])[i]);
      const none = { isVideo: false, video: '', labelBg: 'transparent', poster: '', preload: 'metadata' };
      const css = (u) => `#2a2e34 url("${String(u).replace(/["\\\n]/g, encodeURIComponent)}") center/cover no-repeat`;
      // A video with a poster still shows the still (no video bytes); the preview can still play it.
      if (m?.url && m.videoUrl) return { ...none, bg: css(m.url), label: '▶', labelBg: 'rgba(0,0,0,.5)', play: m.videoUrl, poster: m.url };
      if (m?.url) return { ...none, bg: css(m.url), label: '' };
      // Videos without a still show their first frame (#t=0.1 makes Safari render one) with a play badge.
      if (m?.videoUrl) return { ...none, bg: '#1d2025', label: '▶', isVideo: true, video: `${m.videoUrl}#t=0.5`, labelBg: 'rgba(0,0,0,.5)' };
      return { ...none, bg: 'linear-gradient(160deg,#9a7a58,#5d4a36)', label: kind === 'VIDEO' ? '▶ VIDEO' : kind };
    };
    v.mediaTiles = d.media.map((kind, i) => ({ kind, ...look(kind, i), remove: () => this.upd({ media: d.media.filter((_, j) => j !== i), mediaIds: (d.mediaIds || []).filter((_, j) => j !== i) }) }));
    // Files still uploading: a tile that fills up as the upload goes.
    for (const u of s.uploads || []) {
      v.mediaTiles.push({ kind: u.kind, isVideo: false, video: '', labelBg: 'rgba(0,0,0,.45)', label: u.pct < 99 ? `${u.pct}%` : 'Saving…',
        bg: `linear-gradient(to top, #5d6470 ${u.pct}%, #2a2e34 ${u.pct}%)`, remove: () => this.flash('Wait for the upload to finish, then remove it', true) });
    }
    if ((s.uploads || []).length) v.hasMedia = true;
    // The preview plays videos (with controls); the composer tiles stay still thumbnails.
    if (v.pv) v.pv.media = d.media.slice(0, v.pv.media.length || 4).map((kind, i) => { const t = look(kind, i); return t.isVideo || t.play ? { ...t, isVideo: true, video: t.play || t.video, preload: t.play ? 'none' : 'metadata', label: '', labelBg: 'transparent', controls: true, pe: 'auto' } : { ...t, controls: false, pe: 'none' }; });
    // Realistic preview (Instagram/Facebook feed, Reels, Stories) in place of the generic card.
    {
      const sel = s.accounts.filter((a) => d.targets.includes(a.id));
      const pa = sel.find((a) => a.id === d.previewId) || sel[0] || null;
      const meta = pa && (pa.platform === 'instagram' || pa.platform === 'facebook');
      const format = meta ? (d.ov[pa.id]?.opts || {}).format || d.postAs || 'Post' : pa ? 'Post' : d.postAs || 'Post';
      const media = d.media.map((kind, i) => { const m = libById.get((d.mediaIds || [])[i]); return { kind, url: m ? m.url || m.videoUrl || '' : '' }; });
      const at = d.mode === 'schedule' ? Base.fromLocal(d.when) : null;
      const when = d.mode === 'now' ? 'Just now' : at ? `${this.dayLabel(at)} ${this.time(at)}` : d.mode === 'queue' ? 'Next open slot' : 'Draft';
      v.pvClassic = false;
      v.pvCustom = true;
      v.pvNode = (
        <PostPreview
          account={pa && { name: pa.display || pa.username, handle: pa.username, avatar: pa.avatar, platform: pa.platform }}
          caption={pa ? d.ov[pa.id]?.caption ?? d.caption : d.caption}
          media={media}
          format={format}
          when={when}
        />
      );
    }
    // Instagram takes JPEG images only (the server refuses others); the design only knows "image", so check here.
    const jpegOnly = d.targets.map((id) => accBy((a) => a.id === id)).filter((a) => a?.platform === 'instagram');
    const notJpeg = (d.mediaIds || []).map((id) => libById.get(id)).filter((m) => m && m.mime?.startsWith('image/') && m.mime !== 'image/jpeg');
    if (jpegOnly.length && notJpeg.length) {
      const extra = jpegOnly.map((a) => `Instagram only accepts JPEG images: ${notJpeg.map((m) => m.name).join(', ')} ${notJpeg.length === 1 ? "isn't" : "aren't"} JPEG. Use JPG files or deselect @${a.username}.`);
      v.problems = [...new Set([...(v.problems || []), ...extra])];
      v.hasProblems = true;
      v.submitDisabled = d.mode !== 'draft';
      v.submitOpacity = v.submitDisabled ? 0.45 : 1;
    }
    // The server refused this post's first save; it was reopened here. Shown until it's submitted again (doesn't block).
    if (d.serverError) {
      v.problems = [`Not saved yet. The server said: ${d.serverError}`, ...(v.problems || [])];
      v.hasProblems = true;
    }

    // Media library.
    const q = (s.libQ || '').toLowerCase();
    // Same filter and order as the design's own list, so handlers line up by index.
    const inFolder = (s.folder === 'All' || !s.folder ? s.library : s.library.filter((m) => m.folder === s.folder))
      .filter((m) => (!q || m.name.toLowerCase().includes(q)) && (!s.libType || m.kind === s.libType) && matchesUsage(m, s.libUse))
      .sort((x, y) => (s.libSort === 'name' ? x.name.localeCompare(y.name) : s.libSort === 'used' ? y.used - x.used : s.libSort === 'rested' ? (x.last || 0) - (y.last || 0) : 0));
    // A file inside its reuse cooldown is still usable; the composer just says so.
    const headsUp = (m, lead) => this.flash(m.state === 'recent' ? `${lead} ${m.usageLong}` : lead);
    const useInNewPost = (m) => { super.setState({ pvMediaId: null, screen: 'compose', uploads: [], draft: { ...Base.blank(), media: [m.kind], mediaIds: [m.id], tok: newTok() } }); if (m.state === 'recent') headsUp(m, `${m.name}:`); };
    (v.libItems || []).forEach((it, i) => { const m = inFolder[i]; if (m) it.use = () => { this.upd({ media: [...d.media, m.kind], mediaIds: [...(d.mediaIds || []), m.id] }); headsUp(m, `Added ${m.name}.`); }; });
    (v.libCards || []).forEach((c, i) => { const m = inFolder[i]; if (m) c.use = () => useInNewPost(m); });
    // Changing the cooldown re-reads every file's state right away (and saves with the other settings).
    v.onCooldown = (e) => {
      const cooldown = Number(e.target.value);
      this.setState((st) => ({ cooldown, library: st.library.map((m) => withUsage(m, usageCtx({ ...st, cooldown }))) }));
      this.flash(cooldown ? `Files posted in the last ${cooldown} days now show as used recently` : 'Reuse cooldown off: every posted file counts as ready to reuse');
    };
    if (v.pvMedia && s.pvMediaId) {
      const m = s.library.find((x) => x.id === s.pvMediaId);
      if (m) {
        v.pvMedia.use = () => useInNewPost(m);
        // Full-size image on top of the already-loaded thumbnail, so the dialog is never blank while it loads.
        if (m.fullUrl && m.fullUrl !== m.url) v.pvMedia.thumb = `url("${String(m.fullUrl).replace(/["\\\n]/g, encodeURIComponent)}") center/cover no-repeat, ${m.tone} url("${String(m.url).replace(/["\\\n]/g, encodeURIComponent)}") center/cover no-repeat`;
      }
    }
    v.onLibFiles = (e) => {
      const fl = [...(e.target.files || [])];
      e.target.value = '';
      if (!fl.length) return;
      // From "All", files land in the library itself, not silently in the first folder.
      const folder = s.folder === 'All' ? null : s.folder;
      this.flash(`Uploading ${fl.length} file${fl.length === 1 ? '' : 's'}…`);
      Promise.all(fl.map((f) => this.upload(f, folder))).then(() => this.flash(`Uploaded ${fl.length} file${fl.length === 1 ? '' : 's'}${folder ? ' to ' + folder : ''}`)).catch((err) => this.flash(err.message, true));
    };
    v.folderName = s.folder === 'All' || !s.folder ? 'library' : s.folder;
    // Deleting selected files removes them from storage too; posts that already published keep their copies on the platforms.
    v.libBulkDelete = () => {
      const ids = s.libSel || [];
      if (!ids.length) return;
      const inPosts = s.posts.filter((p) => ['scheduled', 'draft'].includes(p.status) && (p.mediaIds || []).some((id) => ids.includes(id))).length;
      const warn = inPosts ? ` ${inPosts} scheduled or draft post${inPosts === 1 ? ' uses' : 's use'} them and would publish without media.` : '';
      if (!confirm(`Delete ${ids.length} file${ids.length === 1 ? '' : 's'} from the library and storage?${warn}`)) return;
      super.setState((st) => ({ library: st.library.filter((x) => !ids.includes(x.id)), libSel: [] }));
      Promise.all(ids.map((id) => api(`/api/v1/media/${id}`, { method: 'DELETE' }))).then(() => this.flash(`Deleted ${ids.length} file${ids.length === 1 ? '' : 's'}`)).catch((e) => { this.flash(e.message, true); this.load(false); });
    };
    const tally = { unused: 0, recent: 0, rested: 0 };
    for (const m of s.library) tally[m.state || 'unused']++;
    const cd = s.cooldown ?? DEFAULT_COOLDOWN_DAYS;
    v.libSummary = `${s.library.length} file${s.library.length === 1 ? '' : 's'} in ${s.folders.length} folder${s.folders.length === 1 ? '' : 's'}. ${tally.unused} never used · ${tally.rested} ready to reuse${cd ? ` · ${tally.recent} used in the last ${cd} days` : ''}. Each file shows where it has been posted and where it hasn't.`;

    // Bulk uploads keep the real files.
    const toItems = (fl) => fl.filter((f) => /^(image|video)\//.test(f.type)).map((f) => ({ name: f.name, kind: kindOf(f.type), url: f.type.startsWith('image') ? URL.createObjectURL(f) : '', file: f }));
    v.onFiles = (e) => { const fl = toItems([...(e.target.files || [])]); e.target.value = ''; if (fl.length) this.addFiles(fl); };
    v.bulkDrop = (e) => { e.preventDefault(); super.setState({ bulkHover: false }); const fl = toItems([...(e.dataTransfer.files || [])]); if (fl.length) this.addFiles(fl); };
    v.addSamples = (e) => { e.preventDefault(); e.stopPropagation(); this.flash('Choose files from your computer to schedule them', true); };

    // Queue: links to the live posts.
    const postById = Object.fromEntries(s.posts.map((p) => [p.id, p]));
    for (const g of v.groups || []) for (const it of g.items) {
      const p = postById[it.__id];
      if (p) it.media = p.media.map((kind, i) => look(kind, i, p.mediaIds));
      it.targets.forEach((t, i) => { const url = p?.targets[i]?.url; if (url && p.targets[i].status === 'published') { t.href = url; t.pe = 'auto'; t.arrow = '↗'; } else { t.href = '#'; t.pe = 'none'; t.arrow = ''; } });
    }

    // Analytics: engagement isn't fetched from the platforms yet.
    // Queue toolbar: the Select button stays in place on every tab (so the tab bar never shifts);
    // off the Upcoming tab it is shown muted and explains itself, since bulk actions apply to
    // scheduled posts (the design turns selection off anywhere else).
    if (s.screen === 'queue' && s.tab !== 'upcoming') {
      v.canSelect = true;
      v.selectLabel = 'Select';
      v.selectBorder = '#ebe9e3';
      v.selectBg = '#fff';
      v.selectColor = '#b9bec6';
      v.toggleSelect = () => this.flash('Select works on the Upcoming tab: switch there to pick posts to move or delete.');
    }

    // Bulk rows: an empty caption is flagged before review (it is allowed, but rarely meant).
    (v.bulkRows || []).forEach((row, i) => {
      const f = s.bulkFiles[i];
      if (!f || (f.caption || '').trim() || row.vLabel === 'No time' || row.vLabel === 'In the past') return;
      row.vLabel = 'No caption';
      row.vBg = '#fff1d6';
      row.vFg = '#8a5a00';
      if (!row.hasWarn) { row.hasWarn = true; row.warn = 'Add a caption, or use "Apply to all rows" above. Posting without one is allowed.'; }
    });

    // Extra Home attention items: a frequent poster wants to know before the queue runs dry, and
    // about drafts that have quietly piled up. Added after the design's own items; counters follow.
    const addAttention = (item) => {
      v.attention = [...(v.attention || []), item];
      v.attentionShown = s.allIssues ? v.attention : v.attention.slice(0, 3);
      v.hasMoreIssues = v.attention.length > 3;
      v.issuesLabel = s.allIssues ? 'Show fewer' : `View all ${v.attention.length} issues`;
      v.attnEmpty = false;
      v.attnCount = `${v.attention.length} item${v.attention.length === 1 ? '' : 's'}`;
      const n = v.attention.length;
      v.needText = `${n} item${n === 1 ? '' : 's'} that need attention`;
      v.needColor = '#a1281f';
      v.needBg = 'linear-gradient(transparent 62%,#fdd9d5 62%)';
    };
    if (s.screen === 'home' && (s.slots || []).length && (s.slotDays || []).length) {
      const weekEnd = Date.now() + 7 * 864e5;
      const openSlots = this.nextSlots(60).filter((ms) => ms <= weekEnd);
      const future = s.posts.filter((p) => p.status === 'scheduled' && p.at && p.at > Date.now()).map((p) => p.at).sort((a, b) => a - b);
      const lastAt = future.length ? future[future.length - 1] : null;
      const thisWeek = future.filter((at) => at <= weekEnd).length;
      if (openSlots.length >= 2 && (!lastAt || lastAt < weekEnd)) {
        addAttention({
          icon: '◷',
          iconBg: '#e8f1ff',
          iconFg: '#1d4ed8',
          title: lastAt ? `Queue runs dry after ${this.dayLabel(lastAt)}` : 'Nothing scheduled for the next 7 days',
          when: '',
          body: `${openSlots.length} open slot${openSlots.length === 1 ? '' : 's'} this week, the next ${this.slotLabel(openSlots[0])}. ${thisWeek} post${thisWeek === 1 ? '' : 's'} scheduled. Add a few now and the queue places them for you.`,
          actions: [
            { label: 'Add to queue', go: () => { this.newPost(); this.upd({ mode: 'queue' }); }, bg: '#141619', color: '#fff', border: '#141619' },
            { label: 'Open calendar', go: () => super.setState({ screen: 'calendar', calView: 'week', weekStart: this.wsMonday() }), bg: '#fff', color: '#141619', border: '#e7e5df' },
          ],
        });
      }
    }
    if (s.screen === 'home') {
      const stale = s.posts.filter((p) => p.status === 'draft' && p.updated && p.updated < Date.now() - 7 * 864e5);
      if (stale.length >= 3) {
        const oldest = Math.min(...stale.map((p) => p.updated));
        const days = Math.floor((Date.now() - oldest) / 864e5);
        addAttention({
          icon: '✎',
          iconBg: '#f1efe8',
          iconFg: '#5d4a36',
          title: `${stale.length} drafts have waited more than a week`,
          when: '',
          body: `The oldest is ${days} days old. Schedule the ones that are ready, or delete what you won't post, so the drafts list stays something you can work from.`,
          actions: [{ label: 'Open drafts', go: () => super.setState({ screen: 'queue', tab: 'drafts' }), bg: '#141619', color: '#fff', border: '#141619' }],
        });
      }
    }

    // Impressions and engagement aren't fetched from the platforms yet. Clicks are real when link
    // tracking is on (Automations → Link clicks): the same six posts the design lists, in its order.
    const recent = s.posts.filter((p) => p.status === 'published' || p.status === 'partial').sort((a, b) => b.at - a.at).slice(0, 6);
    v.postStats = (v.postStats || []).map((r, i) => {
      const clicks = (recent[i]?.targets || []).reduce((n, t) => n + (t.clicks || 0), 0);
      return { ...r, imp: '—', eng: '—', clicks: s.trackLinks ? clicks.toLocaleString('en-US') : '—', rate: '—', rateColor: '#677184' };
    });

    // Calendar CSV with the real post URLs.
    v.exportCalCsv = () => {
      const z2 = (n) => String(n).padStart(2, '0'), esc = (x) => (/[",\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x);
      const range = this.calRange(); // the workspace's days
      const rows = [['date', 'time', 'account', 'platform', 'caption', 'status', 'labels', 'url']];
      for (const p of s.posts.filter((x) => x.at && x.at >= range[0] && x.at < range[1]).sort((a, b) => a.at - b.at)) {
        for (const t of p.targets) {
          const a = accBy((x) => x.id === t.acc);
          if (!a) continue;
          const dt = this.wsDate(p.at);
          rows.push([`${dt.getFullYear()}-${z2(dt.getMonth() + 1)}-${z2(dt.getDate())}`, `${z2(dt.getHours())}:${z2(dt.getMinutes())}`, '@' + a.username, P[a.platform].label, p.caption, t.status, (p.labels || []).join(';'), t.url || '']);
        }
      }
      const blob = new Blob([rows.map((r) => r.map((c) => esc(String(c))).join(',')).join('\n')], { type: 'text/csv' });
      const el = document.createElement('a'); el.href = URL.createObjectURL(blob); el.download = `calendar-${s.calView}-${new Date(range[0]).toISOString().slice(0, 10)}.csv`; document.body.appendChild(el); el.click(); el.remove();
      this.flash(`Exported ${rows.length - 1} rows`);
    };

    // Settings: API keys, MCP setup and team.
    v.keys = s.keys.map((k) => ({ ...k, revoke: () => api(`/api/v1/keys/${k.id}`, { method: 'DELETE' }).then(() => { super.setState((st) => ({ keys: st.keys.filter((x) => x.id !== k.id) })); this.flash('Key revoked'); }).catch((e) => this.flash(e.message, true)) }));
    v.makeKey = () => api('/api/v1/keys', { method: 'POST', body: { name: s.keyName || 'Default' } }).then((r) => {
      super.setState((st) => ({ newKey: r.key, keyName: '', keys: [{ id: r.id, name: st.keyName || 'Default', prefix: r.prefix, meta: 'Created just now · never used' }, ...st.keys] }));
    }).catch((e) => this.flash(e.message, true));
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    v.mcpText = v.mcpText.replace('https://scheduleforyou.com', origin);
    // Team: each member's real role (owner, editor or member) and the pending invites with the role they'll get.
    v.members = this.memberRows(s.members, s.invites, (i) => this.revokeInvite(i));
    v.sendInvite = () => {
      const email = (s.invite || '').trim().toLowerCase(), role = s.inviteRole === 'editor' ? 'editor' : 'member';
      if (!email) return;
      api('/api/v1/team', { method: 'POST', body: { email, role } })
        .then((r) => {
          super.setState((st) => ({ invites: [...st.invites.filter((i) => i.email !== email), { email, role }], inviteUrl: r.invite_url, invite: '' }));
          this.load(false); // picks up the invite's id, so it can be revoked
          this.flash(r.emailed ? `Invite emailed to ${email}` : 'Invite link ready. Copy it and send it yourself.');
        })
        .catch((e) => this.flash(e.message, true));
    };
    return v;
  }

  /** Revokes a pending invite (owner only; the server answers 403 otherwise). */
  async revokeInvite(inv) {
    try {
      let id = inv.id;
      if (!id) id = ((await api('/api/v1/team')).invites || []).find((x) => x.email === inv.email)?.id;
      if (!id) throw new Error("Couldn't find that invite. Reload the page and try again.");
      await api(`/api/v1/team/invites/${id}`, { method: 'DELETE' });
      super.setState((st) => ({ invites: st.invites.filter((x) => x.email !== inv.email) }));
      this.flash(`Invite for ${inv.email} revoked`);
    } catch (e) {
      this.flash(e.message, true);
    }
  }

  /* ---------- extra UI: loading veil + small form dialog ---------- */
  render() {
    const m = this.state.modal;
    return (
      <>
        {super.render()}
        {this.state.loading && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 90, display: 'grid', placeItems: 'center', background: 'rgba(248,249,246,.86)', backdropFilter: 'blur(2px)', font: '500 15px Geist, system-ui, sans-serif', color: '#677184' }}>
            Loading your workspace…
          </div>
        )}
        {m && <FormDialog modal={m} onClose={() => super.setState({ modal: null })} />}
        {!this.state.loading && (
          <BillingBanner
            billing={this.state.billing}
            owner={this.state.wsList.find((w) => w.id === this.state.wsId)?.role === 'owner'}
            onChoose={() => this.openBilling()}
          />
        )}
        {!this.state.loading && this.state.screen === 'compose' && this.state.draft?.id && this._srv.has(this.state.draft.id) && (
          <button type="button" className="sfy-share-btn" onClick={() => this.shareDraft()} style={{ position: 'fixed', right: 20, zIndex: 70, padding: '10px 14px', borderRadius: 12, border: '1px solid #141619', background: '#fff', color: '#141619', font: '600 14px Geist, system-ui, sans-serif', cursor: 'pointer', boxShadow: '0 8px 24px rgba(20,22,25,.15)' }}>
            <style>{'.sfy-share-btn{bottom:20px}@media (max-width:760px){.sfy-share-btn{bottom:calc(156px + env(safe-area-inset-bottom));right:12px!important}}'}</style>
            Share for review
          </button>
        )}
        {this.state.pickId && (
          <ConnectPicker
            id={this.state.pickId}
            onClose={() => super.setState({ pickId: null })}
            onConnected={(r) => {
              super.setState({ pickId: null });
              const label = P[r.platform]?.label || r.platform;
              this.flash(r.skipped ? `Connected ${r.added} ${label} account${r.added === 1 ? '' : 's'}. ${r.skipped} didn't fit: your plan allows ${r.limit}.` : `Connected ${r.added} ${label} account${r.added === 1 ? '' : 's'}`, !!r.skipped);
              this.load(false);
            }}
          />
        )}
        {this.state.cropFiles && (
          <ImageCropper
            files={this.state.cropFiles}
            onDone={(fs) => { super.setState({ cropFiles: null }); this.addToDraft(fs); }}
            onCancel={() => super.setState({ cropFiles: null })}
          />
        )}
        {this.state.shareLink && <ShareDialog link={this.state.shareLink} onClose={() => super.setState({ shareLink: null })} />}
        {this.state.planPicker && (
          <PlanDialog
            billing={this.state.billing}
            onPick={(plan, interval) => this.goBilling('/api/billing/checkout', { plan, interval })}
            onClose={() => super.setState({ planPicker: false })}
          />
        )}
      </>
    );
  }
}

function FormDialog({ modal, onClose }) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const submit = async (e) => {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget).entries());
    setBusy(true);
    setError('');
    try {
      await modal.submit(values);
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setBusy(false);
    }
  };
  const input = { font: 'inherit', fontSize: 16, padding: '10px 12px', border: '1px solid #e7e5df', borderRadius: 10, outline: 'none', background: '#fff' };
  return (
    <div role="dialog" aria-modal="true" aria-label={modal.title} onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, zIndex: 95, display: 'grid', placeItems: 'center', padding: 16, background: 'rgba(20,22,25,.45)', fontFamily: 'Geist, system-ui, sans-serif' }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 12, padding: 22, borderRadius: 16, background: '#fff', color: '#141619', boxShadow: '0 30px 80px -30px rgba(20,22,25,.6)' }}>
        <strong style={{ fontSize: 18, letterSpacing: '-0.02em' }}>{modal.title}</strong>
        {modal.body && <p style={{ margin: 0, fontSize: 14, color: '#677184', lineHeight: 1.5 }}>{modal.body}</p>}
        {modal.fields.map((f, i) => (
          <label key={f.name} style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13, fontWeight: 500, color: '#4a4f57' }}>
            {f.label}
            <input name={f.name} type={f.type || 'text'} placeholder={f.placeholder} required autoFocus={i === 0} autoComplete="off" style={input} />
          </label>
        ))}
        {error && <p role="alert" style={{ margin: 0, padding: '9px 11px', borderRadius: 9, background: '#fff1f0', color: '#a1281f', fontSize: 13 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <button type="button" onClick={onClose} style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid #e7e5df', background: '#fff', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
          <button type="submit" disabled={busy} style={{ padding: '9px 16px', borderRadius: 10, border: 0, background: '#141619', color: '#fff', cursor: 'pointer', fontWeight: 600, opacity: busy ? 0.6 : 1 }}>{busy ? 'One moment…' : modal.cta}</button>
        </div>
      </form>
    </div>
  );
}


/* ---------- billing UI ---------- */
const planName = (p) => ({ trial: 'Trial', none: 'No plan', solo: 'Solo', studio: 'Studio' })[p] || p;
const stateName = (b) => ({ needs_card: 'No plan yet', trial: `${planName(b.plan)} trial`, expired: 'Plan ended', past_due: planName(b.plan) })[b.state] || planName(b.plan);

function billingLine(b) {
  const day = (t) => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (b.state === 'needs_card') return `Start your ${b.trialDays || 7}-day free trial`;
  if (b.state === 'trial') return b.daysLeft != null ? `${planName(b.plan)} trial · ${b.daysLeft} day${b.daysLeft === 1 ? '' : 's'} left` : `${planName(b.plan)} trial`;
  if (b.state === 'expired') return 'Plan ended · choose a plan';
  if (b.state === 'past_due') return 'Payment failed · update card';
  if (b.cancelAtPeriodEnd && b.periodEnd) return `${planName(b.plan)} · ends ${day(b.periodEnd)}`;
  return `${planName(b.plan)} plan`;
}

/** Slim notice for trial countdown, expired trial or failed payment. Nothing when the plan is fine. */
function BillingBanner({ billing: b, owner, onChoose }) {
  if (!b?.enabled) return null;
  let text = '';
  let tone = 'calm';
  let cta = 'Choose a plan';
  const cur = b.plans?.find((p) => p.id === b.plan);
  const price = cur && (b.interval === 'year' ? `${cur.yearlyAmount} for the year` : cur.amount);
  if (b.state === 'needs_card') { text = `Add a card to start your ${b.trialDays || 7}-day free trial. Publishing is off until then.`; cta = 'Start free trial'; }
  else if (b.state === 'trial' && b.daysLeft != null && b.daysLeft <= 2 && !b.cancelAtPeriodEnd) { text = `Your free trial ends in ${b.daysLeft} day${b.daysLeft === 1 ? '' : 's'}${price ? `. Your card will be charged $${price}` : ''}.`; cta = 'Manage billing'; }
  else if (b.state === 'expired') { text = 'Your plan has ended. Scheduled posts are paused.'; tone = 'alert'; }
  else if (b.state === 'past_due') { text = 'Your last payment failed. Update your card to avoid interruption.'; tone = 'alert'; cta = 'Update card'; }
  if (!text) return null;
  const alert = tone === 'alert';
  return (
    <div role="status" className="sfy-billing-banner" style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', zIndex: 80, display: 'flex', alignItems: 'center', gap: 12, maxWidth: 'calc(100vw - 32px)', padding: '10px 12px 10px 16px', borderRadius: 14, background: alert ? '#fff1ef' : '#141619', color: alert ? '#a1281f' : '#fff', border: alert ? '1px solid #f3c9c3' : '1px solid #141619', boxShadow: '0 8px 24px rgba(20,22,25,.18)', font: '500 14px Geist, system-ui, sans-serif' }}>
      <style>{'.sfy-billing-banner{bottom:20px}@media (max-width:760px){.sfy-billing-banner{bottom:auto;top:calc(64px + env(safe-area-inset-top));width:calc(100vw - 24px);box-sizing:border-box;font-size:13px!important}}'}</style>
      <span>{text}{!owner && ' Ask the workspace owner to choose a plan.'}</span>
      {owner && (
        <button type="button" onClick={onChoose} style={{ flex: 'none', padding: '7px 12px', borderRadius: 10, border: 0, background: '#dcff2e', color: '#15171a', fontWeight: 600, cursor: 'pointer' }}>
          {cta}
        </button>
      )}
    </div>
  );
}

function PlanDialog({ billing: b, onPick, onClose }) {
  const [busy, setBusy] = React.useState('');
  const [interval, setInterval_] = React.useState('month');
  const yearly = interval === 'year';
  const plans = b?.plans || [];
  const pick = async (id) => {
    setBusy(id);
    try { await onPick(id, interval); } catch { setBusy(''); }
  };
  const tab = (on) => ({ flex: 1, padding: '7px 12px', borderRadius: 9, border: 0, cursor: 'pointer', fontWeight: 600, fontSize: 13, background: on ? '#141619' : 'transparent', color: on ? '#fff' : '#3d434d' });
  const features = { solo: ['15 connected accounts', 'Unlimited posts & scheduling', 'API + MCP access'], studio: ['100 connected accounts', 'Team members', 'Priority support'] };
  return (
    <div role="dialog" aria-modal="true" aria-label="Choose a plan" onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, zIndex: 95, display: 'grid', placeItems: 'center', padding: 16, background: 'rgba(20,22,25,.45)', fontFamily: 'Geist, system-ui, sans-serif' }}>
      <div style={{ width: 'min(560px, 100%)', background: '#fff', borderRadius: 18, padding: 22, display: 'grid', gap: 14, boxShadow: '0 24px 60px rgba(20,22,25,.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <strong style={{ fontSize: 18, letterSpacing: '-0.02em' }}>{b?.trialEligible ? `Start your ${b.trialDays || 7}-day free trial` : 'Choose a plan'}</strong>
          <button type="button" onClick={onClose} aria-label="Close" style={{ border: 0, background: 'transparent', fontSize: 20, cursor: 'pointer', color: '#677184' }}>×</button>
        </div>
        <div role="group" aria-label="Billing period" style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 12, background: '#f1f1ec', alignSelf: 'start', maxWidth: 320 }}>
          <button type="button" aria-pressed={!yearly} onClick={() => setInterval_('month')} style={tab(!yearly)}>Monthly</button>
          <button type="button" aria-pressed={yearly} onClick={() => setInterval_('year')} style={tab(yearly)}>Yearly <span style={{ color: yearly ? '#d9ff35' : '#15803d', fontWeight: 600 }}>2 months free</span></button>
        </div>
        <p style={{ margin: 0, fontSize: 14, color: '#677184', lineHeight: 1.5 }}>
          {b?.trialEligible
            ? `${b?.trialDays || 7} days free, then billed ${yearly ? 'yearly' : 'monthly'}. A card is required to start; you are not charged until day ${(b?.trialDays || 7) + 1}, and you can cancel before then.`
            : `Billed ${yearly ? 'yearly' : 'monthly'}. Cancel anytime.`}{' '}Payments are handled by Stripe.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {plans.map((p) => (
            <div key={p.id} style={{ border: p.id === 'studio' ? '2px solid #141619' : '1px solid #e5e3dc', borderRadius: 14, padding: 16, display: 'grid', gap: 10, alignContent: 'start' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: 16 }}>{p.name}</strong>
                <span><strong style={{ fontSize: 22 }}>${yearly ? +(p.yearlyAmount / 12).toFixed(2) : p.amount}</strong><span style={{ color: '#677184', fontSize: 13 }}>/mo</span></span>
              </div>
              <span style={{ marginTop: -6, fontSize: 12, color: '#677184' }}>{yearly ? `$${p.yearlyAmount} billed yearly · save $${p.amount * 12 - p.yearlyAmount}` : 'Billed monthly'}</span>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#3d434d', lineHeight: 1.7 }}>
                {(features[p.id] || []).map((f) => <li key={f}>{f}</li>)}
              </ul>
              <button type="button" disabled={!!busy} onClick={() => pick(p.id)} style={{ padding: '10px 14px', borderRadius: 10, border: 0, background: p.id === 'studio' ? '#dcff2e' : '#141619', color: p.id === 'studio' ? '#15171a' : '#fff', fontWeight: 600, cursor: 'pointer', opacity: busy && busy !== p.id ? 0.5 : 1 }}>
                {busy === p.id ? 'Opening checkout…' : b?.trialEligible ? `Try ${p.name} free` : `Choose ${p.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


function ShareDialog({ link, onClose }) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(link.url); setCopied(true); } catch { setCopied(false); }
  };
  return (
    <div role="dialog" aria-modal="true" aria-label="Share for review" onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, zIndex: 95, display: 'grid', placeItems: 'center', padding: 16, background: 'rgba(20,22,25,.45)', fontFamily: 'Geist, system-ui, sans-serif' }}>
      <div style={{ width: 'min(480px, 100%)', background: '#fff', borderRadius: 18, padding: 22, display: 'grid', gap: 12, boxShadow: '0 24px 60px rgba(20,22,25,.25)' }}>
        <strong style={{ fontSize: 18, letterSpacing: '-0.02em' }}>Share for review</strong>
        <p style={{ margin: 0, fontSize: 14, color: '#677184', lineHeight: 1.5 }}>
          Anyone with this link can see the post, approve it, ask for changes or comment. No account needed. You&apos;ll get an email for each response. The link works until {new Date(link.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.
        </p>
        <input readOnly value={link.url} onFocus={(e) => e.target.select()} style={{ font: '13px "Geist Mono", ui-monospace, monospace', padding: '10px 12px', borderRadius: 10, border: '1px solid #dcdad3', width: '100%', boxSizing: 'border-box' }} />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <a href={link.url} target="_blank" rel="noreferrer" style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid #dcdad3', color: '#141619', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>Open</a>
          <button type="button" onClick={copy} style={{ padding: '9px 16px', borderRadius: 10, border: 0, background: '#141619', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>{copied ? 'Copied' : 'Copy link'}</button>
          <button type="button" onClick={onClose} style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid #dcdad3', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>Done</button>
        </div>
      </div>
    </div>
  );
}
