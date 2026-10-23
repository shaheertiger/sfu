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
import React from 'react';
import Base from './Dashboard';

const P = Base.P;
const PLATFORM_IDS = Object.keys(P);
const kindOf = (mime) => (mime && mime.startsWith('video/') ? 'VIDEO' : 'IMG');
const TONES = ['#8a6d4f', '#6e5a42', '#7a6148', '#4f3f2e', '#5d6b4a', '#5d4a36', '#3e4a55', '#7d7a5c'];
const hashTone = (id) => TONES[Base.hash(id || '') % TONES.length];
const TIKTOK_PRIVACY = { Public: 'PUBLIC_TO_EVERYONE', Friends: 'MUTUAL_FOLLOW_FRIENDS', 'Only me': 'SELF_ONLY' };

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    window.location.href = '/login?next=/app';
    throw new Error('Signed out');
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
  const soon = a.token_expires_at && a.token_expires_at < Date.now() + 3 * 864e5;
  return {
    id: a.id, platform: a.platform, username: a.username || a.display_name || a.platform, display: a.display_name || a.username,
    health: a.status === 'error' ? 'error' : soon ? 'expiring' : undefined,
    error: a.last_error || '', expires: a.token_expires_at || null, boards: a.meta?.boards || [],
  };
}

function mapMedia(m, usage = {}) {
  return { id: m.id, name: m.filename, kind: kindOf(m.mime), tone: hashTone(m.id), folder: m.folder || '', used: usage[m.id] || 0, url: m.mime.startsWith('image/') ? m.url : '' };
}

function mapPost(sp, mediaById) {
  const status = sp.status === 'publishing' ? 'scheduled' : sp.status;
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
      status: t.status === 'published' ? 'published' : t.status === 'failed' ? 'failed' : status === 'draft' ? 'draft' : 'scheduled',
      error: t.status === 'failed' ? t.error || 'Failed' : '',
      url: t.external_url || '',
    })),
    labels: sp.labels || [], repeat: sp.repeat || 'none', evergreen: !!sp.evergreen, approval: sp.approval || null,
    remind: sp.remind !== false, note: sp.note || '', batch: sp.batch || null,
  };
}

