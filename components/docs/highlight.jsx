import s from './docs.module.css';

/**
 * A tiny syntax highlighter for the code samples on /docs. Runs on the server, so the page ships
 * no highlighting library. It only needs to cope with the samples in lib/api-reference.js.
 */
const STR = {
  double: /"(?:[^"\\\n]|\\.)*"/y,
  single: /'(?:[^'\\]|\\.)*'/y,
  backtick: /`(?:[^`\\]|\\.)*`/y,
};
const NUM = /-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/y;
const WORD = /[A-Za-z_$][\w$]*/y;

const LANGS = {
  json: { rules: [[/"(?:[^"\\]|\\.)*"(?=\s*:)/y, 'key'], [STR.double, 'str'], [NUM, 'num'], [WORD, 'word']], keywords: ['true', 'false', 'null'] },
  javascript: {
    rules: [[/\/\/[^\n]*/y, 'com'], [STR.single, 'str'], [STR.double, 'str'], [STR.backtick, 'str'], [WORD, 'word'], [NUM, 'num']],
    keywords: ['const', 'let', 'await', 'async', 'import', 'from', 'export', 'function', 'return', 'new', 'if', 'true', 'false', 'null'],
  },
  python: {
    rules: [[/#[^\n]*/y, 'com'], [STR.double, 'str'], [STR.single, 'str'], [WORD, 'word'], [NUM, 'num']],
    keywords: ['import', 'from', 'def', 'return', 'if', 'not', 'and', 'or', 'for', 'in', 'True', 'False', 'None'],
  },
  bash: {
    rules: [[/(?:^|(?<=\s))#[^\n]*/y, 'com'], [STR.single, 'str'], [STR.double, 'str'], [/(?<=\s)--?[A-Za-z][\w-]*/y, 'attr'], [WORD, 'word']],
    keywords: ['curl'],
  },
};

const CLASS = { key: s.tKey, str: s.tStr, num: s.tNum, kw: s.tKw, com: s.tCom, attr: s.tAttr };

export function highlight(code, lang = 'json') {
  const def = LANGS[lang] || LANGS.json;
  const kw = new Set(def.keywords);
  const out = [];
  let plain = '';
  let i = 0;
  const flush = () => {
    if (plain) out.push(plain);
    plain = '';
  };
  while (i < code.length) {
    let hit = null;
    for (const [re, kind] of def.rules) {
      re.lastIndex = i;
      const m = re.exec(code);
      if (m && m[0].length) {
        hit = { text: m[0], kind: kind === 'word' ? (kw.has(m[0]) ? 'kw' : null) : kind };
        break;
      }
    }
    if (!hit) {
      plain += code[i++];
      continue;
    }
    i += hit.text.length;
    if (!hit.kind) {
      plain += hit.text;
      continue;
    }
    flush();
    out.push(<span key={out.length} className={CLASS[hit.kind]}>{hit.text}</span>);
  }
  flush();
  return out;
}

/** Renders `code`, **bold** and [links](#anchor) inside a line of reference text. */
export function Inline({ text }) {
  const parts = String(text).split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g);
  return parts.map((p, i) => {
    if (!p) return null;
    if (p.startsWith('`') && p.endsWith('`') && p.length > 1) return <code key={i} className={s.ic}>{p.slice(1, -1)}</code>;
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(p);
    if (link) return <a key={i} href={link[2]}>{link[1]}</a>;
    return p;
  });
}
