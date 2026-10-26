/**
 * Username rule checks per platform. These only check the format: none of these platforms offers a
 * public availability check, so the widget links to the profile URL instead (where one exists).
 *
 * Each rule: label, noun (username/handle), min/max length, `allowed` (whole-handle regex),
 * allowedText, and optional flags: lower (stored lowercase), startLetter, startAlnum, noEdge
 * (characters a handle can't start or end with), noDouble (characters that can't repeat),
 * maxUnderscores, profile(handle) → URL (null when the platform has no public URL by name).
 */
export const HANDLE_RULES = {
  instagram: { label: 'Instagram', noun: 'handle', min: 1, max: 30, allowed: /^[a-z0-9._]+$/i, allowedText: 'letters, numbers, periods and underscores', noStartDot: true, noEndDot: true, noDouble: '.', profile: (h) => `https://www.instagram.com/${h}/` },
  tiktok: { label: 'TikTok', noun: 'username', min: 2, max: 24, allowed: /^[a-z0-9._]+$/i, allowedText: 'letters, numbers, underscores and periods', noEndDot: true, profile: (h) => `https://www.tiktok.com/@${h}` },
  x: { label: 'X', noun: 'username', min: 4, max: 15, allowed: /^[a-z0-9_]+$/i, allowedText: 'letters, numbers and underscores', profile: (h) => `https://x.com/${h}` },
  youtube: { label: 'YouTube', noun: 'handle', min: 3, max: 30, allowed: /^[\p{L}\p{N}._·-]+$/u, allowedText: 'letters, numbers, underscores, hyphens and periods', profile: (h) => `https://www.youtube.com/@${h}` },
  twitch: { label: 'Twitch', noun: 'username', min: 4, max: 25, allowed: /^[a-z0-9_]+$/i, allowedText: 'letters, numbers and underscores', startAlnum: true, profile: (h) => `https://www.twitch.tv/${h.toLowerCase()}` },
  discord: { label: 'Discord', noun: 'username', min: 2, max: 32, allowed: /^[a-z0-9._]+$/, allowedText: 'lowercase letters, numbers, underscores and periods', lower: true, noDouble: '.', profile: null },
  roblox: { label: 'Roblox', noun: 'username', min: 3, max: 20, allowed: /^[a-z0-9_]+$/i, allowedText: 'letters, numbers and one underscore', maxUnderscores: 1, noEdgeUnderscore: true, profile: (h) => `https://www.roblox.com/search/users?keyword=${encodeURIComponent(h)}` },
  telegram: { label: 'Telegram', noun: 'username', min: 5, max: 32, allowed: /^[a-z0-9_]+$/i, allowedText: 'letters, numbers and underscores', startLetter: true, noEdgeUnderscore: 'end', profile: (h) => `https://t.me/${h}` },
  reddit: { label: 'Reddit', noun: 'username', min: 3, max: 20, allowed: /^[a-z0-9_-]+$/i, allowedText: 'letters, numbers, underscores and hyphens', profile: (h) => `https://www.reddit.com/user/${h}/` },
};

/** Platforms the all-in-one username checker tests, in display order. */
export const ALL_HANDLE_PLATFORMS = ['instagram', 'tiktok', 'x', 'youtube', 'twitch', 'discord', 'roblox', 'telegram', 'reddit'];

