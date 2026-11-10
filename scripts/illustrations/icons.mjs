/**
 * The figure icon set: one drawing style for every card. 24-unit grid, 1.75-unit stroke, round caps
 * and joins, no fills except where a shape needs one (record-dot). Drawn for this site; platforms
 * never get an icon or logo, only their name in type.
 */
const P = {
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  send: '<path d="M21 3 10.5 13.5"/><path d="m21 3-6.5 18-4-7.5L3 9.5z"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-10 9"/>',
  video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10.5 5-3v9l-5-3"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  'chart-up': '<path d="M4 4v16h16"/><path d="m7.5 15 4-4 3 3 5.5-5.5"/><path d="M16 8.5h4v4"/>',
  bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
  'bell-off': '<path d="M6 16v-5a6 6 0 0 1 9.5-4.9M18 11v5l2 2H8"/><path d="M10 21h4M3 3l18 18"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  'eye-off': '<path d="M9.9 5.2A9.9 9.9 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-2.6 3.5M6.6 6.6C3.6 8.4 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6"/><path d="M3 3l18 18M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  'camera-shutter': '<path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4"/><circle cx="12" cy="12" r="3.5"/>',
  'record-dot': '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/>',
  bookmark: '<path d="M6 3h12v18l-6-4.5L6 21z"/>',
  'user-plus': '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M19 8v6M16 11h6"/>',
  'user-minus': '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 11h6"/>',
  block: '<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>',
  mute: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="m17 9 5 6M22 9l-5 6"/>',
  shield: '<path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
  cross: '<path d="M6 6l12 12M18 6 6 18"/>',
  at: '<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/>',
  type: '<path d="M5 7V5h14v2M12 5v14M9 19h6"/>',
  tilde: '<path d="M5 13.5c1.8-3 4.2-3 6 0s4.2 3 6 0"/>',
  dot: '<circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>',
};

export const ICON_NAMES = Object.keys(P);

/** Inline SVG for an icon at `size` px; the stroke scales with it (1.75 / 24 of the size). */
export function icon(name, size = 48, cls = '') {
  const body = P[name];
  if (!body) throw new Error(`Unknown icon "${name}"`);
  return `<svg class="ic${cls ? ` ${cls}` : ''}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

/** Icons that hint at a topic, picked from the words of a title or sub (hero clusters). */
const TOPIC = [
  [/username|handle|name/i, 'at'], [/font|text|bold|bio|caption|comment|character|strikethrough|title|tag/i, 'type'],
  [/screenshot|screen ?shot/i, 'camera-shutter'], [/record/i, 'record-dot'], [/notif|alert|tell/i, 'bell'], [/silent|no alert|never (?:reported|told)/i, 'bell-off'],
  [/view|see|watch|seen|visible|look/i, 'eye'], [/hid|private|anonym|invisible/i, 'eye-off'], [/save|bookmark|favou?rite/i, 'bookmark'], [/\bfollow/i, 'user-plus'],
  [/unfollow|remove/i, 'user-minus'], [/block|ban/i, 'block'], [/mute/i, 'mute'], [/safe|privacy|secur|scam|risk/i, 'shield'], [/countr|global|world|time ?zone/i, 'globe'],
  [/time|hour|when|day|week|schedul/i, 'clock'], [/calendar|plan|date|month/i, 'calendar'], [/post|publish|send|share|dm|message/i, 'send'], [/image|photo|picture|size|resiz|banner|thumbnail|pfp/i, 'image'],
  [/video|reel|short|clip|live/i, 'video'], [/link|url|embed/i, 'link'], [/grow|reach|views|pay|money|earn|follower|engag|analytic|rank/i, 'chart-up'],
];
export function topicIcons(text, n = 3) {
  const out = [];
  for (const [re, name] of TOPIC) if (re.test(text) && !out.includes(name)) out.push(name);
  for (const fill of ['calendar', 'clock', 'send']) if (out.length < n && !out.includes(fill)) out.push(fill);
  return out.slice(0, n);
}
