// Regenerates app/fonts.css and public/fonts/* from Google Fonts (latin + latin-ext subsets).
// Usage: node scripts/fonts.mjs   (then review the diff; the preload links live in app/layout.jsx)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const FAMILIES = 'family=Geist:wght@100..900&family=Geist+Mono:wght@400;500&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'; // a modern UA gets woff2 + unicode-range
const KEEP = new Set(['latin', 'latin-ext']);

const css = await (await fetch(`https://fonts.googleapis.com/css2?${FAMILIES}&display=swap`, { headers: { 'user-agent': UA } })).text();
const blocks = [...css.matchAll(/\/\* ([a-z-]+) \*\/\s*@font-face \{([\s\S]*?)\}/g)];
const dir = path.join(root, 'public', 'fonts');
fs.mkdirSync(dir, { recursive: true });
const faces = [];
const seen = new Set();
for (const [, subset, body] of blocks) {
  if (!KEEP.has(subset)) continue;
  const get = (re) => body.match(re)?.[1];
  const family = get(/font-family: '([^']+)'/), style = get(/font-style: (\w+)/), weight = get(/font-weight: ([\d ]+)/), stretch = get(/font-stretch: ([^;]+)/), url = get(/url\(([^)]+)\)/), range = get(/unicode-range: ([^;]+)/);
  const name = `${family.toLowerCase().replace(/ /g, '-')}-${style}-${weight.replace(/ /g, '-')}-${subset}.woff2`;
  if (!seen.has(name)) {
    fs.writeFileSync(path.join(dir, name), Buffer.from(await (await fetch(url)).arrayBuffer()));
    seen.add(name);
  }
  faces.push(`@font-face {\n  font-family: '${family}';\n  font-style: ${style};\n  font-weight: ${weight};\n${stretch ? `  font-stretch: ${stretch};\n` : ''}  font-display: optional;\n  src: url(/fonts/${name}) format('woff2');\n  unicode-range: ${range};\n}`);
}
const header = `/*
 * Self-hosted web fonts (served from /public/fonts, same origin, preloaded in app/layout.jsx).
 * font-display: optional means the browser uses the font only when it is already available at
 * first paint (preloaded, or cached from an earlier page), and otherwise keeps the fallback for
 * that page view instead of swapping fonts and reflowing the page later. Files and metrics come
 * from Google Fonts (latin and latin-ext subsets); regenerate with scripts/fonts.mjs.
 */
`;
fs.writeFileSync(path.join(root, 'app', 'fonts.css'), header + faces.join('\n\n') + '\n');
console.log(`wrote ${faces.length} font faces, ${seen.size} files`);
