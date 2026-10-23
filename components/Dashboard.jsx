'use client';
// Logic ported from the Claude Design prototype "Schedule For You.dc.html".
import React from 'react';
import { renderDashboard, css } from './DashboardView';

const DCLogic = React.Component;
class Component extends DCLogic {
  static P = {
    bluesky: {
      label: 'Bluesky',
      color: '#1185fe',
      logo: 'url(/logos/white/bluesky.svg)',
      short: 'BS',
      max: 300,
      req: 'none',
      note: 'Handle and app password. No developer approval needed.',
    },
    x: {
      label: 'X',
      color: '#000000',
      logo: 'url(/logos/white/x.svg)',
      short: 'X',
      max: 280,
      req: 'none',
      note: 'Post text, images and videos to your X profile.',
    },
    instagram: {
      label: 'Instagram',
      color: '#e1306c',
      logo: 'url(/logos/white/instagram.svg)',
      short: 'IG',
      max: 2200,
      req: 'any',
      note: 'Business or Creator account linked to a Facebook Page.',
      fields: [{ key: 'format', label: 'Post as', options: ['Post', 'Reel', 'Story'] }],
    },
    linkedin: {
      label: 'LinkedIn',
      color: '#0a66c2',
      logo: 'url(/logos/white/linkedin.svg)',
      short: 'in',
      max: 3000,
      req: 'none',
      note: 'Posts to your personal profile.',
    },
    facebook: {
      label: 'Facebook',
      color: '#1877f2',
      logo: 'url(/logos/white/facebook.svg)',
      short: 'f',
      max: 63206,
      req: 'none',
      note: 'Posts to Pages you manage.',
      fields: [{ key: 'format', label: 'Post as', options: ['Post', 'Reel', 'Story'] }],
    },
    tiktok: {
      label: 'TikTok',
      color: '#000000',
      logo: 'url(/logos/white/tiktok.svg)',
      short: 'TT',
      max: 2200,
      req: 'any',
      note: 'Post videos and photo carousels to your TikTok.',
      fields: [{ key: 'privacy', label: 'Privacy', options: ['Only me', 'Friends', 'Public'] }],
    },
    youtube: {
      label: 'YouTube',
      color: '#ff0000',
      logo: 'url(/logos/white/youtube.svg)',
      short: 'YT',
      max: 5000,
      req: 'video',
      note: 'Upload videos and Shorts with a title and privacy setting.',
      fields: [
        { key: 'title', label: 'Title' },
        { key: 'privacy', label: 'Privacy', options: ['public', 'unlisted', 'private'] },
      ],
    },
    threads: {
      label: 'Threads',
      color: '#000000',
      logo: 'url(/logos/white/threads.svg)',
      short: '@',
      max: 500,
      req: 'none',
      note: 'Post text, images and videos to your Threads profile.',
    },
    pinterest: {
      label: 'Pinterest',
      color: '#e60023',
      logo: 'url(/logos/white/pinterest.svg)',
      short: 'P',
      max: 500,
      req: 'image',
      note: 'Pin images to the board you choose.',
      fields: [
        { key: 'board', label: 'Board', options: ['Launch', 'Behind the scenes', 'Tips'] },
        { key: 'link', label: 'Destination link' },
      ],
    },
    google_business: {
      label: 'Google Business',
      color: '#4285f4',
      logo: 'url(/logos/white/googlemybusiness.svg)',
      short: 'G',
      max: 1500,
      req: 'none',
      note: 'Post updates to your Google Business Profile locations.',
      keys: true,
    },
  };
  static get NOW() {
    return Date.now();
  }
  static at(d, h, m = 0) {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate() + d, h, m).getTime();
  }
  /** Next whole hour at least 30 minutes away (default time for new posts). */
  static soon() {
    const ms = Date.now() + 30 * 6e4,
      t = new Date(ms + Component.shift(ms));
    t.setMinutes(0, 0, 0);
    return Component.fromLocal(`${Component.ymd(t)}T${String(t.getHours()).padStart(2, '0')}:00`) + 36e5;
  }
  static monday() {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    t.setDate(t.getDate() - ((t.getDay() + 6) % 7));
    return t.getTime();
  }
  static thisMonth() {
    const t = new Date();
    return [t.getFullYear(), t.getMonth()];
  }
  /* Timezones: the workspace zone (Component._tz) can differ from the browser's. */
  static _tz = null;
  static localTz() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      return 'UTC';
    }
  }
  static tzOff(tz, ms) {
    try {
      const p = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hourCycle: 'h23',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).formatToParts(new Date(ms));
      const g = (k) => Number(p.find((x) => x.type === k).value);
      return (
        (Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute'), g('second')) -
          Math.floor(ms / 1000) * 1000) /
        6e4
      );
    } catch {
      return 0;
    }
  }
  /** Milliseconds to add so a browser-local Date shows the wall clock of the workspace timezone. */
  static shift(ms = Date.now(), tz = Component._tz) {
    return tz ? (Component.tzOff(tz, ms) - Component.tzOff(Component.localTz(), ms)) * 6e4 : 0;
  }
  /** Epoch ms for a workspace wall-clock string like 2026-10-26T09:00. */
  static fromLocal(v, tz = Component._tz) {
    if (!v) return null;
    const guess = new Date(v).getTime();
    return Number.isNaN(guess) ? null : guess - Component.shift(guess, tz);
  }
  /** YYYY-MM-DD from a Date's local fields. */
  static ymd(d) {
    const z = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
  }
  static tzLabel(tz) {
    const row = Component.TZ.find((t) => t[0] === tz);
    return row ? row[1] : (tz || 'UTC').replace(/_/g, ' ').split('/').pop();
  }
  static seed() {
    const a = Component.at;
    const T = (ids, st) => ids.map((id) => ({ acc: id, status: st, error: '' }));
    return [
      {
        id: 'p1',
        status: 'scheduled',
        at: a(0, 12),
        caption:
          'Per-account captions are live. Write one post, then trim it for X and expand it for LinkedIn without starting over.',
        targets: T(['a1', 'a2', 'a7', 'a4'], 'scheduled'),
        media: [],
        ov: {},
      },
      {
        id: 'p2',
        status: 'scheduled',
        at: a(0, 17, 30),
        caption: 'Behind the scenes of the October drop. Three days of shooting, one very patient cat.',
        targets: T(['a3', 'a5'], 'scheduled'),
        media: ['IMG', 'IMG', 'IMG'],
        ov: {},
      },
      {
        id: 'p3',
        status: 'scheduled',
        at: a(1, 9),
        caption: 'New tutorial: how I batch a month of posts in one sitting. Full walkthrough on the channel.',
        targets: T(['a6', 'a4'], 'scheduled'),
        media: ['VIDEO'],
        ov: {},
      },
      {
        id: 'p4',
        status: 'scheduled',
        at: a(2, 14),
        caption: 'Quick poll: do you schedule posts the night before or the morning of?',
        targets: T(['a2', 'a1', 'a7'], 'scheduled'),
        media: [],
        ov: {},
      },
      {
        id: 'p5',
        status: 'scheduled',
        at: a(5, 10),
        caption: 'Five things I stopped posting this year, and what replaced them.',
        targets: T(['a3', 'a7', 'a4'], 'scheduled'),
        media: ['IMG'],
        ov: {},
      },
      {
        id: 'p16',
        status: 'scheduled',
        at: a(2, 14, 10),
        caption: 'Quick poll: do you schedule posts the night before or the morning of?',
        targets: T(['a2'], 'scheduled'),
        media: [],
        ov: {},
      },
      {
        id: 'p14',
        status: 'scheduled',
        at: a(8, 11),
        caption: 'November content plan is up. Steal it.',
        targets: T(['a4', 'a2'], 'scheduled'),
        media: [],
        ov: {},
      },
      {
        id: 'p6',
        status: 'published',
        at: a(-1, 9),
        caption: 'We crossed 1,000 scheduled posts this week. Thank you for trusting us with your calendar.',
        targets: T(['a1', 'a2', 'a4'], 'published'),
        media: [],
        ov: {},
      },
      {
        id: 'p7',
        status: 'partial',
        at: a(-2, 16),
        caption: 'Studio tour, part two. The lighting setup everyone keeps asking about.',
        targets: [
          { acc: 'a3', status: 'published', error: '' },
          { acc: 'a5', status: 'failed', error: 'Video must be at least 3 seconds long' },
        ],
        media: ['VIDEO'],
        ov: {},
      },
      {
        id: 'p8',
        status: 'failed',
        at: a(-3, 13),
        caption:
          'Long thought on pricing: we tried three models this year. Each one taught us something about who our customers are, and that is why we landed on flat pricing per workspace with no per-post fees.',
        targets: [
          { acc: 'a2', status: 'failed', error: 'Caption is 212 characters over the limit after link expansion' },
        ],
        media: [],
        ov: {},
      },
      {
        id: 'p11',
        status: 'published',
        at: a(-5, 10),
        caption: 'Tuesday tip: reuse your best-performing caption, change the hook.',
        targets: T(['a2', 'a7', 'a1'], 'published'),
        media: [],
        ov: {},
      },
      {
        id: 'p12',
        status: 'published',
        at: a(-7, 15),
        caption: 'The October drop is live.',
        targets: T(['a3', 'a5', 'a2', 'a4'], 'published'),
        media: ['IMG', 'IMG'],
        ov: {},
      },
      {
        id: 'p13',
        status: 'published',
        at: a(-10, 9),
        caption: 'Office hours on Thursday. Bring your content calendar.',
        targets: T(['a4', 'a1'], 'published'),
        media: [],
        ov: {},
      },
      {
        id: 'p15',
        status: 'published',
        at: a(-12, 18),
        caption: 'Weekend reel.',
        targets: T(['a3', 'a5', 'a6'], 'published'),
        media: ['VIDEO'],
        ov: {},
      },
      {
        id: 'p9',
        status: 'draft',
        at: null,
        caption: 'Thread draft: how we price, and why there is no per-post fee.',
        targets: T(['a2', 'a1'], 'draft'),
        media: [],
        ov: {},
      },
      {
        id: 'p10',
        status: 'draft',
        at: null,
        caption: 'Moodboard for November.',
        targets: T(['a3'], 'draft'),
        media: ['IMG'],
        ov: {},
      },
    ];
  }
  static get CSV() {
    const D = (n) => Component.toLocal(Component.at(n, 12)).slice(0, 10);
    return [
      'date,time,accounts,caption',
      D(5) + ',09:00,x;bluesky,Monday reminder: the Fall field kit ships this week.',
      D(6) + ',12:30,linkedin,How we tested the field kit on job sites for eight months.',
      D(7) + ',17:30,instagram;threads,Behind the scenes from the FW26 shoot.',
      D(8) +
        ',09:00,x,This caption runs long on purpose: canvas weights, brass hardware sourcing, stitching patterns, our lifetime warranty, the repair program, where to buy, plus a link and a few hashtags #fieldkit #madetolast #fw26',
      D(9) + ',25:00,threads,Weekend packing list.',
      D(10) + ',10:00,mastodon,Halloween sale starts now.',
    ].join('\n');
  }
  static SAMPLES = [
    ['fieldkit-hero.jpg', 'IMG', '#8a6d4f'],
    ['canvas-detail.jpg', 'IMG', '#6e5a42'],
    ['brass-hardware.jpg', 'IMG', '#7a6148'],
    ['packing-reel.mp4', 'VIDEO', '#4f3f2e'],
    ['trailhead.jpg', 'IMG', '#5d6b4a'],
    ['workshop-bts.mp4', 'VIDEO', '#5d4a36'],
  ];
  static TZ = [
    ['America/New_York', 'Eastern Time (New York)', 0],
    ['America/Chicago', 'Central Time (Chicago)', -1],
    ['America/Los_Angeles', 'Pacific Time (Los Angeles)', -3],
    ['Europe/London', 'London', 5],
    ['Europe/Berlin', 'Berlin', 6],
    ['Asia/Kolkata', 'India (Kolkata)', 9.5],
    ['Asia/Singapore', 'Singapore', 12],
    ['Australia/Sydney', 'Sydney', 15],
  ];
  static WS = [
    ['maya', "Maya's workspace", 'Pro plan · 7 accounts', '#3a3e45'],
    ['field', 'Field & Co.', 'Client · outdoor gear', 'linear-gradient(160deg,#9a7a58,#5d4a36)'],
    ['north', 'Northside Coffee', 'Client · café', 'linear-gradient(160deg,#6b4a3a,#2e2019)'],
  ];
  static enrich(posts) {
    const a = Component.at,
      T = (ids, st) => ids.map((id) => ({ acc: id, status: st, error: '' }));
    const meta = {
      p1: { labels: ['Launch'] },
      p2: { labels: ['Launch'], remind: true },
      p3: {
        labels: ['Tutorial'],
        approval: 'pending',
        note: 'Check the video thumbnail before approving. The first frame is dark.',
      },
      p4: { labels: ['Community'], repeat: 'weekly' },
      p16: { labels: ['Community'] },
      p5: { approval: 'pending' },
      p11: { labels: ['Evergreen'], evergreen: true },
      p12: { labels: ['Launch', 'Promo'] },
      p14: { labels: ['Promo'], approval: 'approved' },
    };
    return [
      ...posts.map((p) => ({ ...p, ws: 'maya', labels: [], ...(meta[p.id] || {}) })),
      {
        id: 'f1',
        ws: 'field',
        status: 'scheduled',
        at: a(0, 13),
        caption: 'The Fall field kit is live. Waxed canvas, brass hardware, built to take a beating.',
        targets: T(['b1', 'b2', 'b3'], 'scheduled'),
        media: ['IMG'],
        ov: {},
        labels: ['Launch'],
        approval: 'approved',
      },
      {
        id: 'f2',
        ws: 'field',
        status: 'scheduled',
        at: a(2, 9),
        caption: 'How we tested the field kit on job sites for eight months.',
        targets: T(['b3'], 'scheduled'),
        media: [],
        ov: {},
        labels: [],
        approval: 'pending',
      },
      {
        id: 'f3',
        ws: 'field',
        status: 'published',
        at: a(-2, 10),
        caption: 'Teaser: something waxed this way comes.',
        targets: T(['b1', 'b2'], 'published'),
        media: ['IMG'],
        ov: {},
        labels: ['Promo'],
      },
      {
        id: 'n1',
        ws: 'north',
        status: 'scheduled',
        at: a(1, 7, 30),
        caption: 'Pumpkin spice is back, and so is the oat-milk cortado you keep asking about.',
        targets: T(['c1', 'c2'], 'scheduled'),
        media: ['IMG'],
        ov: {},
        labels: ['Seasonal'],
        repeat: 'weekly',
      },
      {
        id: 'p17',
        ws: 'maya',
        status: 'failed',
        at: a(-1, 15),
        caption: 'Reminder: office hours tomorrow at 2pm.',
        targets: [{ acc: 'a1', status: 'failed', error: 'Bluesky was temporarily unavailable (503)' }],
        media: [],
        ov: {},
        labels: [],
      },
      {
        id: 'n2',
        ws: 'north',
        status: 'published',
        at: a(-1, 8),
        caption: 'Open at 6:30 all week.',
        targets: T(['c1'], 'published'),
        media: [],
        ov: {},
        labels: [],
      },
    ];
  }
  /** Account picture: the profile photo over the platform logo (shown if the photo fails), plus a corner badge. */
  static pic(a) {
    const p = Component.P[a.platform] || {},
      base = `${p.logo || 'none'} center/56% no-repeat, ${p.color || '#888'}`;
    const url = a.avatar ? String(a.avatar).replace(/["\\\n()]/g, encodeURIComponent) : '';
    return {
      pic: url ? `url("${url}") center/cover no-repeat, ${base}` : base,
      badge: `${p.logo || 'none'} center/60% no-repeat, ${p.color || '#888'}`,
      badgeDisplay: url ? 'block' : 'none',
    };
  }
  static hash(str) {
    let h = 7;
    for (const c of str) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return h;
  }
  static toLocal(ms) {
    const d = new Date(ms + Component.shift(ms));
    const z = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}T${z(d.getHours())}:${z(d.getMinutes())}`;
  }
  static blank(when) {
    return {
      id: null,
      caption: '',
      targets: [],
      ov: {},
      media: [],
      mode: 'schedule',
      when: Component.toLocal(when || Component.soon()),
      open: null,
      previewId: null,
      labels: [],
      repeat: 'none',
      evergreen: false,
      approval: false,
      remind: true,
      note: '',
    };
  }

  state = {
    screen: null,
    tab: 'upcoming',
    cursor: Component.thisMonth(),
    toast: '',
    toastBad: false,
    accounts: [
      { id: 'a1', platform: 'bluesky', username: 'maya.bsky.social', display: 'Maya Chen' },
      { id: 'a2', platform: 'x', username: 'mayabuilds', display: 'Maya Chen' },
      { id: 'a3', platform: 'instagram', username: 'maya.studio', display: 'Maya Studio' },
      { id: 'a4', platform: 'linkedin', username: 'maya-chen', display: 'Maya Chen' },
      {
        id: 'a5',
        platform: 'tiktok',
        username: 'mayabuilds',
        display: 'Maya Builds',
        health: 'expiring',
        expires: Component.at(3, 9),
      },
      {
        id: 'a6',
        platform: 'youtube',
        username: 'MayaBuilds',
        display: 'Maya Builds',
        health: 'error',
        error: 'Authorization revoked on YouTube',
      },
      { id: 'a7', platform: 'threads', username: 'maya.studio', display: 'Maya Studio' },
      { id: 'b1', ws: 'field', platform: 'instagram', username: 'field.co', display: 'Field & Co.' },
      {
        id: 'b2',
        ws: 'field',
        platform: 'x',
        username: 'fieldco',
        display: 'Field & Co.',
        health: 'expiring',
        expires: Component.at(5, 12),
      },
      { id: 'b3', ws: 'field', platform: 'linkedin', username: 'field-and-co', display: 'Field & Co.' },
      { id: 'c1', ws: 'north', platform: 'instagram', username: 'northside.coffee', display: 'Northside Coffee' },
      { id: 'c2', ws: 'north', platform: 'tiktok', username: 'northsidecoffee', display: 'Northside Coffee' },
    ],
    posts: Component.enrich(Component.seed()),
    draft: Component.blank(),
    ws: 'maya',
    wsOpen: false,
    paused: false,
    labelFilter: null,
    newLabel: '',
    labelList: ['Launch', 'Promo', 'Tutorial', 'Community', 'Evergreen', 'Seasonal'],
    notes: {
      [new Date(Component.at(6, 0)).toDateString()]: 'Field kit launch',
      [new Date(Component.at(10, 0)).toDateString()]: 'Halloween',
      [new Date(Component.at(13, 0)).toDateString()]: 'Office closed',
    },
    noteKey: null,
    noteText: '',
    templates: [
      { name: 'Launch', text: "It's live: [product]. [One line on why it matters]. Link in bio." },
      { name: 'Weekly tip', text: 'Tuesday tip: [the tip]. Try it this week and tell me how it went.' },
      { name: 'Behind the scenes', text: 'Behind the scenes of [project]. [What surprised us].' },
    ],
    tagGroups: [
      { name: 'Field kit', tags: '#fieldkit #madetolast #fw26' },
      { name: 'Creator', tags: '#contentcreator #socialmediatips #batching' },
      { name: 'Small business', tags: '#smallbusiness #shoplocal' },
    ],
    folders: ['Fall ’26', 'Product shots', 'Reels', 'Archive'],
    folder: 'All',
    newFolder: '',
    pickerOpen: false,
    library: [
      ['fieldkit-hero.jpg', 'IMG', '#8a6d4f', 'Fall ’26', 2],
      ['canvas-detail.jpg', 'IMG', '#6e5a42', 'Product shots', 1],
      ['brass-hardware.jpg', 'IMG', '#7a6148', 'Product shots', 0],
      ['packing-reel.mp4', 'VIDEO', '#4f3f2e', 'Reels', 1],
      ['trailhead.jpg', 'IMG', '#5d6b4a', 'Fall ’26', 0],
      ['workshop-bts.mp4', 'VIDEO', '#5d4a36', 'Reels', 0],
      ['studio-tour.mp4', 'VIDEO', '#3e4a55', 'Reels', 1],
      ['spring-lookbook.jpg', 'IMG', '#7d7a5c', 'Archive', 3],
      ['logo-lockup.png', 'IMG', '#2b2e33', 'Product shots', 4],
    ].map(([name, kind, tone, folder, used], i) => ({ id: 'm' + i, name, kind, tone, folder, used, url: '' })),
    tz: 'America/New_York',
    remind: { on: true, lead: 60 },
    alerts: { fail: true, digest: true },
    keys: [
      { id: 'k1', name: 'Claude Desktop', prefix: 'sfy_8f2a', meta: 'Created Oct 2 · last used 2 hours ago' },
      { id: 'k2', name: 'Zapier', prefix: 'sfy_c41d', meta: 'Created Sep 14 · never used' },
    ],
    newKey: '',
    keyName: '',
    invite: '',
    inviteUrl: '',
    invites: [],
    selecting: false,
    selected: [],
    moveDate: '',
    alertHidden: false,
    calView: 'month',
    weekStart: Component.monday(),
    dragId: null,
    dragOver: null,
    bulkTab: 'upload',
    bulkFiles: [],
    bulkAccs: ['a1', 'a2', 'a4'],
    bulkHover: false,
    csv: Component.CSV,
    slots: ['09:00', '12:30', '17:30'],
    slotDays: [1, 2, 3, 4, 5],
    newSlot: '15:00',
  };

  componentDidMount() {
    this._rs = () => this.forceUpdate();
    window.addEventListener('resize', this._rs);
    this._t0 = Date.now();
    this._iv = setInterval(() => this.setState({ tick: Date.now() }), 1000);
    this._key = (e) => {
      const t = e.target.tagName;
      if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || e.metaKey || e.ctrlKey) return;
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        this.newPost();
      }
    };
    window.addEventListener('keydown', this._key);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this._rs);
    clearInterval(this._iv);
    window.removeEventListener('keydown', this._key);
    clearTimeout(this._tt);
  }

  flash(msg, bad, undo) {
    clearTimeout(this._tt);
    this._undo = undo || null;
    this.setState({ toast: msg, toastBad: !!bad, toastUndo: !!undo });
    this._tt = setTimeout(
      () => {
        this._undo = null;
        this.setState({ toast: '', toastUndo: false });
      },
      undo ? 6000 : 2800,
    );
  }
  newPost(when) {
    this.setState({ draft: Component.blank(when), screen: 'compose', drawer: false });
  }
  editPost(p) {
    if (p.src) p = this.state.posts.find((x) => x.id === p.src) || p;
    this.setState({
      screen: 'compose',
      draft: {
        id: p.id,
        caption: p.caption,
        targets: p.targets.map((t) => t.acc),
        ov: JSON.parse(JSON.stringify(p.ov || {})),
        media: [...p.media],
        mode: p.status === 'draft' ? 'draft' : 'schedule',
        when: Component.toLocal(p.at || Component.soon()),
        open: null,
        previewId: null,
        labels: [...(p.labels || [])],
        repeat: p.repeat || 'none',
        evergreen: !!p.evergreen,
        approval: p.approval === 'pending',
        approvedBefore: p.approval === 'approved',
        remind: p.remind !== false,
        note: p.note || '',
      },
    });
  }
  upd(patch) {
    this.setState((s) => ({ draft: { ...s.draft, ...patch } }));
  }
  setOv(id, patch) {
    this.setState((s) => {
      const ov = { ...s.draft.ov, [id]: { ...(s.draft.ov[id] || {}), ...patch } };
      if ('caption' in patch && patch.caption === undefined) delete ov[id].caption;
      return { draft: { ...s.draft, ov } };
    });
  }
  setPost(id, fn) {
    this.setState((s) => ({ posts: s.posts.map((p) => (p.id === id ? fn(p) : p)) }));
  }
  publishNow(p) {
    if (p.approval === 'pending') return this.flash('Approve this post before publishing it', true);
    if (p.evergreen) {
      const at = this.nextSlots(1)[0];
      if (at) setTimeout(() => this.setState((st) => ({ posts: [...st.posts, this.dupOf(p, at)] })), 0);
    }
    this.setPost(p.id, (x) => ({
      ...x,
      status: 'published',
      at: Component.NOW,
      targets: x.targets.map((t) => ({ ...t, status: 'published', error: '' })),
    }));
    this.flash(`Published to ${p.targets.length} account${p.targets.length === 1 ? '' : 's'}`);
  }

  submit() {
    const s = this.state,
      d = s.draft;
    const st = d.mode === 'now' ? 'published' : d.mode === 'schedule' || d.mode === 'queue' ? 'scheduled' : 'draft';
    const at =
      d.mode === 'now'
        ? Component.NOW
        : d.mode === 'schedule'
          ? Component.fromLocal(d.when, s.tz)
          : d.mode === 'queue'
            ? this.nextSlots(1, [], d.id)[0] || this.wsAt(1, 9)
            : null;
    // "Post as" picked before choosing accounts applies to every Instagram and Facebook target without its own choice.
    const accP = Object.fromEntries(s.accounts.map((a) => [a.id, a.platform])),
      ov = { ...d.ov };
    if (d.postAs && d.postAs !== 'Post')
      for (const id of d.targets)
        if ((accP[id] === 'instagram' || accP[id] === 'facebook') && !(ov[id]?.opts || {}).format)
          ov[id] = { ...(ov[id] || {}), opts: { ...(ov[id]?.opts || {}), format: d.postAs } };
    // Save what the composer shows: a select left on its first option (TikTok privacy, Pinterest board…) is saved as that option.
    for (const a of s.accounts) {
      if (!d.targets.includes(a.id)) continue;
      for (const f of Component.P[a.platform]?.fields || []) {
        if (!f.options || f.key === 'format' || (ov[a.id]?.opts || {})[f.key] != null) continue;
        const def = this.fieldOptions(a, f)[0];
        if (def != null) ov[a.id] = { ...(ov[a.id] || {}), opts: { ...(ov[a.id]?.opts || {}), [f.key]: def } };
      }
    }
    const post = {
      id: d.id || 'p' + Date.now(),
      note: d.note || '',
      ws: s.ws || 'maya',
      labels: d.labels || [],
      repeat: d.repeat,
      evergreen: d.evergreen,
      remind: d.remind,
      approval: d.approval ? 'pending' : d.approvedBefore ? 'approved' : null,
      status: st,
      at,
      caption: d.caption,
      media: d.media,
      ov,
      targets: d.targets.map((id) => ({ acc: id, status: st, error: '' })),
    };
    const posts = d.id ? s.posts.map((p) => (p.id === d.id ? post : p)) : [...s.posts, post];
    const tab = st === 'published' ? 'published' : st === 'draft' ? 'drafts' : 'upcoming';
    this.setState({ posts, screen: 'queue', tab, draft: Component.blank() });
    const n = d.targets.length;
    this.flash(
      st === 'published'
        ? `Published to ${n} account${n === 1 ? '' : 's'}`
        : st === 'draft'
          ? 'Draft saved'
          : `Scheduled for ${this.dayLabel(at)} at ${this.time(at)}`,
    );
  }

  nextSlots(n, extra = [], ignoreId = null) {
    const s = this.state,
      taken = new Set([
        ...s.posts.filter((p) => p.status === 'scheduled' && p.id !== ignoreId).map((p) => p.at),
        ...extra,
      ]);
    const out = [],
      slots = [...s.slots].sort();
    if (!slots.length || !s.slotDays.length) return out;
    // Slots are wall-clock times in the workspace timezone, on the workspace's weekdays.
    const today = this.wsDate(Component.NOW);
    for (let d = 0; d < 120 && out.length < n; d++) {
      const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() + d);
      if (!s.slotDays.includes(day.getDay())) continue;
      for (const sl of slots) {
        const [h, m] = sl.split(':').map(Number),
          ms = this.wsTime(day.getFullYear(), day.getMonth(), day.getDate(), h, m);
        if (!ms || ms <= Component.NOW || taken.has(ms)) continue;
        out.push(ms);
        taken.add(ms);
        if (out.length >= n) break;
      }
    }
    return out;
  }
  slotLabel(ms) {
    return ms
      ? `${this.dayLabel(ms)}, ${this.wsDate(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${this.time(ms)}`
      : 'No slots set';
  }
  dupOf(p, at) {
    return {
      ...JSON.parse(JSON.stringify(p)),
      id: 'p' + Date.now() + Math.random().toString(36).slice(2, 6),
      status: 'scheduled',
      at,
      targets: p.targets.map((t) => ({ acc: t.acc, status: 'scheduled', error: '' })),
    };
  }
  duplicate(ids) {
    const s = this.state,
      src = s.posts.filter((p) => ids.includes(p.id)),
      wk = 7 * 864e5;
    const free = this.nextSlots(src.length);
    const copies = src.map((p, i) =>
      this.dupOf(p, p.at && p.at + wk > Component.NOW ? this.plusDays(p.at, 7) : free[i] || this.wsAt(1, 9)),
    );
    this.setState({ posts: [...s.posts, ...copies], tab: 'upcoming' });
    this.flash(
      copies.length === 1
        ? `Duplicated to ${this.slotLabel(copies[0].at)}`
        : `Duplicated ${copies.length} posts, one week later`,
    );
  }
  moveTo(id, dayMs) {
    const p = this.state.posts.find((x) => x.id === id);
    if (!p || !p.at) return;
    // dayMs is a calendar cell (a date label); keep the post's workspace wall-clock time on that date.
    const o = this.wsDate(p.at),
      d = new Date(dayMs),
      at = this.wsTime(d.getFullYear(), d.getMonth(), d.getDate(), o.getHours(), o.getMinutes());
    if (d.toDateString() === o.toDateString()) return;
    if (at < Component.NOW) return this.flash("Can't move a post into the past", true);
    const old = p.at,
      doMove = () => {
        this.setPost(id, (x) => ({ ...x, at }));
        this.flash(`Moved to ${this.slotLabel(at)}`, false, () => this.setPost(id, (x) => ({ ...x, at: old })));
      };
    if (p.repeat && p.repeat !== 'none')
      return this.setState({
        confirm: {
          title: 'Move a repeating post?',
          body: `This post repeats ${p.repeat}. Moving it shifts every future occurrence to the new day.`,
          cta: 'Move all occurrences',
          go: doMove,
        },
      });
    doMove();
  }
  dragProps(p) {
    const can = (p.status === 'scheduled' || p.status === 'draft') && !p.virtual;
    return {
      draggable: can ? 'true' : 'false',
      cursor: can ? 'grab' : 'pointer',
      op: this.state.dragId === p.id ? 0.4 : 1,
      dragStart: (e) => {
        if (!can) return e.preventDefault();
        e.dataTransfer.setData('text/plain', p.id);
        e.dataTransfer.effectAllowed = 'move';
        this.setState({ dragId: p.id });
      },
      dragEnd: () => this.setState({ dragId: null, dragOver: null }),
    };
  }
  dropProps(dd) {
    const k = dd.toDateString();
    return {
      over: (e) => {
        e.preventDefault();
        if (this.state.dragOver !== k) this.setState({ dragOver: k });
      },
      drop: (e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain') || this.state.dragId;
        this.setState({ dragId: null, dragOver: null });
        if (id) this.moveTo(id, dd.getTime());
      },
      isOver: this.state.dragOver === k,
    };
  }
  addFiles(list) {
    const items = list.map((f, i) => ({
      id: 'f' + Date.now() + i,
      name: f.name,
      kind: f.kind,
      url: f.url || '',
      tone: f.tone || '#7a6148',
      caption: f.name
        .replace(/\.[^.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .replace(/^./, (c) => c.toUpperCase()),
      at: null,
    }));
    this.setState(
      (st) => ({ bulkFiles: [...st.bulkFiles, ...items], bulkStep: 2 }),
      () => this.respace(false),
    );
  }
  respace(all = true) {
    const fs = this.state.bulkFiles,
      need = fs.filter((f) => all || !f.at);
    const keep = all ? [] : fs.filter((f) => f.at).map((f) => f.at);
    const slots = this.nextSlots(need.length, keep);
    let i = 0;
    this.setState({ bulkFiles: fs.map((f) => (all || !f.at ? { ...f, at: slots[i++] || null } : f)) });
  }
  bulkCreate(asDraft) {
    const s = this.state,
      accs = s.bulkAccs;
    if (!accs.length) return this.flash('Pick at least one account', true);
    const posts = s.bulkFiles.map((f, i) => ({
      id: 'p' + Date.now() + i,
      ws: s.ws || 'maya',
      labels: [],
      status: asDraft ? 'draft' : 'scheduled',
      at: asDraft ? null : f.at,
      caption: f.caption,
      media: [f.kind],
      ov: {},
      targets: accs.map((a) => ({ acc: a, status: asDraft ? 'draft' : 'scheduled', error: '' })),
    }));
    this.setState({
      posts: [...s.posts, ...posts],
      bulkFiles: [],
      screen: 'queue',
      tab: asDraft ? 'drafts' : 'upcoming',
    });
    this.flash(asDraft ? `Saved ${posts.length} drafts` : `Scheduled ${posts.length} posts`);
  }
  /** Splits CSV text into rows of fields. Handles quoted fields with commas, line breaks and "" escapes. */
  static csvRows(text) {
    const rows = [];
    let row = [],
      f = '',
      q = false,
      quoted = false;
    const endField = () => {
      row.push(f);
      f = '';
      quoted = false;
    };
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"' && text[i + 1] === '"') {
          f += '"';
          i++;
        } else if (c === '"') q = false;
        else f += c;
        continue;
      }
      if (c === '"' && !f.trim() && !quoted) {
        q = true;
        quoted = true;
        f = '';
      } else if (c === ',') endField();
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        endField();
        if (row.some((x) => x.trim())) rows.push(row);
        row = [];
      } else if (!quoted) f += c;
    }
    endField();
    if (row.some((x) => x.trim())) rows.push(row);
    return rows;
  }
  /**
   * CSV import. The accounts column lists accounts separated by ";". Each entry can be an account id, @username,
   * platform:@username, the account's display name, or a platform name. A platform name means that platform's
   * account when only one is connected; with several, the first is used and the row says so.
   */
  parseCsv() {
    const P = Component.P,
      s = this.state,
      accounts = s.accounts.filter((a) => (a.ws || 'maya') === (s.ws || 'maya'));
    const rows = Component.csvRows(s.csv || '');
    if (rows[0] && /^date$/i.test((rows[0][0] || '').trim())) rows.shift();
    const alias = {
      twitter: 'x',
      'x/twitter': 'x',
      ig: 'instagram',
      yt: 'youtube',
      gbp: 'google_business',
      google: 'google_business',
      bsky: 'bluesky',
      fb: 'facebook',
      li: 'linkedin',
      tt: 'tiktok',
    };
    const plat = (x) => {
      const k = x.toLowerCase();
      return P[alias[k] || k] ? alias[k] || k : null;
    };
    const list = (as) => as.map((a) => `${P[a.platform].label} @${a.username}`).join(', ');
    return rows.map((parts) => {
      const [date, time, accStr] = parts,
        caption = parts.slice(3).join(',').trim();
      const issues = [],
        notes = [];
      let warn = false;
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((date || '').trim()),
        t = /^(\d{1,2}):(\d{2})$/.exec((time || '').trim());
      let at = null;
      if (!m) issues.push('Date must look like 2026-10-26');
      else if (!t || +t[1] > 23 || +t[2] > 59) issues.push(`"${(time || '').trim()}" isn't a valid time`);
      else {
        at = Component.fromLocal(`${m[1]}-${m[2]}-${m[3]}T${String(+t[1]).padStart(2, '0')}:${t[2]}`, s.tz);
        if (!at || at <= Component.NOW) issues.push('That time has already passed');
      }
      const names = (accStr || '')
        .split(';')
        .map((x) => x.trim())
        .filter(Boolean);
      const accs = [];
      for (const raw of names) {
        let found = accounts.filter((a) => a.id === raw);
        const pm = /^([\w/ ]+?)\s*:\s*@?(.+)$/.exec(raw),
          pp = pm && plat(pm[1].trim());
        if (!found.length && pp)
          found = accounts.filter(
            (a) =>
              a.platform === pp &&
              (a.username.toLowerCase() === pm[2].trim().toLowerCase() ||
                (a.display || '').toLowerCase() === pm[2].trim().toLowerCase()),
          );
        else if (!found.length && raw.startsWith('@'))
          found = accounts.filter((a) => a.username.toLowerCase() === raw.slice(1).toLowerCase());
        if (!found.length && !raw.startsWith('@') && !pp && !plat(raw))
          found = accounts.filter(
            (a) =>
              (a.display || '').toLowerCase() === raw.toLowerCase() || a.username.toLowerCase() === raw.toLowerCase(),
          );
        if (!found.length && plat(raw)) {
          const pl = plat(raw),
            all = accounts.filter((a) => a.platform === pl);
          if (!all.length) {
            issues.push(`No ${P[pl].label} account connected`);
            continue;
          }
          if (all.length > 1)
            notes.push(
              `"${raw}" matches ${all.length} ${P[pl].label} accounts, so this uses @${all[0].username}. Write ${pl}:@username to pick one.`,
            );
          found = [all[0]];
        } else if (found.length > 1) {
          issues.push(`"${raw}" matches ${found.length} accounts (${list(found)}). Write platform:@username instead.`);
          continue;
        }
        if (!found.length) {
          issues.push(
            raw.startsWith('@') || pp ? `No connected account ${raw}` : `Unknown account or platform "${raw}"`,
          );
          continue;
        }
        const a = found[0];
        if (accs.includes(a)) continue;
        accs.push(a);
        if (caption.length > P[a.platform].max)
          issues.push(`${caption.length}/${P[a.platform].max} characters for ${P[a.platform].label}`);
        if (P[a.platform].req !== 'none') warn = true;
      }
      if (!names.length) issues.push('No accounts listed');
      if (!caption) issues.push('Caption is empty');
      const ok = issues.length === 0;
      return {
        ok,
        warn: ok && warn,
        note: ok ? notes[0] || '' : '',
        at,
        accs,
        caption,
        issue: ok
          ? warn
            ? 'Imports as a draft: this platform needs media. Add it before scheduling.' +
              (notes[0] ? ' ' + notes[0] : '')
            : notes[0] || ''
          : issues[0],
      };
    });
  }
  tzShift(ms = Date.now()) {
    return Component.shift(ms, this.state.tz);
  }
  /* Workspace wall-clock helpers. Calendar days are keyed by the workspace's date, never the browser's. */
  /** A Date whose local fields read as the workspace wall clock at ms (for reading the date and time only). */
  wsDate(ms) {
    return new Date(ms + this.tzShift(ms));
  }
  /** Workspace-local day key, comparable with a calendar cell's toDateString(). */
  dayKey(ms) {
    return this.wsDate(ms).toDateString();
  }
  /** Epoch ms for a workspace wall-clock date and time. Out-of-range days roll over (day 32 → next month). */
  wsTime(y, mo, d, h = 0, mi = 0) {
    const z = (n) => String(n).padStart(2, '0');
    return Component.fromLocal(`${Component.ymd(new Date(y, mo, d))}T${z(h)}:${z(mi)}`, this.state.tz);
  }
  /** Epoch ms for h:mi on the workspace's today + d days. */
  wsAt(d, h, mi = 0) {
    const t = this.wsDate(Date.now());
    return this.wsTime(t.getFullYear(), t.getMonth(), t.getDate() + d, h, mi);
  }
  /** The same workspace wall-clock time n days later (stays at 9:00 across daylight-saving changes). */
  plusDays(ms, n) {
    const o = this.wsDate(ms);
    return this.wsTime(o.getFullYear(), o.getMonth(), o.getDate() + n, o.getHours(), o.getMinutes());
  }
  /** Monday of the workspace's current week, as a calendar-day label (browser midnight). */
  wsMonday() {
    const t = this.wsDate(Date.now());
    t.setHours(0, 0, 0, 0);
    t.setDate(t.getDate() - ((t.getDay() + 6) % 7));
    return t.getTime();
  }
  wsMonth() {
    const t = this.wsDate(Date.now());
    return [t.getFullYear(), t.getMonth()];
  }
  time(ms) {
    return new Date(ms + this.tzShift(ms)).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  /** The calendar's visible range [from, to) in epoch ms, using the workspace's days. */
  calRange() {
    const s = this.state;
    if (s.calView === 'week') {
      const w = new Date(s.weekStart);
      return [
        this.wsTime(w.getFullYear(), w.getMonth(), w.getDate()),
        this.wsTime(w.getFullYear(), w.getMonth(), w.getDate() + 7),
      ];
    }
    return [this.wsTime(s.cursor[0], s.cursor[1], 1), this.wsTime(s.cursor[0], s.cursor[1] + 1, 1)];
  }
  /** Team list rows: members with their real role, then pending invites. */
  memberRows(members, invites) {
    const style = {
      owner: ['#141619', '#d9ff35', '#d9ff35'],
      editor: ['#141619', '#fff', '#e5e3dc'],
      member: ['#141619', '#fff', '#e5e3dc'],
      invited: ['#d98c0b', '#fff8e8', '#f3dfb2'],
    };
    return [
      ...members.map((m) => ({
        name: m.name || '',
        email: m.email,
        kind: style[m.role] ? m.role : 'member',
        role: m.role || 'member',
      })),
      ...(invites || [])
        .map((i) => (typeof i === 'string' ? { email: i, role: 'member' } : i))
        .map((i) => ({ name: '', email: i.email, kind: 'invited', role: `invited · ${i.role || 'member'}` })),
    ].map((m) => ({
      name: m.name,
      email: m.email,
      role: m.role,
      color: style[m.kind][0],
      bg: style[m.kind][1],
      border: style[m.kind][2],
    }));
  }
  /** Choices for a platform's select field (the live app lists the account's real Pinterest boards). */
  fieldOptions(a, f) {
    return f.options || [];
  }
  /** A CSS background showing the post's first image, or null for the placeholder (the live app fills this in). */
  mediaThumb(p, dim) {
    return null;
  }
  /** dayLabel for the middle of a sentence: "tomorrow", "on Saturday", "on Sat, Oct 31". */
  dayWords(ms) {
    const l = this.dayLabel(ms);
    return /^(Today|Tomorrow|Yesterday)$/.test(l) ? l.toLowerCase() : `on ${l}`;
  }
  dayLabel(ms) {
    const a = this.wsDate(ms);
    a.setHours(0, 0, 0, 0);
    const b = this.wsDate(Component.NOW);
    b.setHours(0, 0, 0, 0);
    const diff = Math.round((a - b) / 864e5);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff === -1) return 'Yesterday';
    // A weekday name alone is only clear within the coming week; further out, show the date.
    if (diff > 1 && diff < 7) return a.toLocaleDateString('en-US', { weekday: 'long' });
    return a.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      ...(a.getFullYear() !== b.getFullYear() ? { year: 'numeric' } : {}),
    });
  }

  renderVals() {
    const P = Component.P,
      NOW = Component.NOW,
      S0 = this.state,
      WS = S0.ws || 'maya',
      s = {
        ...S0,
        posts: S0.posts.filter((p) => (p.ws || 'maya') === WS),
        accounts: S0.accounts.filter((a) => (a.ws || 'maya') === WS),
      },
      d = s.draft;
    Component._tz = S0.tz;
    const screen = s.screen || this.props.startScreen || 'home';
    const accById = Object.fromEntries(s.accounts.map((a) => [a.id, a]));
    const LG = (pl) => ({ color: P[pl]?.color || '#888', logo: P[pl]?.logo || 'none' });
    const go = (sc) => () => this.setState({ screen: sc });
    const upcoming = s.posts.filter((p) => p.status === 'scheduled').sort((a, b) => a.at - b.at);

    const failedPosts = s.posts.filter((p) => p.status === 'failed' || p.status === 'partial');
    const norm = (c) => (c || '').toLowerCase().replace(/\s+/g, ' ').trim();
    const findConflicts = (p, pool) => {
      const out = [];
      if (!p.at) return out;
      for (const q of pool) {
        if (q.id === p.id || q.status !== 'scheduled' || !q.at) continue;
        const shared = p.targets.map((t) => t.acc).filter((id) => q.targets.some((t) => t.acc === id));
        if (!shared.length) continue;
        const who = shared
          .map((id) => (accById[id] ? `${P[accById[id].platform].label} @${accById[id].username}` : ''))
          .filter(Boolean)
          .join(', ');
        const gap = Math.abs(q.at - p.at) / 6e4;
        if (norm(q.caption) === norm(p.caption) && norm(p.caption))
          out.push({
            kind: 'dup',
            q,
            msg: `Same caption already scheduled for ${who} ${this.dayWords(q.at)} at ${this.time(q.at)}`,
          });
        else if (gap < 30) out.push({ kind: 'overlap', q, msg: `${Math.round(gap)} min from another post on ${who}` });
      }
      return out;
    };
    const conflictMap = {};
    for (const p of s.posts)
      if (p.status === 'scheduled') {
        const c = findConflicts(p, s.posts);
        if (c.length) conflictMap[p.id] = c;
      }
    const nav = [
      ['home', 'Home', '', ''],
      ['queue', 'Queue', '☰', upcoming.length],
      ['calendar', 'Calendar', '▦', ''],
      ['bulk', 'Bulk schedule', '⇪', ''],
      ['library', 'Library', '', ''],
      ['accounts', 'Accounts', '◎', s.accounts.length],
      ['analytics', 'Analytics', '↗', ''],
      ['settings', 'Settings', '⚙', ''],
    ].map(([id, label, icon, count]) => ({
      id,
      current: screen === id ? 'page' : 'false',
      label:
        { home: 'Overview', bulk: 'Bulk scheduling', library: 'Media library', accounts: 'Social accounts' }[id] ||
        label,
      icon: `url(/icons/${id}${screen === id ? '-on' : ''}.svg)`,
      count,
      go: () => this.setState({ screen: id, selecting: false, selected: [], drawer: false }),
      hasAlert: id === 'queue' && failedPosts.length > 0,
      alert: failedPosts.length,
      bg: screen === id ? '#1f2226' : 'transparent',
      color: screen === id ? '#f8f9f6' : '#a3a9b4',
    }));

    const ST = {
      scheduled: { color: '#141619', bg: '#f1efe9', border: '#e2dfd6' },
      published: { color: '#15803d', bg: '#effaf3', border: '#cdebd8' },
      partial: { color: '#dc3545', bg: '#fff1f0', border: '#f4c6c2' },
      failed: { color: '#dc3545', bg: '#fff1f0', border: '#f4c6c2' },
      draft: { color: '#677184', bg: '#f4f3ef', border: '#e5e3dc' },
    };
    const tabDefs = {
      upcoming: (p) => p.status === 'scheduled',
      review: (p) => p.approval === 'pending' && p.status !== 'published',
      published: (p) => ['published', 'partial'].includes(p.status),
      drafts: (p) => p.status === 'draft',
      failed: (p) => ['failed', 'partial'].includes(p.status),
    };
    const TAB_LABEL = {
      upcoming: 'Upcoming',
      review: 'Needs approval',
      published: 'History',
      drafts: 'Drafts',
      failed: 'Failed',
    };
    const queueTabs = Object.keys(tabDefs).map((k) => ({
      label: TAB_LABEL[k],
      count: s.posts.filter(tabDefs[k]).length,
      select: () => this.setState({ tab: k }),
      bg: s.tab === k ? '#141619' : 'transparent',
      color: s.tab === k ? '#fff' : '#677184',
    }));
    const list = s.posts
      .filter(tabDefs[s.tab])
      .filter(
        (p) =>
          (!S0.qAcc || p.targets.some((t) => t.acc === S0.qAcc)) &&
          (!S0.qPlat || p.targets.some((t) => accById[t.acc]?.platform === S0.qPlat)),
      )
      .filter((p) => !s.labelFilter || (p.labels || []).includes(s.labelFilter))
      .sort((a, b) => (s.tab === 'upcoming' ? a.at - b.at : (b.at || 0) - (a.at || 0)));
    const groups = [];
    for (const p of list) {
      const key = p.at ? this.dayKey(p.at) : 'none';
      let g = groups[groups.length - 1];
      if (!g || g.key !== key) {
        g = {
          key,
          label: p.at ? this.dayLabel(p.at) : 'Drafts',
          sub: p.at
            ? this.wsDate(p.at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
            : 'Not scheduled',
          items: [],
        };
        groups.push(g);
      }
      const imgs = p.media.filter((m) => m === 'IMG').length,
        vids = p.media.length - imgs;
      const errs = p.targets.filter((t) => t.error);
      const errKind = (txt) =>
        /authori|token|revoked|reconnect|permission/i.test(txt || '')
          ? 'auth'
          : /character|limit|seconds|too long|too short|format|size|aspect|required/i.test(txt || '')
            ? 'content'
            : 'temp';
      const fk = errs.length ? errKind(errs[0].error) : null;
      const actLabel = p.publishing
        ? ''
        : ['failed', 'partial'].includes(p.status)
          ? fk === 'auth'
            ? 'Reconnect account'
            : fk === 'content'
              ? 'Edit to fix'
              : 'Retry'
          : p.status === 'scheduled'
            ? p.approval === 'pending'
              ? ''
              : 'Post now'
            : p.status === 'draft'
              ? 'Publish'
              : ['failed', 'partial'].includes(p.status)
                ? 'Retry'
                : p.status === 'published'
                  ? 'Repost'
                  : '';
      const LEAD = { 15: '15m', 30: '30m', 60: '1h', 180: '3h', 1440: '1 day' };
      g.items.push({
        time: p.at ? this.time(p.at) : '—',
        status: p.publishing ? 'publishing…' : p.status,
        st: p.publishing ? ST.scheduled : ST[p.status] || ST.draft,
        meta: [
          `${p.targets.length} account${p.targets.length === 1 ? '' : 's'}`,
          imgs > 1 ? `carousel of ${imgs}` : imgs ? '1 image' : '',
          vids ? 'video' : '',
        ]
          .filter(Boolean)
          .join(' · '),
        caption: p.caption,
        hasMedia: p.media.length > 0,
        media: p.media.map((kind) => ({
          bg: 'linear-gradient(160deg,#9a7a58,#5d4a36)',
          label: kind,
          isVideo: false,
          video: '',
          labelBg: 'transparent',
        })),
        targets: p.targets.map((t) => {
          const a = accById[t.acc] || { username: 'disconnected', platform: 'x' };
          const sc =
            t.status === 'published'
              ? ST.published
              : t.status === 'failed'
                ? ST.failed
                : { bg: '#fff', border: '#e5e3dc' };
          const pid = Component.hash(p.id + t.acc).toString(36),
            u = a.username;
          const URL_ = {
            x: `https://x.com/${u}/status/${pid}`,
            bluesky: `https://bsky.app/profile/${u}/post/${pid}`,
            instagram: `https://instagram.com/p/${pid}`,
            linkedin: `https://linkedin.com/feed/update/urn:li:share:${pid}`,
            tiktok: `https://tiktok.com/@${u}/video/${pid}`,
            youtube: `https://youtube.com/watch?v=${pid}`,
            threads: `https://threads.net/@${u}/post/${pid}`,
            facebook: `https://facebook.com/${u}/posts/${pid}`,
            pinterest: `https://pinterest.com/pin/${pid}`,
            google_business: 'https://business.google.com',
          };
          const live = t.status === 'published';
          return {
            username: a.username,
            short: P[a.platform].short,
            logo: P[a.platform].logo,
            color: P[a.platform].color,
            bg: sc.bg,
            border: sc.border,
            title: live ? `View on ${P[a.platform].label}` : t.error || P[a.platform].label,
            href: live ? URL_[a.platform] || '#' : '#',
            pe: live ? 'auto' : 'none',
            arrow: live ? '↗' : '',
          };
        }),
        hasError: errs.length > 0,
        error:
          (fk === 'content'
            ? 'Content error, edit before retrying. '
            : fk === 'auth'
              ? 'Account needs reconnecting. '
              : 'Temporary error, safe to retry. ') +
          errs.map((t) => `${accById[t.acc]?.username || '?'}: ${t.error}`).join(' · '),
        canEdit: !['published'].includes(p.status),
        hasAction: !!actLabel,
        actLabel,
        act: () => {
          if ((p.status === 'failed' || p.status === 'partial') && fk === 'auth')
            return this.setState({ screen: 'accounts' });
          if ((p.status === 'failed' || p.status === 'partial') && fk === 'content') return this.editPost(p);
          if (p.status === 'failed' || p.status === 'partial') {
            this.setPost(p.id, (x) => ({
              ...x,
              status: 'published',
              targets: x.targets.map((t) => ({ ...t, status: 'published', error: '' })),
            }));
            this.flash('Retried failed targets');
          } else if (p.status === 'published') {
            const at = this.nextSlots(1)[0];
            if (!at) return this.flash('Add posting slots in Settings first', true);
            this.setState((st) => ({ posts: [...st.posts, this.dupOf(p, at)] }));
            this.flash(`Reposting ${this.slotLabel(at)}`);
          } else this.publishNow(p);
        },
        edit: () => this.editPost(p),
        duplicate: () => this.duplicate([p.id]),
        ...(() => {
          const open = S0.menuFor === p.id,
            close = (fn) => () => {
              this.setState({ menuFor: null });
              fn();
            };
          const doAct = () => g.items.find((x) => x.__id === p.id)?.act();
          let prim = p.publishing
            ? ['Publishing…', () => {}, false]
            : p.approval === 'pending' && p.status !== 'published'
              ? [
                  'Approve',
                  () => {
                    this.setPost(p.id, (x) => ({ ...x, approval: 'approved' }));
                    this.flash('Approved');
                  },
                  true,
                ]
              : actLabel
                ? [actLabel, () => doAct(), ['failed', 'partial'].includes(p.status) || actLabel === 'Post now']
                : ['Edit', () => this.editPost(p), false];
          const menu = p.publishing
            ? []
            : [
                p.status !== 'published' ? { label: 'Edit', go: close(() => this.editPost(p)) } : null,
                { label: 'Duplicate', go: close(() => this.duplicate([p.id])) },
                p.approval === 'pending'
                  ? {
                      label: 'Request changes',
                      go: close(() => {
                        this.setPost(p.id, (x) => ({ ...x, approval: null, status: 'draft', at: null }));
                        this.flash('Sent back to drafts');
                      }),
                    }
                  : null,
                p.status === 'scheduled'
                  ? {
                      label: 'Move +1 day',
                      go: close(() => {
                        const old = p.at;
                        this.setPost(p.id, (x) => ({ ...x, at: this.plusDays(x.at, 1) }));
                        this.flash('Moved one day later', false, () => this.setPost(p.id, (x) => ({ ...x, at: old })));
                      }),
                    }
                  : null,
                {
                  label: 'Delete…',
                  color: '#dc3545',
                  go: close(() =>
                    this.setState({
                      confirm: {
                        title: 'Delete this post?',
                        body: (p.caption || '').slice(0, 90),
                        cta: 'Delete post',
                        go: () => {
                          const snap = p;
                          this.setState((st) => ({ posts: st.posts.filter((x) => x.id !== p.id) }));
                          this.flash('Post deleted', false, () =>
                            this.setState((st) => ({ posts: [...st.posts, snap] })),
                          );
                        },
                      },
                    }),
                  ),
                },
              ].filter(Boolean);
          return {
            __id: p.id,
            primLabel: prim[0],
            primary: prim[1],
            primBg: prim[2] ? '#141619' : '#fff',
            primFg: prim[2] ? '#fff' : '#141619',
            primBorder: prim[2] ? '#141619' : '#e7e5df',
            menuOpen: open ? 'true' : 'false',
            showMenu: open,
            menu,
            toggleMenu: () => this.setState({ menuFor: open ? null : p.id }),
          };
        })(),
        hasConflict: !!conflictMap[p.id],
        conflict: conflictMap[p.id] ? conflictMap[p.id][0].msg : '',
        hasNote: !!p.note,
        note: p.note || '',
        pending: p.approval === 'pending',
        approved: p.approval === 'approved' && p.status === 'scheduled',
        labels: p.labels || [],
        flags: [
          p.repeat && p.repeat !== 'none' ? `↻ Repeats ${p.repeat}` : '',
          p.evergreen ? 'Evergreen' : '',
          p.status === 'scheduled' && s.remind.on && p.remind !== false
            ? `Reminder ${LEAD[s.remind.lead] || '1h'} before`
            : '',
        ].filter(Boolean),
        approve: () => {
          this.setPost(p.id, (x) => ({ ...x, approval: 'approved' }));
          this.flash('Approved');
        },
        reject: () => {
          this.setPost(p.id, (x) => ({
            ...x,
            approval: null,
            status: 'draft',
            at: null,
            targets: x.targets.map((t) => ({ ...t, status: 'draft' })),
          }));
          this.flash('Sent back to drafts with a change request');
        },
        selecting: s.selecting,
        toggleSel: () => {
          if (p.status !== 'scheduled') return;
          this.setState((st) => ({
            selected: st.selected.includes(p.id) ? st.selected.filter((x) => x !== p.id) : [...st.selected, p.id],
          }));
        },
        selBorder: s.selected.includes(p.id) ? '#141619' : '#cfccc3',
        selBg: s.selected.includes(p.id) ? '#d9ff35' : '#fff',
        selMark: s.selected.includes(p.id) ? '✓' : '',
        rowBg: s.selecting && s.selected.includes(p.id) ? '#fbffe8' : '#fff',
        remove: () => {
          this.setState((st) => ({ posts: st.posts.filter((x) => x.id !== p.id) }));
          this.flash('Post deleted');
        },
        divider: g.items.length ? '1px solid #e5e3dc' : '0',
      });
    }
    const rowPad = this.props.density === 'compact' ? '10px 16px' : '16px 18px';
    const nextUp = upcoming.length
      ? `${upcoming.length} scheduled. Next one goes out ${this.dayWords(upcoming[0].at)} at ${this.time(upcoming[0].at)}.`
      : 'Nothing scheduled yet.';

    // calendar
    const [cy, cm] = s.cursor;
    const first = new Date(cy, cm, 1),
      lead = (first.getDay() + 6) % 7,
      start = new Date(cy, cm, 1 - lead);
    const byDay = {};
    const calMatch = (p) =>
      (!S0.calPlat || p.targets.some((t) => accById[t.acc]?.platform === S0.calPlat)) &&
      (!S0.calAcc || p.targets.some((t) => t.acc === S0.calAcc)) &&
      (!S0.calStatus ||
        (S0.calStatus === 'approval'
          ? p.approval === 'pending'
          : S0.calStatus === 'failed'
            ? ['failed', 'partial'].includes(p.status)
            : p.status === S0.calStatus));
    const STL = (p) =>
      p.publishing
        ? ['Publishing…', '#eef0f3', '#141619']
        : p.approval === 'pending' && p.status !== 'published'
          ? ['Needs approval', '#fff1d6', '#8a5a00']
          : p.status === 'published'
            ? ['Published', '#e7f5ec', '#15803D']
            : p.status === 'failed' || p.status === 'partial'
              ? ['Failed', '#fde8ea', '#DC3545']
              : p.status === 'draft'
                ? ['Draft', '#f1f1ec', '#677184']
                : ['Scheduled', '#eef0f3', '#141619'];
    const TONES = [
      'linear-gradient(160deg,#9a7a58,#5d4a36)',
      'linear-gradient(160deg,#6e7b5a,#3e4a33)',
      'linear-gradient(160deg,#7a6a8a,#3f3550)',
      'linear-gradient(160deg,#5a6e7b,#2f3e48)',
    ];
    const evOf = (p, i, n) => {
      const st = STL(p),
        th = p.media.length ? this.mediaThumb(p) || TONES[Component.hash(p.src || p.id) % 4] : 'transparent';
      return {
        time: this.time(p.at),
        timeShort: this.time(p.at).replace(':00', '').replace(' AM', 'a').replace(' PM', 'p'),
        c1: LG(accById[p.targets[0]?.acc]?.platform).color,
        l1: LG(accById[p.targets[0]?.acc]?.platform).logo,
        plus: p.targets.length > 1 ? '+' + (p.targets.length - 1) : '',
        caption: (p.repeat && p.repeat !== 'none' ? '↻ ' : '') + (p.caption || '(media)'),
        title: `${this.time(p.at)} · ${st[0]} · ${p.caption}`,
        icons: p.targets.slice(0, 3).map((t) => LG(accById[t.acc]?.platform)),
        stLabel: st[0],
        stBg: st[1],
        stFg: st[2],
        border: st[0] === 'Failed' ? '#f5c2c7' : st[0] === 'Needs approval' ? '#f3dfb2' : '#e7e5df',
        thumb: th,
        thumbDisplay: p.media.length ? 'block' : 'none',
        thumbOrBlank: p.media.length ? th : '#f1f1ec',
        divider: i ? '1px solid #efefea' : '0',
        open: () => this.setState({ calPost: p.src || p.id }),
        key: (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.setState({ calPost: p.src || p.id });
          }
        },
        duplicate: (e) => {
          e && e.stopPropagation && e.stopPropagation();
          this.duplicate([p.src || p.id]);
        },
        ...this.dragProps(p),
      };
    };
    // Bucketed by the workspace's date, so a 9 PM New York post sits on its New York day in any browser.
    for (const p of s.posts.filter(calMatch))
      if (p.at) {
        (byDay[this.dayKey(p.at)] ||= []).push(p);
        if (p.repeat && p.repeat !== 'none' && p.status === 'scheduled')
          for (let k = 1; k <= 12; k++) {
            const dt = this.wsDate(p.at);
            if (p.repeat === 'weekly') dt.setDate(dt.getDate() + 7 * k);
            else dt.setMonth(dt.getMonth() + k);
            const at = this.wsTime(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes());
            (byDay[dt.toDateString()] ||= []).push({ ...p, id: p.id + '~' + k, at, virtual: true, src: p.id });
          }
      }
    const todayK = this.dayKey(NOW);
    const dayEnd = (dd) => this.wsTime(dd.getFullYear(), dd.getMonth(), dd.getDate() + 1);
    const EV = {
      scheduled: ['#f1efe9', '#141619'],
      published: ['#effaf3', '#15803d'],
      partial: ['#fff1f0', '#dc3545'],
      failed: ['#fff1f0', '#dc3545'],
      draft: ['#f4f3ef', '#9aa0a8'],
    };
    const cells = Math.ceil((lead + new Date(cy, cm + 1, 0).getDate()) / 7) * 7;
    const calDays = Array.from({ length: cells }, (_, i) => {
      const dd = new Date(start);
      dd.setDate(start.getDate() + i);
      const k = dd.toDateString(),
        other = dd.getMonth() !== cm,
        isT = k === todayK;
      return {
        num: dd.getDate(),
        color: other ? '#a3a9b4' : '#141619',
        numBg: isT ? '#D9FF35' : 'transparent',
        numColor: isT ? '#141619' : 'inherit',
        ...(() => {
          const ev = (byDay[k] || []).sort((a, b) => a.at - b.at);
          return {
            shown: ev.slice(0, 3).map((p, i) => evOf(p, i)),
            moreDisplay: ev.length > 3 ? 'block' : 'none',
            moreLabel: `+${ev.length - 3} more`,
            more: () =>
              this.setState({
                calView: 'week',
                weekStart: new Date(dd.getFullYear(), dd.getMonth(), dd.getDate() - ((dd.getDay() + 6) % 7)).getTime(),
              }),
          };
        })(),
        add: () => this.newPost(this.wsTime(dd.getFullYear(), dd.getMonth(), dd.getDate(), 10)),
        note: s.notes[k] || '',
        hasNote: !!s.notes[k],
        noteDisplay: s.notes[k] ? 'block' : 'none',
        editNote: (e) => {
          e && e.stopPropagation && e.stopPropagation();
          this.setState({ noteKey: k, noteText: s.notes[k] || '' });
        },
        events: (byDay[k] || [])
          .sort((a, b) => a.at - b.at)
          .map((p) => ({
            time: this.time(p.at).replace(':00', '').replace(' AM', 'a').replace(' PM', 'p'),
            caption: (p.repeat && p.repeat !== 'none' ? '↻ ' : '') + (p.caption || '(media)'),
            dots: p.targets.slice(0, 3).map((t) => LG(accById[t.acc]?.platform)),
            bg: (EV[p.status] || EV.draft)[0],
            edge: (EV[p.status] || EV.draft)[1],
            open: () =>
              p.status === 'published' ? this.setState({ screen: 'queue', tab: 'published' }) : this.editPost(p),
            ...this.dragProps(p),
          })),
        ...(() => {
          const dp = this.dropProps(dd);
          return {
            over: dp.over,
            drop: dp.drop,
            ring: dp.isOver ? 'inset 0 0 0 2px #141619' : 'none',
            bg: dp.isOver ? '#f7ffd6' : dayEnd(dd) <= NOW ? '#f6f6f2' : '#fff',
          };
        })(),
      };
    });
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const dd = new Date(s.weekStart);
      dd.setDate(dd.getDate() + i);
      const k = dd.toDateString(),
        isT = k === todayK,
        dp = this.dropProps(dd);
      return {
        dow: dd.toLocaleDateString('en-US', { weekday: 'short' }),
        num: dd.getDate(),
        numColor: isT ? '#5c6b00' : '#141619',
        bg: dp.isOver ? '#f7ffd6' : isT ? '#fcfff0' : dayEnd(dd) <= NOW ? '#f9f9f6' : '#fff',
        numBg: isT ? '#D9FF35' : 'transparent',
        over: dp.over,
        drop: dp.drop,
        add: () => this.newPost(this.wsTime(dd.getFullYear(), dd.getMonth(), dd.getDate(), 10)),
        note: s.notes[k] || '',
        hasNote: !!s.notes[k],
        noteDisplay: s.notes[k] ? 'block' : 'none',
        editNote: (e) => {
          e && e.stopPropagation && e.stopPropagation();
          this.setState({ noteKey: k, noteText: s.notes[k] || '' });
        },
        events: (byDay[k] || []).sort((a, b) => a.at - b.at).map((p, i) => evOf(p, i)),
      };
    });
    const ws = new Date(s.weekStart),
      we = new Date(s.weekStart + 6 * 864e5);
    const weekLabel = `${ws.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${we.toLocaleDateString('en-US', { month: ws.getMonth() === we.getMonth() ? undefined : 'short', day: 'numeric' })}, ${we.getFullYear()}`;

    // composer
    const sel = d.targets.map((id) => accById[id]).filter(Boolean);
    const accQ = (S0.accQ || '').toLowerCase();
    const accountChips = s.accounts
      .filter(
        (a) => !accQ || a.username.toLowerCase().includes(accQ) || P[a.platform].label.toLowerCase().includes(accQ),
      )
      .map((a) => {
        const on = d.targets.includes(a.id);
        const warn =
          a.health === 'over'
            ? 'Over plan limit'
            : a.health === 'error'
              ? 'Reconnect needed'
              : a.health === 'expiring'
                ? 'Expires soon'
                : P[a.platform].label;
        return {
          username: a.username,
          logo: P[a.platform].logo,
          color: P[a.platform].color,
          ...Component.pic(a),
          pressed: on ? 'true' : 'false',
          border: on ? '#141619' : 'transparent',
          bg: on ? '#f6ffd9' : 'transparent',
          boxBorder: on ? '#141619' : '#cfd3d9',
          boxBg: on ? '#d9ff35' : '#fff',
          mark: on ? '✓' : '',
          sub: warn,
          subColor:
            a.health === 'error' ? '#dc3545' : a.health === 'expiring' || a.health === 'over' ? '#b47100' : '#677184',
          toggle: () => this.upd({ targets: on ? d.targets.filter((x) => x !== a.id) : [...d.targets, a.id] }),
        };
      });
    const plats = [...new Set(sel.map((a) => a.platform))];
    const counters = plats.map((pl) => ({
      label: P[pl].label,
      text: `${d.caption.length}/${P[pl].max}`,
      color: P[pl].color,
      fg: d.caption.length > P[pl].max ? '#dc3545' : '#677184',
    }));
    const hasImg = d.media.includes('IMG'),
      hasVid = d.media.includes('VIDEO');
    const problems = [];
    for (const a of sel) {
      const p = P[a.platform],
        text = d.ov[a.id]?.caption ?? d.caption;
      if (a.health === 'error')
        problems.push(
          `${p.label} @${a.username} is disconnected (${a.error || 'authorization lost'}). Reconnect it in Social accounts or deselect it.`,
        );
      if (a.health === 'over')
        problems.push(
          `${p.label} @${a.username} is over your plan's account limit and can't publish. Upgrade your plan, disconnect another account, or deselect it.`,
        );
      if (text.length > p.max)
        problems.push(
          `Your ${p.label} caption is ${text.length - p.max} characters over the ${p.max.toLocaleString()} limit. Shorten it in the ${p.label} tab.`,
        );
      if (p.req === 'any' && !d.media.length)
        problems.push(`${p.label} posts need an image or video. Add media or deselect @${a.username}.`);
      if (p.req === 'image' && !hasImg)
        problems.push(`${p.label} pins need an image. Add one or deselect @${a.username}.`);
      if (p.req === 'video' && !hasVid)
        problems.push(`${p.label} only accepts video. Add a video or deselect @${a.username}.`);
      // The effective "Post as": the account's own choice, else the one picked for every Instagram and Facebook account.
      const fmt =
        (d.ov[a.id]?.opts || {}).format || (a.platform === 'instagram' || a.platform === 'facebook' ? d.postAs : null);
      if (fmt === 'Reel' && !(d.media.length === 1 && hasVid))
        problems.push(`A ${p.label} Reel needs exactly one video. Change "Post as" or the media for @${a.username}.`);
      if (fmt === 'Story' && d.media.length !== 1)
        problems.push(
          `A ${p.label} Story needs exactly one image or video. Change "Post as" or the media for @${a.username}.`,
        );
      for (const f of p.fields || [])
        if (f.options && !this.fieldOptions(a, f).length)
          problems.push(
            `${p.label} @${a.username} has no ${f.label.toLowerCase()}s to post to. Create one on ${p.label}, then reconnect the account.`,
          );
      if (p.maxImages !== undefined && d.media.filter((m) => m === 'IMG').length > p.maxImages)
        problems.push(
          `${p.label} allows ${p.maxImages} image${p.maxImages === 1 ? '' : 's'} per post. Remove some or deselect @${a.username}.`,
        );
    }
    if (d.mode === 'schedule') {
      const at = Component.fromLocal(d.when, S0.tz);
      if (!at) problems.push('Pick a date and time.');
      else if (at < NOW - 6e4)
        problems.push(
          `That time is in the past (${this.dayLabel(at)} ${this.time(at)}). Pick a future time, or choose Publish now.`,
        );
    }
    const uniq = [...new Set(problems)];
    const draftAt =
      d.mode === 'schedule' ? Component.fromLocal(d.when) : d.mode === 'queue' ? this.nextSlots(1, [], d.id)[0] : null;
    const conflictWarn =
      draftAt && d.targets.length
        ? findConflicts(
            { id: d.id || '__draft', at: draftAt, caption: d.caption, targets: d.targets.map((acc) => ({ acc })) },
            s.posts,
          ).map((c) => c.msg)
        : [];
    const variants = sel.map((a) => {
      const p = P[a.platform],
        o = d.ov[a.id] || {},
        open = d.open === a.id,
        text = o.caption ?? d.caption;
      return {
        id: a.id,
        logo: p.logo,
        username: a.username,
        platform: p.label,
        short: p.short,
        color: p.color,
        pic: Component.pic(a).pic,
        isOpen: open,
        chevron: open ? '▾' : '▸',
        custom: o.caption !== undefined || Object.keys(o.opts || {}).length > 0,
        toggleOpen: () => this.upd({ open: open ? null : a.id }),
        text,
        countText: `${text.length}/${p.max}`,
        countColor: text.length > p.max ? '#dc3545' : '#677184',
        onText: (e) => this.setOv(a.id, { caption: e.target.value }),
        hasOverride: o.caption !== undefined,
        reset: () => this.setOv(a.id, { caption: undefined }),
        // A select shows the value that will be saved: the account's choice, else "Post as", else the first option (submit saves it).
        fields: (p.fields || []).map((f) => {
          const opts = f.options ? this.fieldOptions(a, f) : [];
          return {
            key: f.key,
            label: f.label,
            isSelect: !!f.options,
            isText: !f.options,
            options: opts,
            value:
              (o.opts || {})[f.key] ?? (f.key === 'format' ? d.postAs || opts[0] : f.options ? (opts[0] ?? '') : ''),
            onChange: (e) => this.setOv(a.id, { opts: { ...(o.opts || {}), [f.key]: e.target.value } }),
          };
        }),
      };
    });
    const modes = [
      ['now', 'Publish now', 'Goes out immediately'],
      ['schedule', 'Schedule', 'Pick a date and time'],
      ['queue', 'Add to queue', 'Next open slot'],
      ['draft', 'Save draft', 'Not scheduled'],
    ].map(([k, label, hint]) => ({
      label,
      hint,
      pressed: d.mode === k ? 'true' : 'false',
      select: () => this.upd({ mode: k }),
      bg: d.mode === k ? '#f6ffd9' : '#fff',
      border: d.mode === k ? '#141619' : '#e7e5df',
    }));
    const quickTimes = [
      [
        (() => {
          const h = this.wsDate(Component.soon());
          return (
            (this.dayLabel(Component.soon()) === 'Today' ? 'Today ' : 'Tomorrow ') +
            h.toLocaleTimeString('en-US', { hour: 'numeric' })
          );
        })(),
        Component.soon(),
      ],
      ['Tomorrow 9 AM', this.wsAt(1, 9)],
      [
        'Mon 12 PM',
        (() => {
          const m = new Date(this.wsMonday());
          return this.wsTime(m.getFullYear(), m.getMonth(), m.getDate() + 7, 12);
        })(),
      ],
    ].map(([label, ms]) => ({ label, pick: () => this.upd({ when: Component.toLocal(ms) }) }));
    const n = d.targets.length;
    const submitDisabled = n === 0 || (uniq.length > 0 && d.mode !== 'draft');
    const nextSlot = this.nextSlots(1, [], d.id)[0];
    const submitLabel =
      d.mode === 'queue'
        ? n
          ? `Add to queue · ${n} account${n === 1 ? '' : 's'}`
          : 'Add to queue'
        : d.mode === 'now'
          ? `Publish to ${n} account${n === 1 ? '' : 's'}`
          : d.mode === 'schedule'
            ? n
              ? `Schedule for ${n} account${n === 1 ? '' : 's'}`
              : 'Schedule'
            : 'Save draft';
    const pvAcc = sel.find((a) => a.id === d.previewId) || sel[0];
    const pvText = pvAcc ? (d.ov[pvAcc.id]?.caption ?? d.caption) : d.caption;
    const pvWhen =
      d.mode === 'schedule'
        ? `${this.dayLabel(Component.fromLocal(d.when))} ${this.time(Component.fromLocal(d.when))}`
        : d.mode === 'now'
          ? 'now'
          : 'draft';
    // "Post as" (Instagram and Facebook): one choice for every selected account, changeable per account in its tab.
    const fmtOf = (a) => (d.ov[a.id]?.opts || {}).format || d.postAs || 'Post';
    const metaSel = sel.filter((a) => a.platform === 'instagram' || a.platform === 'facebook');
    const fmtNow = !metaSel.length
      ? d.postAs || 'Post'
      : metaSel.every((a) => fmtOf(a) === fmtOf(metaSel[0]))
        ? fmtOf(metaSel[0])
        : '';
    const FMT_HINT = {
      Post: 'Feed post · images 1:1 or 4:5, carousels up to 10',
      Reel: 'Vertical video · 9:16 (1080×1920)',
      Story: 'One image or video · 9:16, no caption',
    };
    const formatChips = ['Post', 'Reel', 'Story'].map((f) => ({
      label: f,
      ratio: f === 'Post' ? '1:1' : '9:16',
      on: fmtNow === f,
      bg: fmtNow === f ? '#141619' : '#fff',
      fg: fmtNow === f ? '#fff' : '#141619',
      border: fmtNow === f ? '#141619' : '#e7e5df',
      pick: () => {
        this.upd({ postAs: f });
        metaSel.forEach((a) => this.setOv(a.id, { opts: { ...(d.ov[a.id]?.opts || {}), format: f } }));
      },
    }));
    const pvFmt = !pvAcc
      ? d.postAs || 'Post'
      : pvAcc.platform === 'instagram' || pvAcc.platform === 'facebook'
        ? fmtOf(pvAcc)
        : 'Post';
    const vertical = pvFmt !== 'Post' || ['tiktok'].includes(pvAcc?.platform);
    const pv = {
      ratio: vertical ? '9/16' : '1',
      frameW: vertical ? '62%' : '100%',
      fmtTag: pvFmt !== 'Post' ? pvFmt : '',
      hasFmtTag: pvFmt !== 'Post',
      logo: pvAcc ? P[pvAcc.platform].logo : 'none',
      color: pvAcc ? P[pvAcc.platform].color : '#e9e7e0',
      ...(pvAcc ? Component.pic(pvAcc) : { pic: '#e9e7e0', badge: 'none', badgeDisplay: 'none' }),
      name: pvAcc ? pvAcc.display : 'Preview',
      // Pages, profiles and locations are named, not @handles.
      handle: pvAcc
        ? `${['facebook', 'linkedin', 'google_business', 'youtube'].includes(pvAcc.platform) ? '' : '@'}${pvAcc.username} · ${P[pvAcc.platform].label} · ${pvWhen}`
        : 'Pick an account to preview',
      text: pvText || 'Your post will appear here.',
      textColor: pvText ? '#141619' : '#9aa0a8',
      media: d.media
        .slice(0, 4)
        .map((kind) => ({
          bg: 'linear-gradient(160deg,#9a7a58,#5d4a36)',
          label: kind,
          isVideo: false,
          video: '',
          labelBg: 'transparent',
          controls: false,
          pe: 'none',
        })),
      cols: d.media.length === 1 || vertical ? '1fr' : '1fr 1fr',
    };
    if (vertical) pv.media = pv.media.slice(0, 1);
    const previewTabs = sel.map((a) => ({
      short: P[a.platform].short,
      logo: P[a.platform].logo,
      color: P[a.platform].color,
      ...Component.pic(a),
      title: `${P[a.platform].label} · ${a.username}`,
      ringShadow: pvAcc && pvAcc.id === a.id ? '0 0 0 2px #fff, 0 0 0 4px #141619' : 'none',
      select: () => this.upd({ previewId: a.id }),
    }));

    // accounts
    const HL = (a) =>
      a.health === 'over'
        ? {
            hLabel: 'Over plan limit',
            hFg: '#8a5a00',
            hBg: '#fff1d6',
            healthDetail: "Paused. Your plan's account limit is reached",
            needsFix: true,
            fixLabel: 'Upgrade',
          }
        : a.health === 'error'
          ? {
              hLabel: 'Reconnect needed',
              hFg: '#a1281f',
              hBg: '#fde8e6',
              healthDetail: a.error || 'Connection error',
              needsFix: true,
              fixLabel: 'Reconnect',
            }
          : a.health === 'expiring'
            ? {
                hLabel: 'Expires soon',
                hFg: '#8a5a00',
                hBg: '#fff1d6',
                healthDetail: `Token expires ${this.dayLabel(a.expires)}`,
                needsFix: true,
                fixLabel: 'Reconnect',
              }
            : {
                hLabel: 'Connected',
                hFg: '#15803d',
                hBg: '#eaf6ee',
                healthDetail: 'Token valid for 58 days',
                needsFix: false,
                fixLabel: 'Reconnect',
              };
    const reconnect = (a) => () => {
      this.setState((st) => ({
        accounts: st.accounts.map((x) => (x.id === a.id ? { ...x, health: 'ok', error: '', expires: null } : x)),
      }));
      this.flash(`Reconnected ${P[a.platform].label} @${a.username}`);
    };
    const acQ = (S0.acQ || '').toLowerCase();
    const connected = s.accounts
      .filter(
        (a) =>
          (!acQ || a.username.toLowerCase().includes(acQ)) &&
          (!S0.acPlat || a.platform === S0.acPlat) &&
          (!S0.acSt ||
            (S0.acSt === 'issue') === !!(a.health === 'error' || a.health === 'expiring' || a.health === 'over')),
      )
      .sort(
        (x, y) =>
          !!(y.health === 'error' || y.health === 'expiring' || y.health === 'over') -
          !!(x.health === 'error' || x.health === 'expiring' || x.health === 'over'),
      )
      .map((a, i) => ({
        ...a,
        ...HL(a),
        reconnect: reconnect(a),
        initial: a.username[0].toUpperCase(),
        color: P[a.platform].color,
        short: P[a.platform].short,
        logo: P[a.platform].logo,
        ...Component.pic(a),
        platform: P[a.platform].label,
        divider: i ? '1px solid #e5e3dc' : '0',
        queued: (() => {
          const q = upcoming.filter((p) => p.targets.some((t) => t.acc === a.id)).length;
          return q ? `${q} queued` : '';
        })(),
        disconnect: () => {
          const q = upcoming.filter((p) => p.targets.some((t) => t.acc === a.id)).length;
          this.setState({
            confirm: {
              title: `Disconnect @${a.username}?`,
              body: q
                ? `${q} scheduled post${q === 1 ? '' : 's'} will stop publishing to this account. Other accounts on those posts are not affected.`
                : 'No scheduled posts use this account.',
              cta: 'Disconnect',
              go: () => {
                this.setState((st) => ({ accounts: st.accounts.filter((x) => x.id !== a.id) }));
                this.flash(`Disconnected ${a.username}`);
              },
            },
          });
        },
      }));
    const platformCards = Object.entries(P).map(([id, p]) => {
      const c = s.accounts.filter((a) => a.platform === id).length;
      return {
        ...p,
        needsKeys: false,
        cursor: 'pointer',
        btnOpacity: '1',
        hasCount: c > 0,
        count: `${c} connected`,
        connect: () => {
          if (s.accounts.length >= 15) return this.flash('Account limit reached on your plan', true);
          this.setState((st) => ({
            accounts: [
              ...st.accounts,
              {
                id: 'a' + Date.now(),
                ws: WS,
                platform: id,
                username: `maya.${p.short.toLowerCase()}${c + 1}`,
                display: 'Maya Chen',
              },
            ],
          }));
          this.flash(`Connected ${p.label}`);
        },
      };
    });

    // analytics
    let pub = 0,
      fail = 0;
    const bp = {};
    const perDay = {};
    for (const p of s.posts)
      for (const t of p.targets) {
        const pl = accById[t.acc]?.platform;
        if (!pl) continue;
        bp[pl] ||= { published: 0, failed: 0 };
        if (t.status === 'published') {
          pub++;
          bp[pl].published++;
          const k = this.dayKey(p.at);
          perDay[k] = (perDay[k] || 0) + 1;
        }
        if (t.status === 'failed') {
          fail++;
          bp[pl].failed++;
        }
      }
    const days = Array.from({ length: 14 }, (_, i) => {
      const x = this.wsDate(NOW);
      x.setHours(12, 0, 0, 0);
      x.setDate(x.getDate() - 13 + i);
      return x;
    });
    const mx = Math.max(1, ...days.map((x) => perDay[x.toDateString()] || 0));
    const bars = days.map((x, i) => {
      const v = perDay[x.toDateString()] || 0;
      return {
        n: v || '',
        h: `${Math.max(3, (v / mx) * 100)}%`,
        bg: v ? (i === 13 ? '#d9ff35' : '#141619') : '#e5e3dc',
        day: x.getDate(),
        title: `${x.toDateString()}: ${v}`,
      };
    });
    const maxP = Math.max(1, ...Object.values(bp).map((v) => v.published));
    const byPlatform = Object.entries(bp)
      .sort((a, b) => b[1].published - a[1].published)
      .map(([k, v], i) => ({
        label: P[k].label,
        short: P[k].short,
        logo: P[k].logo,
        color: P[k].color,
        published: v.published,
        failed: v.failed,
        hasFailed: v.failed > 0,
        w: `${(v.published / maxP) * 100}%`,
        divider: i ? '1px solid #e5e3dc' : '0',
      }));
    const aDays = S0.aRange || 14,
      aFrom = NOW - aDays * 864e5,
      aPl = S0.aPlat || '';
    let aPub = 0,
      aFail = 0,
      pPub = 0,
      pFail = 0;
    for (const p of s.posts)
      if (p.at && p.at <= NOW)
        for (const t of p.targets) {
          const pl = accById[t.acc]?.platform;
          if (!pl || (aPl && pl !== aPl)) continue;
          const inCur = p.at > aFrom,
            inPrev = p.at <= aFrom && p.at > aFrom - aDays * 864e5;
          if (t.status === 'published') {
            if (inCur) aPub++;
            else if (inPrev) pPub++;
          }
          if (t.status === 'failed') {
            if (inCur) aFail++;
            else if (inPrev) pFail++;
          }
        }
    const rate = aPub + aFail ? Math.round((aPub / (aPub + aFail)) * 100) : 100,
      pRate = pPub + pFail ? Math.round((pPub / (pPub + pFail)) * 100) : null;
    const fmt = (v) => (v >= 1000 ? (v / 1000).toFixed(v >= 10000 ? 0 : 1) + 'k' : String(v));
    const postStats = s.posts
      .filter((p) => p.status === 'published' || p.status === 'partial')
      .sort((a, b) => b.at - a.at)
      .slice(0, 6)
      .map((p, i) => {
        const avail = !p.targets.every((t) =>
          ['threads', 'tiktok', 'google_business'].includes(accById[t.acc]?.platform),
        );
        const h = Component.hash(p.id + p.caption),
          live = p.targets.filter((t) => t.status === 'published').length || 1;
        const imp = (800 + (h % 4200)) * live,
          eng = Math.round(imp * (0.018 + ((h >>> 5) % 50) / 1000)),
          clicks = Math.round(eng * (0.12 + ((h >>> 9) % 20) / 100)),
          r = (eng / imp) * 100;
        return {
          caption: p.caption,
          when:
            this.wsDate(p.at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
            ' · ' +
            live +
            ' account' +
            (live === 1 ? '' : 's'),
          dots: p.targets.map((t) => LG(accById[t.acc]?.platform)),
          imp: avail ? fmt(imp) : 'Unavailable',
          eng: avail ? fmt(eng) : 'Unavailable',
          clicks: avail ? fmt(clicks) : 'Unavailable',
          rate: avail ? r.toFixed(1) + '%' : '—',
          rateColor: r >= 4 ? '#15803d' : '#141619',
          divider: i ? '1px solid #e5e3dc' : '0',
        };
      });

    // bulk
    const bulkAccChips = s.accounts.map((a) => {
      const on = s.bulkAccs.includes(a.id);
      return {
        username: a.username,
        short: P[a.platform].short,
        logo: P[a.platform].logo,
        color: P[a.platform].color,
        border: on ? '#141619' : '#e5e3dc',
        bg: on ? '#141619' : '#fff',
        fg: on ? '#fff' : '#141619',
        toggle: () =>
          this.setState((st) => ({ bulkAccs: on ? st.bulkAccs.filter((x) => x !== a.id) : [...st.bulkAccs, a.id] })),
      };
    });
    const bulkPlats = [...new Set(s.bulkAccs.map((id) => accById[id]?.platform).filter(Boolean))];
    const bulkRows = s.bulkFiles.map((f, i) => {
      const warns = bulkPlats
        .filter((pl) => (P[pl].req === 'video' && f.kind !== 'VIDEO') || (P[pl].req === 'image' && f.kind !== 'IMG'))
        .map((pl) => P[pl].label);
      const over = bulkPlats.filter((pl) => f.caption.length > P[pl].max).map((pl) => P[pl].label);
      const warn = [
        warns.length ? `${warns.join(', ')} will skip this file (wrong media type)` : '',
        over.length ? `Too long for ${over.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join(' · ');
      return {
        name: f.name,
        kind: f.kind === 'VIDEO' ? '▶ VIDEO' : 'IMG',
        thumb: f.url ? `${f.tone} url(${f.url}) center/cover no-repeat` : f.tone,
        caption: f.caption,
        when: f.at ? Component.toLocal(f.at) : '',
        hasWarn: !!warn,
        warn,
        divider: i ? '1px solid #e5e3dc' : '0',
        onCaption: (e) => {
          const v = e.target.value;
          this.setState((st) => ({ bulkFiles: st.bulkFiles.map((x) => (x.id === f.id ? { ...x, caption: v } : x)) }));
        },
        onWhen: (e) => {
          const v = e.target.value;
          this.setState((st) => ({
            bulkFiles: st.bulkFiles.map((x) => (x.id === f.id ? { ...x, at: v ? Component.fromLocal(v) : null } : x)),
          }));
        },
        remove: () => this.setState((st) => ({ bulkFiles: st.bulkFiles.filter((x) => x.id !== f.id) })),
        up: () =>
          this.setState((st) => {
            const a = [...st.bulkFiles],
              k = a.findIndex((x) => x.id === f.id);
            if (k > 0) [a[k - 1], a[k]] = [a[k], a[k - 1]];
            return { bulkFiles: a };
          }),
        down: () =>
          this.setState((st) => {
            const a = [...st.bulkFiles],
              k = a.findIndex((x) => x.id === f.id);
            if (k < a.length - 1) [a[k + 1], a[k]] = [a[k], a[k + 1]];
            return { bulkFiles: a };
          }),
        vLabel: !f.at ? 'No time' : f.at <= NOW ? 'In the past' : warn ? 'Partial' : 'Ready',
        vBg: !f.at || f.at <= NOW ? '#fde8ea' : warn ? '#fff1d6' : '#e7f5ec',
        vFg: !f.at || f.at <= NOW ? '#dc3545' : warn ? '#8a5a00' : '#15803d',
      };
    });
    const bf = s.bulkFiles.length,
      bulkDisabled = !bf || !s.bulkAccs.length || s.bulkFiles.some((f) => !f.at || f.at <= NOW);
    const csvParsed = this.parseCsv(),
      csvOk = csvParsed.filter((r) => r.ok),
      csvErr = csvParsed.length - csvOk.length;
    const csvRows = csvParsed.map((r, i) => ({
      icon: r.ok ? (r.warn || r.note ? '!' : '✓') : '×',
      iconBg: r.ok ? (r.warn || r.note ? '#fff1d6' : '#d9ff35') : '#fde3e1',
      iconFg: r.ok ? (r.warn || r.note ? '#b47100' : '#141619') : '#dc3545',
      when: r.at
        ? `${this.wsDate(r.at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${this.time(r.at)}`
        : '—',
      accs: r.accs.map((a) => ({ short: P[a.platform].short, logo: P[a.platform].logo, color: P[a.platform].color })),
      caption: r.caption || '(empty)',
      hasIssue: !!r.issue,
      issue: r.issue,
      issueColor: r.ok ? '#b47100' : '#dc3545',
      bg: r.ok ? '#fff' : '#fffafa',
      divider: i ? '1px solid #e5e3dc' : '0',
    }));
    const selCount = s.selected.length,
      HOUR = 36e5;
    const shiftSel = (ms) => () => {
      const ids = s.selected,
        bad = s.posts.some((p) => ids.includes(p.id) && p.at + ms <= NOW);
      if (bad) return this.flash('That would move a post into the past', true);
      this.setState((st) => ({ posts: st.posts.map((p) => (ids.includes(p.id) ? { ...p, at: p.at + ms } : p)) }));
      this.flash(`Moved ${ids.length} post${ids.length === 1 ? '' : 's'}`);
    };
    const slotDayBtns = ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, i) => {
      const on = s.slotDays.includes(i);
      return {
        label,
        border: on ? '#141619' : '#e5e3dc',
        bg: on ? '#141619' : '#fff',
        color: on ? '#d9ff35' : '#677184',
        toggle: () =>
          this.setState((st) => ({ slotDays: on ? st.slotDays.filter((x) => x !== i) : [...st.slotDays, i] })),
      };
    });
    const slotChips = [...s.slots].sort().map((sl) => {
      const [h, m] = sl.split(':').map(Number);
      return {
        label: new Date(2026, 0, 1, h, m).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        remove: () => this.setState((st) => ({ slots: st.slots.filter((x) => x !== sl) })),
      };
    });
    const showAlert = failedPosts.length > 0 && !s.alertHidden && s.tab !== 'failed';
    const alertItems = failedPosts.slice(0, 3).map((p) => {
      const t = p.targets.find((x) => x.error) || {};
      const a = accById[t.acc];
      const er = t.error || 'Failed',
        k = /authori|token|revoked/i.test(er)
          ? 'Reconnect the account'
          : /character|limit|seconds|too long|video/i.test(er)
            ? 'Edit the post to fix'
            : 'Safe to retry';
      return {
        who: a ? `${P[a.platform].label} @${a.username}` : 'Post',
        when: p.at ? `${this.dayLabel(p.at)} ${this.time(p.at)}` : '',
        why: `${er}. ${k}.`,
      };
    });

    const members = this.memberRows(
      [
        { name: 'Maya Chen', email: 'maya@scheduleforyou.com', role: 'owner' },
        { name: 'Jordan Lee', email: 'jordan@scheduleforyou.com', role: 'editor' },
      ],
      s.invites,
    );

    return {
      userEmail: this.userEmail || 'maya@scheduleforyou.com',
      nav,
      accountCount: s.accounts.length,
      goCompose: () => this.newPost(),
      goQueue: go('queue'),
      isQueue: screen === 'queue',
      isCalendar: screen === 'calendar',
      isCompose: screen === 'compose',
      isAccounts: screen === 'accounts',
      isAnalytics: screen === 'analytics',
      isSettings: screen === 'settings',
      queueTabs,
      groups,
      queueEmpty: groups.length === 0,
      emptyTitle: s.tab === 'upcoming' ? 'Nothing scheduled' : `No ${s.tab} posts`,
      rowPad,
      nextUp,
      dows:
        typeof window !== 'undefined' && window.innerWidth <= 760
          ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      calDays,
      monthLabel: first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      prevMonth: () => this.setState({ cursor: cm === 0 ? [cy - 1, 11] : [cy, cm - 1] }),
      nextMonth: () => this.setState({ cursor: cm === 11 ? [cy + 1, 0] : [cy, cm + 1] }),
      thisMonth: () => this.setState({ cursor: this.wsMonth() }),
      composeTitle: d.id ? 'Edit post' : 'New post',
      accountChips,
      allLabel: n === s.accounts.length ? 'Clear' : 'Select all',
      toggleAll: () => this.upd({ targets: n === s.accounts.length ? [] : s.accounts.map((a) => a.id) }),
      caption: d.caption,
      onCaption: (e) => this.upd({ caption: e.target.value }),
      counters,
      hasMedia: d.media.length > 0,
      mediaTiles: d.media.map((kind, i) => ({
        kind,
        bg: 'linear-gradient(160deg,#9a7a58,#5d4a36)',
        label: kind,
        isVideo: false,
        video: '',
        labelBg: 'transparent',
        remove: () => this.upd({ media: d.media.filter((_, j) => j !== i) }),
      })),
      addImage: () => this.upd({ media: [...d.media, 'IMG'] }),
      addVideo: () => this.upd({ media: [...d.media, 'VIDEO'] }),
      ...(() => {
        const w = (typeof window !== 'undefined' && window.innerWidth) || 1400,
          wide = w >= 1320,
          mid = w >= 900 && !wide,
          mob = w < 900,
          tab = S0.cTab || 'edit';
        const ct = S0.capTab && sel.find((a) => a.id === S0.capTab) ? S0.capTab : null,
          cv = ct ? variants.find((v) => v.id === ct) : null;
        const advBits = [
          (d.labels || []).length ? (d.labels || []).join(', ') : '',
          d.note ? 'Reviewer note' : '',
          d.repeat && d.repeat !== 'none' ? 'Repeats ' + d.repeat : '',
          d.evergreen ? 'Evergreen' : '',
          d.approval ? 'Needs approval' : '',
        ].filter(Boolean);
        return {
          composeCols: wide
            ? 'minmax(210px,20%) minmax(0,1fr) minmax(300px,30%)'
            : mid
              ? 'minmax(0,1fr) minmax(290px,34%)'
              : 'minmax(0,1fr)',
          showAccCol: wide ? 'flex' : 'none',
          inlineAccounts: !wide && (!mob || tab === 'edit'),
          showEditCol: !mob || tab === 'edit' ? 'flex' : 'none',
          showRightCol: !mob || tab === 'preview' ? 'flex' : 'none',
          composeTabs: mob,
          cTabs: [
            ['edit', 'Edit'],
            ['preview', 'Preview & publish'],
          ].map(([k, label]) => ({
            label,
            bg: tab === k ? '#141619' : 'transparent',
            color: tab === k ? '#fff' : '#677184',
            pick: () => this.setState({ cTab: k }),
          })),
          accQ: S0.accQ || '',
          onAccQ: (e) => this.setState({ accQ: e.target.value }),
          capTabs: [
            {
              id: null,
              label: 'Main caption',
              title: 'Main caption',
              tag: '',
              logo: 'none',
              dotBg: 'transparent',
              pic: 'none',
              iconDisplay: 'none',
            },
            ...variants.map((v) => ({
              id: v.id,
              label: variants.filter((x) => x.platform === v.platform).length > 1 ? v.username : v.platform,
              title: `${v.platform} · ${v.username}`,
              tag: v.hasOverride ? '· custom' : '· main',
              logo: v.logo,
              dotBg: v.color,
              pic: v.pic,
              iconDisplay: 'block',
            })),
          ].map((t) => {
            const on = t.id === ct;
            return {
              ...t,
              line: on ? '#141619' : 'transparent',
              weight: on ? 600 : 500,
              color: on ? '#141619' : '#677184',
              tagColor: t.tag.includes('custom') ? '#15803d' : '#9aa0a8',
              pick: () => this.setState({ capTab: t.id }),
            };
          }),
          capValue: cv ? cv.text : d.caption,
          onCapValue: cv ? cv.onText : (e) => this.upd({ caption: e.target.value, savedAt: Date.now() }),
          capPlaceholder: cv
            ? `Custom caption for ${cv.platform}. Leave as is to use the main caption.`
            : "What's happening? Write once, then tailor it per platform with the tabs above.",
          capIsCustom: !!(cv && cv.hasOverride),
          capReset: cv ? cv.reset : () => {},
          capFields: cv ? cv.fields : [],
          savedLabel: d.caption ? (d.savedAt ? 'Draft saved' : 'Autosaves as you type') : '',
          toggleAdv: () => this.setState((st) => ({ advOpen: !st.advOpen })),
          advOpen: S0.advOpen ? 'true' : 'false',
          advDisplay: S0.advOpen ? 'flex' : 'none',
          advChevron: S0.advOpen ? 'Hide' : 'Show',
          advSummary: advBits.length
            ? advBits.join(' · ')
            : 'Labels, reviewer note, repeat, evergreen, approval, reminders',
        };
      })(),
      hasSelected: sel.length > 0,
      variants,
      modes,
      isSchedule: d.mode === 'schedule',
      when: d.when,
      onWhen: (e) => this.upd({ when: e.target.value }),
      quickTimes,
      hasProblems: uniq.length > 0,
      problems: uniq,
      submit: () => this.submit(),
      submitDisabled,
      submitOpacity: submitDisabled ? 0.45 : 1,
      submitLabel,
      showPreview: this.props.showPreview ?? true,
      pv,
      previewTabs,
      pvClassic: true,
      pvCustom: false,
      pvNode: null,
      showFormat: metaSel.length > 0 || d.media.includes('VIDEO'),
      formatChips,
      formatHint: fmtNow ? FMT_HINT[fmtNow] : 'Different per account. Set it in each account’s tab.',
      formatFor: !sel.length || metaSel.length < sel.length ? 'Applies to Instagram and Facebook' : '',
      connected,
      platformCards,
      acQ: S0.acQ || '',
      onAcQ: (e) => this.setState({ acQ: e.target.value }),
      acPlat: S0.acPlat || '',
      onAcPlat: (e) => this.setState({ acPlat: e.target.value }),
      acSt: S0.acSt || '',
      onAcSt: (e) => this.setState({ acSt: e.target.value }),
      stats: [
        {
          label: `Published · last ${aDays} days`,
          value: aPub,
          color: '#141619',
          delta: `${aPub - pPub >= 0 ? '+' : ''}${aPub - pPub} vs previous ${aDays} days`,
        },
        {
          label: 'Failed attempts',
          value: aFail,
          color: aFail ? '#dc3545' : '#141619',
          delta: `${pFail} in previous period`,
        },
        {
          label: 'Success rate',
          value: `${rate}%`,
          color: '#141619',
          delta: pRate === null ? 'No previous data' : `${rate - pRate >= 0 ? '+' : ''}${rate - pRate} pts vs previous`,
        },
        {
          label: 'Scheduled (not counted)',
          value: upcoming.length,
          color: '#141619',
          delta: 'Future posts are never counted as failures',
        },
      ],
      aRange: String(aDays),
      onARange: (e) => this.setState({ aRange: +e.target.value }),
      aPlat: aPl,
      onAPlat: (e) => this.setState({ aPlat: e.target.value }),
      bars,
      byPlatform,
      keys: s.keys.map((k) => ({
        ...k,
        revoke: () => {
          this.setState((st) => ({ keys: st.keys.filter((x) => x.id !== k.id) }));
          this.flash('Key revoked');
        },
      })),
      hasNewKey: !!s.newKey,
      newKey: s.newKey,
      keyName: s.keyName,
      onKeyName: (e) => this.setState({ keyName: e.target.value }),
      makeKey: () => {
        const r = 'sfy_' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 14);
        this.setState((st) => ({
          newKey: r,
          keyName: '',
          keys: [
            {
              id: 'k' + Date.now(),
              name: st.keyName || 'Default',
              prefix: r.slice(0, 8),
              meta: 'Created just now · never used',
            },
            ...st.keys,
          ],
        }));
      },
      mcpText:
        '{\n  "mcpServers": {\n    "scheduleforyou": {\n      "type": "http",\n      "url": "https://scheduleforyou.com/api/mcp",\n      "headers": { "Authorization": "Bearer sfy_..." }\n    }\n  }\n}',
      members,
      invite: s.invite,
      onInvite: (e) => this.setState({ invite: e.target.value }),
      inviteRole: S0.inviteRole || 'member',
      onInviteRole: (e) => this.setState({ inviteRole: e.target.value }),
      inviteRoleHint:
        (S0.inviteRole || 'member') === 'editor'
          ? 'Editors can also connect and disconnect accounts and change automations.'
          : 'Members create, schedule and publish posts.',
      sendInvite: () => {
        if (!s.invite) return;
        this.setState((st) => ({
          invites: [...st.invites, { email: st.invite, role: st.inviteRole || 'member' }],
          inviteUrl: `https://app.scheduleforyou.com/invite/${Math.random().toString(36).slice(2, 12)}`,
          invite: '',
        }));
      },
      hasInviteUrl: !!s.inviteUrl,
      inviteUrl: s.inviteUrl,
      canSelect: s.tab === 'upcoming',
      selectLabel: s.selecting ? 'Cancel' : 'Select',
      selectBorder: s.selecting ? '#141619' : '#e5e3dc',
      selectBg: s.selecting ? '#141619' : '#fff',
      selectColor: s.selecting ? '#fff' : '#141619',
      toggleSelect: () => this.setState((st) => ({ selecting: !st.selecting, selected: [] })),
      rowCols: s.selecting ? '22px 76px minmax(0,1fr) auto' : '76px minmax(0,1fr) auto',
      hasSelection: s.selecting && selCount > 0,
      selCount,
      moveDate: s.moveDate,
      shiftBtns: [
        ['−1h', -HOUR],
        ['+1h', HOUR],
        ['+1 day', 24 * HOUR],
        ['+1 week', 168 * HOUR],
      ].map(([label, ms]) => ({ label, go: shiftSel(ms) })),
      onMoveDate: (e) => {
        const v = e.target.value;
        if (!v) return;
        const [y, mo, da] = v.split('-').map(Number),
          ids = s.selected;
        const next = s.posts.map((p) => {
          if (!ids.includes(p.id)) return p;
          const o = this.wsDate(p.at);
          return { ...p, at: this.wsTime(y, mo - 1, da, o.getHours(), o.getMinutes()) };
        });
        if (next.some((p) => ids.includes(p.id) && p.at <= NOW))
          return this.flash('That date has already passed', true);
        this.setState({ posts: next, moveDate: '' });
        this.flash(
          `Moved ${ids.length} post${ids.length === 1 ? '' : 's'} to ${new Date(y, mo - 1, da).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`,
        );
      },
      labelNames: S0.labelList,
      bulkLabel: (e) => {
        const v = e.target.value,
          ids = s.selected;
        if (!v) return;
        this.setState((st) => ({
          posts: st.posts.map((p) =>
            ids.includes(p.id) ? { ...p, labels: [...new Set([...(p.labels || []), v])] } : p,
          ),
        }));
        this.flash(`Labelled ${ids.length} posts “${v}”`);
      },
      bulkDuplicate: () => {
        this.duplicate(s.selected);
        this.setState({ selected: [] });
      },
      bulkDelete: () => {
        const ids = s.selected;
        return this.setState({
          confirm: {
            title: `Delete ${ids.length} post${ids.length === 1 ? '' : 's'}?`,
            body: 'They will be removed from the queue and won\u2019t publish.',
            cta: 'Delete posts',
            go: () => {
              const snap = S0.posts.filter((p) => ids.includes(p.id));
              this.setState((st) => ({ posts: st.posts.filter((p) => !ids.includes(p.id)), selected: [] }));
              this.flash(`Deleted ${ids.length} posts`, false, () =>
                this.setState((st) => ({ posts: [...st.posts, ...snap] })),
              );
            },
          },
        });
        const _ids = ids;
        this.setState((st) => ({ posts: st.posts.filter((p) => !ids.includes(p.id)), selected: [] }));
        this.flash(`Deleted ${ids.length} post${ids.length === 1 ? '' : 's'}`);
      },
      showAlert,
      alertItems,
      ...(() => {
        const r = failedPosts.filter((p) => {
          const e = (p.targets.find((t) => t.error) || {}).error || '';
          return !/authori|token|revoked|reconnect|permission|character|limit|seconds|too long|too short|format|size|aspect|required/i.test(
            e,
          );
        }).length;
        return { hasRetryable: r > 0, retryLabel: `Retry ${r}` };
      })(),
      alertTitle: `${failedPosts.length} post${failedPosts.length === 1 ? '' : 's'} failed to publish`,
      retryAll: () => {
        const ids = failedPosts
          .filter((p) => {
            const e = (p.targets.find((t) => t.error) || {}).error || '';
            return !/authori|token|revoked|reconnect|permission|character|limit|seconds|too long|too short|format|size|aspect|required/i.test(
              e,
            );
          })
          .map((p) => p.id);
        if (!ids.length)
          return this.flash(
            'None of these can be retried as-is. Fix the content or reconnect the account first.',
            true,
          );
        this.setState((st) => ({
          posts: st.posts.map((p) =>
            ids.includes(p.id)
              ? { ...p, status: 'published', targets: p.targets.map((t) => ({ ...t, status: 'published', error: '' })) }
              : p,
          ),
        }));
        this.flash(`Retried ${ids.length} post${ids.length === 1 ? '' : 's'}`);
      },
      viewFailed: () => this.setState({ tab: 'failed' }),
      dismissAlert: () => this.setState({ alertHidden: true }),
      calViews: [
        ['month', 'Month'],
        ['week', 'Week'],
        ['list', 'List'],
      ].map(([k, label]) => ({
        label,
        select: () => this.setState({ calView: k }),
        bg: s.calView === k ? '#141619' : 'transparent',
        color: s.calView === k ? '#fff' : '#677184',
      })),
      isList: s.calView === 'list',
      ...(() => {
        const inM = s.posts
          .filter(calMatch)
          .filter((p) => p.at && this.wsDate(p.at).getMonth() === cm && this.wsDate(p.at).getFullYear() === cy)
          .sort((a, b) => a.at - b.at);
        const g = [];
        for (const p of inM) {
          const k = this.dayKey(p.at);
          let x = g[g.length - 1];
          if (!x || x.k !== k) {
            x = {
              k,
              label: this.wsDate(p.at).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
              items: [],
            };
            g.push(x);
          }
          x.items.push(evOf(p, x.items.length));
        }
        return { listDays: g, listEmpty: g.length === 0 };
      })(),
      calPlat: S0.calPlat || '',
      calAcc: S0.calAcc || '',
      calStatus: S0.calStatus || '',
      onCalPlat: (e) => this.setState({ calPlat: e.target.value || null }),
      onCalAcc: (e) => this.setState({ calAcc: e.target.value || null }),
      onCalStatus: (e) => this.setState({ calStatus: e.target.value || null }),
      calPlatOpts: [
        { v: '', l: 'All platforms' },
        ...[...new Set(s.accounts.map((a) => a.platform))].map((pl) => ({ v: pl, l: P[pl].label })),
      ],
      calAccOpts: [
        { v: '', l: 'All accounts' },
        ...s.accounts.map((a) => ({ v: a.id, l: '@' + a.username + ' · ' + P[a.platform].label })),
      ],
      calStatusOpts: [
        ['', 'All statuses'],
        ['scheduled', 'Scheduled'],
        ['published', 'Published'],
        ['draft', 'Draft'],
        ['failed', 'Failed'],
        ['approval', 'Needs approval'],
      ].map(([v, l]) => ({ v, l })),
      tzShort: Component.tzLabel(S0.tz),
      isMonth: s.calView === 'month',
      isWeek: s.calView === 'week',
      weekDays,
      calLabel:
        s.calView === 'week'
          ? weekLabel
          : s.calView === 'list'
            ? first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      calPrev: () =>
        s.calView === 'week'
          ? this.setState({ weekStart: s.weekStart - 7 * 864e5 })
          : this.setState({ cursor: cm === 0 ? [cy - 1, 11] : [cy, cm - 1] }),
      calNext: () =>
        s.calView === 'week'
          ? this.setState({ weekStart: s.weekStart + 7 * 864e5 })
          : this.setState({ cursor: cm === 11 ? [cy + 1, 0] : [cy, cm + 1] }),
      calToday: () => this.setState({ cursor: this.wsMonth(), weekStart: this.wsMonday() }),
      isQueueMode: d.mode === 'queue',
      nextSlotLabel: this.slotLabel(nextSlot),
      goSettings: go('settings'),
      isBulk: screen === 'bulk',
      isBulkUpload: s.bulkTab === 'upload',
      isBulkCsv: s.bulkTab === 'csv',
      bulkTabs: [
        ['upload', 'Upload media'],
        ['csv', 'Import CSV'],
      ].map(([k, label]) => ({
        label,
        select: () => this.setState({ bulkTab: k }),
        bg: s.bulkTab === k ? '#141619' : 'transparent',
        color: s.bulkTab === k ? '#fff' : '#677184',
      })),
      ...(() => {
        const step = s.bulkFiles.length ? S0.bulkStep || 1 : 1,
          setStep = (n) => () => this.setState({ bulkStep: n });
        const accs = S0.bulkAccs.map((id) => accById[id]).filter(Boolean);
        const val = (f) => {
          const bad = accs.filter((a) => {
            const r = P[a.platform].req;
            return (
              (r === 'video' && f.kind !== 'VIDEO') ||
              (r === 'image' && f.kind !== 'IMG') ||
              f.caption.length > P[a.platform].max ||
              a.health === 'error'
            );
          });
          const conflict =
            f.at &&
            s.posts.some(
              (p) =>
                p.status === 'scheduled' &&
                Math.abs(p.at - f.at) < 18e5 &&
                p.targets.some((t) => S0.bulkAccs.includes(t.acc)),
            );
          const past = !!f.at && f.at <= NOW;
          return {
            ok: !!f.at && !past && bad.length < accs.length,
            skip: bad.map((a) => P[a.platform].label),
            conflict,
            noTime: !f.at,
            past,
          };
        };
        const vs = s.bulkFiles.map(val),
          valid = vs.filter((v) => v.ok).length,
          invalid = vs.length - valid,
          jobs = s.bulkFiles.reduce((n, f, i) => n + (vs[i].ok ? accs.length - vs[i].skip.length : 0), 0);
        const times = s.bulkFiles
          .map((f) => f.at)
          .filter(Boolean)
          .sort((a, b) => a - b);
        const today = this.wsDate(NOW);
        const dist = Array.from({ length: 7 }, (_, i) => {
          const dd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i),
            d0 = this.wsTime(dd.getFullYear(), dd.getMonth(), dd.getDate()),
            d1 = this.wsTime(dd.getFullYear(), dd.getMonth(), dd.getDate() + 1);
          const n = times.filter((t) => t >= d0 && t < d1).length;
          return {
            n: n || '',
            day: dd.toLocaleDateString('en-US', { weekday: 'narrow' }),
            title: `${dd.toDateString()}: ${n}`,
            h: 0,
            raw: n,
          };
        });
        const mx = Math.max(1, ...dist.map((d) => d.raw));
        dist.forEach((d) => {
          d.h = (d.raw / mx) * 100;
          d.bg = d.raw ? '#141619' : '#e7e5df';
        });
        const conflicts = vs.filter((v) => v.conflict).length;
        return {
          bulkStep1: step === 1,
          bulkTabsDisplay: step === 1 ? 'inline-flex' : 'none',
          bulkStep2: step === 2,
          bulkStep3: step === 3,
          toStep1: setStep(1),
          toStep2: setStep(2),
          toStep3: setStep(3),
          bulkSteps: [
            ['Upload', 1],
            ['Customize', 2],
            ['Review & schedule', 3],
          ].map(([label, n]) => ({
            label,
            n: n < step ? '✓' : n,
            current: n === step ? 'step' : 'false',
            disabled: n > 1 && !s.bulkFiles.length,
            go: setStep(n),
            border: n === step ? '#141619' : '#e7e5df',
            bg: n === step ? '#fff' : 'transparent',
            color: n <= step ? '#141619' : '#9aa0a8',
            numBg: n < step ? '#d9ff35' : n === step ? '#141619' : '#eef0ec',
            numFg: n === step ? '#fff' : '#141619',
          })),
          bulkAllCap: S0.bulkAllCap || '',
          onBulkAllCap: (e) => this.setState({ bulkAllCap: e.target.value }),
          applyAllCap: () => {
            const v = (S0.bulkAllCap || '').trim();
            if (!v) return;
            this.setState((st) => ({ bulkFiles: st.bulkFiles.map((f) => ({ ...f, caption: v })) }));
            this.flash(`Applied to ${s.bulkFiles.length} rows`);
          },
          bulkSummary: [
            { label: 'Posts', value: s.bulkFiles.length },
            { label: 'Publishing jobs (post × account)', value: jobs },
            {
              label: 'Date range',
              value: times.length
                ? `${this.wsDate(times[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${this.wsDate(times[times.length - 1]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                : '—',
            },
            {
              label: 'Invalid posts',
              value: invalid,
              color: invalid ? '#dc3545' : '#141619',
              border: invalid ? '#f5c2c7' : '#e7e5df',
            },
            {
              label: 'Conflicts',
              value: conflicts,
              color: conflicts ? '#b47100' : '#141619',
              border: conflicts ? '#f3dfb2' : '#e7e5df',
            },
          ].map((b) => ({ color: '#141619', border: '#e7e5df', ...b })),
          bulkDist: dist,
          bulkIssues: s.bulkFiles
            .map((f, i) =>
              vs[i].noTime
                ? { text: `${f.name}: no time set. Use “Re-space into slots” or pick a time.`, color: '#dc3545' }
                : vs[i].past
                  ? {
                      text: `${f.name}: that time is in the past. Pick a future time or use “Re-space into slots”.`,
                      color: '#dc3545',
                    }
                  : vs[i].skip.length
                    ? {
                        text: `${f.name}: will skip ${vs[i].skip.join(', ')} (media type, length or connection).`,
                        color: '#b47100',
                      }
                    : vs[i].conflict
                      ? { text: `${f.name}: within 30 min of another post on the same account.`, color: '#b47100' }
                      : null,
            )
            .filter(Boolean),
          bulkHasInvalid: invalid > 0 || vs.some((v) => v.skip.length),
          bulkNoValid: valid === 0,
          bulkValidOp: valid ? 1 : 0.45,
          bulkValidLabel: `Schedule ${valid} valid post${valid === 1 ? '' : 's'}`,
          bulkReport: () => {
            const rows = [['file', 'caption', 'issue']].concat(
              s.bulkFiles
                .map((f, i) => [
                  f.name,
                  f.caption,
                  vs[i].noTime
                    ? 'No time'
                    : vs[i].past
                      ? 'Time in the past'
                      : vs[i].skip.length
                        ? 'Skips ' + vs[i].skip.join('; ')
                        : vs[i].conflict
                          ? 'Conflict'
                          : '',
                ])
                .filter((r) => r[2]),
            );
            const b = new Blob(
              [rows.map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n')],
              { type: 'text/csv' },
            );
            const a = document.createElement('a');
            a.href = URL.createObjectURL(b);
            a.download = 'bulk-schedule-issues.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
          },
          bulkScheduleValid: () => {
            const batch = S0.bulkBatch || 'b' + Date.now(),
              existing = new Set(S0.posts.filter((p) => p.batch === batch).map((p) => p.fileId));
            const add = s.bulkFiles
              .map((f, i) => ({ f, v: vs[i] }))
              .filter(({ f, v }) => v.ok && !existing.has(f.id))
              .map(({ f, v }, i) => ({
                id: 'p' + Date.now() + i,
                batch,
                fileId: f.id,
                ws: WS,
                labels: [],
                status: 'scheduled',
                at: f.at,
                caption: f.caption,
                media: [f.kind],
                ov: {},
                targets: accs
                  .filter((a) => !v.skip.includes(P[a.platform].label))
                  .map((a) => ({ acc: a.id, status: 'scheduled', error: '' })),
              }));
            const left = s.bulkFiles.filter((f, i) => !vs[i].ok);
            this.setState((st) => ({
              posts: [...st.posts, ...add],
              bulkFiles: left,
              bulkBatch: left.length ? batch : null,
              bulkStep: left.length ? 2 : 1,
              screen: left.length ? 'bulk' : 'queue',
              tab: 'upcoming',
            }));
            this.flash(
              left.length
                ? `Scheduled ${add.length}. ${left.length} still need fixing.`
                : `Scheduled ${add.length} posts`,
            );
          },
        };
      })(),
      bulkAccChips,
      bulkRows,
      hasBulkFiles: bf > 0,
      bulkCountLabel: `${bf} file${bf === 1 ? '' : 's'} → ${bf} post${bf === 1 ? '' : 's'}`,
      dropBorder: s.bulkHover ? '#141619' : '#d9d6cd',
      dropBg: s.bulkHover ? '#f7ffd6' : '#faf9f6',
      bulkOver: (e) => {
        e.preventDefault();
        if (!s.bulkHover) this.setState({ bulkHover: true });
      },
      bulkDrop: (e) => {
        e.preventDefault();
        const fl = [...(e.dataTransfer.files || [])].filter((f) => /^(image|video)\//.test(f.type));
        this.setState({ bulkHover: false });
        if (fl.length)
          this.addFiles(
            fl.map((f) => ({
              name: f.name,
              kind: f.type.startsWith('video') ? 'VIDEO' : 'IMG',
              url: f.type.startsWith('image') ? URL.createObjectURL(f) : '',
            })),
          );
      },
      onFiles: (e) => {
        const fl = [...(e.target.files || [])];
        if (fl.length)
          this.addFiles(
            fl.map((f) => ({
              name: f.name,
              kind: f.type.startsWith('video') ? 'VIDEO' : 'IMG',
              url: f.type.startsWith('image') ? URL.createObjectURL(f) : '',
            })),
          );
        e.target.value = '';
      },
      addSamples: (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.addFiles(Component.SAMPLES.map(([name, kind, tone]) => ({ name, kind, tone })));
      },
      respace: () => this.respace(true),
      clearBulk: () => this.setState({ bulkFiles: [] }),
      bulkSchedule: () => this.bulkCreate(false),
      bulkDrafts: () => this.bulkCreate(true),
      bulkDisabled,
      bulkOpacity: bulkDisabled ? 0.45 : 1,
      bulkSubmitLabel: `Schedule ${bf} post${bf === 1 ? '' : 's'}`,
      csv: s.csv,
      onCsv: (e) => this.setState({ csv: e.target.value }),
      csvRows,
      csvSummary: `${csvOk.length} ready${csvErr ? ` · ${csvErr} need fixing` : ''}`,
      csvDisabled: csvOk.length === 0,
      csvOpacity: csvOk.length ? 1 : 0.45,
      csvSubmitLabel: `Import ${csvOk.length} post${csvOk.length === 1 ? '' : 's'}`,
      importCsv: () => {
        const add = csvOk.map((r, i) => ({
          id: 'p' + Date.now() + i,
          ws: s.ws || 'maya',
          labels: [],
          status: r.warn ? 'draft' : 'scheduled',
          at: r.warn ? null : r.at,
          caption: r.caption,
          media: [],
          ov: {},
          targets: r.accs.map((a) => ({ acc: a.id, status: r.warn ? 'draft' : 'scheduled', error: '' })),
        }));
        this.setState((st) => ({ posts: [...st.posts, ...add], screen: 'queue', tab: 'upcoming' }));
        this.flash(`Imported ${add.length} posts${csvErr ? `, skipped ${csvErr}` : ''}`);
      },
      postStats,
      slotDayBtns,
      slotChips,
      newSlot: s.newSlot,
      onNewSlot: (e) => this.setState({ newSlot: e.target.value }),
      addSlot: () => {
        if (!s.newSlot || s.slots.includes(s.newSlot)) return;
        this.setState((st) => ({ slots: [...st.slots, st.newSlot] }));
        this.flash('Slot added');
      },
      nextSlotsLabel:
        this.nextSlots(3)
          .map((ms) => this.slotLabel(ms))
          .join('  ·  ') || 'No slots set',
      ...(() => {
        const nowMs = Date.now(),
          nx = upcoming.find((p) => p.at > nowMs);
        const z = (n) => String(n).padStart(2, '0');
        let countdown = '—';
        if (nx) {
          const sec = Math.floor((nx.at - nowMs) / 1000),
            d = Math.floor(sec / 86400),
            h = Math.floor((sec % 86400) / 3600),
            m = Math.floor((sec % 3600) / 60),
            ss = sec % 60;
          countdown = d ? `${d}d ${h}h ${z(m)}m` : h ? `${h}h ${z(m)}m ${z(ss)}s` : `${m}m ${z(ss)}s`;
        }
        const day0 = this.wsAt(0, 0);
        const H0 = 6,
          H1 = 24;
        const pos = (ms) => Math.min(100, Math.max(0, (((ms - day0) / 36e5 - H0) / (H1 - H0)) * 100));
        const todayKey = this.dayKey(NOW),
          today = s.posts.filter((p) => p.at && this.dayKey(p.at) === todayKey).sort((a, b) => a.at - b.at);
        const todayMarks = today.map((p, i) => ({
          left: pos(p.at),
          top: 22 + (i % 2) * 0,
          op: p.at < nowMs && p.status === 'scheduled' ? 0.5 : 1,
          bg: p.status === 'published' ? '#2a3214' : '#22252a',
          border:
            p.status === 'published'
              ? '#4d5c12'
              : p.status === 'failed' || p.status === 'partial'
                ? '#dc3545'
                : '#3a3e45',
          title: `${this.time(p.at)} · ${p.caption}`,
          icons: p.targets.slice(0, 4).map((t) => {
            const a = accById[t.acc];
            return { color: a ? P[a.platform].color : '#888', logo: a ? P[a.platform].logo : 'none' };
          }),
        }));
        const pubToday = today.filter((p) => p.status === 'published').length,
          schToday = today.filter((p) => p.status === 'scheduled').length;
        return {
          hasNext: !!nx && s.tab === 'upcoming',
          countdown,
          nextWhen: nx ? this.slotLabel(nx.at) : '',
          nextCaption: nx ? nx.caption : '',
          nextAccs: nx
            ? nx.targets.map((t) => {
                const a = accById[t.acc];
                return a
                  ? {
                      color: P[a.platform].color,
                      logo: P[a.platform].logo,
                      title: `${P[a.platform].label} @${a.username}`,
                    }
                  : { color: '#888', logo: 'none', title: '' };
              })
            : [],
          nextMeta: nx
            ? `${nx.targets.length} account${nx.targets.length === 1 ? '' : 's'}${nx.media.length ? ' · ' + (nx.media.includes('VIDEO') ? 'video' : nx.media.length + ' image' + (nx.media.length > 1 ? 's' : '')) : ''}`
            : '',
          nextEdit: () => nx && this.editPost(nx),
          nextNow: () => nx && this.publishNow(nx),
          ticks: [6, 9, 12, 15, 18, 21, 24].map((h) => ({
            left: ((h - H0) / (H1 - H0)) * 100,
            label: h === 24 ? '12a' : h === 12 ? '12p' : h > 12 ? `${h - 12}p` : `${h}a`,
          })),
          nowLeft: pos(nowMs).toFixed(2),
          todayMarks,
          todaySummary: `${pubToday} sent · ${schToday} to go`,
          planPct: Math.min(100, (s.accounts.length / (s.accountLimit || 15)) * 100),
          accountLimitLabel: s.accountLimit || 15,
        };
      })(),
      ...(() => {
        const tog = (on) => ({ Track: on ? '#141619' : '#d8d5cc', Knob: on ? 16 : 2 });
        const T = (name, on, fn) => ({
          [name + 'Toggle']: fn,
          [name + 'Track']: tog(on).Track,
          [name + 'Knob']: tog(on).Knob,
        });
        const wsMeta = Component.WS.find((w) => w[0] === WS) || Component.WS[0];
        const used = [...new Set(s.posts.flatMap((p) => p.labels || []))];
        const lib = S0.library,
          q = (S0.libQ || '').toLowerCase();
        const inFolder = (S0.folder === 'All' ? lib : lib.filter((m) => m.folder === S0.folder))
          .filter((m) => (!q || m.name.toLowerCase().includes(q)) && (!S0.libType || m.kind === S0.libType))
          .sort((x, y) =>
            S0.libSort === 'name' ? x.name.localeCompare(y.name) : S0.libSort === 'used' ? y.used - x.used : 0,
          );
        const libSel = S0.libSel || [];
        const thumb = (m) => (m.url ? `${m.tone} url(${m.url}) center/cover no-repeat` : m.tone);
        const addLib = (m) => this.upd({ media: [...d.media, m.kind] });
        const tzRow = Component.TZ.find((t) => t[0] === S0.tz) || Component.TZ[0];
        const leadOpts = [
          [15, '15 minutes'],
          [30, '30 minutes'],
          [60, '1 hour'],
          [180, '3 hours'],
          [1440, '1 day'],
        ];
        const z2 = (n) => String(n).padStart(2, '0');
        return {
          workspaces: Component.WS.map(([id, name, sub, tone]) => ({
            name,
            sub,
            tone,
            mark: id === WS ? '✓' : '',
            bg: id === WS ? '#22252a' : 'transparent',
            pick: () => {
              this.setState({
                ws: id,
                wsOpen: false,
                labelFilter: null,
                selected: [],
                selecting: false,
                draft: Component.blank(),
              });
              this.flash(`Switched to ${name}`);
            },
          })),
          wsOpen: S0.wsOpen,
          toggleWs: () => this.setState((st) => ({ wsOpen: !st.wsOpen })),
          wsName: wsMeta[1],
          wsSub: wsMeta[2],
          wsTone: wsMeta[3],
          paused: !!S0.paused,
          togglePause: () => {
            this.setState((st) => ({ paused: !st.paused }));
            this.flash(S0.paused ? 'Queue resumed' : 'Queue paused');
          },
          pauseLabel: S0.paused ? 'Resume queue' : 'Pause queue',
          pauseBg: S0.paused ? '#141619' : '#fff',
          pauseColor: S0.paused ? '#fff' : '#141619',
          pauseBorder: S0.paused ? '#141619' : '#e7e5df',
          heroLabel: S0.paused ? 'Queue paused. Next post would go out in' : 'Next post goes out in',
          exportCsv: () => {
            const esc = (v) => (/[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v);
            // Accounts as platform:@username, which the CSV import reads back to the same accounts.
            const rows = [['date', 'time', 'timezone', 'accounts', 'caption', 'labels', 'approval']].concat(
              upcoming.map((p) => {
                const dt = this.wsDate(p.at);
                return [
                  `${dt.getFullYear()}-${z2(dt.getMonth() + 1)}-${z2(dt.getDate())}`,
                  `${z2(dt.getHours())}:${z2(dt.getMinutes())}`,
                  S0.tz,
                  p.targets
                    .map((t) => accById[t.acc])
                    .filter(Boolean)
                    .map((a) => `${a.platform}:@${a.username}`)
                    .join(';'),
                  p.caption,
                  (p.labels || []).join(';'),
                  p.approval || '',
                ];
              }),
            );
            const blob = new Blob([rows.map((r) => r.map((c) => esc(String(c))).join(',')).join('\n')], {
              type: 'text/csv',
            });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `scheduled-posts-${WS}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            this.flash(`Exported ${upcoming.length} scheduled posts`);
          },
          hasLabels: used.length > 0,
          labelFilters: [{ label: 'All', key: null }, ...used.map((l) => ({ label: l, key: l }))].map((l) => {
            const on = S0.labelFilter === l.key;
            return {
              label: l.label,
              count: l.key ? s.posts.filter((p) => (p.labels || []).includes(l.key)).length : '',
              border: on ? '#141619' : '#e7e5df',
              bg: on ? '#141619' : '#fff',
              color: on ? '#fff' : '#141619',
              pick: () => this.setState({ labelFilter: l.key }),
            };
          }),
          noteOpen: !!S0.noteKey,
          noteDay: S0.noteKey
            ? new Date(S0.noteKey).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
            : '',
          noteText: S0.noteText,
          onNoteText: (e) => this.setState({ noteText: e.target.value }),
          saveNote: () => {
            const k = S0.noteKey,
              v = S0.noteText.trim();
            this.setState((st) => {
              const n = { ...st.notes };
              if (v) n[k] = v;
              else delete n[k];
              return { notes: n, noteKey: null, noteText: '' };
            });
            this.flash(v ? 'Note saved' : 'Note removed');
          },
          deleteNote: () => {
            const k = S0.noteKey;
            this.setState((st) => {
              const n = { ...st.notes };
              delete n[k];
              return { notes: n, noteKey: null, noteText: '' };
            });
            this.flash('Note removed');
          },
          closeNote: () => this.setState({ noteKey: null, noteText: '' }),
          templates: S0.templates.map((t) => ({
            ...t,
            use: () => this.upd({ caption: d.caption ? d.caption + '\n\n' + t.text : t.text }),
          })),
          saveTemplate: () => {
            const c = d.caption.trim();
            if (!c) return this.flash('Write a caption first', true);
            if (c.length > 5000)
              return this.flash('Templates can be up to 5,000 characters. Shorten the caption first.', true);
            const name =
              c
                .split(/\s+/)
                .slice(0, 3)
                .join(' ')
                .replace(/[^\w\s’']/g, '')
                .slice(0, 60) || 'Template';
            this.setState((st) => ({ templates: [...st.templates, { name, text: c }] }));
            this.flash(`Saved template “${name}”`);
          },
          tagGroups: S0.tagGroups.map((g) => ({
            ...g,
            count: g.tags.split(/\s+/).length,
            add: () => this.upd({ caption: (d.caption ? d.caption.replace(/\s+$/, '') + '\n\n' : '') + g.tags }),
          })),
          saveTags: () => {
            const tags = [...new Set(d.caption.match(/#[\w]+/g) || [])];
            if (!tags.length) return this.flash('No hashtags in the caption yet', true);
            this.setState((st) => ({
              tagGroups: [
                ...st.tagGroups,
                {
                  name: tags[0].slice(1, 61),
                  tags: tags
                    .join(' ')
                    .slice(0, 2000)
                    .replace(/\s+\S*$/, (m) => (tags.join(' ').length > 2000 ? '' : m)),
                },
              ],
            }));
            this.flash(`Saved ${tags.length} hashtags as a group`);
          },
          pickerOpen: S0.pickerOpen,
          togglePicker: () => this.setState((st) => ({ pickerOpen: !st.pickerOpen })),
          folderTabs: ['All', ...S0.folders].map((f) => {
            const on = S0.folder === f;
            return {
              name: f,
              count: f === 'All' ? lib.length : lib.filter((m) => m.folder === f).length,
              border: on ? '#141619' : '#e7e5df',
              bg: on ? '#141619' : '#fff',
              color: on ? '#fff' : '#141619',
              navBg: on ? '#f1efe9' : 'transparent',
              folderColor: on ? '#141619' : '#d8d5cc',
              pick: () => this.setState({ folder: f }),
            };
          }),
          libItems: inFolder.map((m) => ({
            name: m.name,
            thumb: thumb(m),
            badge: m.kind === 'VIDEO' ? '▶' : '',
            use: () => {
              addLib(m);
              this.flash(`Added ${m.name}`);
            },
          })),
          isLibrary: screen === 'library',
          folderName: S0.folder === 'All' ? S0.folders[0] || 'library' : S0.folder,
          folderNames: S0.folders,
          libSummary: `${lib.length} files in ${S0.folders.length} folders. Use any file in a post without uploading it again.`,
          libQ: S0.libQ || '',
          onLibQ: (e) => this.setState({ libQ: e.target.value }),
          libType: S0.libType || '',
          onLibType: (e) => this.setState({ libType: e.target.value }),
          libSort: S0.libSort || 'new',
          onLibSort: (e) => this.setState({ libSort: e.target.value }),
          libViews: [
            ['grid', 'Grid'],
            ['list', 'List'],
          ].map(([k, label]) => ({
            label,
            bg: (S0.libView || 'grid') === k ? '#141619' : 'transparent',
            color: (S0.libView || 'grid') === k ? '#fff' : '#677184',
            pick: () => this.setState({ libView: k }),
          })),
          libCols: S0.libView === 'list' ? 'minmax(0,1fr)' : 'repeat(auto-fill,minmax(150px,1fr))',
          libDir: S0.libView === 'list' ? 'row' : 'column',
          libRatio: S0.libView === 'list' ? '1 / 1' : '4 / 3',
          libThumbW: S0.libView === 'list' ? '72px' : 'auto',
          libThumbFlex: S0.libView === 'list' ? 'none' : '0 0 auto',
          libUsedThumb: S0.libView === 'list' ? 'none' : 'inline',
          libUsedText: S0.libView === 'list' ? 'block' : 'none',
          libSelCount: libSel.length,
          libEmpty: inFolder.length === 0,
          libClearSel: () => this.setState({ libSel: [] }),
          libBulkMove: (e) => {
            const v = e.target.value;
            if (!v) return;
            this.setState((st) => ({
              library: st.library.map((x) => (libSel.includes(x.id) ? { ...x, folder: v } : x)),
              libSel: [],
            }));
            this.flash(`Moved ${libSel.length} files to ${v}`);
          },
          hasPreviewMedia: !!S0.pvMediaId,
          closePreview: () => this.setState({ pvMediaId: null }),
          pvMedia: (() => {
            const m = lib.find((x) => x.id === S0.pvMediaId);
            return m
              ? {
                  name: m.name,
                  folder: m.folder,
                  thumb: thumb(m),
                  badge: m.kind === 'VIDEO' ? '▶ VIDEO' : 'IMAGE',
                  use: () =>
                    this.setState({
                      pvMediaId: null,
                      draft: { ...Component.blank(), media: [m.kind] },
                      screen: 'compose',
                    }),
                }
              : { name: '', folder: '', thumb: '#ddd', badge: '', use: () => {} };
          })(),
          libCards: inFolder.map((m) => ({
            toggleSel: (e) => {
              e.stopPropagation();
              this.setState((st) => {
                const cur = st.libSel || [];
                return { libSel: cur.includes(m.id) ? cur.filter((x) => x !== m.id) : [...cur, m.id] };
              });
            },
            selBg: libSel.includes(m.id) ? '#d9ff35' : 'rgba(255,255,255,.85)',
            selBorder: libSel.includes(m.id) ? '#141619' : 'rgba(255,255,255,.9)',
            selMark: libSel.includes(m.id) ? '✓' : '',
            cardBorder: libSel.includes(m.id) ? '#141619' : '#e7e5df',
            preview: () => this.setState({ pvMediaId: m.id }),
            name: m.name,
            thumb: thumb(m),
            isVideo: !!m.videoUrl,
            video: m.videoUrl ? `${m.videoUrl}#t=0.1` : '',
            badge:
              m.kind === 'VIDEO'
                ? S0.libView === 'list'
                  ? '▶'
                  : '▶ VIDEO'
                : S0.libView === 'list' || m.url
                  ? ''
                  : 'IMG',
            used: m.used ? `used ${m.used}×` : '',
            folder: m.folder,
            move: (e) => {
              const v = e.target.value;
              this.setState((st) => ({ library: st.library.map((x) => (x.id === m.id ? { ...x, folder: v } : x)) }));
              this.flash(`Moved to ${v}`);
            },
            use: () => {
              this.setState({ draft: { ...Component.blank(), media: [m.kind] }, screen: 'compose' });
            },
          })),
          newFolder: S0.newFolder,
          onNewFolder: (e) => this.setState({ newFolder: e.target.value }),
          addFolder: () => {
            const v = S0.newFolder.trim();
            if (!v || S0.folders.includes(v)) return;
            this.setState((st) => ({ folders: [...st.folders, v], newFolder: '', folder: v }));
          },
          onLibFiles: (e) => {
            const fl = [...(e.target.files || [])],
              folder = S0.folder === 'All' ? S0.folders[0] : S0.folder;
            if (!fl.length) return;
            this.setState((st) => ({
              library: [
                ...fl.map((f, i) => ({
                  id: 'm' + Date.now() + i,
                  name: f.name,
                  kind: f.type.startsWith('video') ? 'VIDEO' : 'IMG',
                  tone: '#7a6148',
                  folder,
                  used: 0,
                  url: f.type.startsWith('image') ? URL.createObjectURL(f) : '',
                })),
                ...st.library,
              ],
            }));
            this.flash(`Uploaded ${fl.length} file${fl.length === 1 ? '' : 's'} to ${folder}`);
            e.target.value = '';
          },
          draftLabels: [...new Set([...S0.labelList, ...(d.labels || [])])].map((l) => {
            const on = (d.labels || []).includes(l);
            return {
              name: l,
              border: on ? '#141619' : '#e7e5df',
              bg: on ? '#141619' : '#fff',
              color: on ? '#fff' : '#141619',
              toggle: () => this.upd({ labels: on ? d.labels.filter((x) => x !== l) : [...(d.labels || []), l] }),
            };
          }),
          newLabel: S0.newLabel,
          onNewLabel: (e) => this.setState({ newLabel: e.target.value }),
          addLabel: () => {
            const v = S0.newLabel.trim();
            if (!v) return;
            this.setState((st) => ({
              labelList: st.labelList.includes(v) ? st.labelList : [...st.labelList, v],
              newLabel: '',
              draft: { ...st.draft, labels: [...new Set([...(st.draft.labels || []), v])] },
            }));
          },
          repeatOpts: [
            ['none', 'Once'],
            ['weekly', 'Weekly'],
            ['monthly', 'Monthly'],
          ].map(([k, label]) => ({
            label,
            bg: (d.repeat || 'none') === k ? '#141619' : 'transparent',
            color: (d.repeat || 'none') === k ? '#fff' : '#677184',
            pick: () => this.upd({ repeat: k }),
          })),
          repeatNote:
            d.repeat === 'weekly'
              ? 'Goes out every week at the same day and time until you stop it.'
              : d.repeat === 'monthly'
                ? 'Goes out on the same date every month.'
                : 'Publishes one time.',
          ...T('ever', !!d.evergreen, () => this.upd({ evergreen: !d.evergreen })),
          ...T('appr', !!d.approval, () => this.upd({ approval: !d.approval })),
          ...T('rem', d.remind !== false && S0.remind.on, () =>
            S0.remind.on
              ? this.upd({ remind: d.remind === false })
              : this.flash('Turn on email reminders in Settings first', true),
          ),
          remindNote: S0.remind.on
            ? `Email ${this.userEmail || 'maya@scheduleforyou.com'} ${(leadOpts.find((o) => o[0] === S0.remind.lead) || leadOpts[2])[1]} before`
            : 'Reminders are off in Settings',
          ...T('remAll', S0.remind.on, () => this.setState((st) => ({ remind: { ...st.remind, on: !st.remind.on } }))),
          remindLead: String(S0.remind.lead),
          onRemindLead: (e) => this.setState((st) => ({ remind: { ...st.remind, lead: +e.target.value } })),
          leadOptions: leadOpts.map(([v, label]) => ({ value: String(v), label })),
          tzValue: S0.tz,
          onTz: (e) => {
            this.setState({ tz: e.target.value });
            this.flash('Timezone updated');
          },
          tzOptions: [
            ...Component.TZ.map((t) => t[0]),
            ...[Component.localTz(), S0.tz].filter((z) => z && !Component.TZ.some((t) => t[0] === z)),
          ]
            .filter((z, i, a) => a.indexOf(z) === i)
            .map((v) => {
              const o = Component.tzOff(v, Date.now()) / 60,
                hh = Math.trunc(Math.abs(o)),
                mm = Math.round((Math.abs(o) - hh) * 60);
              return {
                value: v,
                label: `${Component.tzLabel(v)} · UTC${o >= 0 ? '+' : '−'}${hh}${mm ? ':' + String(mm).padStart(2, '0') : ''}`,
              };
            }),
          tzNow: this.time(Date.now()),
        };
      })(),
      ...(() => {
        const tog = (on) => ({ Track: on ? '#141619' : '#d8d5cc', Knob: on ? 16 : 2 });
        const T = (name, on, fn) => ({
          [name + 'Toggle']: fn,
          [name + 'Track']: tog(on).Track,
          [name + 'Knob']: tog(on).Knob,
        });
        const nowMs = Date.now(),
          hr = new Date(nowMs + this.tzShift(nowMs)).getHours();
        const sick = s.accounts.filter((a) => a.health === 'error' || a.health === 'expiring' || a.health === 'over');
        const pending = s.posts.filter((p) => p.approval === 'pending' && p.status !== 'published');
        const pub7 = s.posts.filter(
          (p) => ['published', 'partial'].includes(p.status) && p.at > NOW - 7 * 864e5,
        ).length;
        const conflictIds = Object.keys(conflictMap),
          seen = new Set();
        const attention = [];
        for (const p of failedPosts) {
          const t = p.targets.find((x) => x.error) || {},
            a = accById[t.acc];
          attention.push({
            icon: '!',
            iconBg: '#fde8e6',
            iconFg: '#dc3545',
            title: `${a ? P[a.platform].label : 'Post'} post couldn't publish`,
            when: p.at ? this.dayLabel(p.at) : '',
            body: `${t.error || 'Failed'}. "${(p.caption || '').slice(0, 70)}${p.caption.length > 70 ? '…' : ''}"`,
            actions: (() => {
              const e = t.error || '';
              const kind = /authori|token|revoked/i.test(e)
                ? 'auth'
                : /character|limit|too long|seconds|video/i.test(e)
                  ? 'content'
                  : 'temp';
              if (kind === 'auth')
                return [
                  {
                    label: 'Reconnect account',
                    accId: a?.id || null,
                    go: () => this.setState({ screen: 'accounts' }),
                    bg: '#141619',
                    color: '#fff',
                    border: '#141619',
                  },
                ];
              if (kind === 'content')
                return [
                  {
                    label: /second|video/i.test(e) ? 'Fix video length' : 'Edit caption',
                    go: () => this.editPost(p),
                    bg: '#141619',
                    color: '#fff',
                    border: '#141619',
                  },
                ];
              return [
                {
                  label: 'Retry',
                  go: () => {
                    this.setPost(p.id, (x) => ({
                      ...x,
                      status: 'published',
                      targets: x.targets.map((y) => ({ ...y, status: 'published', error: '' })),
                    }));
                    this.flash('Retried');
                  },
                  bg: '#141619',
                  color: '#fff',
                  border: '#141619',
                },
                { label: 'Edit post', go: () => this.editPost(p), bg: '#fff', color: '#141619', border: '#e7e5df' },
              ];
            })(),
          });
        }
        for (const a of sick) {
          const h = HL(a);
          attention.push({
            accId: a.id,
            icon: a.health === 'error' ? '!' : '⏱',
            iconBg: a.health === 'error' ? '#fde8e6' : '#fff1d6',
            iconFg: a.health === 'error' ? '#dc3545' : '#8a5a00',
            title: `${P[a.platform].label} @${a.username}: ${h.hLabel.toLowerCase()}`,
            when: '',
            body:
              a.health === 'error'
                ? `${a.error}. Posts to this account are on hold until you reconnect.`
                : `${h.healthDetail}. Reconnect now so scheduled posts don't fail.`,
            actions: [
              {
                label: a.health === 'over' ? 'Upgrade' : 'Reconnect',
                accId: a.id,
                go: reconnect(a),
                bg: '#141619',
                color: '#fff',
                border: '#141619',
              },
            ],
          });
        }
        for (const id of conflictIds) {
          const c = conflictMap[id][0],
            key = [id, c.q.id].sort().join('|');
          if (seen.has(key)) continue;
          seen.add(key);
          const p = s.posts.find((x) => x.id === id);
          attention.push({
            icon: '⚠',
            iconBg: '#fff1d6',
            iconFg: '#8a5a00',
            title: c.kind === 'dup' ? 'Duplicate post scheduled' : 'Posts too close together',
            when: this.dayLabel(p.at),
            body: c.msg + '.',
            actions: [
              { label: 'Edit post', go: () => this.editPost(p), bg: '#fff', color: '#141619', border: '#e7e5df' },
              {
                label: c.kind === 'dup' ? 'Delete duplicate' : 'Move +1 hour',
                go: () => {
                  if (c.kind === 'dup') {
                    this.setState((st) => ({ posts: st.posts.filter((x) => x.id !== id) }));
                    this.flash('Duplicate deleted');
                  } else {
                    this.setPost(id, (x) => ({ ...x, at: x.at + 36e5 }));
                    this.flash('Moved 1 hour later');
                  }
                },
                bg: '#fff',
                color: '#141619',
                border: '#e7e5df',
              },
            ],
          });
        }
        if (pending.length)
          attention.push({
            icon: '✓',
            iconBg: '#eef0ff',
            iconFg: '#3b4bd8',
            title: `${pending.length} post${pending.length === 1 ? '' : 's'} waiting for approval`,
            when: '',
            body: pending
              .slice(0, 2)
              .map((p) => `"${p.caption.slice(0, 48)}${p.caption.length > 48 ? '…' : ''}"`)
              .join('  ·  '),
            actions: [
              {
                label: 'Review',
                go: () => this.setState({ screen: 'queue', tab: 'review' }),
                bg: '#141619',
                color: '#fff',
                border: '#141619',
              },
            ],
          });
        const rank = (x) =>
          /couldn't publish/.test(x.title)
            ? 0
            : /reconnect needed/.test(x.title)
              ? 1
              : /expires soon/.test(x.title)
                ? 2
                : /approval/.test(x.title)
                  ? 3
                  : 4;
        attention.sort((a, b) => rank(a) - rank(b));
        const icon = (n) => `url(/icons/${n}.svg)`;
        const range = this.calRange();
        if (screen === 'home' && this._lastScreen !== 'home') this._homeT0 = Date.now();
        this._lastScreen = screen;
        const pr = Math.min(1, (Date.now() - (this._homeT0 || 0)) / 900),
          ease = 1 - Math.pow(1 - pr, 3);
        if (screen === 'home' && pr < 1) requestAnimationFrame(() => this.forceUpdate());
        const cu = (v) => Math.round(v * ease);
        const mon = new Date(this.wsMonday());
        let wkTotal = 0,
          wkSent = 0;
        const weekStrip = Array.from({ length: 7 }, (_, i) => {
          const dd = new Date(mon);
          dd.setDate(mon.getDate() + i);
          const isT = dd.toDateString() === this.dayKey(NOW),
            past = this.wsTime(dd.getFullYear(), dd.getMonth(), dd.getDate() + 1) <= NOW;
          const ps = s.posts.filter((p) => p.at && this.dayKey(p.at) === dd.toDateString()).sort((a, b) => a.at - b.at);
          wkTotal += ps.length;
          wkSent += ps.filter((p) => p.status === 'published').length;
          return {
            dow: isT ? 'Today' : dd.toLocaleDateString('en-US', { weekday: 'short' }),
            num: dd.getDate(),
            dowColor: isT ? '#d9ff35' : '#677184',
            bg: isT ? '#22262b' : '#16181b',
            border: isT ? '#d9ff35' : '#262a2f',
            items: ps.slice(0, 4).map((p) => {
              const a = accById[p.targets[0]?.acc];
              const bad = p.status === 'failed' || p.status === 'partial';
              return {
                time: this.time(p.at).replace(':00', '').replace(' AM', 'a').replace(' PM', 'p'),
                color: a ? P[a.platform].color : '#555',
                logo: a ? P[a.platform].logo : 'none',
                op: p.status === 'published' ? 0.5 : 1,
                ring: bad ? '0 0 0 2px #ff5a4e' : 'none',
                title: `${p.status} · ${p.caption}`,
              };
            }),
            more:
              ps.length > 4
                ? `+${ps.length - 4} more`
                : ps.length
                  ? `${ps.length} post${ps.length === 1 ? '' : 's'}`
                  : past
                    ? ''
                    : 'Open',
            open: () =>
              this.setState({
                screen: 'calendar',
                calView: 'week',
                weekStart: new Date(dd.getFullYear(), dd.getMonth(), dd.getDate() - ((dd.getDay() + 6) % 7)).getTime(),
              }),
          };
        });
        const wkEnd = this.wsTime(mon.getFullYear(), mon.getMonth(), mon.getDate() + 7),
          thisWeek = upcoming.filter((p) => p.at < wkEnd);
        const wkPlats = [
          ...new Set(thisWeek.flatMap((p) => p.targets.map((t) => accById[t.acc]?.platform)).filter(Boolean)),
        ];
        const needN = failedPosts.length + sick.length + seen.size;
        const tones = [
          'linear-gradient(160deg,#9a7a58,#5d4a36)',
          'linear-gradient(160deg,#6e7b5a,#3e4a33)',
          'linear-gradient(160deg,#7a6a8a,#3f3550)',
          'linear-gradient(160deg,#5a6e7b,#2f3e48)',
        ];
        const upNext = upcoming.slice(0, 8).map((p, i) => {
          const hasMedia = p.media.length > 0,
            c = conflictMap[p.id];
          const tag =
            p.approval === 'pending'
              ? ['Needs approval', '#fff1d6', '#8a5a00']
              : c
                ? ['Conflict', '#fff1d6', '#8a5a00']
                : p.approval === 'approved'
                  ? ['Approved', '#eaf6ee', '#15803d']
                  : (p.labels || [])[0]
                    ? [(p.labels || [])[0], '#f1efe9', '#4a4f57']
                    : ['Scheduled', '#f1efe9', '#4a4f57'];
          const words = p.caption.split(/\s+/).slice(0, 6).join(' ');
          return {
            __id: p.id,
            day: this.dayLabel(p.at),
            time: this.time(p.at),
            caption: p.caption,
            cover: hasMedia ? this.mediaThumb(p, true) || tones[Component.hash(p.id) % tones.length] : '#141619',
            coverFg: hasMedia ? '#f6efe3' : '#d9ff35',
            kind: p.media.includes('VIDEO')
              ? '▶ VIDEO'
              : p.media.length > 1
                ? `${p.media.length} IMAGES`
                : p.media.length
                  ? 'IMAGE'
                  : 'TEXT',
            quote: hasMedia ? words + (p.caption.split(/\s+/).length > 6 ? '…' : '') : '“' + words + '…”',
            quoteSize: hasMedia ? '22px' : '20px',
            icons: p.targets.slice(0, 5).map((t) => LG(accById[t.acc]?.platform)),
            tag: tag[0],
            tagBg: tag[1],
            tagFg: tag[2],
            open: () => this.editPost(p),
          };
        });
        const healthTiles = s.accounts
          .map((a) => {
            const h = HL(a);
            return {
              accId: a.id,
              username: a.username,
              detail: h.needsFix ? h.healthDetail : P[a.platform].label,
              label: h.hLabel === 'Connected' ? 'OK' : h.hLabel,
              fg: h.hFg,
              border: h.needsFix ? (a.health === 'error' ? '#f4c6c2' : '#f3dfb2') : '#e7e5df',
              glow: h.needsFix
                ? '0 12px 28px -20px ' + (a.health === 'error' ? 'rgba(210,59,47,.6)' : 'rgba(180,113,0,.5)')
                : 'none',
              color: P[a.platform].color,
              logo: P[a.platform].logo,
              ...Component.pic(a),
              title: `@${a.username} · ${P[a.platform].label}`,
              platform: a.platform,
              needsFix: h.needsFix,
              fixLabel: h.fixLabel,
              fix: reconnect(a),
            };
          })
          .sort((x, y) => y.needsFix - x.needsFix);
        const localNow = new Date(nowMs + this.tzShift());
        return {
          dateLine:
            localNow.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) +
            ' · ' +
            this.time(nowMs) +
            ' · ' +
            Component.tzLabel(S0.tz),
          greetWord: hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening',
          greetName: WS === 'maya' ? 'Maya' : (Component.WS.find((w) => w[0] === WS) || [])[1],
          weekPosts: `${thisWeek.length} post${thisWeek.length === 1 ? '' : 's'}`,
          weekLogos: wkPlats.map((pl) => ({ color: P[pl].color, logo: P[pl].logo, title: P[pl].label })),
          needText: needN
            ? `${needN} item${needN === 1 ? '' : 's'} that need attention`
            : 'nothing that needs attention',
          needTail: '',
          needColor: needN ? '#a1281f' : '#141619',
          needBg: needN ? 'linear-gradient(transparent 62%,#fdd9d5 62%)' : 'transparent',
          jumpAttn: () => {
            const el = document.getElementById('attn');
            if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 24, behavior: 'smooth' });
          },
          goCalWeek: () => this.setState({ screen: 'calendar', calView: 'week', weekStart: this.wsMonday() }),
          goReview: () => this.setState({ screen: 'queue', tab: 'review' }),
          reviewLabel: pending.length ? `Review ${pending.length} pending` : 'Approvals',
          upNext,
          upcomingCount: upcoming.length,
          healthTiles,
          upRef: (this._upRef ||= React.createRef()),
          upPrev: () => this._upRef.current && this._upRef.current.scrollBy({ left: -320 }),
          upNextBtn: () => this._upRef.current && this._upRef.current.scrollBy({ left: 320 }),
          sickTiles: healthTiles.filter((t) => t.needsFix),
          okTiles: healthTiles.filter((t) => !t.needsFix).slice(0, 12),
          okMore: healthTiles.filter((t) => !t.needsFix).length > 12,
          okMoreLabel: `+${healthTiles.filter((t) => !t.needsFix).length - 12}`,
          okCount: healthTiles.filter((t) => !t.needsFix).length,
          okBreakdown: (() => {
            const by = {};
            for (const t of healthTiles) if (!t.needsFix) by[t.platform] = (by[t.platform] || 0) + 1;
            const parts = Object.entries(by)
              .sort((x, y) => y[1] - x[1])
              .map(([k, n]) => `${n} ${P[k].label}`);
            return parts.length > 1 ? ' · ' + parts.join(' · ') : '';
          })(),
          attentionShown: S0.allIssues ? attention : attention.slice(0, 3),
          hasMoreIssues: attention.length > 3,
          issuesLabel: S0.allIssues ? 'Show fewer' : `View all ${attention.length} issues`,
          toggleIssues: () => this.setState((st) => ({ allIssues: !st.allIssues })),
          qAcc: S0.qAcc || '',
          qPlat: S0.qPlat || '',
          onQAcc: (e) => this.setState({ qAcc: e.target.value || null }),
          onQPlat: (e) => this.setState({ qPlat: e.target.value || null }),
          weekStrip,
          weekSum: `${wkSent} of ${wkTotal} sent`,
          isHome: screen === 'home',
          greeting: `${hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening'}, ${WS === 'maya' ? 'Maya' : (Component.WS.find((w) => w[0] === WS) || [])[1]}`,
          homeSub: `${upcoming.length} scheduled · ${pub7} published this week · ${failedPosts.length + sick.length + seen.size ? failedPosts.length + sick.length + seen.size + ' need attention' : 'nothing needs attention'} · ${pending.length} awaiting approval`,
          homeStats: [
            {
              label: 'Scheduled',
              value: cu(upcoming.length),
              cta: 'Queue →',
              color: '#141619',
              icon: icon('calendar'),
              go: () => this.setState({ screen: 'queue', tab: 'upcoming' }),
            },
            {
              label: 'Published this week',
              value: cu(pub7),
              cta: 'History →',
              color: '#141619',
              icon: icon('analytics'),
              go: () => this.setState({ screen: 'queue', tab: 'published' }),
            },
            {
              label: 'Needs attention',
              value: cu(failedPosts.length + sick.length + seen.size),
              cta: 'Below ↓',
              color: failedPosts.length + sick.length + seen.size ? '#dc3545' : '#141619',
              icon: icon('alert'),
              go: () => {},
            },
            {
              label: 'Awaiting approval',
              value: cu(pending.length),
              cta: 'Review →',
              color: '#141619',
              icon: icon('approve'),
              go: () => this.setState({ screen: 'queue', tab: 'review' }),
            },
          ],
          attention,
          attnEmpty: attention.length === 0,
          attnCount: attention.length ? `${attention.length} item${attention.length === 1 ? '' : 's'}` : '',
          healthRows: s.accounts
            .map((a) => {
              const h = HL(a);
              return {
                name: `${P[a.platform].label} · @${a.username}`,
                detail: h.healthDetail,
                label: h.hLabel,
                bg: h.hBg,
                fg: h.hFg,
                color: P[a.platform].color,
                logo: P[a.platform].logo,
              };
            })
            .sort((x, y) => (y.label !== 'Connected') - (x.label !== 'Connected')),
          comingUp: upcoming
            .slice(0, 5)
            .map((p) => ({
              when:
                this.time(p.at).replace(':00', '').replace(' AM', 'a').replace(' PM', 'p') +
                (this.dayLabel(p.at) === 'Today' ? '' : ' ' + this.dayLabel(p.at).slice(0, 3)),
              caption: p.caption,
              open: () => this.editPost(p),
              icons: p.targets.slice(0, 4).map((t) => LG(accById[t.acc]?.platform)),
            })),
          goAccounts: () => this.setState({ screen: 'accounts' }),
          goQueueTab: () => this.setState({ screen: 'queue', tab: 'upcoming' }),
          draftNote: d.note || '',
          onDraftNote: (e) => this.upd({ note: e.target.value }),
          hasConflictWarn: conflictWarn.length > 0,
          conflictWarn,
          exportCalCsv: () => {
            const z2 = (n) => String(n).padStart(2, '0'),
              esc = (v) => (/[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v);
            const inRange = s.posts
              .filter((p) => p.at && p.at >= range[0] && p.at < range[1])
              .sort((a, b) => a.at - b.at);
            const rows = [['date', 'time', 'account', 'platform', 'caption', 'status', 'labels', 'url']];
            for (const p of inRange)
              for (const t of p.targets) {
                const a = accById[t.acc];
                if (!a) continue;
                const dt = this.wsDate(p.at);
                const pid = Component.hash(p.id + t.acc).toString(36);
                rows.push([
                  `${dt.getFullYear()}-${z2(dt.getMonth() + 1)}-${z2(dt.getDate())}`,
                  `${z2(dt.getHours())}:${z2(dt.getMinutes())}`,
                  '@' + a.username,
                  P[a.platform].label,
                  p.caption,
                  t.status,
                  (p.labels || []).join(';'),
                  t.status === 'published'
                    ? `https://${a.platform === 'x' ? 'x.com' : a.platform + '.com'}/${a.username}/${pid}`
                    : '',
                ]);
              }
            const blob = new Blob([rows.map((r) => r.map((c) => esc(String(c))).join(',')).join('\n')], {
              type: 'text/csv',
            });
            const el = document.createElement('a');
            el.href = URL.createObjectURL(blob);
            el.download = `calendar-${S0.calView}-${new Date(range[0]).toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(el);
            el.click();
            el.remove();
            this.flash(`Exported ${rows.length - 1} rows`);
          },
          ...T('failMail', S0.alerts.fail, () =>
            this.setState((st) => ({ alerts: { ...st.alerts, fail: !st.alerts.fail } })),
          ),
          ...T('digest', S0.alerts.digest, () =>
            this.setState((st) => ({ alerts: { ...st.alerts, digest: !st.alerts.digest } })),
          ),
        };
      })(),
      navGroups: [
        { title: 'Workspace', items: ['home', 'calendar', 'queue', 'bulk'] },
        { title: 'Manage', items: ['library', 'accounts', 'analytics'] },
      ].map((g) => ({ title: g.title, items: g.items.map((id) => nav.find((n) => n.id === id)).filter(Boolean) })),
      navBottom: nav.filter((n) => n.id === 'settings'),
      ...(() => {
        // Phones: the sidebar becomes a slide-in drawer, so it is never collapsed there.
        const phone = typeof window !== 'undefined' && window.innerWidth <= 760,
          col = S0.collapsed && !phone;
        const more = ['bulk', 'library', 'accounts', 'analytics', 'settings'].includes(screen);
        const tab = (id, label, kind, go, on, badge) => ({
          label,
          kind,
          go,
          on: on ? 'true' : 'false',
          current: on ? 'page' : 'false',
          badge: badge || 0,
          icon: kind === 'nav' ? `url(/icons/${id}${on ? '-on' : ''}.svg)` : 'none',
        });
        const goTo = (id) => () => this.setState({ screen: id, selecting: false, selected: [], drawer: false });
        return {
          sideCols: col ? '64px minmax(0,1fr)' : '236px minmax(0,1fr)',
          sideTxt: col ? 'none' : 'inline',
          sideBlock: col ? 'none' : 'flex',
          sideArrow: col ? '»' : '«',
          sideToggleLabel: col ? 'Expand sidebar' : 'Collapse sidebar',
          drawerAttr: S0.drawer ? 'open' : 'closed',
          drawerOpen: S0.drawer ? 'true' : 'false',
          toggleDrawer: () => this.setState((st) => ({ drawer: !st.drawer })),
          closeDrawer: () => this.setState({ drawer: false }),
          screenTitle:
            {
              home: 'Overview',
              queue: 'Queue',
              calendar: 'Calendar',
              bulk: 'Bulk scheduling',
              library: 'Media library',
              compose: S0.draft && S0.draft.id ? 'Edit post' : 'New post',
              accounts: 'Social accounts',
              analytics: 'Analytics',
              settings: 'Settings',
            }[screen] || 'Schedule For You',
          mobTabs: [
            tab('home', 'Home', 'nav', goTo('home'), screen === 'home'),
            tab('queue', 'Queue', 'nav', goTo('queue'), screen === 'queue', failedPosts.length),
            tab('create', 'Create', 'create', () => this.newPost(), screen === 'compose'),
            tab('calendar', 'Calendar', 'nav', goTo('calendar'), screen === 'calendar'),
            tab('more', 'More', 'more', () => this.setState((st) => ({ drawer: !st.drawer })), more),
          ],
        };
      })(),
      toggleSide: () => this.setState((st) => ({ collapsed: !st.collapsed })),
      ...(() => {
        const p = S0.posts.find((x) => x.id === S0.calPost);
        if (!p) return { hasCalPost: false, cp: { accs: [] }, closeCalPost: () => {} };
        const st = STL(p),
          close = () => this.setState({ calPost: null });
        return {
          hasCalPost: true,
          closeCalPost: close,
          cp: {
            stLabel: st[0],
            stBg: st[1],
            stFg: st[2],
            when: p.at ? `${this.dayLabel(p.at)}, ${this.time(p.at)}` : 'Not scheduled',
            caption: p.caption,
            thumb: p.media.length ? this.mediaThumb(p) || TONES[Component.hash(p.id) % 4] : 'none',
            thumbDisplay: p.media.length ? 'block' : 'none',
            accs: p.targets.map((t) => {
              const a = accById[t.acc];
              return {
                name: a ? `${P[a.platform].label} · @${a.username}` : 'Disconnected',
                color: a ? P[a.platform].color : '#888',
                logo: a ? P[a.platform].logo : 'none',
                st: t.error ? 'Failed' : t.status,
                stColor: t.error ? '#dc3545' : '#677184',
              };
            }),
            canMove: p.status === 'scheduled',
            local: p.at ? Component.toLocal(p.at) : '',
            onTime: (e) => {
              const v = e.target.value;
              if (!v) return;
              const at = Component.fromLocal(v),
                old = p.at;
              if (at <= NOW) return this.flash('Pick a time in the future', true);
              this.setPost(p.id, (x) => ({ ...x, at }));
              this.flash(`Moved to ${this.slotLabel(at)}`, false, () => this.setPost(p.id, (x) => ({ ...x, at: old })));
            },
            edit: () => {
              close();
              this.editPost(p);
            },
            dup: () => {
              close();
              this.duplicate([p.id]);
            },
            del: () =>
              this.setState({
                confirm: {
                  title: 'Delete this post?',
                  body: p.caption.slice(0, 90),
                  cta: 'Delete post',
                  go: () => {
                    close();
                    this.setState((s2) => ({ posts: s2.posts.filter((x) => x.id !== p.id) }));
                    this.flash('Post deleted', false, () => this.setState((s2) => ({ posts: [...s2.posts, p] })));
                  },
                },
              }),
          },
        };
      })(),
      hasConfirm: !!S0.confirm,
      cfTitle: S0.confirm?.title || '',
      cfBody: S0.confirm?.body || '',
      cfCta: S0.confirm?.cta || 'Confirm',
      cfBg: /delete/i.test(S0.confirm?.cta || '') ? '#dc3545' : '#141619',
      cfCancel: () => this.setState({ confirm: null }),
      cfGo: () => {
        const c = S0.confirm;
        this.setState({ confirm: null });
        c && c.go();
      },
      cfHasAlt: !!S0.confirm?.alt,
      cfAltLabel: S0.confirm?.altLabel || '',
      cfAlt: () => {
        const c = S0.confirm;
        this.setState({ confirm: null });
        c && c.alt && c.alt();
      },
      toastUndo: !!S0.toastUndo,
      doUndo: () => {
        const u = this._undo;
        this._undo = null;
        clearTimeout(this._tt);
        this.setState({ toast: '', toastUndo: false });
        if (u) {
          u();
          this.flash('Undone');
        }
      },
      hasToast: !!s.toast,
      toast: s.toast,
      toastDot: s.toastBad ? '#ff6b5e' : '#d9ff35',
    };
  }
}

Component.defaultProps = {
  ...{ startScreen: 'home', density: 'comfortable', showPreview: true },
  ...(Component.defaultProps || {}),
};
Component.prototype.render = function () {
  const vals = { ...this.props, ...(this.renderVals() || {}) };
  return (
    <div id="dc-root">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="sc-host">{renderDashboard(vals)}</div>
    </div>
  );
};

export default Component;
