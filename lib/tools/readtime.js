/**
 * Script length and read-aloud time for captions and video scripts. Pure functions, no DOM.
 *
 * Japanese is counted in characters (kana and kanji, not spaces or punctuation) and everything
 * else in words, because that is how each is paced: about 300 characters a minute for a Japanese
 * announcer (the figure usually cited for NHK news) and about 150 words a minute for English.
 * A mixed script is the sum of the two.
 */

/** Speaking pace: Japanese characters per minute and words per minute. */
export const PACES = {
  slow: { ja: 250, en: 130 },
  normal: { ja: 300, en: 150 },
  fast: { ja: 350, en: 170 },
};

/** Silent reading speed (Japanese ~500 characters/min, English ~238 words/min). */
export const READING = { ja: 500, en: 238 };

/** Target lengths in seconds offered as chips. */
export const TARGETS = [15, 30, 60, 90, 180, 300];

// Hiragana, katakana (incl. half-width), kanji, the prolonged sound mark ー and the iteration marks.
const JA_RE = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}ーｰ々〆〻ゝゞヽヾ]/gu;
// A word: letters/digits of any other script, joined by apostrophes, hyphens or decimal points.
const WORD_RE = /[\p{L}\p{N}]+(?:['’.\-][\p{L}\p{N}]+)*/gu;

/** { ja: Japanese characters, words: words in any other script, chars: characters without spaces }. */
export function countScript(text) {
  const str = String(text || '');
  const ja = (str.match(JA_RE) || []).length;
  const rest = str.replace(JA_RE, ' ');
  const words = (rest.match(WORD_RE) || []).length;
  const chars = Array.from(str.replace(/\s+/g, '')).length;
  return { ja, words, chars };
}

const paceOf = (pace) => (typeof pace === 'object' && pace ? pace : PACES[pace] || PACES.normal);

/** Seconds to say the script aloud at a pace ('slow' | 'normal' | 'fast' or { ja, en }). */
export function speakingSeconds(counts, pace = 'normal') {
  const p = paceOf(pace);
  return (counts.ja / p.ja + counts.words / p.en) * 60;
}

/** Seconds to read the script silently. */
export function readingSeconds(counts) {
  return (counts.ja / READING.ja + counts.words / READING.en) * 60;
}

/** 75 → "1:15", 3725 → "1:02:05". Rounds to the nearest second. */
export function formatDuration(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = String(total % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

/** 15 → "15s", 180 → "3 min", 90 → "90s" (used for chip labels). */
export function targetLabel(seconds, locale = 'en') {
  const ja = locale === 'ja';
  if (seconds < 120 || seconds % 60) return ja ? `${seconds}秒` : `${seconds}s`;
  return ja ? `${seconds / 60}分` : `${seconds / 60} min`;
}

/**
 * How the script compares with a target length.
 * `unit` is the language that makes up most of the speaking time ('ja' characters or 'en' words;
 * `prefer` breaks the tie for an empty script). `fit` is how many of that unit fit in the target
 * once the other language's share is taken off, `diff` is current − fit (positive = over), and
 * `jaFit` / `enFit` are the capacity of the target in a script written in only one language.
 */
export function targetFit(counts, targetSeconds, pace = 'normal', prefer = 'en') {
  const p = paceOf(pace);
  const target = Math.max(0, Number(targetSeconds) || 0);
  const jaSec = (counts.ja / p.ja) * 60;
  const enSec = (counts.words / p.en) * 60;
  const unit = jaSec > enSec || (jaSec === enSec && prefer === 'ja') ? 'ja' : 'en';
  const otherSec = unit === 'ja' ? enSec : jaSec;
  const rate = unit === 'ja' ? p.ja : p.en;
  const fit = Math.max(0, Math.floor(((target - otherSec) * rate) / 60));
  const current = unit === 'ja' ? counts.ja : counts.words;
  const seconds = jaSec + enSec;
  return {
    unit,
    fit,
    current,
    diff: current - fit,
    seconds,
    diffSeconds: seconds - target,
    jaFit: Math.floor((target * p.ja) / 60),
    enFit: Math.floor((target * p.en) / 60),
  };
}
