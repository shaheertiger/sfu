// Converts a Claude Design .dc.html prototype into a React view + logic module.
// Usage: npm run design:convert  (or: node scripts/convert-design.mjs <in.dc.html> components <Name>)
import fs from 'node:fs';
import path from 'node:path';
import { parseDocument } from 'htmlparser2';
import * as prettier from 'prettier';

const [, , inFile, outDir, Name] = process.argv;
let src = fs.readFileSync(inFile, 'utf8');

// Asset + page links: make relative paths absolute for Next.js routes.
const fixPaths = (s) =>
  s
    .replace(/(["'(=\s])(logos|icons|uploads)\//g, '$1/$2/')
    .replace(/Schedule For You\.dc\.html/g, '/app')
    .replace(/Landing Page\.dc\.html/g, '/')
    .replace(/Logo\.dc\.html/g, '/brand');

const open = /<x-dc(?:\s[^>]*)?>/.exec(src);
const close = src.lastIndexOf('</x-dc>');
const template = fixPaths(src.slice(open.index + open[0].length, close));
const scriptM = /<script type="text\/x-dc" data-dc-script([^>]*)>([\s\S]*?)<\/script>/.exec(src);
const script = scriptM ? fixPaths(scriptM[2]) : '';
let propsMeta = {};
if (scriptM) {
  const pm = /data-props="([^"]*)"/.exec(scriptM[1]);
  if (pm) {
    const raw = pm[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    propsMeta = JSON.parse(raw);
  }
}
const defaults = {};
for (const [k, m] of Object.entries(propsMeta)) if (k[0] !== '$' && m && m.default !== undefined) defaults[k] = m.default;

const doc = parseDocument(template, { lowerCaseTags: false, lowerCaseAttributeNames: false, recognizeSelfClosing: true, decodeEntities: true });

// ---------- expressions (mirror of dc-runtime resolve()) ----------
const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*/;
function parensWrapWhole(e) { let d = 0; for (let i = 0; i < e.length - 1; i++) { if (e[i] === '(') d++; else if (e[i] === ')') { d--; if (d === 0) return false; } } return true; }
function topEq(e) {
  let d = 0;
  for (let i = 0; i < e.length; i++) {
    const c = e[i];
    if (c === '[' || c === '(') d++; else if (c === ']' || c === ')') d--;
    else if (d === 0 && (c === '=' || c === '!') && e[i + 1] === '=') {
      if (i > 0 && (e[i - 1] === '=' || e[i - 1] === '!')) continue;
      if (!e.slice(0, i).trim()) continue;
      return { index: i, op: e[i + 2] === '=' ? c + '==' : c + '=' };
    }
  }
  return null;
}
function expr(raw, scope) {
  const e = String(raw).trim();
  if (!e) return 'undefined';
  if (e[0] === '(' && e[e.length - 1] === ')' && parensWrapWhole(e)) return expr(e.slice(1, -1), scope);
  const eq = topEq(e);
  if (eq) return `(${expr(e.slice(0, eq.index), scope)} ${eq.op} ${expr(e.slice(eq.index + eq.op.length), scope)})`;
  if (e[0] === '!') return `!(${expr(e.slice(1), scope)})`;
  if (['true', 'false', 'null', 'undefined'].includes(e)) return e;
  if (/^-?\d+(\.\d+)?$/.test(e)) return e;
  if (e.length >= 2 && (e[0] === '"' || e[0] === "'") && e[e.length - 1] === e[0]) return JSON.stringify(e.slice(1, -1));
  const head = e.match(IDENT);
  if (!head) throw new Error('bad expr ' + e);
  let out = scope.includes(head[0]) ? head[0] : `$v[${JSON.stringify(head[0])}]`;
  let i = head[0].length;
  while (i < e.length) {
    if (e[i] === '.') {
      const m = e.slice(i + 1).match(IDENT) || e.slice(i + 1).match(/^\d+/);
      if (!m) throw new Error('bad path ' + e);
      out += /^\d/.test(m[0]) ? `?.[${m[0]}]` : `?.${m[0]}`;
      i += 1 + m[0].length;
    } else if (e[i] === '[') {
      let d = 1, j = i + 1;
      while (j < e.length && d > 0) { if (e[j] === '[') d++; else if (e[j] === ']') { d--; if (d === 0) break; } j++; }
      out += `?.[${expr(e.slice(i + 1, j), scope)}]`;
      i = j + 1;
    } else throw new Error('bad path ' + e);
  }
  return out;
}

// ---------- attributes ----------
const HOLE = /\{\{([\s\S]+?)\}\}/g;
const WHOLE = /^\s*\{\{([\s\S]+?)\}\}\s*$/;
const tl = (s) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
function mixed(raw, scope) {
  const parts = raw.split(HOLE);
  return '`' + parts.map((p, i) => (i & 1 ? '${' + expr(p, scope) + ' ?? ""}' : tl(p))).join('') + '`';
}
function attrExpr(raw, scope) {
  const w = raw.match(WHOLE);
  if (w) return expr(w[1], scope);
  if (raw.includes('{{')) return mixed(raw, scope);
  return JSON.stringify(raw);
}
const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
function splitDecls(css) {
  const out = []; let d = 0, q = '', start = 0, hole = 0;
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (css.startsWith('{{', i)) { hole++; i++; continue; }
    if (css.startsWith('}}', i)) { hole--; i++; continue; }
    if (hole) continue;
    if (q) { if (c === q) q = ''; continue; }
    if (c === '"' || c === "'") q = c; else if (c === '(') d++; else if (c === ')') d--;
    else if (c === ';' && d === 0) { out.push(css.slice(start, i)); start = i + 1; }
  }
  out.push(css.slice(start));
  return out;
}
let needSx = false;
function styleExpr(raw, scope) {
  const w = raw.match(WHOLE);
  if (w) { needSx = true; return `$sx(${expr(w[1], scope)})`; }
  // dc-runtime cssToObj splits on every ';' — mimic that for static text.
  const decls = raw.includes('{{') ? splitDecls(raw) : raw.split(';');
  const entries = [];
  for (const decl of decls) {
    const i = decl.indexOf(':');
    if (i < 0) { if (decl.includes('{{')) { needSx = true; return `$sx(${mixed(raw, scope)})`; } continue; }
    const prop = decl.slice(0, i).trim();
    if (prop.includes('{{')) { needSx = true; return `$sx(${mixed(raw, scope)})`; }
    const val = decl.slice(i + 1).trim();
    const key = prop.startsWith('--') ? prop : camel(prop);
    entries.push(`${JSON.stringify(key)}: ${val.includes('{{') ? mixed(val, scope) : JSON.stringify(val)}`);
  }
  return `{${entries.join(', ')}}`;
}

// pseudo-class sheet (style-hover etc.)
const pseudo = new Map();
function importantify(css) {
  return css.split(';').map((d) => d.trim()).filter(Boolean).map((d) => (/!important\s*$/.test(d) ? d : d + ' !important')).join(';');
}
function pseudoClass(kind, css) {
  if (css.includes('{{')) throw new Error('dynamic pseudo css unsupported: ' + css);
  const k = kind + '|' + css;
  if (!pseudo.has(k)) {
    const cls = `${Name.toLowerCase()}-${kind}-${pseudo.size.toString(36)}`;
    const el = kind === 'before' || kind === 'after';
    pseudo.set(k, { cls, rule: `.${cls}${el ? '::' : ':'}${kind}{${el ? css : importantify(css)}}` });
  }
  return pseudo.get(k).cls;
}

const ATTR_MAP = { class: 'className', for: 'htmlFor', tabindex: 'tabIndex', playsinline: 'playsInline', readonly: 'readOnly', maxlength: 'maxLength', minlength: 'minLength', autofocus: 'autoFocus', autocomplete: 'autoComplete', colspan: 'colSpan', rowspan: 'rowSpan', spellcheck: 'spellCheck', contenteditable: 'contentEditable', crossorigin: 'crossOrigin', srcset: 'srcSet', enctype: 'encType', novalidate: 'noValidate', 'xlink:href': 'xlinkHref', 'xml:space': 'xmlSpace', 'xmlns:xlink': 'xmlnsXlink' };
const VOID = new Set(['img', 'input', 'br', 'hr', 'meta', 'link', 'source', 'area', 'col', 'wbr', 'embed', 'track']);
const NO_WS = new Set(['table', 'thead', 'tbody', 'tfoot', 'tr', 'select', 'colgroup', 'ul', 'ol']);
const PLAIN_TEXT = new Set(['option', 'title', 'textarea']);

// helmet
const helmetCss = [], fontLinks = [];

function children(node, scope, parentTag) {
  return node.children.map((c) => walk(c, scope, parentTag)).filter((x) => x != null && x !== '');
}
function walk(node, scope, parentTag) {
  if (node.type === 'text') return text(node.data, scope, parentTag);
  if (node.type === 'comment') return null;
  if (node.type !== 'tag' && node.type !== 'script' && node.type !== 'style') return null;
  const tag = node.name;
  if (tag === 'helmet') {
    for (const c of node.children) {
      if (c.type === 'style' || c.name === 'style') helmetCss.push(c.children.map((t) => t.data).join(''));
      else if (c.name === 'link' && /stylesheet/.test(c.attribs.rel || '')) fontLinks.push(c.attribs.href);
    }
    return null;
  }
  if (tag === 'sc-for') {
    const as = node.attribs.as || 'item';
    const list = attrExpr(node.attribs.list || '', scope);
    const sub = [...scope, as, '$index'];
    const kids = children(node, sub, parentTag);
    return `{$arr(${list}).map((${as}, $index) => (<Fragment key={$index}>${kids.join('')}</Fragment>))}`;
  }
  if (tag === 'sc-if') {
    const val = attrExpr(node.attribs.value || '', scope);
    const kids = children(node, scope, parentTag);
    return `{${val} ? (<>${kids.join('')}</>) : null}`;
  }
  if (tag === 'style' || tag === 'script') throw new Error('inline ' + tag + ' in template');
  const props = [], cls = [];
  for (const [name, value] of Object.entries(node.attribs)) {
    if (name.startsWith('hint-') || name === 'sc-name') continue;
    if (name.startsWith('style-')) { cls.push(pseudoClass(name.slice(6), value)); continue; }
    let key = ATTR_MAP[name] || name;
    if (key.startsWith('on') && key.length > 2) key = 'on' + key[2].toUpperCase() + key.slice(3);
    else if (key.includes('-') && !/^(aria|data)-/.test(key)) key = camel(key);
    if (key === 'style') { props.push(`style={${styleExpr(value, scope)}}`); continue; }
    if (key === 'className') { cls.unshift(value.includes('{{') ? '${' + attrExpr(value, scope) + ' ?? ""}' : value); continue; }
    let ex = attrExpr(value, scope);
    if (key === 'value' || key === 'defaultValue') ex = value.includes('{{') ? `$dv(${ex})` : ex;
    if (key === 'checked') ex = `!!(${ex})`;
    props.push(ex.startsWith('"') && !ex.includes('\\') ? `${key}=${ex}` : `${key}={${ex}}`);
  }
  if (cls.length) props.push(cls.some((c) => c.includes('${')) ? `className={\`${cls.join(' ')}\`}` : `className=${JSON.stringify(cls.join(' '))}`);
  const kids = children(node, scope, tag);
  const p = props.length ? ' ' + props.join(' ') : '';
  if (!kids.length && (VOID.has(tag) || node.children.length === 0)) return `<${tag}${p} />`;
  if (tag === 'textarea') {
    // React wants textarea content as defaultValue.
    const txt = node.children.map((c) => c.data || '').join('');
    return `<textarea${p} defaultValue={${JSON.stringify(txt)}} />`;
  }
  return `<${tag}${p}>${kids.join('')}</${tag}>`;
}
function text(data, scope, parentTag) {
  if (!data.includes('{{')) {
    if (!data.trim()) {
      if (!data.includes(' ') || NO_WS.has(parentTag)) return null;
      return '{" "}';
    }
    return `{${JSON.stringify(data.replace(/\s+/g, ' '))}}`;
  }
  const parts = data.split(HOLE);
  const plain = PLAIN_TEXT.has(parentTag);
  return parts.map((p, i) => {
    if (i & 1) return plain ? `{${expr(p, scope)}}` : `{$t(${expr(p, scope)})}`;
    if (!p) return '';
    if (!p.trim()) return p.includes(' ') || plain ? '{" "}' : '';
    return `{${JSON.stringify(p.replace(/\s+/g, ' '))}}`;
  }).join('');
}

const body = children(doc, [], 'root');
const css = [...helmetCss, ...[...pseudo.values()].map((p) => p.rule)].join('\n');

const view = `// Generated from the Claude Design prototype "${path.basename(inFile)}".
import React, { Fragment } from 'react';
import { $arr, $t, $sx, $dv } from '../lib/dc';

export const css = ${JSON.stringify(css)};

export function render${Name}($v) {
  return (
    <>
      ${body.join('\n')}
    </>
  );
}
`;

let logic;
if (script.trim()) {
  logic = `'use client';
// Logic ported from the Claude Design prototype "${path.basename(inFile)}".
import React from 'react';
import { render${Name}, css } from './${Name}View';

const DCLogic = React.Component;
${script.trim()}

Component.defaultProps = { ...${JSON.stringify(defaults)}, ...(Component.defaultProps || {}) };
Component.prototype.render = function () {
  const vals = { ...this.props, ...(this.renderVals() || {}) };
  return (
    <div id="dc-root">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="sc-host">{render${Name}(vals)}</div>
    </div>
  );
};

export default Component;
`;
} else {
  logic = `'use client';
import React from 'react';
import { render${Name}, css } from './${Name}View';

export default function ${Name}(props) {
  return (
    <div id="dc-root">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="sc-host">{render${Name}({ ...${JSON.stringify(defaults)}, ...props })}</div>
    </div>
  );
}
`;
}

fs.mkdirSync(outDir, { recursive: true });
const fmt = async (code) => {
  try { return await prettier.format(code, { parser: 'babel', printWidth: 120, singleQuote: true }); }
  catch (e) { console.error('prettier failed for', Name, e.message.slice(0, 500)); return code; }
};
fs.writeFileSync(path.join(outDir, `${Name}View.jsx`), await fmt(view));
fs.writeFileSync(path.join(outDir, `${Name}.jsx`), await fmt(logic));

console.log(Name, 'ok; pseudo classes:', pseudo.size, 'fonts:', fontLinks.length, 'needSx:', needSx);
