/**
 * Reads the followers / following files from Instagram's "Download your information" export
 * (JSON or HTML) and compares them. Pure functions: the widget reads files in the browser.
 */

const fromHref = (href) => {
  const m = /instagram\.com\/(?:_u\/)?([A-Za-z0-9._]+)\/?/.exec(String(href || ''));
  return m ? m[1] : '';
};

function collectJson(node, out) {
  if (Array.isArray(node)) {
    for (const n of node) collectJson(n, out);
    return;
  }
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node.string_list_data)) {
    for (const d of node.string_list_data) {
      const name = d?.value || fromHref(d?.href) || node.title || '';
      if (name) out.add(String(name).toLowerCase());
    }
    if (!node.string_list_data.length && node.title) out.add(String(node.title).toLowerCase());
    return;
  }
  for (const v of Object.values(node)) collectJson(v, out);
}

/**
 * Detects which list a file is and returns its usernames.
 * kind: 'followers' | 'following' | 'unknown' (unknown files are still parsed).
 */
export function parseExport(text, fileName = '') {
  const name = String(fileName).toLowerCase();
  const usernames = new Set();
  let kind = /following/.test(name) ? 'following' : /followers/.test(name) ? 'followers' : 'unknown';
  const src = String(text ?? '').trim();
  if (src.startsWith('{') || src.startsWith('[')) {
    let data;
    try {
      data = JSON.parse(src);
    } catch {
      return { kind, usernames, error: 'This file isn’t valid JSON.' };
    }
    if (data && !Array.isArray(data) && data.relationships_following) kind = 'following';
    if (Array.isArray(data) && kind === 'unknown') kind = 'followers';
    collectJson(data, usernames);
  } else {
    for (const m of src.matchAll(/href="([^"]*instagram\.com[^"]*)"/g)) {
      const u = fromHref(m[1]);
      if (u) usernames.add(u.toLowerCase());
    }
    if (kind === 'unknown' && /Following/.test(src) && !/Followers/.test(src)) kind = 'following';
  }
  usernames.delete('');
  return { kind, usernames };
}

export function compareLists(followers, following) {
  const notBack = [...following].filter((u) => !followers.has(u)).sort();
  const fans = [...followers].filter((u) => !following.has(u)).sort();
  return { notBack, fans, mutual: [...following].filter((u) => followers.has(u)).length };
}
