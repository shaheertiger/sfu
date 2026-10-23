import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import * as ref from '../lib/api-reference.js';
import { PLATFORMS } from '../lib/server/platforms.ts';
import { PostBody } from '../lib/server/posts.ts';
import { WEBHOOK_EVENTS } from '../lib/server/webhooks.ts';

const { DASHBOARD_ONLY, ENDPOINTS, PLATFORM_OPTIONS, requestSamples } = ref as any;
const V1 = path.join(process.cwd(), 'app', 'api', 'v1');

/** `/posts/{id}/publish` → app/api/v1/posts/[id]/publish/route.ts */
const routeFile = (p: string) => path.join(V1, ...p.split('/').filter(Boolean).map((seg) => seg.replace(/^\{(\w+)\}$/, '[$1]')), 'route.ts');

/** The HTTP methods a route file exports, each with its source so options like sessionOnly can be read. */
function exportsOf(file: string) {
  const src = fs.readFileSync(file, 'utf8');
  const starts = [...src.matchAll(/^export /gm)].map((m) => m.index!);
  const out = new Map<string, string>();
  for (const m of src.matchAll(/^export (?:const|async function|function) (GET|POST|PUT|PATCH|DELETE)\b/gm)) {
    const end = starts.find((i) => i > m.index!) ?? src.length;
    out.set(m[1], src.slice(m.index!, end));
  }
  return out;
}

function allRoutes() {
  const found: { method: string; path: string; sessionOnly: boolean }[] = [];
  const walk = (dir: string) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(full);
      else if (ent.name === 'route.ts') {
        const p = '/' + path.relative(V1, dir).split(path.sep).map((seg) => seg.replace(/^\[(\w+)\]$/, '{$1}')).join('/');
        for (const [method, src] of exportsOf(full)) found.push({ method, path: p, sessionOnly: /sessionOnly:\s*true/.test(src) });
      }
    }
  };
  walk(V1);
  return found;
}

test('every documented endpoint is a route that exports the method and accepts API keys', () => {
  for (const e of ENDPOINTS) {
    const file = routeFile(e.path);
    assert.ok(fs.existsSync(file), `${e.method} ${e.path}: no ${path.relative(process.cwd(), file)}`);
    const src = exportsOf(file).get(e.method);
    assert.ok(src, `${e.method} ${e.path}: the route does not export ${e.method}`);
    assert.ok(!/sessionOnly:\s*true/.test(src), `${e.method} ${e.path}: documented, but the route refuses API keys`);
  }
});

test('the dashboard-only list matches routes that refuse API keys', () => {
  for (const d of DASHBOARD_ONLY) {
    const src = exportsOf(routeFile(d.path)).get(d.method);
    assert.ok(src, `${d.method} ${d.path}: missing`);
    assert.match(src, /sessionOnly:\s*true/, `${d.method} ${d.path}: listed as dashboard-only but accepts API keys`);
  }
});

test('every v1 route is either documented or listed as dashboard-only', () => {
  const documented = new Set([...ENDPOINTS, ...DASHBOARD_ONLY].map((e: any) => `${e.method} ${e.path}`));
  for (const r of allRoutes()) {
    assert.ok(documented.has(`${r.method} ${r.path}`), `${r.method} ${r.path} is not in lib/api-reference.js`);
    if (r.sessionOnly) assert.ok(DASHBOARD_ONLY.some((d: any) => d.method === r.method && d.path === r.path), `${r.method} ${r.path} is dashboard-only but not listed as such`);
  }
});

test('anchors are unique', () => {
  const prose = ['introduction', 'authentication', 'errors', 'limits', 'webhook-events', 'platforms', 'platform-options', 'mcp-server', 'dashboard-only'];
  const ids = [...prose, ...(ref as any).GROUPS.map((g: any) => g.id), ...ENDPOINTS.map((e: any) => e.id)];
  assert.equal(new Set(ids).size, ids.length, 'duplicate anchor id');
});

test('documented post fields are exactly the fields the API reads', () => {
  const create = ENDPOINTS.find((e: any) => e.id === 'create-a-post');
  assert.deepEqual(create.params.body.map((p: any) => p.name).sort(), Object.keys(PostBody.shape).sort());
});

test('webhook events and platform options match the server', () => {
  assert.deepEqual((ref as any).WEBHOOK_EVENTS.map(([e]: [string]) => e), [...WEBHOOK_EVENTS]);
  for (const p of Object.values(PLATFORMS)) {
    const fields = (p.fields || []).map((f) => f.key).sort();
    const documented = (PLATFORM_OPTIONS[p.id] || []).map(([k]: [string]) => k).sort();
    assert.deepEqual(documented, fields, `${p.id} options`);
  }
});

test('request samples use the endpoint’s method and URL, and their JSON bodies are valid', () => {
  for (const e of ENDPOINTS) {
    const [curl, js, py] = requestSamples(e);
    const url = `https://scheduleforyou.com/api/v1${e.path.split('/{')[0]}`;
    for (const s of [curl, js, py]) assert.ok(s.code.includes(url), `${e.id} ${s.label}: ${url}`);
    if (e.method !== 'GET') assert.ok(curl.code.includes(`-X ${e.method}`), `${e.id}: curl method`);
    if (e.example?.body) {
      const m = /-d '([\s\S]*)'$/.exec(curl.code);
      assert.ok(m, `${e.id}: curl body`);
      assert.deepEqual(JSON.parse(m![1]), e.example.body);
    }
  }
});
