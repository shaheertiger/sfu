// Small helpers used by the generated views. They mirror how the Claude Design
// prototype runtime rendered its templates, so the screens look identical.
import React from 'react';

// List bindings: anything that isn't an array renders nothing.
export const $arr = (list) => (Array.isArray(list) ? list : []);

// Text bindings: strings/numbers render inside a <span>, null/booleans render nothing.
export function $t(v) {
  if (v === undefined || v === null || typeof v === 'boolean') return null;
  if (React.isValidElement(v) || Array.isArray(v)) return v;
  return <span className="sc-interp">{String(v)}</span>;
}

// Form values: undefined becomes an empty string so inputs stay controlled.
export const $dv = (v) => (v === undefined ? '' : v);

// Style bindings may be a CSS string or an object.
const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
export function $sx(v) {
  if (v == null || typeof v !== 'string') return v || undefined;
  const o = {};
  for (const decl of v.split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    o[prop.startsWith('--') ? prop : camel(prop)] = decl.slice(i + 1).trim();
  }
  return o;
}
