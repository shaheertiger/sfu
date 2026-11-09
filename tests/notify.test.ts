import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NOTIFY, NOTIFY_ACTIONS, NOTIFY_PLATFORMS, allNotifyPages, notifyActionsFor, notifyCopy, notifyEntry, notifyFaq, notifyPlatformsFor } from '../lib/notify.js';
import { resolve } from '../lib/md/registry.js';

test('notify: every entry is complete, every key is a known platform and action', () => {
  const actions = new Set(NOTIFY_ACTIONS.map((a) => a.slug));
  const platforms = new Set(NOTIFY_PLATFORMS.map((p) => p.slug));
  assert.equal(actions.size, NOTIFY_ACTIONS.length);
  assert.equal(platforms.size, NOTIFY_PLATFORMS.length);
  for (const [p, acts] of Object.entries(NOTIFY)) {
    assert.ok(platforms.has(p), `unknown platform ${p}`);
    for (const [a, e] of Object.entries(acts)) {
      assert.ok(actions.has(a), `${p}: unknown action ${a}`);
      assert.ok(['yes', 'no', 'partly'].includes(e.answer), `${p}/${a} answer`);
      for (const k of ['rule', 'detail', 'sees', 'sure'] as const) assert.ok(typeof e[k] === 'string' && e[k].length > 10, `${p}/${a} ${k}`);
      assert.ok(Array.isArray(e.except), `${p}/${a} except`);
      assert.match(e.rule, /[.!]$/, `${p}/${a} rule ends with a full stop`);
    }
  }
  for (const a of NOTIFY_ACTIONS) assert.ok(notifyPlatformsFor(a.slug).length >= 1, `${a.slug} has no platform`);
  assert.ok(allNotifyPages().length >= 120);
  assert.ok(notifyActionsFor('instagram').length >= 20);
});

test('notify: titles carry the answer inside the first 50 characters and stay under 70', () => {
  for (const { platform, action } of allNotifyPages()) {
    const p = NOTIFY_PLATFORMS.find((x) => x.slug === platform)!; const a = NOTIFY_ACTIONS.find((x) => x.slug === action)!;
    const e = notifyEntry(platform, action)!;
    const copy = notifyCopy(p, a, e);
    const head = copy.title.slice(0, 50);
    assert.ok(/Yes|No|Sometimes/.test(copy.title.slice(0, copy.title.indexOf('?') + 12)), `${platform}/${action}: ${copy.title}`);
    assert.ok(copy.title.includes('?'), head);
    assert.ok(copy.description.length <= 320 && copy.description.length >= 60, `${platform}/${action} description ${copy.description.length}`);
    const faq = notifyFaq(p, a, e);
    assert.ok(faq.length >= 5);
    for (const f of faq) assert.ok(f.a.length > 10);
  }
});

test('notify: markdown twins resolve for the index, a hub and a page', () => {
  for (const path of ['/does-it-notify', '/does-it-notify/instagram', '/does-it-notify/instagram/screenshot-story']) {
    const r = resolve(path);
    assert.ok(r, path);
    const page = (r!.route.render as (params: Record<string, string>) => any)(r!.params);
    assert.ok(page && page.title && page.body, path);
  }
  assert.equal(resolve('/does-it-notify/whatsapp/screenshot-story'), null);
});
