import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chatMessage, webhookBody, WEBHOOK_FORMATS } from '../lib/server/webhooks.ts';

const data = {
  post: { id: 'p1', caption: 'Our autumn menu starts Monday.   Come hungry.' },
  targets: [
    { platform: 'x', username: 'harbor', status: 'published', url: 'https://x.com/harbor/status/1' },
    { platform: 'instagram', username: 'harbor.ig', status: 'failed', error: 'Instagram only accepts JPEG images.' },
  ],
};

test('Slack and Discord get a readable message; everything else gets the signed JSON', () => {
  assert.deepEqual([...WEBHOOK_FORMATS], ['json', 'slack', 'discord']);
  const slack = JSON.parse(webhookBody('slack', 'post.partial', 'ws', data));
  assert.equal(slack.text, '⚠️ Partly published: “Our autumn menu starts Monday. Come hungry.”\n• X @harbor → https://x.com/harbor/status/1\n• Instagram @harbor.ig: Instagram only accepts JPEG images.');
  const discord = JSON.parse(webhookBody('discord', 'post.published', 'ws', data));
  assert.ok(discord.content.startsWith('✅ Published: “Our autumn menu'));
  const json = JSON.parse(webhookBody('json', 'post.failed', 'ws', data));
  assert.equal(json.event, 'post.failed');
  assert.equal(json.workspace_id, 'ws');
  assert.deepEqual(json.data, data);
  assert.equal(chatMessage('ping', {}), 'Test from Schedule For You: this webhook works.');
});

test('long captions are shortened and Discord messages stay under its 2,000-character cap', () => {
  const long = { post: { caption: 'x'.repeat(500) }, targets: Array.from({ length: 40 }, (_, i) => ({ platform: 'x', username: `u${i}`, status: 'failed', error: 'e'.repeat(60) })) };
  const msg = chatMessage('post.failed', long);
  assert.ok(msg.startsWith('❌ Failed: “' + 'x'.repeat(89) + '…”'));
  assert.ok(JSON.parse(webhookBody('discord', 'post.failed', 'ws', long)).content.length <= 2000);
});
