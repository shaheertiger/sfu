'use client';
// Logic ported from the Claude Design prototype "Landing Page.dc.html".
import React from 'react';
import { renderLanding, css } from './LandingView';

const DCLogic = React.Component;
const CAP = 'The Fall field kit is live. Waxed canvas, brass hardware, built to take a beating. Ships this week →';
const LOGO = (s) => `url(/logos/${s}.svg)`;
const IG = 'radial-gradient(circle at 30% 107%,#fdf497 0%,#fd5949 45%,#d6249f 60%,#285AEB 90%)';
const TILE = {
  bluesky: '#1185fe',
  x: '#000000',
  instagram: IG,
  linkedin: '#0a66c2',
  facebook: '#1877f2',
  tiktok: '#000000',
  youtube: '#ff0000',
  threads: '#000000',
  pinterest: '#e60023',
  googlemybusiness: '#4285f4',
};
const ACC = [
  { id: 'x', label: 'X', handle: '@fieldco', dot: '#f6f5f1', limit: 280 },
  { id: 'bluesky', label: 'Bluesky', handle: 'fieldco.bsky.social', dot: '#1185fe', limit: 300 },
  { id: 'linkedin', label: 'LinkedIn', handle: 'Field & Co.', dot: '#3b8ee0', limit: 3000 },
  { id: 'instagram', label: 'Instagram', handle: '@field.co', dot: '#ff4f8b', limit: 2200 },
  { id: 'threads', label: 'Threads', handle: '@field.co', dot: '#f6f5f1', limit: 500 },
].map((a) => ({ ...a, logo: LOGO(a.id) }));
const VARIANTS = {
  x: 'Fall field kit is live. Waxed canvas, brass hardware, built to take a beating. Ships this week →',
  bluesky:
    'The Fall field kit is live. Waxed canvas, brass hardware, built to take a beating. Ships this week. Link below.',
  linkedin:
    "Today we're shipping the Fall field kit.\n\nWaxed canvas, solid brass hardware and triple-stitched seams. We spent eight months testing it on job sites and trailheads so it holds up to a real season of use.\n\nOrders ship this week.",
  instagram:
    'Fall field kit. Out now.\nWaxed canvas, brass hardware, built to take a beating.\nLink in bio.\n\n#fieldkit #waxedcanvas #madetolast',
  threads: 'The Fall field kit is live. Waxed canvas + brass hardware, built to take a beating. Ships this week.',
};
const CODE = {
  rest: `curl -X POST https://scheduleforyou.com/api/v1/posts \\
  -H "Authorization: Bearer $SFY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "caption": "The Fall field kit is live.",
    "accounts": ["x", "bluesky", "threads"],
    "scheduled_at": "2026-10-27T09:00:00Z"
  }'`,
  mcp: `{
  "mcpServers": {
    "schedule-for-you": {
      "command": "npx",
      "args": ["schedule-for-you-mcp"],
      "env": { "SFY_API_KEY": "sk_live_…" }
    }
  }
}

> Schedule the field kit post for Tuesday 9am on X and Bluesky.`,
};
const PLATFORMS = [
  ['bluesky', 'Bluesky'],
  ['x', 'X / Twitter'],
  ['instagram', 'Instagram'],
  ['linkedin', 'LinkedIn'],
  ['facebook', 'Facebook'],
  ['tiktok', 'TikTok'],
  ['youtube', 'YouTube'],
  ['threads', 'Threads'],
  ['pinterest', 'Pinterest'],
  ['googlemybusiness', 'Google Business'],
].map(([slug, label]) => ({ slug, label, logo: LOGO(slug), tile: TILE[slug] }));
const FLOAT = [
  ['instagram', '6%', '90px', 84, '-10deg', 6.5, 0],
  ['x', '12%', '330px', 64, '8deg', 7, 1.2],
  ['youtube', '2%', '560px', 58, '-6deg', 8, 0.6],
  ['tiktok', '86%', '80px', 76, '10deg', 7.2, 0.3],
  ['linkedin', '80%', '320px', 62, '-8deg', 6.2, 1.6],
  ['bluesky', '90%', '540px', 70, '6deg', 7.8, 0.9],
].map(([s, left, top, size, rot, dur, delay]) => ({ logo: LOGO(s), tile: TILE[s], left, top, size, rot, dur, delay }));
const FAN = PLATFORMS.map((p, i) => ({ ...p, left: 75, top: 8 + i * (84 / 9), delay: (i * 0.17).toFixed(2) }));
const FAN_FMT = [
  { slug: 'pinterest', ratio: 2 / 3, fmt: 'Pin · 2:3', max: '500', tone: '#8a5a3c' },
  { slug: 'tiktok', ratio: 9 / 16, fmt: 'Video · 9:16', max: '2,200', tone: '#5d4a36' },
  { slug: 'instagram', ratio: 1, fmt: 'Post · 1:1', max: '2,200', tone: '#7a6148' },
  { slug: 'facebook', ratio: 1.91, fmt: 'Link · 1.91:1', max: '63,206', tone: '#6e5a42' },
  { slug: 'x', ratio: 16 / 9, fmt: 'Post · 16:9', max: '280', tone: '#7a6148' },
  { slug: 'threads', ratio: 0, fmt: 'Text', max: '500', tone: '' },
  { slug: 'bluesky', ratio: 16 / 9, fmt: 'Post · 16:9', max: '300', tone: '#6a543e' },
  { slug: 'linkedin', ratio: 1.91, fmt: 'Post · 1.91:1', max: '3,000', tone: '#806650' },
  { slug: 'youtube', ratio: 9 / 16, fmt: 'Short · 9:16', max: '5,000', tone: '#4f3f2e' },
  { slug: 'googlemybusiness', ratio: 4 / 3, fmt: 'Update · 4:3', max: '1,500', tone: '#76604a' },
];
const C = { x: '#f6f5f1', bsky: '#1185fe', li: '#3b8ee0', ig: '#e1306c', th: '#a7abb2', yt: '#ff3b30', tt: '#f6f5f1' };
const WI = (...a) => a.map((x) => LOGO(x));
const WEEK = [
  { dow: 'Mon', num: 26, posts: [{ time: '9:00', icons: WI('x', 'bluesky', 'linkedin') }] },
  {
    dow: 'Tue',
    num: 27,
    posts: [
      { time: '9:00', icons: WI('x', 'bluesky', 'linkedin', 'instagram', 'threads') },
      { time: '17:30', icons: WI('instagram') },
    ],
  },
  { dow: 'Wed', num: 28, posts: [{ time: '12:00', icons: WI('linkedin') }] },
  {
    dow: 'Thu',
    num: 29,
    posts: [
      { time: '8:30', icons: WI('x', 'threads') },
      { time: '19:00', icons: WI('youtube', 'tiktok') },
    ],
  },
  { dow: 'Fri', num: 30, posts: [{ time: '10:00', icons: WI('x', 'bluesky', 'instagram') }] },
  { dow: 'Sat', num: 31, posts: [{ time: '11:00', icons: WI('instagram', 'tiktok') }] },
  { dow: 'Sun', num: 1, posts: [] },
];
const QUOTES = [
  {
    text: "I used to lose Monday mornings to posting. Now the whole week is queued before my coffee's cold.",
    name: 'Priya Raman',
    role: 'Founder, small-batch skincare',
    initials: 'PR',
  },
  {
    text: 'We run 40 accounts across six platforms. One calendar and per-platform captions made that manageable for two people.',
    name: 'Marcus Lee',
    role: 'Social lead, agency',
    initials: 'ML',
  },
  {
    text: 'The MCP server sold me. Claude drafts the posts, I approve them, the queue handles the rest.',
    name: 'Dana Okafor',
    role: 'Indie developer',
    initials: 'DO',
  },
];
const LOOP = 130;

