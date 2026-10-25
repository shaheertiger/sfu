/**
 * Share-to-queue. The dashboard can be opened as /app?share=1&title=…&text=…&url=… by the installed
 * app's Share target (manifest.js), by the bookmarklet on the Automations page, or by hand. These
 * helpers turn those parameters into a caption draft; nothing here touches the network.
 */

/** Query parameters a share can carry. Anything else is ignored. */
export const SHARE_KEYS = ['share', 'title', 'text', 'url'];

export function isShare(params) {
  return SHARE_KEYS.some((k) => params.has(k));
}

/**
 * Caption from a share: the shared text (or the page title when there is none), then the link on its
 * own line unless the text already contains it. Some apps put the URL in `text`; that is kept as is.
 */
export function shareCaption(params) {
  const get = (k) => String(params.get(k) ?? '').trim();
  const url = pickUrl(get('url')) || pickUrl(get('text'));
  const text = get('text') || get('title');
  const body = text && url && text !== url && !text.includes(url) ? `${text}\n\n${url}` : text || url;
  return body.slice(0, 5000);
}

/** Only http(s) links are kept; a bare or odd value is dropped. */
export function pickUrl(value) {
  const v = String(value ?? '').trim();
  if (!/^https?:\/\//i.test(v)) return '';
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : '';
  } catch {
    return '';
  }
}

/** The bookmarklet: opens the composer with the current page's title, selection and address. */
export function bookmarklet(appUrl) {
  const base = String(appUrl || '').replace(/\/$/, '');
  return `javascript:void(open(${JSON.stringify(base + '/app?share=1')}+'&title='+encodeURIComponent(document.title)+'&text='+encodeURIComponent(String(getSelection()))+'&url='+encodeURIComponent(location.href)))`;
}
