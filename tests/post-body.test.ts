import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePostBody } from '../lib/server/posts.ts';

test('account_ids become targets, ISO dates become epoch ms, duplicates collapse', () => {
  const b = parsePostBody({ caption: 'Hi', account_ids: ['acc_1', 'acc_2', 'acc_1'], scheduled_at: '2026-11-01T14:00:00Z', publish_now: false });
  assert.deepEqual(b.targets, [{ account_id: 'acc_1' }, { account_id: 'acc_2' }]);
  assert.equal(b.scheduled_at, Date.UTC(2026, 10, 1, 14));
  assert.equal(b.caption, 'Hi');
});

test('the dashboard shape passes through unchanged', () => {
  const raw = { caption: '', media: ['med_1'], scheduled_at: 1800000000000, status: 'scheduled', targets: [{ account_id: 'acc_1', caption: null, options: { ui: { privacy: 'Public' }, privacy: 'PUBLIC_TO_EVERYONE' } }], labels: ['Launch'], repeat: 'none', evergreen: false, approval: null, remind: true, note: '', batch: null };
  const b = parsePostBody(raw);
  assert.deepEqual(b.targets, raw.targets);
  assert.equal(b.scheduled_at, raw.scheduled_at);
  assert.equal(b.approval, null);
});

test('a PATCH without targets leaves them undefined so existing targets are kept', () => {
  const b = parsePostBody({ caption: 'Edited' });
  assert.equal('targets' in b, false);
});

test('malformed bodies are rejected with a ZodError', () => {
  const bad = (raw: unknown) => assert.throws(() => parsePostBody(raw), (e: any) => e?.name === 'ZodError');
  bad({ scheduled_at: 'tomorrow-ish' });
  bad({ scheduled_at: -5 });
  bad({ status: 'published' });
  bad({ repeat: 'daily' });
  bad({ media: 'med_1' });
  bad({ targets: [{ account_id: 'has spaces' }] });
  bad({ caption: 'x'.repeat(65_001) });
  bad({ approval: 'maybe' });
});

test('unknown keys are dropped', () => {
  const b = parsePostBody({ caption: 'Hi', workspace_id: 'ws_other', created_by: 'someone' }) as any;
  assert.equal(b.workspace_id, undefined);
  assert.equal(b.created_by, undefined);
});

test('an update without a caption leaves the caption out, so the saved one is kept', () => {
  const b = parsePostBody({ labels: ['Launch'] });
  assert.equal(b.caption, undefined);
  assert.equal('targets' in b, false);
});