/** Platform-specific fields from the composer → what the publishing adapters expect. */
function adapterOptions(account, ui = {}) {
  const o = { ui };
  if (!account) return o;
  if (account.platform === 'tiktok' && ui.privacy) o.privacy = TIKTOK_PRIVACY[ui.privacy] || ui.privacy;
  if (account.platform === 'youtube') { if (ui.title) o.title = ui.title; if (ui.privacy) o.privacy = ui.privacy; }
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
  }

  /* ---------- lifecycle ---------- */
  componentDidMount() {
    super.componentDidMount();
    this.load(true);
    this._poll = setInterval(() => { if (document.visibilityState === 'visible') this.load(false); }, 30_000);
    this._vis = () => { if (document.visibilityState === 'visible') this.load(false); };
    document.addEventListener('visibilitychange', this._vis);
  }
  componentWillUnmount() {
    super.componentWillUnmount();
    clearInterval(this._poll);
    clearTimeout(this._prefsT);
    document.removeEventListener('visibilitychange', this._vis);
  }

  setState(update, cb) {
    super.setState(update, () => { this._sync(); if (cb) cb(); });
  }

  async load(first) {
    if (!first && (this._busy > 0 || this._queue.size > 0)) return; // don't overwrite unsaved work
    try {
      const d = await api('/api/app/state');
      if (!first && (this._busy > 0 || this._queue.size > 0)) return;
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
    const patch = {
      loading: false, posts, accounts,
      library: d.media.map((m) => mapMedia(m, d.mediaUsage)),
      keys: d.keys.map((k) => ({ id: k.id, name: k.name, prefix: k.prefix, meta: `Created ${new Date(k.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${k.last_used_at ? 'last used ' + new Date(k.last_used_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'never used'}` })),
      members: d.members, wsId: d.workspace.id, wsList: d.workspaces, plan: d.workspace.plan, accountLimit: d.workspace.account_limit,
      platforms: Object.fromEntries(d.platforms.map((p) => [p.id, p])), storage: d.storage, billing: d.billing || null,
      tz: prefs.tz || Base.localTz(), remind: prefs.remind || { on: true, lead: 60 }, alerts: prefs.alerts || { fail: true, digest: true },
      slots: prefs.slots || [], slotDays: prefs.slotDays || [], paused: !!prefs.paused, labelList: prefs.labels || [],
      folders: prefs.folders || [], templates: prefs.templates || [], tagGroups: prefs.tagGroups || [], notes: prefs.notes || {},
    };
    if (first) {
      patch.bulkAccs = accounts.slice(0, 3).map((a) => a.id);
      patch.folder = 'All';
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
    if (q.get('screen')) super.setState({ screen: q.get('screen') });
    if (q.get('connected')) {
      const n = Number(q.get('n') || 1);
      this.flash(`Connected ${n} ${P[q.get('connected')]?.label || q.get('connected')} account${n === 1 ? '' : 's'}`);
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
  prefsOf(s) {
    return { tz: s.tz, remind: s.remind, alerts: s.alerts, slots: s.slots, slotDays: s.slotDays, paused: s.paused, labels: s.labelList, folders: s.folders, templates: s.templates, tagGroups: s.tagGroups, notes: s.notes };
  }

  toInput(p, accounts = this.state.accounts) {
    const byId = Object.fromEntries(accounts.map((a) => [a.id, a]));
    return {
      caption: p.caption || '', media: p.mediaIds || [], scheduled_at: p.at ?? null,
      status: p.status === 'draft' ? 'draft' : 'scheduled',
      targets: p.targets.map((t) => ({ account_id: t.acc, caption: p.ov?.[t.acc]?.caption ?? null, options: adapterOptions(byId[t.acc], p.ov?.[t.acc]?.opts || {}) })),
      labels: p.labels || [], repeat: p.repeat || 'none', evergreen: !!p.evergreen, approval: p.approval || null,
      remind: p.remind !== false, note: p.note || '', batch: p.batch || null,
    };
  }

  enqueue(id, job) {
    const prev = this._queue.get(id) || Promise.resolve();
    const next = prev.then(job).catch((e) => {
      this.flash(e.message || 'Could not save', true);
      this._srv.delete(id);
      setTimeout(() => this.load(false), 500); // resync with the server
    }).finally(() => {
      if (this._queue.get(id) === next) this._queue.delete(id);
      if (!this._queue.size && this._reloadAfter) { this._reloadAfter = false; this.load(false); }
    });
    this._queue.set(id, next);
  }

  _sync() {
    const s = this.state;
    if (s.loading) return;
    if (s.posts !== this._lastPosts) {
      this._lastPosts = s.posts;
      const seen = new Set();
      for (const p of s.posts) {
        seen.add(p.id);
        if (p.virtual) continue;
        this.attachMedia(p);
        const wasPublished = this._srvStatus.get(p.id) === 'published';
        if (p.status === 'published' && !wasPublished) { this._srvStatus.set(p.id, 'published'); this.enqueue(p.id, () => this.publish(p)); continue; }
        if (wasPublished || p.status === 'partial' || (p.status === 'failed' && this._srvStatus.get(p.id) === 'failed')) continue;
        const ser = JSON.stringify(this.toInput(p));
        if (ser === this._srv.get(p.id)) continue;
        this._srv.set(p.id, ser);
        this.enqueue(p.id, () => this.save(p));
      }
      for (const id of [...this._srv.keys()]) {
        if (seen.has(id)) continue;
        this._srv.delete(id);
        this._srvStatus.delete(id);
        this.enqueue(id, () => api(`/api/app/posts/${id}`, { method: 'DELETE' }));
      }
    }
    const prefs = this.prefsOf(s), pk = JSON.stringify(prefs);
    if (pk !== this._prefsKey) {
      this._prefsKey = pk;
      clearTimeout(this._prefsT);
      this._prefsT = setTimeout(() => api('/api/app/prefs', { method: 'PATCH', body: { prefs } }).catch((e) => this.flash(e.message, true)), 500);
    }
    const lk = JSON.stringify(s.library.map((m) => [m.id, m.folder]));
    if (lk !== this._libKey) {
      const before = new Map(JSON.parse(this._libKey || '[]'));
      this._libKey = lk;
      for (const m of s.library) if (before.has(m.id) && before.get(m.id) !== m.folder) api(`/api/v1/media/${m.id}`, { method: 'PATCH', body: { folder: m.folder || null } }).catch((e) => this.flash(e.message, true));
    }
    const ak = s.accounts.map((a) => a.id).join(',');
    if (ak !== this._accKey) {
      const now = new Set(s.accounts.map((a) => a.id));
      for (const id of (this._accKey || '').split(',').filter(Boolean)) if (!now.has(id)) api(`/api/v1/accounts/${id}`, { method: 'DELETE' }).catch((e) => this.flash(e.message, true));
      this._accKey = ak;
    }
  }

  /** Posts created by the design carry media "kinds" only; attach the uploaded media ids. */
  attachMedia(p) {
    if (p.mediaIds) return;
    if (this._submitFor && (this._submitFor.id ? p.id === this._submitFor.id : !this._srv.has(p.id))) { p.mediaIds = this._submitFor.mediaIds; this._submitFor = null; return; }
    if (p.fileId && this._uploads.has(p.fileId)) p.mediaIds = [];
    else p.mediaIds = [];
  }

  async save(p) {
    if (p.fileId && this._uploads.has(p.fileId) && !p.mediaIds.length) {
      const id = await this._uploads.get(p.fileId);
      if (id) p.mediaIds = [id];
    }
    const res = await api(`/api/app/posts/${p.id}`, { method: 'PUT', body: this.toInput(p) });
    this._srvStatus.set(p.id, res.post.status === 'publishing' ? 'scheduled' : res.post.status);
    this._srv.set(p.id, JSON.stringify(this.toInput(p)));
  }

  async publish(p) {
    this._busy++;
    try {
      await api(`/api/app/posts/${p.id}`, { method: 'PUT', body: { ...this.toInput(p), status: 'scheduled', scheduled_at: Date.now() } });
      const r = await api(`/api/v1/posts/${p.id}/publish`, { method: 'POST' });
      const failed = r.post.targets.filter((t) => t.status === 'failed').length;
      if (failed) this.flash(`${failed} of ${r.post.targets.length} account${r.post.targets.length === 1 ? '' : 's'} failed. See the Failed tab.`, true);
    } finally {
      this._busy--;
      this._reloadAfter = true; // pick up the published status and links once saves settle
    }
  }

  /* ---------- overrides of design actions ---------- */
  publishNow(p) {
    // The server handles evergreen re-queueing, so skip the design's local copy.
    if (p.approval === 'pending') return this.flash('Approve this post before publishing it', true);
    this.setPost(p.id, (x) => ({ ...x, status: 'published', at: Date.now(), targets: x.targets.map((t) => ({ ...t, status: 'published', error: '' })) }));
    this.flash(`Publishing to ${p.targets.length} account${p.targets.length === 1 ? '' : 's'}…`);
  }

  editPost(p) {
    const src = p.src ? this.state.posts.find((x) => x.id === p.src) || p : p;
    super.editPost(src);
    super.setState((st) => ({ draft: { ...st.draft, mediaIds: [...(src.mediaIds || [])] } }));
  }

  submit() {
    const d = this.state.draft;
    this._submitFor = { id: d.id, mediaIds: [...(d.mediaIds || [])] };
    super.submit();
  }

  newPost(when) {
    super.newPost(when);
    super.setState((st) => ({ draft: { ...st.draft, mediaIds: [] } }));
  }

  addFiles(list) {
    const items = list.map((f, i) => ({ id: 'f' + Date.now() + i, name: f.name, kind: f.kind, url: f.url || '', tone: f.tone || '#7a6148', caption: f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/^./, (c) => c.toUpperCase()), at: null }));
    list.forEach((f, i) => { if (f.file) this._uploads.set(items[i].id, this.upload(f.file).then((m) => m.id).catch((e) => { this.flash(e.message, true); return null; })); });
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
  async upload(file, folder = null) {
    if (!this.state.storage) throw new Error("Media storage isn't set up yet. Add the R2 settings in Vercel.");
    const r = await api('/api/v1/media', { method: 'POST', body: { filename: file.name, mime: file.type, size: file.size, folder } });
    const put = await fetch(r.upload_url, { method: 'PUT', headers: { 'content-type': file.type }, body: file });
    if (!put.ok) throw new Error(`Upload of ${file.name} failed (${put.status}). Check the R2 bucket's CORS rules.`);
    const done = await api(`/api/v1/media/${r.id}`, { method: 'PATCH', body: { uploaded: true } });
    const item = mapMedia(done.media);
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

  addToDraft(files) {
    if (!files.length) return;
    this.flash(`Uploading ${files.length} file${files.length === 1 ? '' : 's'}…`);
    this._busy++;
    Promise.all(files.map((f) => this.upload(f).then((m) => ({ id: m.id, kind: kindOf(m.mime) }))))
      .then((ms) => {
        super.setState((st) => ({ draft: { ...st.draft, media: [...st.draft.media, ...ms.map((m) => m.kind)], mediaIds: [...(st.draft.mediaIds || []), ...ms.map((m) => m.id)] } }));
        this.flash(`Added ${ms.length} file${ms.length === 1 ? '' : 's'}`);
      })
      .catch((e) => this.flash(e.message, true))
      .finally(() => { this._busy--; });
  }

  /* ---------- accounts ---------- */
  connect(platform) {
    const s = this.state;
    if (s.accounts.length >= s.accountLimit) return this.flash(`Account limit (${s.accountLimit}) reached on your plan`, true);
    if (platform === 'bluesky') return this.openBluesky();
    if (!s.platforms[platform]?.configured) return this.flash(`${P[platform].label} isn't set up yet. Add its developer keys in Vercel (see the README).`, true);
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
    v.platformCards = v.platformCards.map((c, i) => {
      const id = PLATFORM_IDS[i];
      const configured = id === 'bluesky' || !!s.platforms[id]?.configured;
      return { ...c, needsKeys: !configured, hasCount: c.hasCount || (configured && s.accounts.some((a) => a.platform === id)), connect: () => this.connect(id) };
    });
    v.connected = v.connected.map((c) => {
      const a = accBy((x) => x.id === c.id);
      const detail = a?.health === 'error' ? a.error || 'Connection error' : a?.expires ? `Token valid until ${new Date(a.expires).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'Connected';
      return { ...c, healthDetail: c.needsFix ? c.healthDetail : detail, reconnect: () => this.connect(a?.platform || 'bluesky') };
    });
    for (const t of v.healthTiles || []) {
      const a = accBy((x) => x.username === t.username && P[x.platform].color === t.color);
      if (a) t.fix = () => this.connect(a.platform);
    }
    for (const item of v.attention || []) {
      for (const act of item.actions || []) {
        if (act.label !== 'Reconnect') continue;
        const m = /@(\S+):/.exec(item.title);
        const a = m && accBy((x) => x.username === m[1]);
        if (a) act.go = () => this.connect(a.platform);
      }
    }

    // Composer media: real uploads.
    v.addImage = () => this.pickFiles('image/jpeg,image/png,image/gif,image/webp', true, (fs) => this.addToDraft(fs));
    v.addVideo = () => this.pickFiles('video/mp4,video/quicktime,video/webm', false, (fs) => this.addToDraft(fs));
    // Show the real image in the composer tiles and the preview; videos (and anything not in the
    // library yet) keep the placeholder.
    const libById = new Map((s.library || []).map((m) => [m.id, m]));
    const look = (kind, i, ids = d.mediaIds) => {
      const m = libById.get((ids || [])[i]);
      if (m?.url) return { bg: `#2a2e34 url("${String(m.url).replace(/["\\\n]/g, encodeURIComponent)}") center/cover no-repeat`, label: '' };
      return { bg: 'linear-gradient(160deg,#9a7a58,#5d4a36)', label: kind === 'VIDEO' ? '▶ VIDEO' : kind };
    };
    v.mediaTiles = d.media.map((kind, i) => ({ kind, ...look(kind, i), remove: () => this.upd({ media: d.media.filter((_, j) => j !== i), mediaIds: (d.mediaIds || []).filter((_, j) => j !== i) }) }));
    if (v.pv) v.pv.media = d.media.slice(0, 4).map((kind, i) => look(kind, i));

    // Media library.
    const q = (s.libQ || '').toLowerCase();
    const inFolder = (s.folder === 'All' || !s.folder ? s.library : s.library.filter((m) => m.folder === s.folder))
      .filter((m) => (!q || m.name.toLowerCase().includes(q)) && (!s.libType || m.kind === s.libType))
      .sort((x, y) => (s.libSort === 'name' ? x.name.localeCompare(y.name) : s.libSort === 'used' ? y.used - x.used : 0));
    const useInNewPost = (m) => super.setState({ pvMediaId: null, screen: 'compose', draft: { ...Base.blank(), media: [m.kind], mediaIds: [m.id] } });
    (v.libItems || []).forEach((it, i) => { const m = inFolder[i]; if (m) it.use = () => { this.upd({ media: [...d.media, m.kind], mediaIds: [...(d.mediaIds || []), m.id] }); this.flash(`Added ${m.name}`); }; });
    (v.libCards || []).forEach((c, i) => { const m = inFolder[i]; if (m) c.use = () => useInNewPost(m); });
    if (v.pvMedia && s.pvMediaId) { const m = s.library.find((x) => x.id === s.pvMediaId); if (m) v.pvMedia.use = () => useInNewPost(m); }
    v.onLibFiles = (e) => {
      const fl = [...(e.target.files || [])];
      e.target.value = '';
      if (!fl.length) return;
      const folder = s.folder === 'All' ? s.folders[0] || null : s.folder;
      this.flash(`Uploading ${fl.length} file${fl.length === 1 ? '' : 's'}…`);
      Promise.all(fl.map((f) => this.upload(f, folder))).then(() => this.flash(`Uploaded ${fl.length} file${fl.length === 1 ? '' : 's'}${folder ? ' to ' + folder : ''}`)).catch((err) => this.flash(err.message, true));
    };
    v.libSummary = `${s.library.length} file${s.library.length === 1 ? '' : 's'} in ${s.folders.length} folder${s.folders.length === 1 ? '' : 's'}. Use any file in a post without uploading it again.`;

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
    v.postStats = (v.postStats || []).map((r) => ({ ...r, imp: '—', eng: '—', clicks: '—', rate: '—', rateColor: '#677184' }));

    // Calendar CSV with the real post URLs.
    v.exportCalCsv = () => {
      const z2 = (n) => String(n).padStart(2, '0'), esc = (x) => (/[",\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x);
      const range = s.calView === 'week' ? [s.weekStart, s.weekStart + 7 * 864e5] : [new Date(s.cursor[0], s.cursor[1], 1).getTime(), new Date(s.cursor[0], s.cursor[1] + 1, 1).getTime()];
      const rows = [['date', 'time', 'account', 'platform', 'caption', 'status', 'labels', 'url']];
      for (const p of s.posts.filter((x) => x.at && x.at >= range[0] && x.at < range[1]).sort((a, b) => a.at - b.at)) {
        for (const t of p.targets) {
          const a = accBy((x) => x.id === t.acc);
          if (!a) continue;
          const dt = new Date(p.at + this.tzShift(p.at));
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
    v.mcpText = v.mcpText.replace('https://app.scheduleforyou.com', origin).replace('/path/to/scheduleforyou/mcp/server.mjs', '/path/to/sfu/mcp/server.mjs');
    const roleStyle = { owner: ['#141619', '#d9ff35', '#d9ff35'], editor: ['#141619', '#fff', '#e5e3dc'], invited: ['#d98c0b', '#fff8e8', '#f3dfb2'] };
    v.members = [
      ...s.members.map((m) => ({ name: m.name || '', email: m.email, role: m.role === 'owner' ? 'owner' : 'editor' })),
      ...s.invites.map((e) => ({ name: '', email: e, role: 'invited' })),
    ].map((m) => ({ ...m, color: roleStyle[m.role][0], bg: roleStyle[m.role][1], border: roleStyle[m.role][2] }));
    v.sendInvite = () => {
      const email = (s.invite || '').trim();
      if (!email) return;
      api('/api/v1/team', { method: 'POST', body: { email } })
        .then((r) => {
          super.setState((st) => ({ invites: [...st.invites, email], inviteUrl: r.invite_url, invite: '' }));
          this.flash(r.emailed ? `Invite emailed to ${email}` : 'Invite link ready. Copy it and send it yourself.');
        })
        .catch((e) => this.flash(e.message, true));
    };
    return v;
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
            <style>{'.sfy-share-btn{bottom:20px}@media (max-width:760px){.sfy-share-btn{bottom:140px}}'}</style>
            Share for review
          </button>
        )}
        {this.state.shareLink && <ShareDialog link={this.state.shareLink} onClose={() => super.setState({ shareLink: null })} />}
        {this.state.planPicker && (
          <PlanDialog
            billing={this.state.billing}
            onPick={(plan) => this.goBilling('/api/billing/checkout', { plan })}
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
  if (b.state === 'needs_card') return 'Start your 7-day free trial';
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
  const price = b.plans?.find((p) => p.id === b.plan)?.amount;
  if (b.state === 'needs_card') { text = 'Add a card to start your 7-day free trial. Publishing is off until then.'; cta = 'Start free trial'; }
  else if (b.state === 'trial' && b.daysLeft != null && b.daysLeft <= 2 && !b.cancelAtPeriodEnd) { text = `Your free trial ends in ${b.daysLeft} day${b.daysLeft === 1 ? '' : 's'}${price ? `. Your card will be charged $${price}` : ''}.`; cta = 'Manage billing'; }
  else if (b.state === 'expired') { text = 'Your plan has ended. Scheduled posts are paused.'; tone = 'alert'; }
  else if (b.state === 'past_due') { text = 'Your last payment failed. Update your card to avoid interruption.'; tone = 'alert'; cta = 'Update card'; }
  if (!text) return null;
  const alert = tone === 'alert';
  return (
    <div role="status" className="sfy-billing-banner" style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', zIndex: 80, display: 'flex', alignItems: 'center', gap: 12, maxWidth: 'calc(100vw - 32px)', padding: '10px 12px 10px 16px', borderRadius: 14, background: alert ? '#fff1ef' : '#141619', color: alert ? '#a1281f' : '#fff', border: alert ? '1px solid #f3c9c3' : '1px solid #141619', boxShadow: '0 8px 24px rgba(20,22,25,.18)', font: '500 14px Geist, system-ui, sans-serif' }}>
      <style>{'.sfy-billing-banner{bottom:20px}@media (max-width:760px){.sfy-billing-banner{bottom:84px}}'}</style>
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
  const plans = b?.plans || [];
  const pick = async (id) => {
    setBusy(id);
    try { await onPick(id); } catch { setBusy(''); }
  };
  const features = { solo: ['15 connected accounts', 'Unlimited posts & scheduling', 'API + MCP access'], studio: ['100 connected accounts', 'Team members', 'Priority support'] };
  return (
    <div role="dialog" aria-modal="true" aria-label="Choose a plan" onClick={(e) => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, zIndex: 95, display: 'grid', placeItems: 'center', padding: 16, background: 'rgba(20,22,25,.45)', fontFamily: 'Geist, system-ui, sans-serif' }}>
      <div style={{ width: 'min(560px, 100%)', background: '#fff', borderRadius: 18, padding: 22, display: 'grid', gap: 14, boxShadow: '0 24px 60px rgba(20,22,25,.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <strong style={{ fontSize: 18, letterSpacing: '-0.02em' }}>{b?.trialEligible ? 'Start your 7-day free trial' : 'Choose a plan'}</strong>
          <button type="button" onClick={onClose} aria-label="Close" style={{ border: 0, background: 'transparent', fontSize: 20, cursor: 'pointer', color: '#677184' }}>×</button>
        </div>
        <p style={{ margin: 0, fontSize: 14, color: '#677184', lineHeight: 1.5 }}>
          {b?.trialEligible
            ? '7 days free, then billed monthly. A card is required to start; you are not charged until day 8, and you can cancel before then.'
            : 'Billed monthly. Cancel anytime.'}{' '}Payments are handled by Stripe.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {plans.map((p) => (
            <div key={p.id} style={{ border: p.id === 'studio' ? '2px solid #141619' : '1px solid #e5e3dc', borderRadius: 14, padding: 16, display: 'grid', gap: 10, alignContent: 'start' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: 16 }}>{p.name}</strong>
                <span><strong style={{ fontSize: 22 }}>${p.amount}</strong><span style={{ color: '#677184', fontSize: 13 }}>/mo</span></span>
              </div>
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
