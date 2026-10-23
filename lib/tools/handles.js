/**
 * Username rule checks for Instagram and TikTok. These only check the format: neither platform
 * offers a public availability check, so the widget links to the profile URL instead.
 */

export const HANDLE_RULES = {
  instagram: { label: 'Instagram', min: 1, max: 30, allowed: /^[a-z0-9._]+$/i, allowedText: 'letters, numbers, periods and underscores', profile: (h) => `https://www.instagram.com/${h}/` },
  tiktok: { label: 'TikTok', min: 2, max: 24, allowed: /^[a-z0-9._]+$/i, allowedText: 'letters, numbers, underscores and periods', profile: (h) => `https://www.tiktok.com/@${h}` },
};

/** Returns { handle, ok, problems[] } for the cleaned handle (leading @ and spaces removed). */
export function checkHandle(raw, platform = 'instagram') {
  const rule = HANDLE_RULES[platform] || HANDLE_RULES.instagram;
  const handle = String(raw ?? '').trim().replace(/^@+/, '');
  const problems = [];
  const len = Array.from(handle).length;
  if (!handle) return { handle, ok: false, problems: ['Type a handle to check.'] };
  if (len < rule.min) problems.push(`Too short: ${rule.label} needs at least ${rule.min} characters.`);
  if (len > rule.max) problems.push(`Too long: ${len} characters, the limit is ${rule.max}.`);
  if (/\s/.test(handle)) problems.push('Spaces aren’t allowed.');
  if (!rule.allowed.test(handle.replace(/\s/g, ''))) problems.push(`Only ${rule.allowedText} are allowed.`);
  if (handle.endsWith('.')) problems.push('It can’t end with a period.');
  if (platform === 'instagram') {
    if (handle.startsWith('.')) problems.push('It can’t start with a period.');
    if (handle.includes('..')) problems.push('Two periods in a row aren’t allowed.');
  }
  if (/^[._0-9]+$/.test(handle)) problems.push('Use at least one letter so people can find and remember it.');
  return { handle, ok: problems.length === 0, problems };
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
  ];
  const seen = new Set();
  return cands.filter((c) => {
    const ok = checkHandle(c, platform).ok && c !== base && !seen.has(c);
    seen.add(c);
    return ok;
  }).slice(0, count);
}