class Component extends DCLogic {
  state = { t: 0, tab: 'x', code: 'chat', copied: false };
  fanSvg() {
    const h = React.createElement;
    const paths = FAN.map((n, i) => {
      const x1 = 332,
        y1 = 280,
        x2 = n.left * 10 - 8,
        y2 = n.top * 5.6;
      const d = `M${x1} ${y1} C ${x1 + 170} ${y1}, ${x2 - 190} ${y2}, ${x2} ${y2}`;
      return h(
        'g',
        { key: i },
        h('path', { d, fill: 'none', stroke: '#24282d', strokeWidth: 1.2 }),
        h('path', {
          d,
          fill: 'none',
          stroke: '#dcff2e',
          strokeWidth: 2,
          strokeLinecap: 'round',
          pathLength: 100,
          strokeDasharray: '14 86',
          style: {
            animation: `sfyPulse 2.4s cubic-bezier(.55,0,.35,1) ${n.delay}s infinite`,
            filter: 'drop-shadow(0 0 3px rgba(220,255,46,.9))',
          },
        }),
      );
    });
    return h(
      'svg',
      { viewBox: '0 0 1000 560', style: { position: 'absolute', inset: 0, width: '100%', height: '100%' } },
      paths,
    );
  }
  curTarget(t) {
    if (t < 29) return 'caption';
    if (t < 44) return 'chip-' + Math.min(4, Math.floor((t - 29) / 3));
    if (t < 48) return 'time';
    if (t < 60) return 'btn';
    return 'rest';
  }
  measureCursor() {
    const auto = this.props.autoplay ?? true,
      t = auto ? this.state.t : 115;
    const key = this.curTarget(t);
    if (key === this.lastKey && !this.dirty) return;
    const root = document.querySelector('[data-demo-root]'),
      el = root && root.querySelector('[data-demo="' + key + '"]');
    if (!el) return;
    const rr = root.getBoundingClientRect(),
      er = el.getBoundingClientRect(),
      k = rr.width / root.offsetWidth || 1;
    const fx = key === 'caption' ? 0.82 : key === 'rest' ? 0.7 : 0.55,
      fy = key === 'caption' ? 0.75 : key === 'rest' ? 0.85 : 0.55;
    this.lastKey = key;
    this.dirty = false;
    this.setState({
      cx: Math.round((er.left - rr.left + er.width * fx) / k),
      cy: Math.round((er.top - rr.top + er.height * fy) / k),
    });
  }
  cursorVals(t) {
    const clicks = [32, 35, 38, 41, 44, 48, 54];
    const down = clicks.some((c) => t >= c && t < c + 1.2);
    return {
      cx: this.state.cx ?? 400,
      cy: this.state.cy ?? 200,
      curScale: down ? 0.8 : 1,
      curOp: t > 104 || t < 3 ? 0 : 1,
    };
  }
  valueVals(t) {
    const wideV = (this.state.w ?? 1400) >= 900;
    const merged = t >= 30 && t < 118;
    const hosts = [
      ['x', 'x.com'],
      ['bluesky', 'bsky.app'],
      ['linkedin', 'linkedin.com'],
      ['instagram', 'instagram.com'],
      ['threads', 'threads.net'],
    ];
    const tabRows = hosts.map(([id, host], i) => ({
      host,
      logo: LOGO(id),
      tile: TILE[id],
      y: merged ? 0 : i * 58,
      sc: merged ? 0.94 : 1,
      op: merged ? 0 : 1,
      z: 10 - i,
      d: merged ? (0.06 * (4 - i)).toFixed(2) : (0.06 * i).toFixed(2),
      resOp: t >= 40 && t < 118 ? 1 : 0,
      resY: t >= 40 && t < 118 ? 0 : 12,
      rd: (0.08 * i).toFixed(2),
    }));
    const KEY = 'Fall field kit';
    const echo = ['x', 'bluesky', 'linkedin', 'instagram'].map((id, i) => {
      const line = VARIANTS[id].split('\n').find((l) => l.includes(KEY)) || VARIANTS[id];
      const k = line.indexOf(KEY),
        on = t >= 14 + i * 7 && t < 112;
      return {
        logo: LOGO(id),
        pre: line.slice(0, k),
        key: KEY,
        post: line.slice(k + KEY.length),
        hl: on ? '#dcff2e' : 'transparent',
        hc: on ? '#15171a' : '#f6f5f1',
      };
    });
    const C = [
      ['x', 'X · 280 characters', 'fits · 96/280', 'ok', 20],
      ['instagram', 'Instagram · needs media', 'fall-kit.jpg attached', 'ok', 38],
      ['tiktok', 'TikTok · needs video', 'add a video or skip', 'warn', 56],
      ['pinterest', 'Pinterest · board required', "board: Fall '26", 'ok', 74],
      ['youtube', 'YouTube · title required', 'from first line', 'ok', 90],
    ];
    const checks = C.map(([id, rule, note, kind, at]) => {
      const done = t >= at && t < 120,
        warn = kind === 'warn';
      return {
        logo: LOGO(id),
        rule,
        note: done ? note : 'checking…',
        icon: done ? (warn ? '!' : '✓') : '',
        ring: done ? (warn ? '#ffb547' : '#dcff2e') : '#3a3e45',
        fill: done ? (warn ? '#ffb547' : '#dcff2e') : 'transparent',
        noteColor: done ? (warn ? '#ffb547' : '#a7abb2') : '#4a4f57',
      };
    });
    return {
      bentoCols: wideV ? 'minmax(0,1.15fr) minmax(0,1fr)' : 'minmax(0,1fr)',
      bentoSpan: wideV ? 'span 2' : 'auto',
      tabRows,
      echo,
      checks,
      oneOp: merged ? 1 : 0,
      oneY: merged ? 0 : 16,
      tabCaption: merged ? '1 tab · 5 accounts' : '5 tabs · 5 logins',
    };
  }
  featRef = React.createRef();
  featVals(t, tabId) {
    const wideF = (this.state.w ?? 1400) >= 960,
      el = this.featRef.current;
    let active = this.state.feat ?? 0,
      fill = 100;
    if (wideF && el) {
      const vh = window.innerHeight || 800,
        span = Math.max(1, el.offsetHeight - vh);
      const p = Math.min(0.9999, Math.max(0, ((this.state.sy ?? 0) - el.offsetTop) / span));
      active = Math.floor(p * 3);
      fill = Math.round((p * 3 - active) * 100);
    }
    const STEPS = [
      [
        'Per-platform captions',
        "Start from one caption and adjust it per account. The counter tracks each platform's limit as you type.",
      ],
      [
        'Queue and calendar',
        'Every scheduled post on one calendar. Click a day to fill a gap, click a post to change it.',
      ],
      [
        'API + MCP',
        'A REST API and an MCP server ship with every workspace, so Claude, Cursor or your own scripts can post for you.',
      ],
    ];
    const featSteps = STEPS.map(([title, body], i) => ({
      n: '0' + (i + 1),
      title,
      body,
      color: i === active ? '#f6f5f1' : '#4a4f57',
      numColor: i === active ? '#dcff2e' : '#4a4f57',
      rows: i === active ? '1fr' : '0fr',
      fill: i < active ? 100 : i === active ? (wideF ? fill : 100) : 0,
      go: () => {
        if (wideF && el) {
          const vh = window.innerHeight || 800;
          window.scrollTo({ top: el.offsetTop + ((i + 0.35) / 3) * (el.offsetHeight - vh), behavior: 'smooth' });
        } else this.setState({ feat: i });
      },
    }));
    const layer = (i) => ({
      op: i === active ? 1 : 0,
      y: i === active ? 0 : i < active ? -24 : 24,
      sc: i === active ? 1 : 0.97,
      pe: i === active ? 'auto' : 'none',
    });
    const acc = ACC.find((a) => a.id === tabId),
      txt = VARIANTS[tabId],
      pct = Math.min(100, (txt.length / acc.limit) * 100);
    const lt = t % 65,
      added = lt >= 18;
    const weekLive = WEEK.map((d) => {
      const posts = d.posts.map((p) => ({
        time: p.time,
        icons: p.icons || [],
        bg: '#1f2227',
        fg: '#f6f5f1',
        op: 1,
        y: 0,
      }));
      if (d.dow === 'Thu')
        posts.push({
          time: '15:00',
          icons: [LOGO('x'), LOGO('threads'), LOGO('bluesky')],
          bg: '#dcff2e',
          fg: '#15171a',
          op: added ? 1 : 0,
          y: added ? 0 : -14,
        });
      const hot = d.dow === 'Thu' && lt >= 10 && lt < 30;
      return { dow: d.dow, num: d.num, posts, bg: hot ? '#1a1d10' : '#0c0d0f', border: hot ? '#dcff2e' : '#1f2227' };
    });
    const PROMPT = 'Schedule the field kit post for Tuesday 9am on X and Bluesky.';
    const ct = t % 80,
      typedN = Math.min(PROMPT.length, Math.floor((ct / 24) * PROMPT.length));
    return {
      featRef: this.featRef,
      featH: wideF ? '300vh' : 'auto',
      featPos: wideF ? 'sticky' : 'relative',
      featMinH: wideF ? '100vh' : '0',
      featCols: wideF ? 'minmax(0,.9fr) minmax(0,1.1fr)' : 'minmax(0,1fr)',
      featSteps,
      v0: layer(0),
      v1: layer(1),
      v2: layer(2),
      tabHandle: acc.handle,
      tabLabel: acc.label,
      ringDash: pct.toFixed(1) + ' 100',
      tabNote: pct < 90 ? 'Fits with room to spare' : 'Close to the limit',
      weekLive,
      weekCount: (added ? 11 : 10) + ' posts scheduled',
      dropOp: added ? 1 : 0,
      chatPrompt: PROMPT.slice(0, typedN),
      chatCursor: typedN < PROMPT.length && Math.floor(t / 4) % 2 === 0 ? 1 : 0,
      chatToolOp: ct >= 32 ? 1 : 0,
      chatToolY: ct >= 32 ? 0 : 10,
      chatDoneOp: ct >= 46 ? 1 : 0,
    };
  }
  fanRef = React.createRef();
  fanVals() {
    const open = !!this.state.fanOpen,
      hov = this.state.hov ?? null,
      n = FAN_FMT.length;
    const scale = Math.min(1, ((this.state.w ?? 1400) - 32) / 1040);
    return {
      fanRef: this.fanRef,
      fanScale: scale.toFixed(3),
      fanH: Math.round(500 * scale),
      fanLeave: () => this.setState({ hov: null }),
      fanCards: FAN_FMT.map((f, i) => {
        const p = PLATFORMS.find((x) => x.slug === f.slug);
        const base = -30 + i * (60 / (n - 1));
        const ang = open ? base : base * 0.05;
        const isH = hov === i;
        const box = 150,
          mw = f.ratio >= 1 ? 168 : Math.round(118 * f.ratio),
          mh = f.ratio >= 1 ? Math.round(168 / f.ratio) : 118;
        return {
          label: p.label,
          logo: p.logo,
          tile: p.tile,
          tf: `translateX(-50%) rotate(${ang.toFixed(2)}deg) translateY(${isH ? -54 : 0}px)`,
          z: isH ? 40 : 10 + i,
          op: hov == null || isH ? 1 : 0.5,
          delay: open ? (Math.abs(i - (n - 1) / 2) * 0.05).toFixed(2) : 0,
          border: isH ? '#dcff2e' : '#2a2e34',
          hasMedia: f.ratio > 0,
          textOnly: f.ratio === 0,
          mw: Math.min(mw, 168),
          mh: Math.min(mh, box - 32),
          tone: f.tone,
          long: CAP,
          text: f.ratio === 0 ? '' : CAP,
          fmt: f.fmt,
          limit: `${f.max} max`,
          limitColor: isH ? '#dcff2e' : '#6b7079',
          enter: () => this.setState({ hov: i }),
        };
      }),
    };
  }
  onResize = () => {
    this.dirty = true;
    this.setState({ w: window.innerWidth });
  };
  onScroll = () => {
    if (this.raf) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      this.setState({ sy: window.scrollY });
    });
  };
  setupReveal() {
    const els = [...document.querySelectorAll('[data-reveal]')].filter((el) => !el.dataset.rv);
    if (!els.length || !('IntersectionObserver' in window)) return;
    this.io =
      this.io ||
      new IntersectionObserver(
        (entries) =>
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            const el = en.target;
            el.style.opacity = '1';
            el.style.transform = 'none';
            el.style.filter = 'none';
            this.io.unobserve(el);
            setTimeout(() => {
              el.style.transition = '';
            }, 1200);
          }),
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
      );
    els.forEach((el, i) => {
      el.dataset.rv = '1';
      const base = el.style.transition;
      el.style.opacity = '0';
      el.style.transform = 'translateY(40px) scale(.98)';
      el.style.filter = 'blur(6px)';
      el.style.transition = `opacity .9s cubic-bezier(.2,.8,.2,1) ${(i % 3) * 0.08}s, transform .9s cubic-bezier(.2,.8,.2,1) ${(i % 3) * 0.08}s, filter .9s ease ${(i % 3) * 0.08}s${base ? ',' + base : ''}`;
      this.io.observe(el);
    });
  }
  componentDidUpdate() {
    if (!this.revealDone) {
      this.revealDone = true;
      this.setupReveal();
    }
    this.measureCursor();
  }
  componentDidMount() {
    // Signed-in visitors get "Open dashboard" instead of "Sign in" (see lib/signed-in-hint.js).
    this.setState({ signedIn: /(?:^|;\s*)sfy_signed_in=1/.test(document.cookie) });
    this.onResize();
    window.addEventListener('resize', this.onResize);
    window.addEventListener('scroll', this.onScroll, { passive: true });
    setTimeout(() => this.setupReveal(), 300);
    if ('IntersectionObserver' in window && this.fanRef.current) {
      this.fio = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            this.setState({ fanOpen: true });
            this.fio.disconnect();
          }
        },
        { threshold: 0.35 },
      );
      this.fio.observe(this.fanRef.current);
    } else this.setState({ fanOpen: true });
    this.iv = setInterval(() => {
      if ((this.props.autoplay ?? true) === false) return;
      const s = this.props.demoSpeed ?? 1;
      this.setState((st) => ({ t: (st.t + s) % LOOP }));
    }, 100);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('scroll', this.onScroll);
    this.io?.disconnect();
    this.fio?.disconnect();
    cancelAnimationFrame(this.raf);
    clearInterval(this.iv);
    clearTimeout(this.ct);
  }
  renderVals() {
    const auto = this.props.autoplay ?? true;
    const t = auto ? this.state.t : 115;
    const typed = Math.min(CAP.length, Math.floor((t / 28) * CAP.length));
    const typing = t < 32;
    const chips = ACC.map((a, i) => {
      const on = t >= 32 + i * 3;
      return {
        label: a.label,
        logo: a.logo,
        bg: on ? '#f6f5f1' : 'transparent',
        border: on ? '#f6f5f1' : '#2a2e34',
        color: on ? '#15171a' : '#a7abb2',
      };
    });
    const timeSet = t >= 48;
    const scheduled = t >= 57;
    const rows = ACC.map((a, i) => {
      const show = t >= 60 + i * 4;
      const posted = t >= 88 + i * 5;
      return {
        label: a.label,
        handle: a.handle,
        dot: a.dot,
        logo: a.logo,
        tile: TILE[a.id],
        text: VARIANTS[a.id].split('\n')[0],
        op: show ? 1 : 0.12,
        ty: show ? 0 : 10,
        status: posted ? 'Posted' : show ? 'Scheduled' : 'Draft',
        pillBg: posted ? '#dcff2e' : show ? '#a7abb2' : '#3a3e45',
        pillColor: posted ? '#dcff2e' : show ? '#f6f5f1' : '#6b7079',
        pillBorder: '',
        meta: posted ? 'just now' : `${VARIANTS[a.id].length}/${a.limit}`,
      };
    });
    const step = t < 30 ? 0 : t < 48 ? 1 : t < 86 ? 2 : 3;
    const steps = ['Write once', 'Pick accounts', 'Schedule', 'Goes out'].map((label, i) => ({
      n: `0${i + 1}`,
      label,
      bg: i === step ? '#dcff2e' : 'transparent',
      color: i === step ? '#15171a' : i < step ? '#f6f5f1' : '#6b7079',
    }));

    const tabId = this.state.picked ? this.state.tab : ACC[Math.floor(t / 26) % ACC.length].id;
    const acc = ACC.find((a) => a.id === tabId);
    const txt = VARIANTS[tabId];
    const tabs = ACC.map((a) => ({
      label: a.label,
      logo: a.logo,
      fg: a.id === tabId ? '#15171a' : a.dot,
      bg: a.id === tabId ? '#f6f5f1' : 'transparent',
      color: a.id === tabId ? '#15171a' : '#a7abb2',
      select: () => this.setState({ tab: a.id, picked: true }),
    }));
    const codeId = this.state.code;
    const codeTabs = [
      ['chat', 'Claude · MCP'],
      ['rest', 'REST API'],
    ].map(([id, label]) => ({
      label,
      bg: id === codeId ? '#2a2e34' : 'transparent',
      color: id === codeId ? '#f6f5f1' : '#6b7079',
      select: () => this.setState({ code: id, copied: false }),
    }));

    return {
      chips,
      rows,
      steps,
      caption: CAP.slice(0, typed),
      cursorOp: typing && Math.floor(t / 4) % 2 === 0 ? 1 : typing ? 0.25 : 0,
      captionBorder: typing ? '#3a3e45' : '#22252a',
      ...this.cursorVals(t),
      ...this.valueVals(t),
      ...this.featVals(t, tabId),
      demoCols:
        (this.state.w ?? 1400) >= 1100 ? '188px minmax(0,1.1fr) minmax(0,1fr)' : 'repeat(auto-fit,minmax(300px,1fr))',
      charLabel: `${typed} chars`,
      timeLabel: timeSet ? 'Tue, Oct 27 · 9:00 AM' : 'Pick a time',
      timeColor: timeSet ? '#f6f5f1' : '#6b7079',
      timeBorder: t >= 48 && t < 56 ? '#dcff2e' : '#22252a',
      btnScale: t >= 54 && t < 57 ? 0.94 : 1,
      btnLabel: scheduled ? 'Scheduled ✓' : 'Schedule 5 posts',
      progress: Math.round((t / LOOP) * 100),
      platforms: PLATFORMS,
      marquee: [...PLATFORMS, ...PLATFORMS],
      floaters: FLOAT,
      wide: (this.state.w ?? 1400) >= 1100,
      fanNodes: FAN,
      fanSvg: this.fanSvg(),
      tilt: (() => {
        const p = Math.min(1, (this.state.sy ?? 0) / 420);
        return `perspective(1800px) rotateX(${((1 - p) * 20).toFixed(2)}deg) scale(${(0.9 + 0.1 * p).toFixed(3)})`;
      })(),
      spotlight:
        this.state.mx == null
          ? 'transparent'
          : `radial-gradient(520px circle at ${this.state.mx}px ${this.state.my}px, rgba(220,255,46,.09), transparent 60%)`,
      onHeroMove: (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        this.setState({ mx: Math.round(e.clientX - r.left), my: Math.round(e.clientY - r.top) });
      },
      tabs,
      tabText: txt,
      tabPct: Math.min(100, Math.max(2, (txt.length / acc.limit) * 100)),
      tabCount: `${txt.length} / ${acc.limit.toLocaleString()}`,
      week: WEEK,
      codeTabs,
      codeText: CODE[codeId === 'chat' ? 'mcp' : 'rest'],
      isChat: codeId === 'chat',
      isRest: codeId === 'rest',
      copyLabel: this.state.copied ? 'Copied' : 'Copy',
      copy: () => {
        navigator.clipboard?.writeText(CODE[codeId === 'chat' ? 'mcp' : 'rest']).catch(() => {});
        this.setState({ copied: true });
        clearTimeout(this.ct);
        this.ct = setTimeout(() => this.setState({ copied: false }), 1500);
      },
      navMainLabel: this.state.signedIn ? 'Open dashboard' : 'Start free',
      navMainHref: this.state.signedIn ? '/app' : '/signup',
      navSecondLabel: this.state.signedIn ? 'Pricing' : 'Sign in',
      navSecondHref: this.state.signedIn ? '#pricing' : '/login',
      quotes: QUOTES,
      showTestimonials: this.props.showTestimonials ?? true,
      ...(() => {
        // Yearly is 10 months of the monthly price (2 months free).
        const yr = !!this.state.yearly,
          per = (m) => '$' + +((m * 10) / 12).toFixed(2);
        return {
          moPressed: yr ? 'false' : 'true',
          yrPressed: yr ? 'true' : 'false',
          moBg: yr ? 'transparent' : '#dcff2e',
          moFg: yr ? '#a7abb2' : '#15171a',
          yrBg: yr ? '#dcff2e' : 'transparent',
          yrFg: yr ? '#15171a' : '#a7abb2',
          yrTag: yr ? '#15171a' : '#dcff2e',
          pickMonthly: () => this.setState({ yearly: false }),
          pickYearly: () => this.setState({ yearly: true }),
          soloPrice: yr ? per(19) : '$19',
          studioPrice: yr ? per(59) : '$59',
          soloBilled: yr ? '$190 billed yearly · save $38' : 'Billed monthly',
          studioBilled: yr ? '$590 billed yearly · save $118' : 'Billed monthly',
        };
      })(),
    };
  }
}

Component.defaultProps = {
  ...{ demoSpeed: 1, autoplay: true, showTestimonials: true },
  ...(Component.defaultProps || {}),
};
Component.prototype.render = function () {
  const vals = { ...this.props, ...(this.renderVals() || {}) };
  return (
    <div id="dc-root">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="sc-host">{renderLanding(vals)}</div>
    </div>
  );
};

export default Component;
