'use client';
// Logic ported from the Claude Design prototype "Landing Page Mobile.dc.html".
import React from 'react';
import { renderLandingMobile, css } from './LandingMobileView';

const DCLogic = React.Component;
class Component extends DCLogic {
  state = {
    email: '',
    tried: false,
    done: false,
    plan: 'solo',
    faq: 0,
    sheet: false,
    t: 0,
    showBar: false,
    scrolled: false,
    picks: [],
    ppw: 10,
    accN: 4,
    accTouched: false,
  };
  static CAP = 'Tuesday tip: batch your whole week of posts in one sitting.';
  static PL = {
    x: ['X', '#000000', 'Trimmed to 280'],
    bluesky: ['Bluesky', '#1185fe', 'Trimmed to 300'],
    instagram: ['Instagram', '#e1306c', 'Image attached'],
    linkedin: ['LinkedIn', '#0a66c2', 'Full caption'],
    threads: ['Threads', '#000000', 'Full caption'],
    tiktok: ['TikTok', '#000000', ''],
    youtube: ['YouTube', '#ff0000', ''],
    facebook: ['Facebook', '#1877f2', ''],
    pinterest: ['Pinterest', '#e60023', ''],
    googlemybusiness: ['Google Business', '#4285f4', ''],
  };
  emailRef = React.createRef();
  sheetRef = React.createRef();
  componentDidMount() {
    this._iv = setInterval(() => this.setState((s) => ({ t: (s.t + 1) % 120 })), 70);
    this._sc = () => {
      const y = window.scrollY,
        fin = document.getElementById('final');
      const finTop = fin ? fin.getBoundingClientRect().top : 9999;
      this.setState({ showBar: y > 560 && finTop > window.innerHeight * 0.6, scrolled: y > 8 });
    };
    window.addEventListener('scroll', this._sc, { passive: true });
    this._sc();
  }
  componentWillUnmount() {
    clearInterval(this._iv);
    window.removeEventListener('scroll', this._sc);
  }
  valid() {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(this.state.email.trim());
  }
  renderVals() {
    const s = this.state,
      C = Component,
      P = C.PL,
      cap = C.CAP;
    const typeEnd = 50,
      chars = Math.min(cap.length, Math.round((Math.min(s.t, typeEnd) / typeEnd) * cap.length));
    const order = ['x', 'bluesky', 'instagram', 'linkedin', 'threads'];
    const demoRows = order.map((k, i) => {
      const on = s.t > typeEnd + 6 + i * 7;
      return {
        name: P[k][0],
        color: P[k][1],
        bg: `url(/logos/white/${k}.svg)`,
        note: P[k][2],
        divider: i ? '1px solid #22252a' : '0',
        st: on ? 'Scheduled ✓' : s.t > typeEnd ? 'Queuing…' : '—',
        stColor: on ? '#dcff2e' : '#6b7079',
      };
    });
    const invalid = s.tried && !this.valid();
    const submit = (e) => {
      e && e.preventDefault && e.preventDefault();
      if (!this.valid()) {
        this.setState({ tried: true });
        (s.sheet ? this.sheetRef : this.emailRef).current?.focus();
        return;
      }
      // Continue to sign-up with the email filled in.
      this.setState({ done: true, tried: false });
      const q = new URLSearchParams({ email: this.state.email.trim() });
      window.location.href = `/signup?${q}`;
    };
    const plans = {
      solo: [
        'Solo',
        '$19',
        [
          '15 connected accounts',
          'Unlimited posts & scheduling',
          'Per-platform captions',
          'API + MCP access',
          'Basic analytics',
        ],
        19,
      ],
      studio: [
        'Studio',
        '$59',
        ['Everything in Solo', '100 connected accounts', 'Team members', 'Priority support'],
        59,
      ],
    };
    const pl = plans[s.plan];
    const faqs = [
      [
        'Which platforms can I post to?',
        'X, Bluesky, Instagram, LinkedIn, Threads, TikTok, YouTube, Facebook, Pinterest and Google Business Profile.',
      ],
      [
        'Can I change a post for one platform?',
        'Yes. Write one caption, then tailor it per platform. Edits to one never touch the others.',
      ],
      [
        'What happens if a post fails?',
        'You get an alert right away with the reason, and a one-tap retry or reconnect.',
      ],
      ['Is there an API?', 'Every workspace includes a REST API and an MCP server.'],
      [
        'Do I need a card for the trial?',
        'Yes. Add a card to start the 7-day free trial. You are not charged until day 8, and you can cancel before then.',
      ],
      ['Can I cancel?', 'Cancel anytime. There is no contract.'],
    ];
    const PK = [
      'instagram',
      'x',
      'linkedin',
      'tiktok',
      'facebook',
      'youtube',
      'threads',
      'bluesky',
      'pinterest',
      'googlemybusiness',
    ];
    const nPick = s.picks.length,
      accN = s.accTouched ? s.accN : Math.max(s.accN, nPick || 0);
    const manualMin = s.ppw * accN * 2,
      toolMin = s.ppw * 2,
      savedMin = Math.max(0, manualMin - toolMin);
    const fmtT = (m) => {
      if (m < 60) return `${m} min`;
      const h = (m / 60).toFixed(m >= 600 ? 0 : 1).replace('.0', '');
      return `${h} hr${h === '1' ? '' : 's'}`;
    };
    const yearH = Math.round((savedMin * 52) / 60);
    const price = (s.plan === 'studio' ? 59 : 19) * (s.yearly ? 10 / 12 : 1),
      hrsMonth = (savedMin * 4.33) / 60;
    const ctaLabel = s.done
      ? 'One moment…'
      : nPick
        ? `Start posting to ${nPick} platform${nPick === 1 ? '' : 's'}`
        : 'Start free trial';
    return {
      pickers: PK.map((k) => {
        const on = s.picks.includes(k);
        return {
          name: P[k][0],
          pressed: on ? 'true' : 'false',
          border: on ? '#dcff2e' : '#2a2e34',
          bg: on ? P[k][1] : '#0f1113',
          op: on ? 1 : 0.55,
          check: on ? 'grid' : 'none',
          logo: `url(/logos/white/${k}.svg)`,
          toggle: () => this.setState((st) => ({ picks: on ? st.picks.filter((x) => x !== k) : [...st.picks, k] })),
        };
      }),
      pickHint: nPick ? `${nPick} selected` : 'Tap all that apply',
      hasPicks: nPick > 0,
      pickedLogos: s.picks.slice(0, 6).map((k) => ({ color: P[k][1], logo: `url(/logos/white/${k}.svg)` })),
      pickSummary: `${nPick} platform${nPick === 1 ? '' : 's'} ready to connect`,
      progW: s.done ? '100%' : nPick ? '66%' : '33%',
      progLabel: s.done ? 'Opening…' : nPick ? 'Last step' : 'Step 1 of 2',
      ppw: s.ppw,
      accN,
      onPpw: (e) => this.setState({ ppw: +e.target.value }),
      onAccN: (e) => this.setState({ accN: +e.target.value, accTouched: true }),
      manualLabel: fmtT(manualMin),
      manualSub: 'per week',
      toolLabel: fmtT(toolMin),
      toolSub: 'per week',
      yearLabel: `${yearH} hours`,
      savedLabel: fmtT(savedMin),
      perDay: `$${(price / 30).toFixed(2)}`,
      perHour: hrsMonth > 0 ? `$${Math.max(0.01, price / hrsMonth).toFixed(2)}` : `$${price}`,
      quotes: [
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
      ],
      bottomPad: s.showBar ? '84px' : '0',
      headBorder: s.scrolled ? '#22252a' : 'transparent',
      heroLogos: ['instagram', 'x', 'linkedin', 'tiktok', 'youtube'].map((k) => ({
        color: P[k][1],
        bg: `url(/logos/white/${k}.svg)`,
      })),
      typed: cap.slice(0, chars),
      caretOp: chars < cap.length || s.t % 14 < 7 ? 1 : 0,
      demoRows,
      email: s.email,
      onEmail: (e) => this.setState({ email: e.target.value }),
      emailRef: this.emailRef,
      sheetRef: this.sheetRef,
      invalid: invalid ? 'true' : 'false',
      showErr: invalid,
      inputBorder: invalid ? '#ff8a8f' : '#3a3e45',
      ctaLabel,
      submit,
      notSignedUp: true,
      signedUp: false,
      steps: [
        [
          '1',
          'Connect your accounts',
          'Link up to 15 accounts across ten platforms. Several per platform is fine.',
          '#dcff2e',
          '#15171a',
          '#dcff2e',
        ],
        [
          '2',
          'Write once, tweak per platform',
          'One caption with per-platform edits, limit checks and a live preview.',
          '#15171a',
          '#f6f5f1',
          '#2a2e34',
        ],
        [
          '3',
          'The queue posts on time',
          'Drop posts into your slots. Drag them around the calendar whenever plans change.',
          '#15171a',
          '#f6f5f1',
          '#2a2e34',
        ],
      ].map(([n, title, body, bg, fg, border]) => ({ n, title, body, bg, fg, border })),
      features: [
        ['Bulk upload', 'Drop a week of images and videos and spread them across your slots.'],
        ['Drag-and-drop calendar', 'Week and month views. Move a post by dragging it to another day.'],
        ['Failed-post alerts', 'See exactly what went wrong and fix it in one tap.'],
        ['Approvals', 'Send posts for review before they go out. Built for clients and teams.'],
        ['Multi-account dashboard', 'Every brand and client in one place, with separate workspaces.'],
      ].map(([title, body], i) => ({ n: String(i + 1).padStart(2, '0'), title, body })),
      plans: Object.entries(plans).map(([k, v]) => ({
        name: v[0],
        sel: s.plan === k ? 'true' : 'false',
        bg: s.plan === k ? '#dcff2e' : 'transparent',
        fg: s.plan === k ? '#15171a' : '#a7abb2',
        pick: () => this.setState({ plan: k }),
      })),
      planPrice: s.yearly ? '$' + +((pl[3] * 10) / 12).toFixed(2) : pl[1],
      planBilled: s.yearly ? `$${pl[3] * 10} billed yearly · save $${pl[3] * 2}` : 'Billed monthly',
      moPressed: s.yearly ? 'false' : 'true',
      yrPressed: s.yearly ? 'true' : 'false',
      moBg: s.yearly ? 'transparent' : '#dcff2e',
      moFg: s.yearly ? '#a7abb2' : '#15171a',
      yrBg: s.yearly ? '#dcff2e' : 'transparent',
      yrFg: s.yearly ? '#15171a' : '#a7abb2',
      pickMonthly: () => this.setState({ yearly: false }),
      pickYearly: () => this.setState({ yearly: true }),
      planFeatures: pl[2],
      planBorder: s.plan === 'studio' ? '#dcff2e' : '#2a2e34',
      faqs: faqs.map(([q, a], i) => ({
        q,
        a,
        open: s.faq === i ? 'true' : 'false',
        display: s.faq === i ? 'block' : 'none',
        rot: s.faq === i ? 45 : 0,
        toggle: () => this.setState({ faq: s.faq === i ? -1 : i }),
      })),
      barY: s.showBar && !s.sheet && !s.done ? 0 : 110,
      barPE: s.showBar && !s.sheet && !s.done ? 'auto' : 'none',
      sheetOpen: s.sheet,
      sheetPlan: s.yearly
        ? `${pl[0]} plan · $${pl[3] * 10}/year after the trial`
        : `${pl[0]} plan · ${pl[1]}/mo after the trial`,
      openSheet: () => {
        this.setState({ sheet: true });
        setTimeout(() => this.sheetRef.current?.focus(), 80);
      },
      closeSheet: () => this.setState({ sheet: false }),
    };
  }
}

Component.defaultProps = { ...{}, ...(Component.defaultProps || {}) };
Component.prototype.render = function () {
  const vals = { ...this.props, ...(this.renderVals() || {}) };
  return (
    <div id="dc-root">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="sc-host">{renderLandingMobile(vals)}</div>
    </div>
  );
};

export default Component;
