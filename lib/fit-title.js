/**
 * Search titles. Google shows about 60-65 characters of a title and cuts the rest, so each generated title
 * lists versions from fullest to shortest and the first that fits is used. Every version keeps the playbook's
 * shape: the search question first, then the hook (the answer, the number, the year).
 */
export const TITLE_MAX = 65;

export function fitTitle(...versions) {
  const list = versions.flat().filter(Boolean);
  return list.find((t) => t.length <= TITLE_MAX) || list.reduce((a, b) => (b.length < a.length ? b : a));
}

/** The name people search with, where the full one is long: "Google Business Profile" → "Google Business". */
export const shortPlatform = (name) =>
  ({ 'Google Business Profile': 'Google Business', 'X (Twitter)': 'X' })[name] || name;

const SMALL = new Set(['a', 'an', 'and', 'or', 'the', 'of', 'for', 'to', 'in', 'on', 'at', 'by', 'with']);
/** Title Case for a phrase inside a title ("accounting firms" → "Accounting Firms"). */
export const titleCase = (s) =>
  String(s).replace(/\S+/g, (w, i) => (i > 0 && SMALL.has(w.toLowerCase()) ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1)));