/** Returns { handle, ok, problems[], tips[] } for the cleaned handle (leading @ and spaces removed). */
export function checkHandle(raw, platform = 'instagram') {
  const rule = HANDLE_RULES[platform] || HANDLE_RULES.instagram;
  let handle = String(raw ?? '').trim().replace(/^@+/, '');
  // Discord stores usernames in lowercase; capitals are converted, not rejected.
  if (rule.lower) handle = handle.toLowerCase();
  const problems = [];
  const len = Array.from(handle).length;
  if (!handle) return { handle, ok: false, problems: ['Type a handle to check.'] };
  if (len < rule.min) problems.push(`Too short: ${rule.label} needs at least ${rule.min} characters.`);
  if (len > rule.max) problems.push(`Too long: ${len} characters, the limit is ${rule.max}.`);
  if (/\s/.test(handle)) problems.push('Spaces aren’t allowed.');
  if (!rule.allowed.test(handle.replace(/\s/g, ''))) problems.push(`Only ${rule.allowedText} are allowed.`);
  if (rule.noEndDot && handle.endsWith('.')) problems.push('It can’t end with a period.');
  if (rule.noStartDot && handle.startsWith('.')) problems.push('It can’t start with a period.');
  if (rule.noDouble === '.' && handle.includes('..')) problems.push('Two periods in a row aren’t allowed.');
  if (rule.startAlnum && handle.startsWith('_')) problems.push('It can’t start with an underscore.');
  if (rule.startLetter && !/^[a-z]/i.test(handle)) problems.push('It has to start with a letter.');
  if (rule.noEdgeUnderscore === true && (handle.startsWith('_') || handle.endsWith('_'))) problems.push('It can’t start or end with an underscore.');
  if (rule.noEdgeUnderscore === 'end' && handle.endsWith('_')) problems.push('It can’t end with an underscore.');
  if (rule.maxUnderscores !== undefined && (handle.match(/_/g) || []).length > rule.maxUnderscores) problems.push(`Only ${rule.maxUnderscores === 1 ? 'one underscore is' : `${rule.maxUnderscores} underscores are`} allowed.`);
  // Advice, not a platform rule: shown alongside the result without failing it.
  const tips = /^[._0-9-]+$/.test(handle) ? ['Tip: add at least one letter so people can find and remember it.'] : [];
  return { handle, ok: problems.length === 0, problems, tips };
}

/** One handle against every platform: [{ platform, label, ok, problems, profile }]. */
export function checkEverywhere(raw, platforms = ALL_HANDLE_PLATFORMS) {
  return platforms.map((p) => {
    const rule = HANDLE_RULES[p];
    const r = checkHandle(raw, p);
    return { platform: p, label: rule.label, ...r, profile: r.ok && rule.profile ? rule.profile(r.handle) : null };
  });
}

/** A pasted list (one per line, or separated by commas), checked line by line. Duplicates are dropped. */
export function checkList(text, platform = 'instagram', limit = 200) {
  const seen = new Set();
  const out = [];
  for (const raw of String(text ?? '').split(/[\n,]+/)) {
    const r = checkHandle(raw, platform);
    if (!r.handle || seen.has(r.handle.toLowerCase())) continue;
    seen.add(r.handle.toLowerCase());
    out.push(r);
    if (out.length >= limit) break;
  }
  return out;
}

/** Close valid variations of a handle, for when the one you want is taken or invalid. */
export function handleVariations(raw, platform = 'instagram', count = 12) {
  const rule = HANDLE_RULES[platform] || HANDLE_RULES.instagram;
  const base = String(raw ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/^@+/, '')
    .replace(/[^a-z0-9._]+/g, '')
    .replace(/\.{2,}/g, '.')
    .replace(/^[._]+|[._]+$/g, '')
    .slice(0, rule.max - 4) || 'yourname';
  const cands = [
    `${base}_`, `_${base}`, `the${base}`, `its${base}`, `${base}hq`, `${base}.co`, `real${base}`,
    `${base}_daily`, `hey${base}`, `${base}.studio`, `${base}_`.replace(/_$/, 'x'), `${base}.app`, `by${base}`, `${base}26`, `${base}.tv`,
    `${base}live`, `${base}tv`, `${base}_hq`, `iam${base}`, `${base}official`, `${base}plays`,
  ];
  const seen = new Set();
  return cands.filter((c) => {
    const ok = checkHandle(c, platform).ok && c !== base && !seen.has(c);
    seen.add(c);
    return ok;
  }).slice(0, count);
}
