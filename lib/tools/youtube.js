/** Rule-based YouTube helpers: a transparent title checklist and a tag idea builder. No AI. */

const SPECIFIC = /\b(how|why|what|guide|tutorial|tips|steps|mistakes|ways|ideas|explained|vs|review|best|easy|quick|fast|beginner|beginners|complete|ultimate|simple|before|after|without|in \d+|minutes|days|hours)\b/i;

export const TITLE_LIMIT = 100;
export const TITLE_IDEAL = 70;

/** Scores a title out of 100. Each check returns { id, label, pass, tip, weight }. */
export function checkTitle(title, keyword = '') {
  const t = String(title ?? '').trim();
  const k = String(keyword ?? '').trim().toLowerCase();
  const len = Array.from(t).length;
  const letters = t.replace(/[^A-Za-z]/g, '');
  const upper = letters.replace(/[^A-Z]/g, '').length;
  const emoji = (t.match(/\p{Extended_Pictographic}/gu) || []).length;
  const kwPos = k ? t.toLowerCase().indexOf(k) : -1;
  const checks = [
    { id: 'limit', weight: 20, label: `Within YouTube’s ${TITLE_LIMIT}-character limit`, pass: len > 0 && len <= TITLE_LIMIT, tip: len > TITLE_LIMIT ? `Cut ${len - TITLE_LIMIT} characters: YouTube won’t accept it.` : 'Write a title first.' },
    { id: 'ideal', weight: 15, label: `${TITLE_IDEAL} characters or fewer, so it isn’t cut off`, pass: len > 0 && len <= TITLE_IDEAL, tip: 'Longer titles are often truncated in search and suggestions. Put the key words first.' },
    { id: 'notTooShort', weight: 5, label: 'Long enough to say what the video is', pass: len >= 20, tip: 'Very short titles rarely tell viewers what they’ll get.' },
    k
      ? { id: 'keyword', weight: 20, label: 'Keyword in the first half', pass: kwPos >= 0 && kwPos <= len / 2, tip: kwPos < 0 ? `Include “${keyword.trim()}” in the title.` : 'Move the keyword nearer the start.' }
      : { id: 'keyword', weight: 20, label: 'Keyword in the first half', pass: null, tip: 'Add a target keyword above to run this check.' },
    { id: 'number', weight: 10, label: 'Includes a number', pass: /\d/.test(t), tip: 'Numbers (steps, time, year, results) make the payoff concrete.' },
    { id: 'specific', weight: 10, label: 'Uses a specific or benefit word', pass: SPECIFIC.test(t), tip: 'Words like “how”, “mistakes”, “in 10 minutes” or “for beginners” tell viewers what they’ll get.' },
    { id: 'caps', weight: 10, label: 'Not shouting (under half capitals)', pass: letters.length === 0 || upper / letters.length < 0.5, tip: 'Capitalize one word for emphasis at most.' },
    { id: 'punct', weight: 5, label: 'No piled-up punctuation', pass: !/[!?]{2,}/.test(t), tip: 'Replace “!!!” or “???” with one mark, or none.' },
    { id: 'emoji', weight: 3, label: 'Two emoji or fewer', pass: emoji <= 2, tip: 'Emoji take space and can look spammy in search.' },
    { id: 'brackets', weight: 2, label: 'Uses brackets or parentheses for context', pass: /[([{].+[)\]}]/.test(t), tip: 'Optional: “(2026 update)” or “[Full guide]” can add context.' },
  ];
  const scored = checks.filter((c) => c.pass !== null);
  const total = scored.reduce((s, c) => s + c.weight, 0);
  const got = scored.reduce((s, c) => s + (c.pass ? c.weight : 0), 0);
  return { length: len, score: t ? Math.round((got / total) * 100) : 0, checks };
}

export const TAG_LIMIT = 500;

/** YouTube counts commas between tags and adds quotes around tags that contain spaces. */
export function tagsLength(tags) {
  return tags.reduce((n, t, i) => n + Array.from(t).length + (/\s/.test(t) ? 2 : 0) + (i ? 1 : 0), 0);
}

/** Tag ideas built from templates, kept within the 500-character limit. */
export function generateTags(topic, extra = '', year = new Date().getFullYear()) {
  const k = String(topic ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (!k) return [];
  const extras = String(extra ?? '')
    .split(/[,\n]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const words = k.split(' ');
  const ideas = [
    k, ...extras, `how to ${k}`, `${k} tutorial`, `${k} for beginners`, `${k} tips`, `best ${k}`, `${k} ${year}`, `${k} explained`,
    `${k} guide`, `${k} step by step`, `easy ${k}`, `${k} mistakes`, `${k} ideas`, `learn ${k}`,
    ...(words.length > 1 ? [words.join('')] : []),
    ...extras.map((e) => `${k} ${e}`),
  ];
  const out = [];
  const seen = new Set();
  for (const tag of ideas) {
    const t = tag.slice(0, 100);
    if (seen.has(t)) continue;
    if (tagsLength([...out, t]) > TAG_LIMIT) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}
