import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = new URL('../', import.meta.url);
const EXTS = ['.ts', '.tsx', '.js', '.mjs', '/index.ts'];

export async function resolve(specifier, context, nextResolve) {
  // `import 'server-only'` throws outside React Server Components; tests are neither.
  if (specifier === 'server-only') return { url: 'data:text/javascript,', shortCircuit: true };
  let target = specifier;
  if (target.startsWith('@/')) target = new URL(target.slice(2), ROOT).href;
  const relative = target.startsWith('./') || target.startsWith('../') || target.startsWith('file:');
  if (relative && !/\.[cm]?[jt]sx?$/.test(target)) {
    const base = target.startsWith('file:') ? new URL(target) : new URL(target, context.parentURL);
    for (const ext of EXTS) {
      const candidate = base.href + ext;
      if (existsSync(fileURLToPath(candidate))) return nextResolve(candidate, context);
    }
  }
  return nextResolve(target, context);
}

export { pathToFileURL };
